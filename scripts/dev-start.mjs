#!/usr/bin/env node

/**
 * Development Start Script
 * Initializes database and starts dev server
 */

import 'dotenv/config';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  log(`${colors.bright}========================================`, colors.blue);
  log('  BookYourPTO Development Server', colors.blue);
  log(`========================================${colors.reset}`, colors.blue);

  try {
    // Initialize database
    log(`\n${colors.blue}Initializing database...${colors.reset}`);
    execSync('node scripts/db-init.mjs', { stdio: 'inherit' });
    
    // Start dev server
    log(`\n${colors.green}Starting development server...${colors.reset}\n`);
    execSync('nuxt dev --host', { stdio: 'inherit' });
    
  } catch (error) {
    log(`\n${colors.red}✗ Development server failed to start${colors.reset}`);
    process.exit(1);
  }
}

main();