/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { ComponentRef, Fragment, useEffect, useRef, useState } from "react";
import { Member, Message, Profile } from "@prisma/client";
import { Loader2, ServerCrash, Wifi, History } from "lucide-react";
import { format } from "date-fns";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

type MessagesWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

const DATE_FORMAT = "d MMM yyyy, HH:mm";

export function ChatMessages({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ComponentRef<"div">>(null);
  const bottomRef = useRef<ComponentRef<"div">>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  useChatSocket({ queryKey, addKey, updateKey });

  useChatScroll({
    chatRef: chatRef as React.RefObject<HTMLDivElement>,
    bottomRef: bottomRef as React.RefObject<HTMLDivElement>,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0
  });

  // INITIAL BOOT-UP / LOADING STATE
  if (!isMounted || status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-[#1e1e2b]">
        <div className="relative flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
            <Wifi className="absolute h-4 w-4 text-red-600 animate-pulse" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mt-4 italic">
          Establishing_Uplink...
        </p>
      </div>
    );
  }

  // CONNECTION FAILURE STATE
  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-[#1e1e2b]">
        <ServerCrash className="h-10 w-10 text-red-600 my-4" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-600 italic">
          Critical_System_Failure // No_Signal
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-[9px] font-black uppercase italic tracking-widest text-zinc-400 hover:text-white transition"
        >
          {">>"} Reboot_System
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={chatRef} 
      className="flex-1 flex flex-col py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hover:scrollbar-thumb-red-600/20 transition-all"
    >
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome name={name} type={type} />}
      
      {/* HISTORY RETRIEVAL SECTION */}
      {hasNextPage && (
        <div className="flex justify-center my-4">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-x-2">
                <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Syncing_Logs...</span>
            </div>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="flex items-center gap-x-2 px-4 py-1 bg-zinc-800/40 border border-zinc-700/50 hover:border-red-600/50 rounded-sm group transition-all"
            >
              <History className="h-3 w-3 text-zinc-500 group-hover:text-red-600 transition" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 group-hover:text-white transition">
                Retrieve_History
              </span>
            </button>
          )}
        </div>
      )}

      {/* REVERSE MESSAGE FEED */}
      <div className="flex flex-col-reverse mt-auto px-1">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessagesWithMemberWithProfile) => (
              <ChatItem
                key={message.id}
                id={message.id}
                content={message.content}
                member={message.member}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                currentMember={member}
                isUpdated={new Date(message.updatedAt).getTime() !== new Date(message.createdAt).getTime()}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}