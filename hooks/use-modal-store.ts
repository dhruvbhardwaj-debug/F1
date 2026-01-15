/* eslint-disable @typescript-eslint/no-explicit-any */
import { Channel, ChannelType, Server } from "@prisma/client"; // Import Prisma types
import { create } from "zustand";
 
export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" |"leaveServer"|"deleteServer" | "deleteChannel"
  | "editChannel"|"messageFile" |"deleteMessage"|"carDesign"|"carRace";

interface ModalData {
  server?: Server;
  channel?: Channel;       
  channelType?: ChannelType;
  apiUrl?: string;             
  query?: Record<string, any>;
}

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: {},
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false })
}));