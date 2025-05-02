/**
 * Utility to validate required environment variables
 */

function validateEnv() {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const productionVars = [
    'NODE_ENV',
    'PORT',
    'CORS_ORIGIN'
  ];

  // Check required variables in all environments
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file or environment configuration');
    return false;
  }

  // Check additional variables required in production
  if (process.env.NODE_ENV === 'production') {
    const missingProdVars = productionVars.filter(varName => !process.env[varName]);
    
    if (missingProdVars.length > 0) {
      console.error(`Missing production environment variables: ${missingProdVars.join(', ')}`);
      console.error('These variables are required in production environment');
      return false;
    }
    
    // Check JWT_SECRET strength in production
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.warn('WARNING: JWT_SECRET is too short for production use. It should be at least 32 characters long.');
    }
  }

  return true;
}

module.exports = validateEnv;
