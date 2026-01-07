/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Listen for UPDATED messages (Edit/Delete)
    const handleUpdate = (message: any) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: any) => 
            item.id === message.id ? message : item
          )
        }));

        return { ...oldData, pages: newPages };
      });
    };

    // Listen for NEW messages
    const handleAdd = (message: any) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        // Initialize if no data exists
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
              nextCursor: null
            }],
            pageParams: [undefined]
          };
        }

        // Check for duplicates across ALL pages
        const messageExists = oldData.pages.some((page: any) => 
          page.items.some((item: any) => item.id === message.id)
        );

        if (messageExists) {
          return oldData;
        }

        // Add to first page
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          items: [message, ...newPages[0].items]
        };

        return {
          ...oldData,
          pages: newPages
        };
      });
    };

    socket.on(updateKey, handleUpdate);
    socket.on(addKey, handleAdd);

    return () => {
      socket.off(addKey, handleAdd);
      socket.off(updateKey, handleUpdate);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};