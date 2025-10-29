// src/hooks/useViewport.js
import { useState } from "react";
import { screenToWorld } from "../utils/viewBox";

export default function useViewport() {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    /* зум от центра курсора */
    const applyZoom = (delta, cx, cy) => {
        const newZoom = Math.min(Math.max(zoom * delta, 0.3), 5);
        const before = screenToWorld(cx, cy, pan, zoom);
        const after = screenToWorld(cx, cy, pan, newZoom);
        setPan((p) => ({
            x: p.x + (after.x - before.x) * newZoom,
            y: p.y + (after.y - before.y) * newZoom,
        }));
        setZoom(newZoom);
    };

    return { pan, zoom, setPan, applyZoom };
}
