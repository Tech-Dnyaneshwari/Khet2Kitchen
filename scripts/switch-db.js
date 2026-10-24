const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'sqlite' or 'postgres'
const rootDir = path.resolve(__dirname, '..');

if (target === 'sqlite') {
  const sqliteSchema = fs.readFileSync(path.join(rootDir, 'prisma', 'schema.sqlite.prisma'), 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'prisma', 'schema.prisma'), sqliteSchema);
  
  // Update .env DATABASE_URL
  const envPath = path.join(rootDir, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
    } else {
      envContent += '\nDATABASE_URL="file:./dev.db"\n';
    }
  } else {
    envContent = 'DATABASE_URL="file:./dev.db"\nJWT_SECRET="khet2kitchen_super_secret_jwt_key_2026_min32chars_secure"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\nNODE_ENV="development"\nDEFAULT_PLATFORM_COMMISSION_PERCENT=3.0\nDEFAULT_LOGISTICS_BASE_FEE=250.0\nDEFAULT_LOGISTICS_PER_KM_FEE=12.0\n';
  }
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Switched database schema to SQLite (dev.db)');
} else if (target === 'postgres') {
  const postgresSchema = fs.readFileSync(path.join(rootDir, 'prisma', 'schema.postgres.prisma'), 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'prisma', 'schema.prisma'), postgresSchema);
  
  const envPath = path.join(rootDir, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="postgresql://k2k_user:k2k_password_secure@localhost:5432/khet2kitchen_db?schema=public"');
    } else {
      envContent += '\nDATABASE_URL="postgresql://k2k_user:k2k_password_secure@localhost:5432/khet2kitchen_db?schema=public"\n';
    }
  } else {
    envContent = 'DATABASE_URL="postgresql://k2k_user:k2k_password_secure@localhost:5432/khet2kitchen_db?schema=public"\nJWT_SECRET="khet2kitchen_super_secret_jwt_key_2026_min32chars_secure"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\nNODE_ENV="development"\nDEFAULT_PLATFORM_COMMISSION_PERCENT=3.0\nDEFAULT_LOGISTICS_BASE_FEE=250.0\nDEFAULT_LOGISTICS_PER_KM_FEE=12.0\n';
  }
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Switched database schema to PostgreSQL (docker-compose / local PostgreSQL)');
} else {
  console.error('Usage: node scripts/switch-db.js [sqlite|postgres]');
  process.exit(1);
}
