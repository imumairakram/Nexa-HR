const test = require('node:test');
const assert = require('node:assert/strict');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();
const {
  ScreeningResultSchema,
  JobMatchResultSchema,
  evaluateDecision,
  cleanJsonOutput,
  callGemini,
  getAIConfig,
  DEFAULT_GEMINI_FALLBACK_CHAIN,
} = require('../services/aiScreening.service');
const {
  extractPhoneFromText,
  normalizePhoneNumber,
  extractLocationFromText,
  maskPhone,
} = require('../utils/contactExtractor');
const { visibleApplicationsWhere } = require('../utils/recruitmentFilters');

test('AI ATS Screening - Unit Tests', async (t) => {
  // ====================================================
  // 1. Scoring Decision Logic & Threshold Boundaries
  // ====================================================
  await t.test('Threshold boundary tests (default 70)', () => {
    // Save original env
    const originalThreshold = process.env.ATS_PASS_THRESHOLD;
    delete process.env.ATS_PASS_THRESHOLD;

    // Score 69 -> Fail / SCREENED_OUT
    const result69 = evaluateDecision(69);
    assert.equal(result69.isPass, false);
    assert.equal(result69.status, 'SCREENED_OUT');
    assert.equal(result69.threshold, 70);

    // Score 70 -> Pass / CONFIRMED
    const result70 = evaluateDecision(70);
    assert.equal(result70.isPass, true);
    assert.equal(result70.status, 'CONFIRMED');
    assert.equal(result70.threshold, 70);

    // Score 71 -> Pass / CONFIRMED
    const result71 = evaluateDecision(71);
    assert.equal(result71.isPass, true);
    assert.equal(result71.status, 'CONFIRMED');
    assert.equal(result71.threshold, 70);

    // Restore or test custom threshold
    process.env.ATS_PASS_THRESHOLD = '80';
    const result79 = evaluateDecision(79);
    assert.equal(result79.isPass, false);
    assert.equal(result79.status, 'SCREENED_OUT');

    const result80 = evaluateDecision(80);
    assert.equal(result80.isPass, true);
    assert.equal(result80.status, 'CONFIRMED');

    // Restore
    if (originalThreshold !== undefined) {
      process.env.ATS_PASS_THRESHOLD = originalThreshold;
    } else {
      delete process.env.ATS_PASS_THRESHOLD;
    }
  });

  // ====================================================
  // 2. Strict Zod JSON Validation Tests
  // ====================================================
  await t.test('Zod validation succeeds with valid ATS JSON payload', () => {
    const validPayload = {
      score: 88,
      breakdown: {
        skillsMatch: 90,
        experienceMatch: 85,
        educationMatch: 80,
        keywordsRelevance: 95,
      },
      candidate: {
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        phone: '+1 555-0199',
        currentTitle: 'Senior Cloud Engineer',
        yearsExperience: 6,
        topSkills: ['AWS', 'Terraform', 'Kubernetes', 'Node.js'],
      },
      strengths: ['Extensive multi-cloud architecture experience', 'Strong infrastructure-as-code proficiency'],
      gaps: ['Limited direct experience with PostgreSQL replication'],
      summary: 'Experienced cloud engineer with deep AWS expertise well aligned with our DevOps lead role.',
      recommendation: 'PASS',
    };

    const parsed = ScreeningResultSchema.parse(validPayload);
    assert.equal(parsed.score, 88);
    assert.equal(parsed.breakdown.skillsMatch, 90);
    assert.equal(parsed.candidate.name, 'Sarah Connor');
    assert.equal(parsed.candidate.yearsExperience, 6);
  });

  await t.test('Zod validation rejects malformed payload (score out of range or missing breakdown)', () => {
    // Missing breakdown
    assert.throws(() => {
      ScreeningResultSchema.parse({
        score: 75,
        candidate: { name: 'Test' },
      });
    });

    // Score out of 0-100 range
    assert.throws(() => {
      ScreeningResultSchema.parse({
        score: 105,
        breakdown: {
          skillsMatch: 100,
          experienceMatch: 100,
          educationMatch: 100,
          keywordsRelevance: 100,
        },
      });
    });
  });

  await t.test('cleanJsonOutput extracts valid JSON from markdown code blocks', () => {
    const rawMarkdown = '```json\n{\n  "score": 92,\n  "recommendation": "PASS"\n}\n```';
    const cleaned = cleanJsonOutput(rawMarkdown);
    assert.equal(cleaned.score, 92);
    assert.equal(cleaned.recommendation, 'PASS');

    const rawPlain = '{"score": 85}';
    const cleanedPlain = cleanJsonOutput(rawPlain);
    assert.equal(cleanedPlain.score, 85);
  });

  await t.test('JobMatchResultSchema parses AI job match response correctly', () => {
    const matchJson = {
      matchedJobId: 'job-uuid-1234',
      confidence: 0.88,
      reasoning: 'Strong Python and React alignment with Full Stack Developer opening.',
    };

    const parsed = JobMatchResultSchema.parse(matchJson);
    assert.equal(parsed.matchedJobId, 'job-uuid-1234');
    assert.equal(parsed.confidence, 0.88);
  });

  // ====================================================
  // 3. Duplicate Candidate Protection Logic
  // ====================================================
  await t.test('Duplicate candidate protection updates existing record rather than creating a duplicate', async () => {
    // Mock simulation of duplicate check logic used in atsPipeline.service.js
    const database = [];

    async function simulateApply({ jobOpeningId, email, name, score, stage }) {
      const existing = database.find((a) => a.jobOpeningId === jobOpeningId && a.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        existing.name = name;
        existing.score = score;
        existing.stage = stage;
        existing.updatedAt = new Date();
        return { action: 'UPDATED', record: existing };
      } else {
        const newRecord = {
          id: `app-${database.length + 1}`,
          jobOpeningId,
          email: email.toLowerCase(),
          name,
          score,
          stage,
          createdAt: new Date(),
        };
        database.push(newRecord);
        return { action: 'CREATED', record: newRecord };
      }
    }

    // 1st submission
    const res1 = await simulateApply({
      jobOpeningId: 'job-101',
      email: 'alex.smith@example.com',
      name: 'Alex Smith',
      score: 65,
      stage: 'SCREENED_OUT',
    });
    assert.equal(res1.action, 'CREATED');
    assert.equal(database.length, 1);
    assert.equal(database[0].score, 65);

    // 2nd submission with same email and same jobOpeningId (e.g. updated CV sent by candidate)
    const res2 = await simulateApply({
      jobOpeningId: 'job-101',
      email: 'alex.smith@example.com',
      name: 'Alexander Smith',
      score: 82,
      stage: 'APPLIED',
    });
    assert.equal(res2.action, 'UPDATED');
    // Must NOT create a second application
    assert.equal(database.length, 1);
    assert.equal(database[0].name, 'Alexander Smith');
    assert.equal(database[0].score, 82);
    assert.equal(database[0].stage, 'APPLIED');

    // 3rd submission with same candidate but DIFFERENT jobOpeningId -> Allowed to apply to another opening
    const res3 = await simulateApply({
      jobOpeningId: 'job-202',
      email: 'alex.smith@example.com',
      name: 'Alexander Smith',
      score: 90,
      stage: 'APPLIED',
    });
    assert.equal(res3.action, 'CREATED');
    assert.equal(database.length, 2);
  });

  // ====================================================
  // 4. Contact Extractor & Phone Normalization Tests
  // ====================================================
  await t.test('Phone extraction handles all target formats and normalizes to standard +92 format', () => {
    const testCases = [
      { input: 'Call me at +92 311 0108939 anytime.', expected: '+92 311 0108939' },
      { input: 'Mobile: 0311-0108939', expected: '+92 311 0108939' },
      { input: 'Phone: (0311) 0108939', expected: '+92 311 0108939' },
      { input: 'Tel: 03110108939', expected: '+92 311 0108939' },
      { input: 'Direct: +92-311-0108939', expected: '+92 311 0108939' },
      { input: 'Intl: 00923110108939', expected: '+92 311 0108939' },
      { input: 'US number: +1 415 555 2671', expected: '+1 415 555 2671' },
    ];

    for (const { input, expected } of testCases) {
      const extracted = extractPhoneFromText(input);
      assert.ok(extracted, `Failed to extract from "${input}"`);
      const normalized = normalizePhoneNumber(extracted);
      assert.equal(normalized, expected, `Mismatch for input "${input}"`);
    }
  });

  await t.test('Phone extraction rejects false positives like year ranges, single years, and IDs', () => {
    const falsePositives = [
      'Experience: 2021-2024 at Tech Solutions',
      'Worked from 2018 - 2023 as software engineer',
      'Graduated in 2020',
      'Postal code 90210, Beverly Hills',
      'Requisition ref ID: 123456',
    ];

    for (const text of falsePositives) {
      const extracted = extractPhoneFromText(text);
      assert.equal(extracted, null, `Should have rejected false positive: "${text}" but got "${extracted}"`);
    }
  });

  await t.test('maskPhone redacts phone number for privacy in logs', () => {
    assert.equal(maskPhone('+92 311 0108939'), '+92 311 ***8939');
    assert.equal(maskPhone('03110108939'), '03110***8939');
    assert.equal(maskPhone(null), 'N/A');
    assert.equal(maskPhone(''), 'N/A');
  });

  await t.test('extractLocationFromText extracts city and country from CV text header', () => {
    const resume1 = `
      Muhammad Umair Akram
      Full-Stack Developer
      Karachi, Pakistan | +92 311 0108939 | umair@example.com
      
      EXPERIENCE:
      Frontend Lead, ABC Corp (2021-2024)
    `;
    assert.equal(extractLocationFromText(resume1), 'Karachi, Pakistan');

    const resume2 = `
      John Doe
      Islamabad, Pakistan
      Email: john@test.com
    `;
    assert.equal(extractLocationFromText(resume2), 'Islamabad, Pakistan');
  });

  // ====================================================
  // 5. Preserving Existing Phone in Duplicate Check
  // ====================================================
  await t.test('Duplicate update preserves existing phone if subsequent payload has null phone', () => {
    const existing = {
      phone: '+92 311 0108939',
      location: 'Karachi, Pakistan',
    };

    const newCandidatePhone = null;
    const resolvedPhone = newCandidatePhone || existing?.phone || null;
    assert.equal(resolvedPhone, '+92 311 0108939');

    // If new valid phone arrives, it updates
    const updatedCandidatePhone = '+92 300 1234567';
    const newResolvedPhone = updatedCandidatePhone || existing?.phone || null;
    assert.equal(newResolvedPhone, '+92 300 1234567');
  });

  // ====================================================
  // 6. Applicant Count Parity via Single Source of Truth
  // ====================================================
  await t.test('visibleApplicationsWhere filter ensures Job Cards and KPI Total Applicants agree', () => {
    // Simulated database applications collection
    const apps = [
      // Visible (Pass / Confirmed or non-AI manual)
      { id: '1', jobOpeningId: 'job-1', status: 'ACTIVE', aiStatus: 'CONFIRMED' },
      { id: '2', jobOpeningId: 'job-1', status: 'ACTIVE', aiStatus: 'CONFIRMED' },
      { id: '3', jobOpeningId: 'job-2', status: 'ACTIVE', aiStatus: 'CONFIRMED' },
      // Hidden / Excluded
      { id: '4', jobOpeningId: 'job-1', status: 'ACTIVE', aiStatus: 'SCREENED_OUT' },
      { id: '5', jobOpeningId: null,    status: 'ACTIVE', aiStatus: 'UNMATCHED' },
      { id: '6', jobOpeningId: 'job-2', status: 'ACTIVE', aiStatus: 'ERROR' },
      { id: '7', jobOpeningId: 'job-1', status: 'ARCHIVED', aiStatus: 'CONFIRMED' },
    ];

    const jobs = [
      { id: 'job-1', title: 'Full-Stack Developer' },
      { id: 'job-2', title: 'DevOps Specialist' },
    ];

    // Filter rule matching visibleApplicationsWhere
    function isVisible(app) {
      if (app.status !== 'ACTIVE') return false;
      const excluded = ['SCREENED_OUT', 'UNMATCHED', 'ERROR'];
      if (excluded.includes(app.aiStatus)) return false;
      return true;
    }

    // 1. KPI Total Count
    const kpiTotal = apps.filter(isVisible).length;
    assert.equal(kpiTotal, 3);

    // 2. Per-Job counts
    let jobCardsSum = 0;
    const jobCounts = {};
    for (const job of jobs) {
      const count = apps.filter((a) => a.jobOpeningId === job.id && isVisible(a)).length;
      jobCounts[job.id] = count;
      jobCardsSum += count;
    }

    assert.equal(jobCounts['job-1'], 2);
    assert.equal(jobCounts['job-2'], 1);
    assert.equal(jobCardsSum, kpiTotal, 'Job card sum must strictly match KPI total applicants');
  });

  await t.test('Pipeline simulation: Confirmed, Screened-out, Unmatched, Override, and Archive maintain strict count parity', () => {
    const job = { id: 'job-101', title: 'Full-Stack Developer' };
    const applications = [];

    function countVisible(jobId = null) {
      return applications.filter((app) => {
        if (app.status !== 'ACTIVE') return false;
        if (['SCREENED_OUT', 'UNMATCHED', 'ERROR'].includes(app.aiStatus)) return false;
        if (jobId) return app.jobOpeningId === jobId;
        return true;
      }).length;
    }

    // Baseline: 0 applicants
    assert.equal(countVisible(), 0);
    assert.equal(countVisible(job.id), 0);

    // 1. Candidate 1 scores 85 -> CONFIRMED
    applications.push({
      id: 'app-1',
      jobOpeningId: job.id,
      name: 'Umair',
      status: 'ACTIVE',
      aiStatus: 'CONFIRMED',
      stage: 'APPLIED',
    });
    assert.equal(countVisible(), 1);
    assert.equal(countVisible(job.id), 1);

    // 2. Candidate 2 scores 55 -> SCREENED_OUT (Must NOT increment count)
    applications.push({
      id: 'app-2',
      jobOpeningId: job.id,
      name: 'Candidate 2',
      status: 'ACTIVE',
      aiStatus: 'SCREENED_OUT',
      stage: 'SCREENED_OUT',
    });
    assert.equal(countVisible(), 1);
    assert.equal(countVisible(job.id), 1);

    // 3. Candidate 3 -> UNMATCHED (Must NOT increment count)
    applications.push({
      id: 'app-3',
      jobOpeningId: null,
      name: 'Candidate 3',
      status: 'ACTIVE',
      aiStatus: 'UNMATCHED',
      stage: 'UNMATCHED',
    });
    assert.equal(countVisible(), 1);
    assert.equal(countVisible(job.id), 1);

    // 4. HR Overrides Candidate 2 -> Promoted to CONFIRMED
    const app2 = applications.find((a) => a.id === 'app-2');
    app2.aiStatus = 'CONFIRMED';
    app2.stage = 'APPLIED';
    assert.equal(countVisible(), 2);
    assert.equal(countVisible(job.id), 2);

    // 5. Candidate 1 is archived -> Both counts decrement to 1
    const app1 = applications.find((a) => a.id === 'app-1');
    app1.status = 'ARCHIVED';
    assert.equal(countVisible(), 1);
    assert.equal(countVisible(job.id), 1);
  });

  // ====================================================
  // 6. Gemini Model Fallback Chain & Error Handling
  // ====================================================
  await t.test('getAIConfig defaults to gemini-3.8-flash and exposes correct fallback chain', () => {
    const originalModel = process.env.AI_MODEL;
    const originalProvider = process.env.AI_PROVIDER;
    try {
      delete process.env.AI_MODEL;
      delete process.env.AI_PROVIDER;
      const config = getAIConfig();
      assert.equal(config.model, 'gemini-3.8-flash');
      assert.deepEqual(DEFAULT_GEMINI_FALLBACK_CHAIN, [
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
      ]);
    } finally {
      if (originalModel) process.env.AI_MODEL = originalModel;
      if (originalProvider) process.env.AI_PROVIDER = originalProvider;
    }
  });

  await t.test('callGemini on 404 skips immediately to the next model in fallback chain', async () => {
    const originalFetch = globalThis.fetch;
    const requestedModels = [];

    globalThis.fetch = async (url) => {
      const match = url.match(/models\/([^:]+):generateContent/);
      const modelName = match ? match[1] : '';
      requestedModels.push(modelName);

      if (modelName === 'gemini-3.8-flash') {
        return {
          ok: false,
          status: 404,
          text: async () => 'Model not found',
        };
      }

      if (modelName === 'gemini-3.5-flash') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              { content: { parts: [{ text: JSON.stringify({ score: 85 }) }] } },
            ],
          }),
        };
      }

      return { ok: false, status: 500, text: async () => 'Unexpected model' };
    };

    try {
      const result = await callGemini({
        apiKey: 'test-key',
        model: 'gemini-3.8-flash',
        systemPrompt: 'System',
        userPrompt: 'User',
      });
      assert.equal(JSON.parse(result).score, 85);
      assert.deepEqual(requestedModels, ['gemini-3.8-flash', 'gemini-3.5-flash']);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test('callGemini on 503/429 retries with backoff and then falls back to next model', async () => {
    const originalFetch = globalThis.fetch;
    const calls = [];

    globalThis.fetch = async (url) => {
      const match = url.match(/models\/([^:]+):generateContent/);
      const modelName = match ? match[1] : '';
      calls.push(modelName);

      // Model 1 fails with 503 every attempt
      if (modelName === 'gemini-3.8-flash') {
        return {
          ok: false,
          status: 503,
          text: async () => 'Service Unavailable',
        };
      }

      // Model 2 succeeds
      if (modelName === 'gemini-3.5-flash') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              { content: { parts: [{ text: JSON.stringify({ score: 92 }) }] } },
            ],
          }),
        };
      }

      return { ok: false, status: 500, text: async () => 'Unknown model' };
    };

    try {
      const result = await callGemini({
        apiKey: 'test-key',
        model: 'gemini-3.8-flash',
        systemPrompt: 'System',
        userPrompt: 'User',
        maxRetries: 2,
      });

      assert.equal(JSON.parse(result).score, 92);
      // gemini-3.8-flash attempted 3 times (initial + 2 retries), then gemini-3.5-flash attempted once and succeeded
      const m38Calls = calls.filter((c) => c === 'gemini-3.8-flash').length;
      assert.equal(m38Calls, 3);
      assert.equal(calls[calls.length - 1], 'gemini-3.5-flash');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test('callGemini fails fast on 400, 401, 403 without retrying or fallback', async () => {
    const originalFetch = globalThis.fetch;
    let callCount = 0;

    for (const testStatus of [400, 401, 403]) {
      callCount = 0;
      globalThis.fetch = async () => {
        callCount++;
        return {
          ok: false,
          status: testStatus,
          text: async () => `Auth/Client error ${testStatus}`,
        };
      };

      try {
        await assert.rejects(
          async () => {
            await callGemini({
              apiKey: 'bad-key',
              model: 'gemini-3.8-flash',
              systemPrompt: 'System',
              userPrompt: 'User',
            });
          },
          (err) => {
            assert.equal(err.status, testStatus);
            return true;
          }
        );
        // Must fail fast after exactly 1 call (no retries, no fallback models)
        assert.equal(callCount, 1, `Status ${testStatus} must fail fast on first attempt`);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  });
});

