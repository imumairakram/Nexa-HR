const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/prisma');

async function migrateBase64Resumes() {
  console.log('--- MIGRATING BASE64 RESUMES IN DATABASE ---');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const applications = await prisma.jobApplication.findMany({
    where: {
      resumeUrl: {
        startsWith: 'data:',
      },
    },
  });

  console.log(`Found ${applications.length} applications with data: URIs in resumeUrl.`);

  for (const app of applications) {
    try {
      const match = app.resumeUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        console.warn(`Could not parse data URI for candidate: ${app.name} (${app.applicationId})`);
        continue;
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'pdf';
      if (mimeType.includes('pdf')) ext = 'pdf';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('word') || mimeType.includes('docx')) ext = 'docx';

      const filename = `resume_${app.applicationId || app.id}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      console.log(`Extracted ${buffer.length} bytes -> saved to ${fileUrl}`);

      await prisma.jobApplication.update({
        where: { id: app.id },
        data: {
          resumeUrl: fileUrl,
        },
      });

      console.log(`Updated candidate ${app.name} (${app.applicationId}) resumeUrl to: ${fileUrl}`);
    } catch (err) {
      console.error(`Failed to migrate resume for ${app.applicationId}:`, err);
    }
  }

  console.log('Migration complete!');
}

migrateBase64Resumes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

