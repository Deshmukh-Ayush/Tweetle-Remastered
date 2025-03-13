import {dbConnect} from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      await dbConnect();
      return NextResponse.json({ message: 'Database connected' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Database connection failed', error: error.message },
        { status: 500 }
      );
    }
  }