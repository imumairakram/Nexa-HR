/**
 * src/services/demoGuard.service.js
 *
 * Startup Guard for Isolated Demo Environment Safety:
 * - If ENABLE_GUEST_DEMO=true, verifies that the database contains ONLY demo accounts (isDemo: true).
 * - If ANY real/non-demo user (isDemo: false) is found, logs a loud critical error and disables
 *   all guest demo endpoints to guarantee zero data leakage from real accounts.
 */

let guestDemoActive = false;

async function initDemoGuard(prismaClient) {
  if (process.env.ENABLE_GUEST_DEMO !== 'true') {
    guestDemoActive = false;
    return false;
  }

  try {
    const nonDemoCount = await prismaClient.user.count({
      where: { isDemo: false },
    });

    if (nonDemoCount > 0) {
      console.error('========================================================================');
      console.error('[CRITICAL SECURITY ERROR] ENABLE_GUEST_DEMO=true, but target database contains');
      console.error(`  ${nonDemoCount} REAL / NON-DEMO user account(s)!`);
      console.error('GUEST DEMO ENDPOINTS HAVE BEEN AUTOMATICALLY BLOCKED FOR DATA SAFETY.');
      console.error('Guest demo mode is strictly restricted to an isolated demo database.');
      console.error('========================================================================');
      guestDemoActive = false;
      return false;
    }

    guestDemoActive = true;
    console.log('[SECURITY GUARD] Isolated demo environment verified (0 real accounts). Guest demo is ACTIVE.');
    return true;
  } catch (error) {
    console.error('[SECURITY GUARD ERROR] Failed to verify demo database isolation:', error.message);
    guestDemoActive = false;
    return false;
  }
}

function isGuestDemoActive() {
  return guestDemoActive && process.env.ENABLE_GUEST_DEMO === 'true';
}

// For unit testing only
function setGuestDemoActiveForTesting(active) {
  guestDemoActive = active;
}

module.exports = {
  initDemoGuard,
  isGuestDemoActive,
  setGuestDemoActiveForTesting,
};

