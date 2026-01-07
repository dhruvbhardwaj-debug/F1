import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";

interface MemberIdPageProps {
  params: Promise<{ // Note: params is now a Promise in Next.js 15
    memberId: string;
    serverId: string;
  }>;
}

const MemberIdPage = async ({
  params,
}: MemberIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  // Await params once and destructure
  const { memberId, serverId } = await params;

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  // Usually in a Member ID page, you want to start a conversation
  const conversation = await getOrCreateConversation(currentMember.id, memberId);

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  // Determine which member is the "other" person to display their info
  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-zinc-800 flex flex-col h-full">
       <ChatHeader 
        imageUrl ={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
       />
    </div>
  );
};

export default MemberIdPage;