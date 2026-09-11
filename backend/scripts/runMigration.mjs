import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const sqlPath = path.resolve('../schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  const client = new Client({
    connectionString: 'postgresql://postgres:Ahilesh%402004%40@db.psccqynqwebbtzdaqfqv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected! Executing schema.sql (this may take a few seconds)...');
  
  await client.query(sql);
  console.log('Schema executed successfully!');
  
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log(`Public tables created (${res.rows.length}):`);
  res.rows.forEach(r => console.log(' - ' + r.table_name));
  
  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
