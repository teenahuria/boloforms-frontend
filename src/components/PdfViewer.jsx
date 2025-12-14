
import React from 'react';
import { Document, Page, pdfjs } from "react-pdf"; 
import FieldWrapper from "./FieldWrapper"; 
import { calculatePixelCoordsForRender } from "../utils/coordinateMath"; 

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


export default function PdfViewer({
    fields, 
    pdfDimensions, 
    onFieldUpdate,
    onLoadSuccess,
    pdfContainerRef 
}) {
    const { width } = pdfDimensions;

    return (
        <div className="pdf-container">
            <Document
                file="/sample.pdf"
                onLoadError={(error) => {
                    console.error("PDF load error:", error);
                }}
            >
              
                <div style={{ position: "relative" }} ref={pdfContainerRef}> 
                    <Page
                        pageNumber={1}
                        width={600}
                        onLoadSuccess={onLoadSuccess}
                    />

                    
                    {fields.map(field => {
                        const { pixelX, pixelY, pixelWidth, pixelHeight } = calculatePixelCoordsForRender(
                            field, 
                            pdfDimensions
                        );

                        return (
                            <FieldWrapper
                                key={field.id}
                                field={field}
                                pixelX={pixelX}
                                pixelY={pixelY}
                                pixelWidth={pixelWidth}
                                pixelHeight={pixelHeight}
                                pdfDimensions={pdfDimensions}
                                onFieldUpdate={onFieldUpdate}
                            />
                        );
                    })}

                    {width > 0 && (
                        <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                            Page Size: {Math.round(pdfDimensions.width)} × {Math.round(pdfDimensions.height)} px
                        </div>
                    )}
                </div>
            </Document>
        </div>
    );
}