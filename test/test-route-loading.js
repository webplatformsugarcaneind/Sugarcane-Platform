// Test if the route file loads without errors
console.log('Testing route file loading...');

try {
  const listingsRoutes = require('./routes/listings.routes.simple');
  console.log('✅ listings.routes.simple loaded successfully');
  console.log('Route object type:', typeof listingsRoutes);
  console.log('Route object:', listingsRoutes);
  console.log('Router stack:', listingsRoutes.stack?.length || 'no stack');
} catch (error) {
  console.log('❌ Error loading listings.routes.simple:');
  console.log(error.message);
}

try {
  const authRoutes = require('./routes/auth.routes');
  console.log('✅ auth.routes loaded successfully for comparison');
  console.log('Auth route object type:', typeof authRoutes);
  console.log('Auth router stack:', authRoutes.stack?.length || 'no stack');
} catch (error) {
  console.log('❌ Error loading auth.routes:');
  console.log(error.message);
}