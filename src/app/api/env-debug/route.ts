import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: process.env.BLOB_READ_WRITE_TOKEN,
    envPath: process.env.PATH,
    processPath: process.execPath,
    cwd: process.cwd(),
    platform: process.platform,
    envPaths: process.env.PATH?.split(':'),
  });
} 