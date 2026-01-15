/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, Suspense, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, PerspectiveCamera, Environment, 
  ContactShadows, useGLTF, Html, Float 
} from '@react-three/drei';
import { 
  Settings2, Zap, Gauge, Wind, Activity, Download, Tag, Trash2, Move, ShieldAlert 
} from 'lucide-react';
import Draggable from 'react-draggable';
import { toPng } from 'html-to-image';

// --- Types ---
interface CarConfig {
  liveryColor: string;
  wingAngle: number;
  suspensionStiffness: number;
  rideHeight: number;
  stability: number;
  tyreWear: number;
  fuelEfficiency: number;
  accelBias: number;
  tractionBias: number;
  brakeAggression: number;
  perfReliability: number;
}

interface Label3D {
  id: number;
  text: string;
  position: [number, number, number];
}

// --- Draggable Label Sub-component ---
const DraggableTag = ({ label, removeLabel, setControlsEnabled }: any) => {
  const nodeRef = useRef(null);

  return (
    <Html position={label.position} distanceFactor={8}>
      <Draggable 
        nodeRef={nodeRef} 
        handle=".handle"
        onStart={(e) => {
          e.stopPropagation();
          setControlsEnabled(false);
        }}
        onStop={() => setControlsEnabled(true)}
      >
        <div 
          ref={nodeRef} 
          className="flex flex-col items-center select-none"
          onMouseEnter={() => setControlsEnabled(false)}
          onMouseLeave={() => setControlsEnabled(true)}
        >
          <div className="handle cursor-grab active:cursor-grabbing bg-black/95 border border-emerald-500/50 p-2 rounded shadow-2xl backdrop-blur-md min-w-[130px]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1 mb-1">
              <Move size={10} className="text-emerald-500" />
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold truncate">
                {label.text}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); removeLabel(label.id); }} 
                className="text-zinc-600 hover:text-red-500 transition-colors pointer-events-auto"
              >
                <Trash2 size={10} />
              </button>
            </div>
            <div className="text-[7px] text-zinc-500 font-mono tracking-tighter italic uppercase">Telemetry_Point_Marker</div>
          </div>
          <div className="w-[1px] h-8 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </div>
      </Draggable>
    </Html>
  );
};

// --- 3D Model Component ---
const F1Model = ({ config, labels, removeLabel, setControlsEnabled }: any) => {
  const { scene } = useGLTF('/models/f1-car.glb');
  
  useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('paint') || child.name.toLowerCase().includes('chassis')) {
          child.material.color.set(config.liveryColor);
          child.material.metalness = 1.0; 
          child.material.roughness = 0.05;
        }
        if (child.name.toLowerCase().includes('wing_rear') || child.name.toLowerCase().includes('drss')) {
          child.rotation.x = (config.wingAngle * Math.PI) / 180;
        }
      }
    });
  }, [config.liveryColor, config.wingAngle, scene]);

  return (
    <group rotation={[0, -Math.PI / 2, 0]} position={[0, config.rideHeight / 1000, 0]}>
      <primitive object={scene} scale={1.8} />
      {labels.map((label: any) => (
        <DraggableTag 
            key={label.id} 
            label={label} 
            removeLabel={removeLabel} 
            setControlsEnabled={setControlsEnabled} 
        />
      ))}
    </group>
  );
};

