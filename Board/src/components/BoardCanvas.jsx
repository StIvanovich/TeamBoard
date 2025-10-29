// src/components/BoardCanvas.jsx
import { useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import CanvasRenderer from "./CanvasRenderer";
import StickerLayer from "./StickerLayer";
import useViewport from "../hooks/useViewport";
import usePen from "../hooks/usePen";
import useSticker from "../hooks/useSticker";
import { screenToWorld } from "../utils/viewBox";

export default function BoardCanvas() {
    const containerRef = useRef(null);

    const { pan, zoom, setPan, applyZoom } = useViewport();
    const { lines, current, start, addPoint, finish, active: penActive } = usePen();
    const { stickers, add, startDrag, drag, stopDrag } = useSticker();
    const [tool, setTool] = useState("pen");

    /* ---------- resize canvas (CSS → буфер) ---------- */
    useEffect(() => {
        const canvas = containerRef.current.querySelector("canvas");
        if (!canvas) return;
        const resize = () => {
            const cssWidth = canvas.clientWidth;
            const cssHeight = canvas.clientHeight;
            canvas.width = cssWidth;
            canvas.height = cssHeight;
            const dpr = window.devicePixelRatio || 1;
            const ctx = canvas.getContext("2d");
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    /* ---------- перевод коорд. ---------- */
    const getWorld = (e) => {
        const r = containerRef.current.getBoundingClientRect();
        return screenToWorld(e.clientX - r.left, e.clientY - r.top, pan, zoom);
    };

    /* ---------- мышь / инструменты ---------- */
    const onMouseDown = (e) => {
        const wp = getWorld(e);
        if (tool === "sticker") {
            add(wp.x, wp.y);
            return;
        }
        if (tool === "hand") return;
        start(wp);
    };
    const onMouseMove = (e) => {
        const wp = getWorld(e);
        if (tool === "hand" && e.buttons === 1) {
            setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
            return;
        }
        if (tool === "pen" && penActive) addPoint(wp);
        drag(wp.x, wp.y);
    };
    const onMouseUp = () => {
        finish();
        stopDrag();
    };
    const onWheel = (e) => {
        e.preventDefault();
        const r = containerRef.current.getBoundingClientRect();
        applyZoom(e.deltaY > 0 ? 0.9 : 1.1, e.clientX - r.left, e.clientY - r.top);
    };

    const cursor = tool === "hand" ? "grab" : tool === "pen" ? "crosshair" : "copy";

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `html,body,#root{margin:0;padding:0;width:100%;height:100%;overflow:hidden}` }} />
            <div ref={containerRef} style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
                <Toolbar tool={tool} setTool={setTool} />

                {/* ❶ контейнер canvas – занимает ВСЁ оставшееся место */}
                <div style={{ flex: 1, position: "relative", cursor }}>
                    <CanvasRenderer pan={pan} zoom={zoom} lines={lines} currentLine={current} stickers={stickers} />
                    <StickerLayer pan={pan} zoom={zoom} stickers={stickers} onStartDrag={startDrag} />

                    {/* прозрачный перехватчик событий */}
                    <div style={{ position: "absolute", inset: 0 }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel} />
                </div>
            </div>
        </>
    );
}
