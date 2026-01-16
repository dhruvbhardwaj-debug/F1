"use client";

import dynamic from 'next/dynamic';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription // Adding this for extra accessibility
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { CarDesignChatbot } from "@/components/modals/car-design/car-design-chatbot";

// SSR disabled for 3D performance
const CarDesignCanvas = dynamic(
  () => import("@/components/modals/car-design/car-design-canvas"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-black text-white font-mono text-xs">
        INITIALIZING VIRTUAL GARAGE...
      </div>
    )
  }
);

export const CarDesignModal = () => {
  const { isOpen, type, onClose } = useModal();
  const open = isOpen && type === "carDesign";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-black border-zinc-800 p-0 overflow-hidden outline-none flex flex-col">
        
        {/* --- ADDED THIS SECTION TO FIX THE ERROR --- */}
        <DialogHeader className="sr-only"> 
          <DialogTitle>F1 Chassis Engineering Studio</DialogTitle>
          <DialogDescription>
            Configure aerodynamics, mechanical linkage, and power unit parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* 75% Space for the 3D Model */}
          <div className="flex-[3] relative border-r border-white/5">
            <CarDesignCanvas />
          </div>
          
          {/* 25% Space for the Chatbot */}
          <div className="flex-1 min-w-[350px] bg-zinc-950/50">
            <CarDesignChatbot />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};