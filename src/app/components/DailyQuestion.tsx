import React, { useState } from "react";

interface Props {
  onAnswer: (answer: string) => void;
}

const options = [
  {
    value: "Low",
    color: "#38bdf8",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#bae6fd"/><ellipse cx="13" cy="17" rx="3" ry="2.2" fill="#2563eb"/><ellipse cx="27" cy="17" rx="3" ry="2.2" fill="#2563eb"/><ellipse cx="20" cy="15" rx="7" ry="2" fill="#2563eb"/><ellipse cx="20" cy="28" rx="9" ry="2.8" fill="#38bdf8"/></svg>
    ),
  },
  {
    value: "Moderate",
    color: "#60a5fa",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#93c5fd"/><rect x="13" y="29" width="14" height="3" rx="1.5" fill="#2563eb"/><ellipse cx="13" cy="17" rx="2.7" ry="2.3" fill="#2563eb"/><ellipse cx="27" cy="17" rx="2.7" ry="2.3" fill="#2563eb"/><ellipse cx="20" cy="15" rx="6" ry="1.5" fill="#2563eb"/></svg>
    ),
  },
  {
    value: "High",
    color: "#2563eb",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#60a5fa"/><rect x="13" y="32" width="14" height="3" rx="1.5" fill="#2563eb"/><ellipse cx="13" cy="17" rx="2.5" ry="2.2" fill="#2563eb"/><ellipse cx="27" cy="17" rx="2.5" ry="2.2" fill="#2563eb"/><ellipse cx="20" cy="15" rx="5" ry="1.5" fill="#2563eb"/></svg>
    ),
  }
];

function getTip(selected: string) {
  if (selected === "Low") return "Enjoy your smooth day! Spread some positivity.";
  if (selected === "Moderate") return "Good balance—remember to hydrate and stretch!";
  if (selected === "High") return "Try deep breathing and take a walk if possible.";
  return "";
}

export default function DailyQuestion({ onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-blue-900/30 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-md text-center border border-blue-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 animate-gradientX opacity-30" />
        <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center justify-center gap-2 animate-bounceUp">
          💙 How heavy is your workload today?
        </h3>
        {!selected ? (
          <div className="flex justify-center gap-4 animate-fadeUp">
            {options.map(opt => (
              <button
                key={opt.value}
                className={`group px-7 py-6 rounded-2xl font-bold shadow bg-white border-2 border-blue-100 hover:border-blue-500 text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 relative`}
                style={{
                  boxShadow: selected === opt.value ? "0 0 0 8px " + opt.color : undefined
                }}
                onClick={() => {
                  setSelected(opt.value);
                  onAnswer(opt.value);
                }}
              >
                <span className="block mb-2 animate-pop">{opt.svg}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 animate-fadeUp">
            <div className="flex justify-center mb-3 animate-pop">
              {options.find(o => o.value === selected)?.svg}
            </div>
            <div className="text-blue-700 font-semibold mb-2 animate-pop">
              {getTip(selected)}
            </div>
            <div className="text-xs text-blue-500">
              Wellness tip just for you!
            </div>
          </div>
        )}
        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.5s;
          }
          .animate-pop {
            animation: pop 0.7s;
          }
          .animate-bounceUp {
            animation: bounceUp 1.2s infinite alternate;
          }
          .animate-fadeUp {
            animation: fadeUp 0.7s;
          }
          .animate-gradientX {
            animation: gradientX 2.4s linear infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes pop {
            0% { transform: scale(0.7); opacity: 0.2;}
            85% { transform: scale(1.16);}
            100% { transform: scale(1); opacity: 1;}
          }
          @keyframes bounceUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-9px); }
          }
          @keyframes gradientX {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}</style>
      </div>
    </div>
  );
}
