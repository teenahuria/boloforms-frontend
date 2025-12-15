// File: ../utils/coordinateMath.js

export const calculateRelativeCoords = (pixelData, pageDims) => {
    // 1. Calculate the raw relative coordinates
    const x = pixelData.pixelX / pageDims.width;
    const y = pixelData.pixelY / pageDims.height;
    const width = pixelData.pixelWidth / pageDims.width;
    const height = pixelData.pixelHeight / pageDims.height;
    
    // 2. CRITICAL FIX: Clamp the X and Y values between 0.0 and 1.0.
    // This ensures that even if the scroll calculation in Editor.jsx is slightly off
    // (which is common on mobile), the coordinates sent to the backend are valid.
    return {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
        width: width,
        height: height,
    };
};


export const calculatePixelCoordsForRender = (relativeData, pageDims) => {
    // This function remains the same, as it correctly scales relative coords back to pixels
    return {
        pixelX: relativeData.x * pageDims.width,
        pixelY: relativeData.y * pageDims.height,
        pixelWidth: relativeData.width * pageDims.width,
        pixelHeight: relativeData.height * pageDims.height,
    };
};