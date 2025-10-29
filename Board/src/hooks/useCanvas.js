// src/hooks/useCanvas.js
import { useRef, useEffect } from "react";

export default function useCanvas(draw, deps = []) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let rafId = null;

        const loop = () => {
            draw(ctx);
            rafId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(rafId); // ← было afId
    }, [draw, ...deps]);

    return canvasRef;
}
