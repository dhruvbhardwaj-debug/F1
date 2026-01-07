/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import React, { useEffect, useState } from "react";
import { Member, MemberRole, Profile } from "@prisma/client";
import {
  Edit,
  FileIcon,
  ShieldAlert,
  ShieldCheck,
  Trash
} from "lucide-react";
import Image from "next/image";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";

import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
};

const formSchema = z.object({
  content: z.string().min(1)
});
/* eslint-disable @typescript-eslint/no-explicit-any */


export function ChatItem({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const { onOpen } = useModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const params = useParams();
  const router = useRouter();

  // Handle Logic for Member Clicking
  const onMemberClick = () => {
    if (member.id === currentMember.id) return;
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  // Handle Escape Key for Editing
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery
      });
      await axios.patch(url, values);
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    form.reset({ content });
  }, [content, form]);

  // Detect file type safely
  useEffect(() => {
    if (!fileUrl || !isMounted) {
      setFileType(null);
      return;
    }

    const detectFileType = async () => {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) setFileType('pdf');
        else if (contentType?.includes('image')) setFileType('image');
        else setFileType('image');
      } catch (error) {
        setFileType('image');
      }
    };

    detectFileType();
  }, [fileUrl, isMounted]);

  // If not mounted, return the basic shell to avoid hydration mismatch
  if (!isMounted) {
    return null; 
  }

  const isPDF = fileType === 'pdf' && fileUrl;
  const isImage = fileType === 'image' && fileUrl;

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-center w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">
                {member.profile.name.replace(" null", "")}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>

          {isImage && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48">
              <Image src={fileUrl} alt={content} fill className="object-cover" />
            </a>
          )}

          {isPDF && (
            <div className="relative flex items-center p-3 mt-2 rounded-md bg-background/10 border border-indigo-200/20">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all">
                PDF File
              </a>
            </div>
          )}

          {!fileUrl && !isEditing && (
            <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">(edited)</span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form className="flex items-center w-full gap-x-2 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative w-full">
                        <Input disabled={isLoading} placeholder="Edited message" className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <Button disabled={isLoading} size="sm" variant="primary">Save</Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">Press escape to cancel, enter to save</span>
            </Form>
          )}
        </div>
      </div>
      
      {canDeleteMessage && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-2 absolute p-1 top-1 right-5 bg-white dark:bg-zinc-800 border rounded-sm shadow-sm transition z-50">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit onClick={() => setIsEditing(true)} className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${id}`, query: socketQuery })} className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
}