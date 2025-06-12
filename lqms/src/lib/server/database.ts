import mysql from 'mysql2/promise';

/**
 * MySQL connection pool.
 * 
 * Uses the following environment variables for configuration:
 * - DATABASE_HOST: Hostname of the MySQL server
 * - DATABASE_USER: Username for authentication
 * - DATABASE_PASSWORD: Password for authentication
 * - DATABASE_NAME: Name of the database to connect to
 */
export const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});