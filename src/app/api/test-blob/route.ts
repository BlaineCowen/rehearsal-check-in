import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenStart: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 10),
    nodeEnv: process.env.NODE_ENV,
  });
} 