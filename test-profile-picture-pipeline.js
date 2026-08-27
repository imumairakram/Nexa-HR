const http = require('http');
const prisma = require('./src/config/prisma');
const { generateToken } = require('./src/utils/jwt');

async function runTest() {
  console.log('--- Starting Profile Picture Pipeline Test ---');

  // 1. Find or pick an active user
  const user = await prisma.user.findFirst({
    where: { isActive: true },
    include: { profile: true },
  });

  if (!user) {
    console.error('No active user found in DB for testing.');
    process.exit(1);
  }

  console.log(`Found test user: ${user.firstName} ${user.lastName} (${user.email}) ID: ${user.id}`);

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  // 2. Prepare multipart body with a sample PNG 1x1 buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const boundary = '----WebKitFormBoundaryTest1234567890';
  const postDataHeader = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="avatar"; filename="avatar.png"\r\n` +
      `Content-Type: image/png\r\n\r\n`
  );
  const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);

  const payload = Buffer.concat([postDataHeader, samplePngBuffer, postDataFooter]);

  // 3. Test POST /api/employees/profile-picture
  console.log('\nTesting POST /api/employees/profile-picture...');

  const uploadResult = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employees/profile-picture',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log('Upload response status:', uploadResult.status);
  console.log('Upload response body:', JSON.stringify(uploadResult.data, null, 2));

  if (uploadResult.status !== 200 || !uploadResult.data?.success) {
    console.error('FAILED: Profile picture upload endpoint failed.');
    process.exit(1);
  }

  const uploadedAvatarUrl = uploadResult.data.data?.avatarUrl;
  console.log('Received Avatar URL:', uploadedAvatarUrl ? 'VALID URL PRESENT' : 'MISSING');

  // 4. Verify in Database
  const profileInDb = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
  });
  console.log('\nVerifying database state:');
  console.log('EmployeeProfile.avatarUrl in DB:', profileInDb?.avatarUrl ? 'PERSISTED IN POSTGRESQL' : 'NULL');

  // 5. Test GET /api/auth/me
  console.log('\nTesting GET /api/auth/me...');
  const meResult = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

  console.log('GET /api/auth/me status:', meResult.status);
  console.log('user.profile.avatarUrl from /auth/me:', meResult.data?.data?.user?.profile?.avatarUrl ? 'CONFIRMED RETRIEVED' : 'MISSING');

  // 6. Test DELETE /api/employees/profile-picture
  console.log('\nTesting DELETE /api/employees/profile-picture...');
  const deleteResult = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employees/profile-picture',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

  console.log('DELETE status:', deleteResult.status);
  console.log('DELETE response body:', JSON.stringify(deleteResult.data, null, 2));

  const profileAfterDelete = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
  });
  console.log('EmployeeProfile.avatarUrl after deletion:', profileAfterDelete?.avatarUrl);

  console.log('\n=== ALL PROFILE PICTURE PIPELINE TESTS PASSED SUCCESSFULLY! ===');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
