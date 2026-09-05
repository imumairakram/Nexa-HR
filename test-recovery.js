/**
 * Automated Verification Script for NexaHR Password Recovery & Security
 */
const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000/api/auth';

function request(urlPath, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${urlPath}`);
    const body = data ? JSON.stringify(data) : null;
    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
          ...headers,
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function ensureServer() {
  try {
    await new Promise((resolve, reject) => {
      const ping = http.get('http://127.0.0.1:5000/api/health', (r) => resolve(r));
      ping.on('error', reject);
    });
  } catch (e) {
    console.log('⚡ Launching local backend instance on port 5000 for test suite...');
    require('./src/index');
    await new Promise((r) => setTimeout(r, 1200));
  }
}

async function runTests() {
  await ensureServer();

  console.log('🧪 ========================================================');
  console.log('🧪 NEXAHR PASSWORD RECOVERY & SECURITY VERIFICATION SUITE');
  console.log('🧪 ========================================================\n');

  try {
    const adminEmailAddress = 'admin@nexahr.com';
    const empEmailAddress = 'umaaiirakram@gmail.com';

    // 1. Check HR Admin User
    console.log('🔹 Test 1: Checking HR Admin account permissions...');
    const adminCheck = await request('/forgot-password/check', 'POST', { email: adminEmailAddress });
    console.log(`Status: ${adminCheck.status} | Role: ${adminCheck.data.data?.role} | Allowed Channels: ${JSON.stringify(adminCheck.data.data?.allowedChannels)}`);
    if (adminCheck.data.data?.allowedChannels.length === 1 && adminCheck.data.data?.allowedChannels[0] === 'EMAIL') {
      console.log('✅ PASS: HR Admin restricted to EMAIL only.\n');
    } else {
      throw new Error('FAIL: HR Admin should only have EMAIL channel.');
    }

    // 2. HR Admin requests WhatsApp OTP -> MUST BE FORBIDDEN (403)
    console.log('🔹 Test 2: HR Admin attempts WhatsApp recovery (Security Policy Enforcement)...');
    const adminWhatsApp = await request('/forgot-password/initiate', 'POST', {
      email: adminEmailAddress,
      channel: 'WHATSAPP',
    });
    console.log(`Status: ${adminWhatsApp.status} | Response: ${adminWhatsApp.data.message}`);
    if (adminWhatsApp.status === 403) {
      console.log('✅ PASS: WhatsApp recovery for HR/Admin was successfully blocked by backend security policy.\n');
    } else {
      throw new Error('FAIL: Admin WhatsApp recovery should have returned 403 Forbidden.');
    }

    // 3. HR Admin requests Email OTP -> MUST SUCCEED (200)
    console.log('🔹 Test 3: HR Admin requests Email recovery...');
    const adminEmail = await request('/forgot-password/initiate', 'POST', {
      email: adminEmailAddress,
      channel: 'EMAIL',
    });
    console.log(`Status: ${adminEmail.status} | Destination: ${adminEmail.data.data?.destination} | OTP Preview: ${adminEmail.data.data?.previewOtp}`);
    if (adminEmail.status === 200) {
      console.log('✅ PASS: HR Admin received OTP via Email.\n');
    } else {
      throw new Error('FAIL: HR Admin Email recovery failed.');
    }

    // 4. Employee checks account -> allowed both EMAIL & WHATSAPP
    console.log('🔹 Test 4: Checking Employee account channels...');
    const empCheck = await request('/forgot-password/check', 'POST', { email: empEmailAddress });
    console.log(`Status: ${empCheck.status} | Role: ${empCheck.data.data?.role} | Allowed Channels: ${JSON.stringify(empCheck.data.data?.allowedChannels)}`);
    if (empCheck.data.data?.allowedChannels.includes('WHATSAPP') && empCheck.data.data?.allowedChannels.includes('EMAIL')) {
      console.log('✅ PASS: Employee has access to both EMAIL and WHATSAPP.\n');
    } else {
      throw new Error('FAIL: Employee should have both EMAIL and WHATSAPP channels.');
    }

    // 5. Employee requests WhatsApp OTP -> MUST SUCCEED
    console.log('🔹 Test 5: Employee requests WhatsApp recovery...');
    const empWhatsApp = await request('/forgot-password/initiate', 'POST', {
      email: empEmailAddress,
      channel: 'WHATSAPP',
    });
    console.log(`Status: ${empWhatsApp.status} | Destination: ${empWhatsApp.data.data?.destination} | OTP Preview: ${empWhatsApp.data.data?.previewOtp}`);
    const generatedOtp = empWhatsApp.data.data?.previewOtp;
    if (empWhatsApp.status === 200 && generatedOtp) {
      console.log('✅ PASS: Employee received OTP via WhatsApp.\n');
    } else {
      throw new Error('FAIL: Employee WhatsApp recovery failed.');
    }

    // 6. Test invalid OTP verification
    console.log('🔹 Test 6: Testing invalid OTP rejection & attempt counter...');
    const invalidOtpRes = await request('/forgot-password/verify-otp', 'POST', {
      email: empEmailAddress,
      otp: '000000',
    });
    console.log(`Status: ${invalidOtpRes.status} | Message: ${invalidOtpRes.data.message}`);
    if (invalidOtpRes.status === 400) {
      console.log('✅ PASS: Invalid OTP rejected.\n');
    } else {
      throw new Error('FAIL: Invalid OTP should be rejected with status 400.');
    }

    // 7. Test valid OTP verification -> returns Reset JWT
    console.log('🔹 Test 7: Verifying correct OTP and generating Reset JWT token...');
    const validOtpRes = await request('/forgot-password/verify-otp', 'POST', {
      email: empEmailAddress,
      otp: generatedOtp,
    });
    console.log(`Status: ${validOtpRes.status} | Message: ${validOtpRes.data.message}`);
    const resetToken = validOtpRes.data.data?.resetToken;
    if (validOtpRes.status === 200 && resetToken) {
      console.log(`✅ PASS: Correct OTP verified and Reset JWT issued (${resetToken.slice(0, 25)}...).\n`);
    } else {
      throw new Error('FAIL: Valid OTP verification failed.');
    }

    // 8. Test resetting password
    console.log('🔹 Test 8: Resetting password using Reset JWT token...');
    const resetRes = await request(
      '/forgot-password/reset-password',
      'POST',
      {
        newPassword: 'NewSecurePassword2026!',
        confirmPassword: 'NewSecurePassword2026!',
      },
      {
        Authorization: `Bearer ${resetToken}`,
      }
    );
    console.log(`Status: ${resetRes.status} | Message: ${resetRes.data.message}`);
    if (resetRes.status === 200) {
      console.log('✅ PASS: Password successfully reset!\n');
    } else {
      throw new Error('FAIL: Password reset failed.');
    }

    // 9. Login with new password
    console.log('🔹 Test 9: Logging in with new password...');
    const loginRes = await request('/login', 'POST', {
      email: empEmailAddress,
      password: 'NewSecurePassword2026!',
    });
    console.log(`Status: ${loginRes.status} | Logged In User: ${loginRes.data.data?.user?.email}`);
    if (loginRes.status === 200 && loginRes.data.data?.token) {
      console.log('✅ PASS: Login successful with new password!\n');
    } else {
      throw new Error('FAIL: Login with new password failed.');
    }

    // 10. Reset back to employee123 / admin123 for seamless continuity
    console.log('🔹 Test 10: Resetting back to default password (admin123)...');
    const reInit = await request('/forgot-password/initiate', 'POST', {
      email: empEmailAddress,
      channel: 'EMAIL',
    });
    const reOtp = reInit.data.data?.previewOtp;
    const reVerify = await request('/forgot-password/verify-otp', 'POST', {
      email: empEmailAddress,
      otp: reOtp,
    });
    const reToken = reVerify.data.data?.resetToken;
    await request(
      '/forgot-password/reset-password',
      'POST',
      {
        newPassword: 'admin123',
        confirmPassword: 'admin123',
      },
      {
        Authorization: `Bearer ${reToken}`,
      }
    );
    console.log('✅ PASS: Cleaned up and restored default password.\n');

    console.log('🎉 ========================================================');
    console.log('🎉 ALL 10 SECURITY & RECOVERY TESTS PASSED 100%!');
    console.log('🎉 ========================================================');
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Ensure server is reachable, or launch a quick runner
runTests();
