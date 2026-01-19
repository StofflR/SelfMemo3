import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { UserService } from "services/UserService";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log("Current user:", user, "id:", user?.id);
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return new NextResponse(JSON.stringify([]), { status: 200 });
    }

    const userService = UserService.getInstance();
    const users = await userService.searchUsersByUsername(query);
    console.log(`Found ${users.length} users matching query "${query}"`);
    console.log("Users:", users);
    // Return only relevant user information, excluding the current user
    const filteredUsers = users
      .filter((u) => u.id !== user.id)
      .map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
      }));

    return new NextResponse(JSON.stringify(filteredUsers), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: error.message || "An error occurred" }),
      { status: 500 }
    );
  }
}
