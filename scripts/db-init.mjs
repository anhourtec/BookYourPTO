#!/usr/bin/env node

/**
 * Database Initialization Script
 * Handles Prisma client generation and migrations
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

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
    throw error;
  }
}

async function main() {
  log(`${colors.bright}========================================`, colors.blue);
  log('  BookYourPTO Database Initialization', colors.blue);
  log(`========================================${colors.reset}`, colors.blue);

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      log('⚠️  DATABASE_URL not found in environment variables', colors.yellow);
      log('Please make sure your .env file is properly configured', colors.yellow);
      process.exit(1);
    }

    log(`\nDatabase URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`, colors.blue);

    // Step 1: Generate Prisma Client
    execCommand(
      'npx prisma generate',
      'Generating Prisma Client'
    );

    // Step 2: Run migrations or push schema
    const migrationsDir = join(process.cwd(), 'prisma', 'migrations');
    const migrationLock = join(migrationsDir, 'migration_lock.toml');
    const prismaConfig = join(process.cwd(), 'prisma.config.ts');
    
    const hasMigrations = existsSync(migrationsDir) && existsSync(migrationLock);
    const hasConfig = existsSync(prismaConfig);
    
    // Use migrations only if we have both migrations AND config file
    if (hasMigrations && hasConfig) {
      log('\n✓ Migrations and config found. Applying migrations...', colors.blue);
      execCommand(
        'npx prisma migrate deploy',
        'Applying database migrations'
      );
    } else {
      // Otherwise use db push (better for development)
      if (!hasConfig) {
        log('\n⚠️  No prisma.config.ts found. Using db push...', colors.yellow);
      } else {
        log('\n⚠️  No migrations found. Using db push...', colors.yellow);
      }
      
      execCommand(
        'npx prisma db push --accept-data-loss',
        'Pushing schema to database'
      );
    }

    // Step 3: Optional seed (if seed file exists)
    const seedFile = join(process.cwd(), 'prisma', 'seed.ts');
    if (existsSync(seedFile)) {
      log('\n📦 Seed file found. Run "npm run db:seed" to populate initial data.', colors.blue);
    }

    log(`\n${colors.green}${colors.bright}✓ Database initialization completed successfully!${colors.reset}`);
    log(`${colors.green}✓ Your application is ready to start.${colors.reset}\n`);

  } catch (error) {
    log(`\n${colors.red}${colors.bright}✗ Database initialization failed${colors.reset}`, colors.red);
    log(`${colors.red}Error: ${error.message}${colors.reset}`, colors.red);
    process.exit(1);
  }
}

main();