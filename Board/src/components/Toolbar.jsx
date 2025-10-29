// src/components/Toolbar.jsx
import React from "react";

export default function Toolbar({ tool, setTool }) {
    return (
        <div style={{ padding: 8, borderBottom: "1px solid #ccc", display: "flex", gap: 8 }}>
            <button style={{ fontWeight: tool === "hand" ? "bold" : "normal" }} onClick={() => setTool("hand")}>
                Рука
            </button>

            <button style={{ fontWeight: tool === "pen" ? "bold" : "normal" }} onClick={() => setTool("pen")}>
                Карандаш
            </button>

            <button style={{ fontWeight: tool === "sticker" ? "bold" : "normal" }} onClick={() => setTool("sticker")}>
                Стикер
            </button>
        </div>
    );
}
