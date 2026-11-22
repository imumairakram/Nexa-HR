require('dotenv').config();
const { enforceDatabaseSafety } = require('../src/utils/envGuard');

enforceDatabaseSafety();
console.log('✓ Environment host safety guard verified: Target database is safe.');
