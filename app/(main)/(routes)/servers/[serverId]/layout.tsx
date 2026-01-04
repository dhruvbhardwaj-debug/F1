import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/ServerSidebar";
const ServerIdLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ serverId: string }>; // 1. Update type to Promise
}) => {
    const profile = await currentProfile();
    if (!profile) return redirect(`/sign-in`);

    // 2. Await the params
    const { serverId } = await params;

    const server = await db.server.findUnique({
        where: {
            id: serverId, // 3. Use the awaited variable
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (!server) return redirect("/");
    

    return (
        <div className="h-full">
            <div className="h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId}/>
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
}

export default ServerIdLayout;