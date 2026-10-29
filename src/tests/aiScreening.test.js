const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ScreeningResultSchema,
  JobMatchResultSchema,
  evaluateDecision,
  cleanJsonOutput,
} = require('../services/aiScreening.service');

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
});

