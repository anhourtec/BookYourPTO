#!/usr/bin/env node

/**
 * BookYourPTO – Database Initialization Script
 * 
 * Works with Prisma 7.x using prisma.config.ts
 */

import 'dotenv/config';
import { execSync } from 'child_process';

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

function execCommand(command, description) {
  try {
    log(`\n${colors.blue}► ${description}...${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✓ ${description} completed${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`, colors.red);
    return false;
  }
}

async function main() {
  log(`${colors.bright}========================================`, colors.blue);
  log('  BookYourPTO Database Initialization', colors.blue);
  log(`========================================${colors.reset}`, colors.blue);

  try {
    if (!process.env.DATABASE_URL) {
      log('✗ DATABASE_URL is not set', colors.red);
      process.exit(1);
    }

    const nodeEnv = process.env.NODE_ENV || 'development';
    log(`\nEnvironment: ${nodeEnv}`, colors.blue);
    log(
      `Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`,
      colors.blue
    );

    // Step 1: Generate Prisma Client
    if (!execCommand('npx prisma generate', 'Generating Prisma Client')) {
      throw new Error('Failed to generate Prisma Client');
    }

    // Step 2: Apply schema using db push
    log('\n⚡ Applying database schema...', colors.blue);
    if (!execCommand(
      'npx prisma db push --accept-data-loss',
      'Pushing schema to database'
    )) {
      throw new Error('Failed to apply database schema');
    }

    log(
      `\n${colors.green}${colors.bright}✓ Database initialization completed successfully!${colors.reset}`
    );
    log(`${colors.green}✓ Application is ready to start.${colors.reset}\n`);

  } catch (error) {
    log(
      `\n${colors.red}${colors.bright}✗ Database initialization failed${colors.reset}`,
      colors.red
    );
    log(`${colors.red}${error.message}${colors.reset}`, colors.red);
    process.exit(1);
  }
}

main();
