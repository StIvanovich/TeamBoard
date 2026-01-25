import React, { forwardRef, useEffect, useRef } from "react";

const DrawingCanvas = forwardRef(({ brushColor, onDrawEnd }, canvasRef) => {
    const internalRef = useRef(null);
    const contextRef = useRef(null);
    const isDrawingRef = useRef(false);

    const FIXED_WIDTH = 3840;
    const FIXED_HEIGHT = 2160;

    useEffect(() => {
        const canvas = internalRef.current;
        if (!canvas) return;

        canvas.width = FIXED_WIDTH;
        canvas.height = FIXED_HEIGHT;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = brushColor;
        contextRef.current = ctx;
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = brushColor;
        }
    }, [brushColor]);

    const getMousePos = (e) => {
        const canvas = internalRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = FIXED_WIDTH / rect.width;
        const scaleY = FIXED_HEIGHT / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        const ctx = contextRef.current;
        if (!ctx) return;
        const { x, y } = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        isDrawingRef.current = true;
    };

    const draw = (e) => {
        if (!isDrawingRef.current || !contextRef.current) return;
        const { x, y } = getMousePos(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (isDrawingRef.current) {
            contextRef.current.closePath();
            isDrawingRef.current = false;
            if (onDrawEnd) onDrawEnd();
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
