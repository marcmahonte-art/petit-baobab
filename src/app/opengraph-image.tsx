import { ImageResponse } from "next/og";

export const alt = "Petit Baobab — Coloriage, livres et créations pour enfants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fef5e0 0%, #fff9f2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 92,
            fontWeight: 800,
            color: "#3B2416",
            letterSpacing: -2,
          }}
        >
          Petit Baobab
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            padding: "14px 32px",
            borderRadius: 999,
            background: "#7D6AF8",
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          Coloriage · Livres · Histoires · Jeux
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 28,
            color: "#6B6B7B",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          L'univers créatif africain qui fait grandir les enfants
        </div>
      </div>
    ),
    { ...size }
  );
}
