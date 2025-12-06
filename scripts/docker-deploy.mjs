#!/usr/bin/env node

/**
 * Docker Deployment Script
 * Ensures database is ready before starting the application
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import pg from 'pg';

const { Client } = pg;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDatabase(maxAttempts = 30) {
  log(`${colors.blue}Waiting for database to be ready...${colors.reset}`);
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = new Client({ connectionString: dbUrl });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      
      log(`${colors.green}✓ Database is ready!${colors.reset}`);
      return true;
    } catch (error) {
      log(`Attempt ${attempt}/${maxAttempts} - Database not ready yet...`, colors.yellow);
      if (attempt === maxAttempts) {
        throw new Error(`Database failed to become ready after ${maxAttempts} attempts`);
      }
      await sleep(2000);
    }
  }
}

async function initializeDatabase() {
  log(`${colors.blue}Initializing database schema...${colors.reset}`);
  
  try {
    execSync('node scripts/db-init.mjs', { stdio: 'inherit' });
    log(`${colors.green}✓ Database initialized successfully${colors.reset}`);
  } catch (error) {
    throw new Error('Database initialization failed');
  }
}

async function main() {
  log(`${colors.bright}========================================`, colors.blue);
  log('  BookYourPTO Docker Deployment', colors.blue);
  log(`========================================${colors.reset}`, colors.blue);

  try {
    // Step 1: Wait for database
    await waitForDatabase();
    
    // Step 2: Initialize database
    await initializeDatabase();
    
    // Step 3: Start the application
    log(`\n${colors.green}${colors.bright}✓ Deployment preparation complete!${colors.reset}`);
    log(`${colors.green}Starting application...${colors.reset}\n`);
    
    // Start the Nuxt app
    execSync('node .output/server/index.mjs', { stdio: 'inherit' });
    
  } catch (error) {
    log(`\n${colors.red}${colors.bright}✗ Deployment failed${colors.reset}`, colors.red);
    log(`${colors.red}Error: ${error.message}${colors.reset}`, colors.red);
    process.exit(1);
  }
}

main();