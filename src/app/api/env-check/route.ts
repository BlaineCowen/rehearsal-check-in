import { NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  // Read both env files
  const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : 'No .env.local file';
  const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : 'No .env file';

  return NextResponse.json({
    current: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 10),
    envFiles: {
      envLocal,
      env,
    },
    cwd: process.cwd(),
  });
} 