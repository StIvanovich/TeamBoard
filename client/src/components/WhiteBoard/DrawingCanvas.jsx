import React, { forwardRef, useEffect, useRef } from "react";

const DrawingCanvas = forwardRef(({ brushColor }, canvasRef) => {
    const internalRef = useRef(null);
    const contextRef = useRef(null);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const canvas = internalRef.current;
        if (!canvas) return;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 80;
        };
        setCanvasSize();
        window.addEventListener("resize", setCanvasSize);

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = brushColor;
        contextRef.current = ctx;

        return () => {
            window.removeEventListener("resize", setCanvasSize);
        };
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = brushColor;
        }
    }, [brushColor]);

    const startDrawing = (e) => {
        const ctx = contextRef.current;
        const { offsetX, offsetY } = e.nativeEvent || e.touches?.[0] || {};
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        isDrawingRef.current = true;
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        const ctx = contextRef.current;
        const { offsetX, offsetY } = e.nativeEvent || e.touches?.[0] || {};
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawingRef.current) {
            contextRef.current.closePath();
            isDrawingRef.current = false;
        }
    };

    return (
        <canvas
            ref={(el) => {
                internalRef.current = el;
                if (canvasRef) canvasRef.current = el;
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="drawing-canvas"
        />
    );
});

export default DrawingCanvas;
