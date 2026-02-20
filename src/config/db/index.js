import pgp from 'pg-promise';

// configure pg-promise 
const pg = pgp({ noWarnings: true });

// database connection details
const connectDB = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
const cn = {
  connectionString: connectDB,
  max: 1000
};

// configure the database
const db = pg(cn);

export default db;
