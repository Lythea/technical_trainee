// app/api/getUsers/route.ts
import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin'; // Import the service role client

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error.message);
      return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
