/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Image from "next/image"
import { useParams,useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { ActionTooltip } from "../ui/action-tooltip"

interface NavigationItemProps{
    id:string;
    imageUrl:string;
    name:string;
}
export const NavigationItem=({id,imageUrl,name}:NavigationItemProps)=>{
    
    const params= useParams();
    const router = useRouter();


return (
    <ActionTooltip side="right" label={name} align="center">
        <button 
            onClick={() => router.push(`/servers/${id}`)} // Fixed: added navigation
            className="group relative flex items-center w-full" // Added w-full to center content
        >
            {/* Active Indicator Bar */}
            <div className={cn(
                "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]", // Fixed: w-full -> w-[4px]
                params?.serverId !== id && "group-hover:h-[20px]",
                params?.serverId === id ? "h-[36px]" : "h-[8px]" // Fixed: added "px" to 36
            )} />

            {/* Image Container */}
            <div className={cn(
                "relative group flex mx-auto h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden", // Fixed: Added w-[48px] and mx-auto
                params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
            )}>
                <Image 
                    fill
                    src={imageUrl}
                    alt="Channel"
                    className="object-cover" // Added to prevent image stretching
                />
            </div>
        </button>
    </ActionTooltip>
)

}