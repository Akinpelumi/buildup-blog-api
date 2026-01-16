import pgp from 'pg-promise';

// configure pg-promise 
const pg = pgp({ noWarnings: true });

// database connection details
const cn = {
  connectionString: process.env.DATABASE_URL,
  max: 1000
};

// configure the database
const db = pg(cn);

export default db;
