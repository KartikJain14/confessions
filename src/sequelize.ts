import { Sequelize, ValidationError } from 'sequelize';

const initializeSequelize = async () => {
  const localUri = 'sqlite:./confessions.sqlite';
  const uri = process.env.DATABASE_URI || localUri; // Use environment variable or local URI

  // Log a warning if DATABASE_URI is not set
  if (!process.env.DATABASE_URI) {
    console.warn('DATABASE_URI is not set, using local database instead.');
  }

  const sequelize = new Sequelize(uri, {
    dialect: uri.startsWith('mysql') ? 'mysql' : 'sqlite', // Determine dialect based on URI
    logging: (msg) => console.log(`Sequelize: ${msg}`), // Optional logging
  });

  try {
    // Log which database is being used
    if (uri === localUri) {
      console.log('Using Local Database.');
    } else {
      console.log('Using Global Database.');
    }
    
    await sequelize.authenticate(); // Test the connection
    console.log('Connection to the database has been established successfully.');
  } catch (error: any) {
    // Enhanced error handling
    if (error instanceof ValidationError) {
      console.error('Validation error:', error);
    } else {
      console.error('Unable to connect to the database:', error);
    }
    throw error; // Rethrow error to handle it in the calling code
  }

  return sequelize; // Return the Sequelize instance
};

export default initializeSequelize;