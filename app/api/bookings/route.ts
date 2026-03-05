import { NextResponse } from "next/server";
import { createAuroraClient } from "@/lib/aurora";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      time_slot_id?: string;
      service_id?: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      status?: string;
    };
    const { time_slot_id, service_id, customer_name, customer_email, customer_phone, status } =
      body;
    if (!time_slot_id || !service_id || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: "time_slot_id, service_id, customer_name, and customer_email are required" },
        { status: 400 }
      );
    }
    const client = createAuroraClient();
    const record = await client.tables("bookings").records.create({
      time_slot_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone: customer_phone ?? null,
      status: status ?? "confirmed",
    });
    return NextResponse.json(record);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
