import { ImageResponse } from "next/og";

export const alt = "ImmersiveLight — physics-inspired optical UI components";
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
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#05070a",
          backgroundImage:
            "radial-gradient(circle at 82% 8%, rgba(76,194,255,0.30) 0px, rgba(5,7,10,0) 520px), radial-gradient(circle at 8% 92%, rgba(255,206,150,0.18) 0px, rgba(5,7,10,0) 420px)",
          color: "#f2f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "999px",
              background: "#8fd8ff",
              boxShadow: "0 0 32px rgba(143,216,255,0.85)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              letterSpacing: "6px",
              color: "#b9c9d6",
            }}
          >
            IMMERSIVE LIGHT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "94px",
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-4px",
            }}
          >
            Optics, made
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "94px",
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-4px",
              background: "linear-gradient(90deg, #8fd8ff, #f6e4c8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            interactive.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "26px",
              fontSize: "26px",
              color: "#9fb3c2",
              letterSpacing: "0.2px",
            }}
          >
            Physics-inspired React components. Copy, paste, degrade gracefully.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: "26px",
            fontSize: "20px",
            color: "#8ea3b2",
          }}
        >
          <div style={{ display: "flex", gap: "14px" }}>
            {["CSS", "SVG", "WebGL"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "999px",
                  padding: "8px 18px",
                  color: "#cfe0ec",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex" }}>15 components · T1–T3 fallback</div>
        </div>
      </div>
    ),
    size,
  );
}
