import { ImageResponse } from "next/og";

export const alt = "DukaSmart helps Tanzanian shop owners manage sales, stock, credit, and reports";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PromoOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          background: "linear-gradient(130deg, #0b3e3b 0%, #115e59 62%, #0f766e 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fcd34d",
              color: "#134e4a",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>DukaSmart</div>
            <div style={{ marginTop: 3, fontSize: 17, color: "#ccfbf1" }}>Jua biashara yako</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ fontSize: 68, lineHeight: 1.04, fontWeight: 800, letterSpacing: -2 }}>
            Run your shop with <span style={{ color: "#fcd34d" }}>clarity.</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "#e6fffb" }}>
            Sales, stock, credit, and daily reports in one simple system.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: "#ccfbf1" }}>
          <span>Built for Tanzanian shops</span>
          <span>dukasmart.online</span>
        </div>
      </div>
    ),
    size,
  );
}
