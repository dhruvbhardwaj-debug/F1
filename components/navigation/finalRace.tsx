"use client"

import { CarIcon, Flag, Plus } from "lucide-react"
import { ActionTooltip } from "@/components/ui/action-tooltip"
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";

export const Race = () => {
    const { onOpen } = useModal();

    return (
        <div className="mb-4">
            <ActionTooltip side="right" align="center" label="Live Race">
                <button 
                    onClick={() => onOpen("carRace")}
                    className="group flex items-center relative">{/* Active/Hover Indicator (Vertical pill) */}

                    {/* Active/Hover Indicator (Vertical pill) */}
                    <div className="absolute left-0 bg-green-500 rounded-r-full transition-all w-[4px] h-[8px] group-hover:h-[20px]" />

                    <div className={cn(
                        "flex mx-3 h-[48px] w-[48px] transition-all duration-300 overflow-hidden items-center justify-center",
                        "bg-[#18181b] border border-zinc-800", // Asphalt background
                        "rounded-[16px] group-hover:rounded-[12px] group-hover:bg-green-500 group-hover:border-green-500", // Shape shift on hover
                        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" // Subtle metallic highlight
                    )}>
                        <Flag
                            className="transition-all duration-300 text-green-500 group-hover:text-white group-hover:rotate-90" 
                            size={22}
                            strokeWidth={3}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}