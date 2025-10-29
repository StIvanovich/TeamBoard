// src/components/CanvasRenderer.jsx
import React from "react";
import useCanvas from "../hooks/useCanvas";

export default function CanvasRenderer({ pan, zoom, lines, currentLine, stickers }) {
    const draw = React.useCallback(
        (ctx) => {
            if (!ctx) return;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);

            /* сетка */
            ctx.strokeStyle = "#e0e0e0";
            ctx.lineWidth = 1 / zoom;
            const step = 50;
            for (let x = 0; x < 4000; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, 4000);
                ctx.stroke();
            }
            for (let y = 0; y < 4000; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(4000, y);
                ctx.stroke();
            }

            /* законченные линии */
            (lines || []).forEach((l) => {
                ctx.strokeStyle = l.color || "#0077ff";
                ctx.lineWidth = 2 / zoom;
                ctx.lineCap = "round";
                ctx.beginPath();
                (l.pts || []).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
                ctx.stroke();
            });

            /* строящаяся линия (пока рисуем) */
            if (currentLine?.pts?.length) {
                ctx.strokeStyle = "#0077ff";
                ctx.lineWidth = 2 / zoom;
                ctx.lineCap = "round";
                ctx.beginPath();
                currentLine.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
                ctx.stroke();
            }

            /* стикеры */
            (stickers || []).forEach((st) => {
                ctx.fillStyle = st.color;
                ctx.fillRect(st.x, st.y, st.w, st.h);
                ctx.strokeStyle = "#d9d900";
                ctx.lineWidth = 2 / zoom;
                ctx.strokeRect(st.x, st.y, st.w, st.h);
                ctx.fillStyle = "#000";
                ctx.font = `${14 / zoom}px sans-serif`;
                ctx.fillText(st.text, st.x + 4, st.y + 16);
            });

            ctx.restore();
        },
        [pan, zoom, lines, currentLine, stickers]
    );

    const canvasRef = useCanvas(draw, [pan, zoom, lines, currentLine, stickers]);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", background: "#fafafa" }} />;
}
