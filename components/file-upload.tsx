"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import "@uploadthing/react/styles.css";
import Image from "next/image";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "serverImage" | "messageFile";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  // Extract file extension and normalize to lowercase
  // This handles URLs like '...file.PDF?params' correctly
  const fileType = value?.split(".").pop()?.toLowerCase();

  // PDF UI Logic
  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-3 mt-2 rounded-md bg-background/10 border border-zinc-200 dark:border-zinc-800">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all"
        >
          {value.split('/').pop() || "PDF File"}
        </a>
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-3 -right-3 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // IMAGE UI Logic
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-40 w-40">
        <Image
          fill
          src={value}
          alt="Upload"
          className={endpoint === "serverImage" ? "rounded-full" : "rounded-md object-cover"}
        />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // UPLOAD DROPZONE Logic
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.error("Upload Error:", error.message);
      }}
    />
  );
};