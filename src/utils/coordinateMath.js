
export const calculateRelativeCoords = (pixelData, pageDims) => {
    return {
        x: pixelData.pixelX / pageDims.width,
        y: pixelData.pixelY / pageDims.height,
        width: pixelData.pixelWidth / pageDims.width,
        height: pixelData.pixelHeight / pageDims.height,
    };
};


export const calculatePixelCoordsForRender = (relativeData, pageDims) => {
    return {
        pixelX: relativeData.x * pageDims.width,
        pixelY: relativeData.y * pageDims.height,
        pixelWidth: relativeData.width * pageDims.width,
        pixelHeight: relativeData.height * pageDims.height,
    };
};