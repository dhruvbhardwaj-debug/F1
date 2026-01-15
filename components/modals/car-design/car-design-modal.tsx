// components/modals/car-design-modal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import CarDesignCanvas from "@/components/modals/car-design/car-design-canvas";

import { CarDesignChatbot } from "@/components/modals/car-design/car-design-chatbot"; // adjust path

export const CarDesignModal = () => {
  const { isOpen, type, onClose } = useModal();
  const open = isOpen && type === "carDesign";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1400px] bg-zinc-900 border-zinc-800 p-0 overflow-hidden outline-none">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-white text-xl font-black tracking-tighter uppercase italic">
            Chassis R&D Engineering Studio
          </DialogTitle>
        </DialogHeader>

        {/* Flex container to hold Canvas and Chatbot side-by-side */}
        <div className="p-4 flex h-[820px] gap-0">
          <div className="flex-1">
            <CarDesignCanvas />
          </div>
          <CarDesignChatbot />
        </div>
      </DialogContent>
    </Dialog>
  );
};