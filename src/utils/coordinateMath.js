// File: ../utils/coordinateMath.js

/**
 * Converts screen-based pixel coordinates (from drag/drop) into relative coordinates (0.0 to 1.0)
 * required by the PDF backend.
 * * @param {object} pixelData - { pixelX, pixelY, pixelWidth, pixelHeight }
 * @param {object} pageDims - { width, height } of the rendered PDF container.
 * @returns {object} Relative coordinates { x, y, width, height }
 */
export const calculateRelativeCoords = (pixelData, pageDims) => {
    // Calculate the raw relative coordinates
    const x = pixelData.pixelX / pageDims.width;
    const y = pixelData.pixelY / pageDims.height;
    const width = pixelData.pixelWidth / pageDims.width;
    const height = pixelData.pixelHeight / pageDims.height;
    
    // CRITICAL FIX: Clamp the X and Y values between 0.0 and 1.0.
    // This ensures that even if the pixel calculation is slightly off (e.g., due to scrolling,
    // mobile viewport, or tiny margins), the coordinate sent to the backend is valid
    // and keeps the signature on the page.
    return {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
        width: width,
        height: height,
    };
};


/**
 * Converts relative coordinates (0.0 to 1.0) back into pixel coordinates for rendering the field boxes.
 * * @param {object} relativeData - { x, y, width, height }
 * @param {object} pageDims - { width, height } of the rendered PDF container.
 * @returns {object} Pixel coordinates { pixelX, pixelY, pixelWidth, pixelHeight }
 */
export const calculatePixelCoordsForRender = (relativeData, pageDims) => {
    // This function correctly scales relative coords back to pixels for the UI display.
    return {
        pixelX: relativeData.x * pageDims.width,
        pixelY: relativeData.y * pageDims.height,
        pixelWidth: relativeData.width * pageDims.width,
        pixelHeight: relativeData.height * pageDims.height,
    };
};