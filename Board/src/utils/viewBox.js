// src/utils/viewBox.js
// перевод экранных координат в мировые (с учётом pan/zoom)
export const screenToWorld = (sx, sy, pan, zoom) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
});

// перевод мировых координат в экранные
export const worldToScreen = (wx, wy, pan, zoom) => ({
    x: wx * zoom + pan.x,
    y: wy * zoom + pan.y,
});
