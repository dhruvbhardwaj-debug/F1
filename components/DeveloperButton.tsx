"use client";

import React from "react";
import { Code2, Github, Linkedin, Twitter, Cpu, Terminal, Zap, Coffee } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle // 1. Added Import
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DeveloperButtonProps {
  mode?: "default" | "sidebar";
}

export const DeveloperButton = ({ mode = "default" }: DeveloperButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "group relative flex items-center justify-center overflow-hidden transition-all duration-300",
            mode === "sidebar" && "h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] bg-zinc-800 hover:bg-emerald-500 text-emerald-500 hover:text-white",
            mode === "default" && "px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 rounded-lg gap-2"
          )}
        >
          {mode === "sidebar" && (
             <Code2 size={24} className="transition-transform group-hover:scale-110" />
          )}

          {mode === "default" && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Code2 className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
              <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">
                Dev_Profile
              </span>
            </>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-black/95 border-zinc-800 p-0 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] outline-none">
        
        {/* Banner */}
        <div className="h-32 bg-[url('https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/95" />
          <div className="absolute top-4 right-4">
             <div className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">
               Open for Work
             </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="px-8 pb-8 -mt-12 relative z-10">
          <div className="w-24 h-24 bg-zinc-900 rounded-2xl border-2 border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <Terminal size={40} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
          </div>

          <div className="mt-4 flex justify-between items-end">
            <div>
              {/* 2. REPLACED h2 WITH DialogTitle */}
              <DialogTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">
                Dhruv Bhardwaj
              </DialogTitle>
              <p className="text-xs font-mono text-emerald-500 font-bold tracking-widest uppercase">Full Stack Engineer</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <StatCard icon={<Cpu size={14} />} label="Stack" value="Next.js" />
            <StatCard icon={<Zap size={14} />} label="Speed" value="Turbopack" />
            <StatCard icon={<Coffee size={14} />} label="Fuel" value="Coffee" />
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Prisma', 'Socket.io', 'Tailwind','NextJs','GenAI','AgenticAI','DevOps'].map((tech) => (
                <span key={tech} className="px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] text-zinc-300 font-mono hover:border-emerald-500/50 hover:text-white transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
             <div className="flex gap-4">
               <SocialLink icon={<Github size={18} />} href="https://github.com/dhruvbhardwaj-debug" />
               <SocialLink icon={<Linkedin size={18} />} href="https://www.linkedin.com/in/dhruv-bhardwaj64/" />
               <SocialLink icon={<Twitter size={18} />} href="https://x.com/DhruvBhardwajOG/" />
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- SUBCOMPONENTS ---

/* eslint-disable @typescript-eslint/no-explicit-any */
const StatCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg flex flex-col items-center gap-1 hover:bg-zinc-800/80 transition-colors">
    <div className="text-zinc-500 mb-1">{icon}</div>
    <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">{label}</div>
    <div className="text-xs font-mono font-bold text-white">{value}</div>
  </div>
);

const SocialLink = ({ icon, href }: { icon: any, href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-emerald-500 hover:scale-110 transition-all">
    {icon}
  </a>
);