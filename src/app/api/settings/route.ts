import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSystemSetting, setSystemSetting } from '@/lib/config';

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key) {
    const value = await getSystemSetting(key, {});
    return NextResponse.json({ value });
  }

  return NextResponse.json({ error: "Missing key" }, { status: 400 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
  }

  await setSystemSetting(key, value);
  return NextResponse.json({ success: true });
}
