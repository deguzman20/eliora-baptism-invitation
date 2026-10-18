import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const attendance = body.attendance;
    const guests = body.guests;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const confirmed = body.confirmed === true;

    if (!confirmed)
      return NextResponse.json(
        { error: "Please confirm the reservation before saving." },
        { status: 400 }
      );
    if (name.length < 2 || name.length > 80)
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    if (attendance !== "yes" && attendance !== "no")
      return NextResponse.json(
        { error: "Invalid attendance selection." },
        { status: 400 }
      );
    if (
      !Number.isInteger(guests) ||
      (attendance === "yes" ? guests < 1 || guests > 20 : guests !== 0)
    )
      return NextResponse.json(
        { error: "Guest count is invalid." },
        { status: 400 }
      );
    if (message.length > 300)
      return NextResponse.json(
        { error: "Message must be 300 characters or less." },
        { status: 400 }
      );

    const doc = await adminDb.collection("reservations").add({
      name,
      attendance,
      guests,
      message,
      source: "chatbot",
      status: "confirmed",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, reservationId: doc.id });
  } catch (error) {
    console.error("CHATBOT RESERVATION SAVE ERROR:", error);
    return NextResponse.json(
      { error: "Could not save the reservation. Please try again later." },
      { status: 500 }
    );
  }
}
