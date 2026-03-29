/**
 * Quick verification script to check if HHM invite factory endpoints exist
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking HHM Invite Factory Implementation...\n');

// Check 1: Controller functions
console.log('1️⃣ Checking HHM Controller...');
const controllerPath = path.join(__dirname, 'controllers', 'hhm.controller.js');
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

const hasInviteFactory = controllerContent.includes('const inviteFactory = async');
const hasInviteMultiple = controllerContent.includes('const inviteMultipleFactories = async');
const hasGetMyInvitations = controllerContent.includes('const getMyFactoryInvitations = async');

console.log(`   ✅ inviteFactory function: ${hasInviteFactory ? 'PRESENT' : 'MISSING'}`);
console.log(`   ✅ inviteMultipleFactories function: ${hasInviteMultiple ? 'PRESENT' : 'MISSING'}`);
console.log(`   ✅ getMyFactoryInvitations function: ${hasGetMyInvitations ? 'PRESENT' : 'MISSING'}`);

// Check exports
const exportsInviteFactory = controllerContent.includes('inviteFactory,');
const exportsInviteMultiple = controllerContent.includes('inviteMultipleFactories,');
const exportsGetMyInvitations = controllerContent.includes('getMyFactoryInvitations');

console.log(`   ✅ inviteFactory exported: ${exportsInviteFactory ? 'YES' : 'NO'}`);
console.log(`   ✅ inviteMultipleFactories exported: ${exportsInviteMultiple ? 'YES' : 'NO'}`);
console.log(`   ✅ getMyFactoryInvitations exported: ${exportsGetMyInvitations ? 'YES' : 'NO'}`);

// Check 2: Routes
console.log('\n2️⃣ Checking HHM Routes...');
const routesPath = path.join(__dirname, 'routes', 'hhm.routes.js');
const routesContent = fs.readFileSync(routesPath, 'utf8');

const hasInviteFactoryRoute = routesContent.includes("router.post('/invite-factory'");
const hasInviteMultipleRoute = routesContent.includes("router.post('/invite-multiple-factories'");
const hasGetMyInvitationsRoute = routesContent.includes("router.get('/my-factory-invitations'");

console.log(`   ✅ POST /invite-factory route: ${hasInviteFactoryRoute ? 'PRESENT' : 'MISSING'}`);
console.log(`   ✅ POST /invite-multiple-factories route: ${hasInviteMultipleRoute ? 'PRESENT' : 'MISSING'}`);
console.log(`   ✅ GET /my-factory-invitations route: ${hasGetMyInvitationsRoute ? 'PRESENT' : 'MISSING'}`);

// Check imports
const importsInviteFactory = routesContent.includes('inviteFactory');
const importsInviteMultiple = routesContent.includes('inviteMultipleFactories');
const importsGetMyInvitations = routesContent.includes('getMyFactoryInvitations');

console.log(`   ✅ inviteFactory imported: ${importsInviteFactory ? 'YES' : 'NO'}`);
console.log(`   ✅ inviteMultipleFactories imported: ${importsInviteMultiple ? 'YES' : 'NO'}`);
console.log(`   ✅ getMyFactoryInvitations imported: ${importsGetMyInvitations ? 'YES' : 'NO'}`);

// Check 3: Invitation Model
console.log('\n3️⃣ Checking Invitation Model...');
const modelPath = path.join(__dirname, 'models', 'invitation.model.js');
const modelContent = fs.readFileSync(modelPath, 'utf8');

const hasHHMtoFactoryType = modelContent.includes("'hhm-to-factory'");
console.log(`   ✅ 'hhm-to-factory' invitation type: ${hasHHMtoFactoryType ? 'PRESENT' : 'MISSING'}`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY:');
console.log('='.repeat(60));

const allChecks = [
    hasInviteFactory,
    hasInviteMultiple,
    hasGetMyInvitations,
    exportsInviteFactory,
    exportsInviteMultiple,
    exportsGetMyInvitations,
    hasInviteFactoryRoute,
    hasInviteMultipleRoute,
    hasGetMyInvitationsRoute,
    importsInviteFactory,
    importsInviteMultiple,
    importsGetMyInvitations,
    hasHHMtoFactoryType
];

const passedChecks = allChecks.filter(check => check).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
    console.log(`✅ ALL CHECKS PASSED (${passedChecks}/${totalChecks})`);
    console.log('\n🎉 HHM CAN SEND INVITATIONS TO FACTORIES!');
    console.log('\nAvailable Endpoints:');
    console.log('   POST   /api/hhm/invite-factory');
    console.log('   POST   /api/hhm/invite-multiple-factories');
    console.log('   GET    /api/hhm/my-factory-invitations');
} else {
    console.log(`⚠️  SOME CHECKS FAILED (${passedChecks}/${totalChecks})`);
    console.log('\n❌ HHM invitation to factory is INCOMPLETE');
}

console.log('='.repeat(60));
