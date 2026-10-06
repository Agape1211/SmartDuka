import { ImageResponse } from "next/og";

export const alt = "DukaSmart digital operations for Tanzanian SMEs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 55%, #ccfbf1 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0f766e",
              color: "white",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#134e4a" }}>
            DukaSmart
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, lineHeight: 1.08, fontWeight: 700 }}>
          Make business operations work better.
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#475569" }}>
          Practical systems for Tanzanian shops and SMEs.
        </div>
      </div>
    ),
    size,
  );
}
