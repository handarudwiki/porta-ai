import { getPersistedEventById } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const event = await getPersistedEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch event" }, { status: 500 });
  }
}
