import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "lib/session";
import { UserService } from "services/UserService";

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userService = UserService.getInstance();
        const user = await userService.getUserById(currentUser.id);

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
        console.error("[GET /api/users/me]", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
