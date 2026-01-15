/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Timer, MessageSquare, Wrench } from 'lucide-react';

// --- CONFIGURATION ---
const TOTAL_LAPS = 45;

// --- TYPE DEFINITIONS ---
type TrackPath = 'main' | 'pit';

interface Car {
  id: number;
  name: string;
  teamColor: string;
  speedBase: number;
  accel: number;
  // braking: number; // Removed as requested (cars stay fast)
  
  // Physics State
  progress: number;      
  currentSpeed: number;
  lapsCompleted: number;
  currentPath: TrackPath;
  
  // Pit Logic
  boxRequest: boolean;   
  isPitting: boolean;    
  pitPhase: 'entry' | 'stopped' | 'exiting';
  pitTimer: number;
}

// --- GEOMETRY DATA ---
const VEGAS_POINTS = [
  { x: 650, y: 450, type: 'straight' }, // 0: Start/Finish (Checkerboard)
  { x: 760, y: 450, type: 'corner' },   // 1
  { x: 760, y: 550, type: 'corner' },   // 2
  { x: 600, y: 550, type: 'corner' },   // 3
  { x: 550, y: 480, type: 'straight' }, // 4
  { x: 200, y: 480, type: 'straight' }, // 5
  { x: 100, y: 430, type: 'corner' },   // 6
  { x: 70, y: 350, type: 'corner' },    // 7
  { x: 100, y: 280, type: 'corner' },   // 8
  { x: 160, y: 250, type: 'corner' },   // 9
  { x: 220, y: 280, type: 'corner' },   // 10
  { x: 200, y: 150, type: 'straight' }, // 11
  { x: 240, y: 100, type: 'corner' },   // 12
  { x: 320, y: 120, type: 'corner' },   // 13
  { x: 320, y: 200, type: 'straight' }, // 14
  { x: 650, y: 200, type: 'straight' }, // 15
  { x: 730, y: 240, type: 'corner' },   // 16
  { x: 710, y: 330, type: 'corner' },   // 17
  { x: 650, y: 380, type: 'corner' },   // 18
  { x: 650, y: 450, type: 'straight' }, // 19
];

const PIT_LANE_POINTS = [
  { x: 640, y: 390, type: 'technical' }, 
  { x: 620, y: 410, type: 'straight' },  
  { x: 620, y: 450, type: 'straight' },  // BOX
  { x: 620, y: 480, type: 'straight' },  
  { x: 720, y: 480, type: 'technical' }, 
];

