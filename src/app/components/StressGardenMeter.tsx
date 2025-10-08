import React, { useState } from "react";

/**
 * Props:
 *   - stressScore: number (0-100)
 *   - deadlines: array of { id: string, label: string, due: ISOString }
 *   - onRefresh: () => void
 */
interface Deadline {
  id: string;
  label: string;
  due: string; // ISO string
}
interface Props {
  stressScore: number;
  deadlines: Deadline[];
  onRefresh: () => void;
}

function getGardenState(score: number) {
  if (score < 33) return "happy";
  if (score < 67) return "ok";
  return "sad";
}
function getGardenText(state: string) {
  if (state === "happy") return "Your garden is vibrant!";
  if (state === "ok") return "Keep watering your garden!";
  return "The garden needs care!";
}

export default function StressGardenMeter({ stressScore, deadlines, onRefresh }: Props) {
  const [watering, setWatering] = useState(false);
  const state = getGardenState(stressScore);

  // Map deadlines due soon to clouds (within 48 hours)
  const now = new Date();
  const soonClouds = deadlines.filter(dl => {
    const diff = new Date(dl.due).getTime() - now.getTime();
    return diff > 0 && diff < 1000 * 60 * 60 * 48;
  });

  // Watering animation
  function handleWater() {
    setWatering(true);
    setTimeout(() => {
      setWatering(false);
      onRefresh();
    }, 900);
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl shadow-xl p-8 bg-blue-100 overflow-hidden" style={{ minHeight: 340 }}>
      {/* Sky */}
      <svg width="100%" height="120" viewBox="0 0 600 120" className="absolute left-0 top-0 w-full pointer-events-none" style={{zIndex: 1}}>
        {/* Sun (shows more if low stress) */}
        <circle cx={550} cy={40} r={state==="happy"?28:state==="ok"?18:12} fill="#FFD700" opacity={state==="sad"?0.5:0.8} />
        {/* Clouds for each close deadline */}
        {soonClouds.map((d, i) => (
          <g key={d.id} transform={`translate(${80 + 80*i},${40+(i%2)*10})`}>
            {/* Main cloud */}
            <ellipse rx="34" ry="22" fill="#e0eafe" />
            <ellipse rx="18" ry="15" fill="#d1dbf3" cx={-18} cy={8} />
            <ellipse rx="14" ry="13" fill="#dbe7fa" cx={20} cy={-8} />
            {/* Deadline label tooltip */}
            <title>{d.label + "\nDue: " + new Date(d.due).toLocaleString()}</title>
          </g>
        ))}
        {/* Optionally more random clouds */}
      </svg>
      {/* Ground */}
      <svg width="100%" height="100" viewBox="0 0 600 100" className="absolute left-0 bottom-0 w-full z-0 pointer-events-none">
        <ellipse cx="300" cy="45" rx="288" ry="40" fill="#84b6f4" opacity="0.35" />
        <ellipse cx="300" cy="75" rx="310" ry="44" fill="#2563eb" opacity="0.22" />
      </svg>
      {/* Garden Plant */}
      <div className="relative z-10 flex flex-col items-center mt-20">
        <svg width={100} height={140} viewBox="0 0 80 110">
          {/* Stem */}
          <rect x="37" y="55" width="6" height="40" fill={state==="sad"?"#6d7b57":state==="ok"?"#7ab47d":"#6ED678"} rx="3"/>
          {/* Leaves, droopy for high stress */}
          <ellipse cx="41" cy={state==="sad"?90:78} rx="18" ry="8" fill="#b1e2d3" transform={state==="sad"?"rotate(-20 41 90)":"rotate(-8 41 80)"}/>
          <ellipse cx="41" cy={state==="sad"?90:78} rx="18" ry="8" fill="#b1d4e2" transform={state==="sad"?"rotate(20 41 90)":"rotate(8 41 80)"}/>
          {/* Happy/ok/sad flower */}
          {state==="happy" && (
            <circle cx="40" cy="50" r="22" fill="#fdef85" stroke="#fff1a6" strokeWidth={3} />
          )}
          {state==="ok" && (
            <ellipse cx="40" cy="55" rx="18" ry="15" fill="#ffeaa5" stroke="#ffedcd" strokeWidth={2}/>
          )}
          {state==="sad" && (
            <ellipse cx="40" cy="65" rx="15" ry="9" fill="#e9d266" stroke="#e6c155" strokeWidth={1} />
          )}
        </svg>
        {/* Watering can button */}
        <button
          onClick={handleWater}
          disabled={watering}
          className="mt-4 px-6 py-2 rounded-full bg-blue-400 text-white font-bold shadow active:scale-95 flex items-center gap-2 hover:bg-blue-500"
        >
          <span>{watering ? "Watering..." : "Refresh (Water Garden)"}</span>
          <span className="inline-block">
            {/* Simple watering can svg animation */}
            <svg width="30" height="22" viewBox="0 0 30 22" style={{transform: watering ? "rotate(-28deg)" : undefined, transition: "transform .5s"}}>
              <rect x={7} y={7} width={14} height={10} rx={4} fill="#7fcaf6" />
              <rect x={16} y={13} width={7} height={2} rx={1} fill="#4299e1" />
              <ellipse cx={7} cy={12} rx={4} ry={4} fill="#4eb3fc"/>
            </svg>
          </span>
        </button>
        <div className="mt-4 text-lg font-semibold text-blue-700">{getGardenText(state)}</div>
      </div>
    </div>
  );
}
