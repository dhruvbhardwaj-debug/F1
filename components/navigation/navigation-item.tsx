"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { ActionTooltip } from "../ui/action-tooltip"

interface NavigationItemProps {
    id: string;
    imageUrl: string;
    name: string;
}

export const NavigationItem = ({ id, imageUrl, name }: NavigationItemProps) => {
    const params = useParams();
    const router = useRouter();

    const isActive = params?.serverId === id;

    return (
        <ActionTooltip side="right" label={name} align="center">
            <button
                onClick={() => router.push(`/servers/${id}`)}
                className="group relative flex items-center w-full mb-1">
                {/* F1 Active Indicator (The "Ready" Light) */}
                <div className={cn(
                    "absolute left-0 bg-red-600 rounded-r-full transition-all duration-300 w-[4px]",
                    !isActive && "group-hover:h-[20px] opacity-0 group-hover:opacity-100",
                    isActive ? "h-[36px] opacity-100 shadow-[0_0_10px_rgba(220,38,38,0.8)]" : "h-[8px]"
                )} />

                {/* Team Badge Container */}
                <div className={cn(
                    "relative group flex mx-auto h-[48px] w-[48px] transition-all duration-300 overflow-hidden",
                    "border-2 border-transparent",
                    // Shape: Circular for inactive, Squircle for active/hover
                    isActive 
                        ? "rounded-[12px] border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                        : "rounded-[24px] group-hover:rounded-[12px] bg-[#18181b] group-hover:border-zinc-700"
                )}>
                    {/* Dark overlay for inactive servers */}
                    {!isActive && (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                    )}
                    
                    <Image 
                        fill
                        src={imageUrl}
                        alt={name}
                        className={cn(
                            "object-cover transition-transform duration-500",
                            isActive ? "scale-100" : "group-hover:scale-100 grayscale-[0.5] group-hover:grayscale-0"
                        )}
                    />
                </div>
            </button>
        </ActionTooltip>
    )
}