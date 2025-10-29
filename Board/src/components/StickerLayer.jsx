// src/components/StickerLayer.jsx
import React, { useRef } from "react";
import { worldToScreen } from "../utils/viewBox";

export default function StickerLayer({ pan, zoom, stickers, onStartDrag }) {
    const layerRef = useRef(null);

    /* перевод мировых коорд. в экранные с учётом pan/zoom */
    const toScreen = (wx, wy) => worldToScreen(wx, wy, pan, zoom);

    return (
        <div
            ref={layerRef}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none", // перехватываем только стикеры
            }}
        >
            {stickers.map((st) => {
                const { x: sx, y: sy } = toScreen(st.x, st.y);
                return (
                    <div
                        key={st.id}
                        style={{
                            position: "absolute",
                            left: sx,
                            top: sy,
                            width: st.w * zoom,
                            height: st.h * zoom,
                            background: st.color,
                            border: "2px solid #d9d900",
                            boxSizing: "border-box",
                            padding: 4 * zoom,
                            fontSize: 14 * zoom,
                            pointerEvents: "auto",
                            cursor: "move",
                            userSelect: "none",
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation(); // предотвращаем запуск рисования/пана
                            const rect = layerRef.current.getBoundingClientRect();
                            const wx = (e.clientX - rect.left - pan.x) / zoom;
                            const wy = (e.clientY - rect.top - pan.y) / zoom;
                            onStartDrag(wx, wy, st.id);
                        }}
                    >
                        {st.text}
                    </div>
                );
            })}
        </div>
    );
}
