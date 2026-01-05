import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  // 1. Define params as a Promise
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const profile = await currentProfile();
    
    // 2. Await the params to get the string ID
    const { serverId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // 3. Update the server by removing the member
    // We filter by serverId AND make sure the person leaving is NOT the owner
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile.id // The creator cannot leave their own server
        },
        members: {
          some: {
            profileId: profile.id // Ensure the user is actually in the server
          }
        }
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id
          }
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_ID_LEAVE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}