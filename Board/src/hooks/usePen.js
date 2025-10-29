// src/hooks/usePen.js
import { useState, useRef } from "react";
import { randomId } from "../utils/randomId";

export default function usePen() {
    const [lines, setLines] = useState([]); // законченные линии
    const current = useRef(null); // строящаяся линия
    const [active, setActive] = useState(false); // рисуем ли сейчас

    /* начать новую линию */
    const start = (pt) => {
        setActive(true);
        current.current = { id: randomId(), pts: [pt] };
    };

    /* добавить точку к текущей линии */
    const addPoint = (pt) => {
        if (!active) return;
        current.current.pts.push(pt);
    };

    /* закончить линию и сохранить в массив */
    const finish = () => {
        if (!active) return;
        setLines((l) => [...l, current.current]); // ← сразу попадает в lines
        current.current = null;
        setActive(false);
    };

    return { lines, current: current.current, start, addPoint, finish, active };
}
