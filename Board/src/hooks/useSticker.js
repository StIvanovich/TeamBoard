// src/hooks/useSticker.js
import { useState, useRef } from "react";
import { randomId } from "../utils/randomId";

export default function useSticker() {
    const [stickers, setStickers] = useState([]); // [{id,x,y,w,h,text,color}]
    const dragId = useRef(null); // id перетаскиваемого стикера
    const offset = useRef({ x: 0, y: 0 }); // смещение курсора от левого-верхнего угла стикера

    /* добавить стикер в точку мира (x,y) */
    const add = (x, y) => {
        const text = prompt("Текст стикера") || "note";
        setStickers((s) => [
            ...s,
            {
                id: randomId(),
                x: x - 60, // центрируем под курсором
                y: y - 40,
                w: 120,
                h: 80,
                text,
                color: "#fffb7f",
            },
        ]);
    };

    /* начать перетаскивание */
    const startDrag = (x, y, id) => {
        const st = stickers.find((s) => s.id === id);
        if (!st) return;
        dragId.current = id;
        offset.current = { x: x - st.x, y: y - st.y };
    };

    /* переместить стикер (x,y — мир) */
    const drag = (x, y) => {
        if (!dragId.current) return;
        setStickers((list) => list.map((s) => (s.id === dragId.current ? { ...s, x: x - offset.current.x, y: y - offset.current.y } : s)));
    };

    /* закончить перетаскивание */
    const stopDrag = () => {
        dragId.current = null;
    };

    return { stickers, add, startDrag, drag, stopDrag };
}
