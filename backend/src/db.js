const { Pool } = require('pg');

// Initialize a connection pool
const pool = new Pool({
    user: 'your_username',  // your database username
    host: 'localhost',       // your database server hostname
    database: 'your_database_name',  // your database name
    password: 'your_password',  // your database password
    port: 5432,  // default PostgreSQL port
});

// Export the pool
module.exports = pool;