// --- Main Engine ---
const CarDesignCanvas: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [labelText, setLabelText] = useState("");
  const [labels, setLabels] = useState<Label3D[]>([]);
  const componentRef = useRef<HTMLDivElement>(null); 
  
  const [config, setConfig] = useState<CarConfig>({
    liveryColor: '#ffffff', // UPDATED: Default tint is now White
    wingAngle: 15,
    suspensionStiffness: 65,
    rideHeight: 25,
    stability: 70,
    tyreWear: 40,
    fuelEfficiency: 50,
    accelBias: 60,
    tractionBias: 30,
    brakeAggression: 80,
    perfReliability: 90
  });

  useEffect(() => { setIsMounted(true); }, []);

  const downloadDesign = async () => {
    if (!componentRef.current) return;
    try {
      const dataUrl = await toPng(componentRef.current, { 
        cacheBust: true, 
        backgroundColor: '#000', 
        pixelRatio: 2,
        skipFonts: true 
      });
      const link = document.createElement('a');
      link.download = `F1-R&D-SPEC-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const addLabel = () => {
    if (!labelText.trim()) return;
    setLabels([...labels, {
      id: Date.now(),
      text: labelText.toUpperCase(),
      position: [(Math.random() - 0.5) * 3, 1.2, (Math.random() - 0.5) * 1.5]
    }]);
    setLabelText("");
  };

  if (!isMounted) return null;

  return (
    <div ref={componentRef} className="w-full h-full bg-black text-slate-200 flex flex-col overflow-hidden font-mono relative">
      
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full z-20 pointer-events-none p-8 flex justify-between items-start">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-red-600 text-white font-black px-2 py-0.5 italic text-[10px] rounded-sm uppercase tracking-tighter">W11-CAD</div>
            <h1 className="text-[12px] font-black tracking-widest uppercase text-white">Engineering Terminal</h1>
          </div>
          <p className="text-[8px] text-emerald-500 animate-pulse font-bold tracking-widest uppercase">System Online // All Features Active</p>
        </div>

        <div className="flex gap-10 pointer-events-auto">
          <Metric readout={(320 + config.accelBias * 0.2 - config.wingAngle * 1.8).toFixed(1)} unit="KM/H" label="V_MAX" />
          <Metric readout={(config.wingAngle * 14.2).toFixed(0)} unit="N" label="D_FORCE" color="text-blue-400" />
          
          <button onClick={downloadDesign} className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all self-center ml-4 shadow-lg active:scale-95">
            <Download size={14} /> Save Design
          </button>
        </div>
      </div>

      <div className="flex flex-1 w-full overflow-hidden pt-16">
        <aside className="w-[320px] border-r border-white/10 bg-zinc-950/80 backdrop-blur-md p-6 flex flex-col gap-6 overflow-y-auto z-10 custom-scrollbar">
          
          <div className="bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
               <Tag size={12} className="text-emerald-500" /> Component Tag
            </div>
            <div className="flex gap-2">
              <input 
                value={labelText} onChange={(e) => setLabelText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                placeholder="TAG NAME..."
                className="bg-black border border-white/10 px-3 py-2 text-[10px] text-white w-full outline-none focus:border-emerald-500 rounded"
              />
              <button onClick={addLabel} className="bg-emerald-600 hover:bg-emerald-500 px-3 rounded text-[10px] font-bold">ADD</button>
            </div>
          </div>

          <section className="space-y-5">
            <SectionHeader icon={<Wind size={14}/>} title="Aerodynamics" color="text-red-500" />
            <Slider label="Wing Angle" value={config.wingAngle} min={0} max={35} suffix="°" colorClass="accent-red-600" onChange={(v: any) => setConfig({...config, wingAngle: v})} />
            <Slider label="Stability" value={config.stability} colorClass="accent-red-600" onChange={(v: any) => setConfig({...config, stability: v})} />
            <Slider label="Perf/Reliability" value={config.perfReliability} colorClass="accent-red-600" onChange={(v: any) => setConfig({...config, perfReliability: v})} />
          </section>

          <section className="space-y-5">
            <SectionHeader icon={<Activity size={14}/>} title="Mechanical" color="text-blue-400" />
            <Slider label="Ride Height" value={config.rideHeight} min={10} max={60} suffix="mm" colorClass="accent-blue-500" onChange={(v: any) => setConfig({...config, rideHeight: v})} />
            <Slider label="Suspension" value={config.suspensionStiffness} colorClass="accent-blue-500" onChange={(v: any) => setConfig({...config, suspensionStiffness: v})} />
            <Slider label="Brake Bias" value={config.brakeAggression} colorClass="accent-blue-500" onChange={(v: any) => setConfig({...config, brakeAggression: v})} />
          </section>

          <section className="space-y-5">
            <SectionHeader icon={<Zap size={14}/>} title="Power Unit" color="text-emerald-400" />
            <Slider label="Accel Bias" value={config.accelBias} colorClass="accent-emerald-500" onChange={(v: any) => setConfig({...config, accelBias: v})} />
            <Slider label="Fuel Map" value={config.fuelEfficiency} colorClass="accent-emerald-500" onChange={(v: any) => setConfig({...config, fuelEfficiency: v})} />
            <Slider label="Traction" value={config.tractionBias} colorClass="accent-emerald-500" onChange={(v: any) => setConfig({...config, tractionBias: v})} />
            <Slider label="Tyre Wear" value={config.tyreWear} colorClass="accent-emerald-500" onChange={(v: any) => setConfig({...config, tyreWear: v})} />
          </section>

          <div className="mt-auto pt-4 flex items-center gap-4 border-t border-white/5">
            <input type="color" value={config.liveryColor} onChange={(e) => setConfig({...config, liveryColor: e.target.value})} className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-2 border-white/10" />
            <div className="text-[9px] text-zinc-100 uppercase font-black tracking-widest leading-tight">Livery Tint<br/><span className="text-white font-mono">{config.liveryColor}</span></div>
          </div>
        </aside>

        <section className="flex-1 bg-black relative">
          <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }}>
            <PerspectiveCamera makeDefault position={[10, 5, 10]} fov={30} />
            <Suspense fallback={null}>
              <Environment preset="city" />
              <spotLight position={[10, 20, 10]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} />
              <ambientLight intensity={0.4} />

              <Float speed={1.2} rotationIntensity={0.1}>
                <F1Model 
                    config={config} 
                    labels={labels} 
                    removeLabel={(id: any) => setLabels(labels.filter(l => l.id !== id))} 
                    setControlsEnabled={setControlsEnabled} 
                />
              </Float>
              <ContactShadows opacity={0.8} scale={20} blur={2.5} far={10} color="#000000" />
            </Suspense>

            <OrbitControls 
                enabled={controlsEnabled} 
                enablePan={false} 
                minDistance={7} 
                maxDistance={15} 
                autoRotate={controlsEnabled} 
                autoRotateSpeed={0.5} 
            />
          </Canvas>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </section>
      </div>
    </div>
  );
};

const Metric = ({ readout, unit, label, color = "text-white" }: any) => (
  <div className="text-right flex flex-col items-end">
    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`text-xl font-black italic ${color} leading-none`}>{readout} <span className="text-[10px] opacity-50 not-italic ml-1">{unit}</span></p>
  </div>
);

const SectionHeader = ({ icon, title, color }: any) => (
  <div className={`flex items-center gap-2 ${color} mb-1`}>
    <div className="p-1.5 bg-white/5 rounded-md">{icon}</div>
    <h3 className="text-[10px] font-black uppercase tracking-widest">{title}</h3>
  </div>
);

const Slider = ({ label, value, min = 0, max = 100, suffix = "%", onChange, colorClass }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
      <span className="text-zinc-500">{label}</span>
      <span className="text-white font-mono">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className={`w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer transition-all ${colorClass}`} />
  </div>
);

useGLTF.preload('/models/f1-car.glb');

export default CarDesignCanvas;