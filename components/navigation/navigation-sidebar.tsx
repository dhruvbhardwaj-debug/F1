import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-Action";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../ui/themeModes";
import { UserButton } from "@clerk/nextjs";
import { CarDesign } from "./carDesign";
import { Race } from "./finalRace";
import { DeveloperButton } from "../DeveloperButton";


export const NavigationSidebar = async () => {
  const profile = await currentProfile();
  if (!profile) return redirect("/");

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // HIGHER CONTRAST CHECKERS: Using a lighter grey against the base
  const checkeredBg = {
    backgroundColor: "#222231",
    backgroundImage: `
      linear-gradient(45deg, #31314a 25%, transparent 25%), 
      linear-gradient(-45deg, #31314a 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #31314a 75%), 
      linear-gradient(-45deg, transparent 75%, #31314a 75%)
    `,
    backgroundSize: "32px 32px",
    backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0px"
  };

  return (
    <div 
      style={checkeredBg}
      className="space-y-4 flex flex-col items-center h-full text-primary w-full py-4 border-r dark:border-black/40 shadow-xl relative overflow-hidden"
    >
      {/* TIGHT FADE OVERLAY: 
          Keeps checkers 100% visible until the very right edge (85%)
          where it blends into the solid sidebar color.
      */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "linear-gradient(to left, #222231 0%, #222231 15%, transparent 60%)"
        }}
      />

      <div className="relative z-10 flex flex-col items-center h-full w-full space-y-4">
        <NavigationAction />
        <CarDesign/>
        <Race/>
        
        {/* <Separator className="h-[2px] bg-red-600/50 rounded-full w-10 mx-auto" /> */}
        
        <ScrollArea className="flex-1 w-full">
          {servers.map((server) => (
            <div key={server.id} className="mb-4 flex justify-center w-full">
              <NavigationItem
                id={server.id}
                imageUrl={server.imageUrl}
                name={server.name}
              />
            </div>
          ))}
        </ScrollArea>

        <div className="pb-4 mt-auto flex items-center flex-col gap-y-2">
          <div className="hover:scale-110 transition-transform">
            <ModeToggle />
          </div>
          <DeveloperButton mode="sidebar" />
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-red-600/30 rounded-full blur-[6px] opacity-0 group-hover:opacity-100 transition duration-500" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-[44px] w-[44px] border-2 border-zinc-800 dark:border-[#31314a] hover:border-red-600 transition-all shadow-xl",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};