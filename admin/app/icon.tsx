import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B0D12",
          width: "100%",
          height: "100%",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
          <path
            d="M41 6v27.5C41 42.06 34.06 49 25.5 49S10 42.06 10 33.5 16.94 18 25.5 18c5.6 0 10.5 2.96 13.24 7.4"
            stroke="#F59E0B"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="19" cy="58" r="4.5" fill="#F59E0B" />
          <circle cx="35" cy="58" r="4.5" fill="#F59E0B" />
        </svg>
      </div>
    ),
    size
  );
}
