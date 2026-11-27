import { ImageResponse } from "next/og";

// Branded link-preview card (LinkedIn, X, Slack, WhatsApp...). 1200x630.
export const runtime = "edge";
export const alt = "GhostAI: job application tracker and CV tailoring tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ghost = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs><path fill="url(#g)" d="M10 29C10 16 19 7 32 7s22 9 22 22v25l-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5L10 54z"/><ellipse cx="25" cy="28" rx="3.6" ry="5" fill="#0f172a"/><ellipse cx="39" cy="28" rx="3.6" ry="5" fill="#0f172a"/><circle cx="26.2" cy="26.2" r="1.2" fill="#fff"/><circle cx="40.2" cy="26.2" r="1.2" fill="#fff"/></svg>`;
const ghostSrc = `data:image/svg+xml;base64,${btoa(ghost)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #0c1a2e 0%, #020617 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ghostSrc} width={84} height={84} alt="" />
          <div style={{ fontSize: 44, fontWeight: 700 }}>GhostAI</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
            Tailor your CV to every job.
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, color: "#38bdf8" }}>
            Track every application.
          </div>
          <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 28 }}>
            Match scores, follow-up reminders, cover letters. Free to start.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#7dd3fc" }}>ghostaicorp.com</div>
      </div>
    ),
    size
  );
}
