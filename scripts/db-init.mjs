#!/usr/bin/env node

/**
 * BookYourPTO – Database Initialization Script
 *
 * Responsibilities:
 * - Generate Prisma Client
 * - Apply migrations safely in production
 * - Allow db push ONLY in development
 *
 * Production rules:
 * - ❌ Never run prisma db push
 * - ✅ Only prisma migrate deploy (if migrations exist)
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
    // ------------------------------------------------------------------
    // Environment validation
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // Step 1: Generate Prisma Client
    // ------------------------------------------------------------------
    execCommand(
      'npx prisma generate',
      'Generating Prisma Client'
    );

    // ------------------------------------------------------------------
    // Step 2: Database schema handling
    // ------------------------------------------------------------------
    const migrationsDir = join(process.cwd(), 'prisma', 'migrations');
    const migrationLock = join(migrationsDir, 'migration_lock.toml');

    const hasMigrations =
      existsSync(migrationsDir) && existsSync(migrationLock);

    if (nodeEnv === 'production') {
      // ============================
      // PRODUCTION BEHAVIOR
      // ============================
      if (hasMigrations) {
        log('\n✓ Production mode: applying migrations', colors.blue);
        execCommand(
          'npx prisma migrate deploy',
          'Applying database migrations'
        );
      } else {
        log(
          '\n✓ Production mode: no migrations found, skipping schema changes',
          colors.green
        );
      }
    } else {
      // ============================
      // DEVELOPMENT BEHAVIOR
      // ============================
      if (hasMigrations) {
        log('\n✓ Development mode: applying migrations', colors.blue);
        execCommand(
          'npx prisma migrate deploy',
          'Applying database migrations'
        );
      } else {
        log(
          '\n⚠️  Development mode: using db push (no migrations found)',
          colors.yellow
        );
        execCommand(
          'npx prisma db push --accept-data-loss',
          'Pushing schema to database'
        );
      }
    }

    // ------------------------------------------------------------------
    // Step 3: Optional seed notice
    // ------------------------------------------------------------------
    const seedFile = join(process.cwd(), 'prisma', 'seed.ts');
    if (existsSync(seedFile)) {
      log(
        '\n📦 Seed file detected. Run `npm run db:seed` if needed.',
        colors.blue
      );
    }

    // ------------------------------------------------------------------
    // Done
    // ------------------------------------------------------------------
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