const INITIAL_CARS: Car[] = [
  { id: 1, name: 'VER', teamColor: '#3671C6', speedBase: 3.2, accel: 0.1, progress: 0, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 2, name: 'HAM', teamColor: '#6CD3BF', speedBase: 3.1, accel: 0.08, progress: 0.02, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 3, name: 'NOR', teamColor: '#FF8000', speedBase: 3.15, accel: 0.09, progress: 0.04, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 4, name: 'LEC', teamColor: '#F91536', speedBase: 3.12, accel: 0.08, progress: 0.06, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 5, name: 'ALO', teamColor: '#2293D1', speedBase: 2.95, accel: 0.07, progress: 0.08, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 6, name: 'PIA', teamColor: '#FF8000', speedBase: 3.0, accel: 0.08, progress: 0.1, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 7, name: 'RUS', teamColor: '#6CD3BF', speedBase: 2.98, accel: 0.07, progress: 0.12, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
  { id: 8, name: 'SAI', teamColor: '#F91536', speedBase: 2.96, accel: 0.06, progress: 0.14, currentSpeed: 0, lapsCompleted: 0, currentPath: 'main', boxRequest: false, isPitting: false, pitPhase: 'entry', pitTimer: 0 },
];

export const F1RealisticVegas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [raceState, setRaceState] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [lights, setLights] = useState(0);
  const [currentLap, setCurrentLap] = useState(0);
  const [commentary, setCommentary] = useState<string[]>(["SYSTEM: Waiting for grid formation..."]);
  const [leaderboard, setLeaderboard] = useState<Car[]>([...INITIAL_CARS]);
  
  const cars = useRef<Car[]>(JSON.parse(JSON.stringify(INITIAL_CARS)));

  const requestRedBullPit = () => {
    const ver = cars.current.find(c => c.name === 'VER');
    if (ver && !ver.boxRequest && !ver.isPitting) {
      ver.boxRequest = true;
      setCommentary(prev => ["🔴 RED BULL RADIO: 'Max, Box Box Box.'", ...prev].slice(0, 6));
    }
  };

  const getPositionOnPath = (progress: number, path: any[], carId: number, isPitting: boolean) => {
    const totalPoints = path.length;
    const safeProgress = Math.max(0, Math.min(1, progress));
    const scaledProgress = safeProgress * (totalPoints - 1);
    const index = Math.floor(scaledProgress);
    const nextIndex = (index + 1) % totalPoints; 
    const safeNextIndex = isPitting ? Math.min(nextIndex, totalPoints - 1) : nextIndex;

    const t = scaledProgress - index;
    const p1 = path[index];
    const p2 = path[safeNextIndex];

    const laneShift = isPitting ? 0 : (carId - 4.5) * 3;

    return {
      x: p1.x + (p2.x - p1.x) * t + laneShift,
      y: p1.y + (p2.y - p1.y) * t + laneShift,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId: number;

    const loop = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. DRAW PIT LANE
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 15;
      PIT_LANE_POINTS.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      
      ctx.beginPath();
      ctx.strokeStyle = '#0055ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      PIT_LANE_POINTS.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Pit Box
      ctx.fillStyle = '#333';
      ctx.fillRect(610, 440, 20, 20);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 8px Arial';
      ctx.fillText("RB BOX", 580, 455);

      // 2. DRAW MAIN TRACK
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 42;
      VEGAS_POINTS.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#dedede';
      ctx.lineWidth = 36;
      VEGAS_POINTS.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // --- CHECKERBOARD START/FINISH LINE ---
      ctx.save();
      ctx.translate(750, 450); // Location of Start Line
      const checkSize = 5;
      const rows = 8; // Width of track (approx 40px)
      const cols = 2; // Thickness of line
      
      // Rotate to match track angle (straight horizontal here)
      ctx.rotate(0); 

      for(let c=0; c<cols; c++) {
        for(let r=0; r<rows; r++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#fff' : '#000';
            // Centering the grid on the track point
            ctx.fillRect(c * checkSize - 5, (r * checkSize) - 20, checkSize, checkSize);
        }
      }
      ctx.restore();

      // 3. PHYSICS
      if (raceState === 'racing') {
        cars.current.forEach((car) => {
          
          if (car.boxRequest && !car.isPitting && car.currentPath === 'main') {
            if (car.progress > 0.90 && car.progress < 0.98) {
              car.currentPath = 'pit';
              car.isPitting = true;
              car.progress = 0;
              car.currentSpeed = car.currentSpeed * 0.8;
              setCommentary(prev => ["Verstappen diving into the pits!", ...prev].slice(0, 6));
            }
          }

          if (car.currentPath === 'pit') {
            const pitLen = PIT_LANE_POINTS.length;
            if (car.pitPhase === 'entry') {
               const distToBox = 0.5 - car.progress;
               if (distToBox <= 0.01) {
                 car.pitPhase = 'stopped';
                 car.currentSpeed = 0;
                 setCommentary(prev => ["Verstappen IN THE BOX.", ...prev].slice(0, 6));
               } else {
                 car.currentSpeed += (0.5 - car.currentSpeed) * 0.1;
                 car.progress += car.currentSpeed * 0.0005;
               }
            } else if (car.pitPhase === 'stopped') {
               car.pitTimer++;
               if (car.pitTimer > 180) {
                 car.pitPhase = 'exiting';
                 car.boxRequest = false; 
                 setCommentary(prev => ["Tyres on! GO GO GO!", ...prev].slice(0, 6));
               }
            } else if (car.pitPhase === 'exiting') {
               car.currentSpeed += 0.05;
               if (car.currentSpeed > 1.2) car.currentSpeed = 1.2;
               car.progress += car.currentSpeed * 0.0005;

               if (car.progress >= 0.99) {
                 car.currentPath = 'main';
                 car.isPitting = false;
                 car.pitPhase = 'entry';
                 car.pitTimer = 0;
                 car.progress = 0.12; 
                 car.currentSpeed = 1.5;
               }
            }

          } else {
            // MAIN TRACK PHYSICS (High Speed Cornering Updated)
            
            const noise = Math.sin(Date.now() * 0.001 + car.id) * 0.1;
            
            // LOGIC CHANGE: Cars are now nearly equally fast at corners
            // We multiply by 0.95 instead of 0.45 to keep speed high
            const targetSpeed = car.speedBase + noise; 

            // Acceleration
            car.currentSpeed += (targetSpeed - car.currentSpeed) * car.accel;

            // Move Car
            car.progress += (car.currentSpeed * 0.00015);

            if (car.progress >= 1) {
              car.progress = 0;
              car.lapsCompleted += 1;
              if (car.id === 1) setCurrentLap(car.lapsCompleted);
              if (car.lapsCompleted >= TOTAL_LAPS) setRaceState('finished');
            }
          }

          const activePath = car.currentPath === 'pit' ? PIT_LANE_POINTS : VEGAS_POINTS;
          const coords = getPositionOnPath(car.progress, activePath, car.id, car.isPitting);

          ctx.save();
          ctx.translate(coords.x, coords.y);
          
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 15;
          ctx.fillStyle = car.teamColor;
          ctx.beginPath();
          ctx.roundRect(-6, -4, 12, 8, 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (car.boxRequest && !car.isPitting) {
             ctx.fillStyle = '#ff8800';
             ctx.font = 'bold 8px Arial';
             ctx.fillText("IN LAP", -10, -10);
          }
          if (car.pitPhase === 'stopped') {
             ctx.fillStyle = '#00ff00';
             ctx.fillRect(-8, -12, (car.pitTimer/180)*16, 2);
          }

          ctx.restore();
        });

        const sorted = [...cars.current].sort((a, b) => {
            if (b.lapsCompleted !== a.lapsCompleted) return b.lapsCompleted - a.lapsCompleted;
            return b.progress - a.progress;
        });
        setLeaderboard(sorted);
      }

      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [raceState]);

  useEffect(() => {
    if (raceState === 'countdown') {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step <= 5) setLights(step);
        else {
          setLights(6);
          setTimeout(() => setRaceState('racing'), 500);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [raceState]);

  return (
    <div className="flex bg-[#0a0a0a] text-white h-[680px] w-full font-sans overflow-hidden">
      
      {/* LEFT: SIMULATION VIEW */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        
        {/* HUD Overlay */}
        <div className="flex justify-between items-center bg-zinc-900/90 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
          <div className="flex gap-6 items-center">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Grand Prix</p>
              <p className="text-xl font-black italic tracking-tighter">LAS VEGAS</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Lap</p>
              <p className="text-lg font-black italic text-white">{currentLap} <span className="text-zinc-600 text-xs">/ {TOTAL_LAPS}</span></p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={requestRedBullPit}
              disabled={cars.current[0].boxRequest || cars.current[0].isPitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black italic transition-all shadow-lg text-sm
                ${!cars.current[0].boxRequest && !cars.current[0].isPitting
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
            >
              <Wrench size={14} />
              {cars.current[0].isPitting ? "IN PITS" : cars.current[0].boxRequest ? "BOX CONFIRMED" : "BOX VERSTAPPEN"}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#111] rounded-2xl border border-white/5 relative flex items-center justify-center overflow-hidden shadow-inner group">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          <canvas ref={canvasRef} width={800} height={600} className="relative z-10 scale-90" />
          
          <div className="absolute top-[200px] left-[50px] w-20 h-20 rounded-full bg-cyan-500/5 border border-cyan-500/20 animate-pulse flex items-center justify-center backdrop-blur-sm">
             <div className="text-[8px] font-bold text-cyan-500">SPHERE</div>
          </div>

          {raceState === 'countdown' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="flex gap-4 p-6 bg-black rounded-xl border border-zinc-800">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-4 ${lights >= i ? 'bg-red-600 border-red-500 shadow-[0_0_30px_red]' : 'bg-zinc-900 border-zinc-800'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: DATA PANEL */}
      <div className="w-[320px] bg-zinc-900/30 border-l border-white/5 flex flex-col p-4 gap-4">
        
        {/* Leaderboard */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Timer size={12} /> Interval
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {leaderboard.map((car, idx) => (
              <div key={car.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all
                ${car.id === 1 ? 'bg-blue-900/10 border-blue-500/20' : 'bg-black/40 border-white/5'}
              `}>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold w-3 ${idx < 3 ? 'text-white' : 'text-zinc-600'}`}>{idx + 1}</span>
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: car.teamColor }} />
                  <div>
                    <p className="font-black italic text-xs tracking-wide">{car.name}</p>
                    {car.isPitting && <span className="text-[8px] text-yellow-500 bg-yellow-500/10 px-1 rounded animate-pulse">PIT LANE</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-white">{(car.currentSpeed * 120).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radio */}
        <div className="h-[200px] bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <MessageSquare size={12} /> Comms
          </h3>
          <div className="flex-1 overflow-y-auto pr-1">
             {commentary.map((t, i) => (
               <div key={i} className={`text-[10px] font-mono mb-2 ${i===0 ? 'text-white font-bold' : 'text-zinc-500'}`}>
                 {">"} {t}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};