"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { F1RealisticVegas } from "@/components/modals/race/Race"; 
import { useModal } from "@/hooks/use-modal-store";

export const RaceSimulationModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "carRace";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1300px] bg-[#050505] border-zinc-800 p-0 overflow-hidden outline-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-black">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-white text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <div className="w-2 h-8 bg-red-600 italic -skew-x-12" />
              Live Grand Prix Telemetry
            </DialogTitle>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded bg-zinc-900/50">
                System: <span className="text-emerald-500 font-bold animate-pulse">Live_Link_Active</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 4. The Race Engine - Fits perfectly now */}
        <div className="bg-[#0a0a0a] min-h-[680px] w-full">
          <F1RealisticVegas/>
        </div>
      </DialogContent>
    </Dialog>
  );
};