import { NextResponse } from "next/server";
import { createAuroraClient } from "@/lib/aurora";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as { status?: string };
    const { status } = body;

    if (status !== "cancelled") {
      return NextResponse.json(
        { error: "Only status 'cancelled' is supported" },
        { status: 400 }
      );
    }

    const client = createAuroraClient();
    const booking = (await client.tables("bookings").records.get(id)) as Record<
      string,
      unknown
    >;
    const timeSlotId = booking?.time_slot_id ? String(booking.time_slot_id) : null;

    await client.tables("bookings").records.update(id, { status: "cancelled" });

    // Free up the time slot
    if (timeSlotId) {
      await client.tables("time_slots").records.update(timeSlotId, {
        status: "available",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
