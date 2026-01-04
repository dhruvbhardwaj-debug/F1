
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

export default async function InviteCodePage({ params }: InviteCodePageProps) {
  const profile = await currentProfile();
  const { inviteCode } = await params;

  if (!profile) return redirect("/sign-in");
  if (!inviteCode) return redirect("/");

  // 1. First, find the server that matches this invite code
  const serverByCode = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
    },
    include: {
      members: true,
    }
  });

  // If the invite code doesn't exist at all, go home
  if (!serverByCode) return redirect("/");

  // 2. Check if the current user (McLaren) is already in THIS specific server (Red Bull)
  const isAlreadyMember = serverByCode.members.some(
    (member) => member.profileId === profile.id
  );

  if (isAlreadyMember) {
    return redirect(`/servers/${serverByCode.id}`);
  }

  // 3. If they aren't a member, add them to THIS specific server
  const joinedServer = await db.server.update({
    where: {
      id: serverByCode.id, // Use the ID we found, not the code
    },
    data: {
      members: {
        create: [
          { profileId: profile.id }
        ]
      }
    }
  });

  if (joinedServer) {
    return redirect(`/servers/${joinedServer.id}`);
  }

  return redirect("/");
}