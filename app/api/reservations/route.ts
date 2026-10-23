import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function normalizeFullName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function getReservationKey(normalizedName: string): string {
  return createHash("sha256").update(normalizedName).digest("hex");
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      const parsedBody: unknown = await request.json();

      if (
        !parsedBody ||
        typeof parsedBody !== "object" ||
        Array.isArray(parsedBody)
      ) {
        return NextResponse.json(
          { error: "Invalid request body." },
          { status: 400 }
        );
      }

      body = parsedBody as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const attendance = body.attendance;
    const guests = body.guests;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const confirmed = body.confirmed === true;

    // Require explicit confirmation from the guest.
    if (!confirmed) {
      return NextResponse.json(
        { error: "Please confirm the reservation before saving." },
        { status: 400 }
      );
    }

    // Validate full name.
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    if (!attendance || (attendance !== "yes" && attendance !== "no")) {
      return NextResponse.json(
        { error: "Invalid attendance selection." },
        { status: 400 }
      );
    }

    // Validate guest count.
    if (
      typeof guests !== "number" ||
      !Number.isInteger(guests) ||
      (attendance === "yes" ? guests < 1 || guests > 20 : guests !== 0)
    ) {
      return NextResponse.json(
        { error: "Guest count is invalid." },
        { status: 400 }
      );
    }

    if (message.length > 300) {
      return NextResponse.json(
        { error: "Message must be 300 characters or less." },
        { status: 400 }
      );
    }

    const normalizedName = normalizeFullName(name);
    const reservationKey = getReservationKey(normalizedName);

    const reservationsRef = adminDb.collection("reservations");
    const newReservationRef = reservationsRef.doc(reservationKey);

    const result = await adminDb.runTransaction(async (transaction) => {
      // First check the deterministic document ID.
      const existingKeyDoc = await transaction.get(newReservationRef);

      if (existingKeyDoc.exists) {
        return {
          duplicate: true,
          reservationId: null,
        };
      }

      // Check older reservations that may have random document IDs.
      const allReservations = await transaction.get(reservationsRef);

      const existingReservation = allReservations.docs.find((doc) => {
        const data = doc.data();

        const existingName =
          typeof data.name === "string"
            ? data.name
            : typeof data.fullName === "string"
            ? data.fullName
            : "";

        return (
          existingName.length > 0 &&
          normalizeFullName(existingName) === normalizedName
        );
      });

      if (existingReservation) {
        return {
          duplicate: true,
          reservationId: null,
        };
      }

      // Save only when no existing reservation has the same full name.
      transaction.create(newReservationRef, {
        name,
        normalizedName,
        attendance,
        guests,
        message,
        source: "chatbot",
        status: "confirmed",
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        duplicate: false,
        reservationId: newReservationRef.id,
      };
    });

    if (result.duplicate) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: "Nakapag-reserve ka na gamit ang pangalang iyan.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      reservationId: result.reservationId,
      message: "Reservation saved successfully.",
    });
  } catch (error) {
    console.error("CHATBOT RESERVATION SAVE ERROR:", {
      message:
        error instanceof Error ? error.message : "Unknown Firestore error",
    });

    return NextResponse.json(
      {
        error: "Could not save the reservation. Please try again later.",
      },
      { status: 500 }
    );
  }
}
