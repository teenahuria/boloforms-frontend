import React from 'react';
import { Document, Page } from 'react-pdf';
// Import react-pdf CSS files to fix "TextLayer styles not found" warnings
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; 

const samplePdf = '/sample.pdf'; 

export default function PdfViewer({ pdfContainerRef, onLoadSuccess, pdfDimensions }) {
    
    const getPageWidth = () => {
        const container = pdfContainerRef.current;
        if (container) {
            return container.clientWidth;
        }
        return 800; 
    };
    
    const pageNumber = 1;

    return (
        <div 
            ref={pdfContainerRef} 
            id="pdf-boundary-container" // Necessary ID for future boundary re-enabling
            style={{ 
                position: 'relative', 
                width: 'fit-content',
                margin: '0 auto',
                minHeight: '100vh',
            }}
            className="pdf-viewer-container"
        >
            <Document 
                file={samplePdf}
                onLoadSuccess={({ numPages }) => {
                    const dummyPage = { width: getPageWidth(), height: pdfDimensions.height || 1000 };
                    onLoadSuccess(dummyPage);
                }}
                loading={<div>Loading Document...</div>}
                error={<div>Failed to load PDF. Check the URL or if the file exists in your public folder.</div>}
            >
                <Page 
                    pageNumber={pageNumber} 
                    width={getPageWidth()}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                />
            </Document>
        </div>
    );
}