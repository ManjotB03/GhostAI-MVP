"use client";

export default function GhostLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg width="60" height="70" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M70 10C42 10 20 32 20 60V115C20 123 26 130 34 130C43 130 48 123 56 123C64 123 69 130 77 130C85 130 90 123 98 123C106 123 111 130 120 130C128 130 134 123 134 115V60C134 32 112 10 84 10H70Z"
          stroke="#00E6FF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-3xl font-extrabold tracking-wide text-[#00E6FF]">
        GhostAI
      </span>
    </div>
  );
}
