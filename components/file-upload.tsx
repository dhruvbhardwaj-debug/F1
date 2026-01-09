/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "serverImage" | "messageFile";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!value || !isMounted) {
      setFileType(null);
      return;
    }

    const detectFileType = async () => {
      try {
        const response = await fetch(value, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) setFileType('pdf');
        else if (contentType?.includes('image')) setFileType('image');
        else setFileType('image');
      } catch (error) {
        setFileType('image');
      }
    };
    detectFileType();
  }, [value, isMounted]);

  // SAFETY: Always return null or a skeleton until mounted to prevent hydration error
  if (!isMounted) return null;

  // Render Logic after mounting
  if (value) {
    if (fileType === "pdf") {
      return (
        <div className="relative flex items-center p-3 mt-2 rounded-md bg-background/10 border border-zinc-200 dark:border-zinc-800">
          <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
          <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all">PDF File</a>
          <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute -top-3 -right-3 shadow-sm" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    if (fileType === "image") {
      return (
        <div className="relative h-40 w-40">
          <Image fill src={value} alt="Upload" className={endpoint === "serverImage" ? "rounded-full" : "rounded-md object-cover"} />
          <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // Still detecting type
    return (
      <div className="relative h-40 w-40 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-md">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => onChange(res?.[0].url)}
      onUploadError={(error: Error) => console.error(error.message)}
    />
  );
};