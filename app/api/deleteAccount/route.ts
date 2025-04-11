import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin"; // Import your supabaseAdmin client

// This handler will delete the user based on the user ID provided in the request body
export async function DELETE(req: Request) {
  try {
    // Parse the JSON body of the request
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Delete the user using the Service Role Key
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return success message if deletion is successful
    return NextResponse.json(
      { message: "User deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete the user." },
      { status: 500 }
    );
  }
}
