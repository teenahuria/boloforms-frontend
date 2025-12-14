import React, { useState, useRef, useCallback } from "react";
import PdfViewer from "../components/PdfViewer"; 
import Sidebar from "../components/Sidebar";
import { calculateRelativeCoords } from "../utils/coordinateMath"; 



export default function Editor() {
    const [fields, setFields] = useState([]); 
    const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
    const pdfContainerRef = useRef(null); 

    const handlePdfLoadSuccess = useCallback((page) => {
        setPdfDimensions({
            width: page.width,
            height: page.height,
        });
    }, []);

    const updateField = useCallback((fieldId, newPixelData) => {
        setFields(prevFields => prevFields.map(field => {
            if (field.id === fieldId) {
               
                const newRelativeCoords = calculateRelativeCoords(newPixelData, pdfDimensions);
                return {
                    ...field,
                    ...newRelativeCoords,
                };
            }
            return field;
        }));
    }, [pdfDimensions]);

    const addField = useCallback((type, initialPixelData) => {
     
        const newRelativeCoords = calculateRelativeCoords(initialPixelData, pdfDimensions);

        const newField = {
            id: `field-${Date.now()}`,
            type: type, 
            page: 1, 
            ...newRelativeCoords,
        };

        setFields(prevFields => [...prevFields, newField]);
    }, [pdfDimensions]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("field/type");
        
        const pageContainer = pdfContainerRef.current; 

        if (!pageContainer) {
            console.error("PDF Container Ref is missing. Cannot calculate drop coordinates.");
            return;
        }
        
        const rect = pageContainer.getBoundingClientRect();

        const initialPixelData = {
            pixelX: e.clientX - rect.left,
            pixelY: e.clientY - rect.top,
            pixelWidth: 100, // Default width
            pixelHeight: 30, // Default height
        };

        if (type) {
            addField(type, initialPixelData);
        }
    }, [addField]);

  
    const handleSignDocument = async () => {
        const signatureField = fields.find(f => f.type === 'Signature');
        
        if (!signatureField) {
            alert("Please place a Signature field on the document first.");
            return;
        }

        const signatureBase64 = prompt("Paste your signature image Base64 string here:");
        if (!signatureBase64) return;

        const newWindow = window.open('', '_blank'); 
        
        if (newWindow) {
            newWindow.document.title = 'Processing Document...';
            newWindow.document.body.innerHTML = '<h1>Signing in Progress... Please Wait.</h1>';
        }
        
        const payload = {
            pdfId: 'document-123', 
            signatureBase64: signatureBase64,
            fieldData: {
                type: signatureField.type,
                page: signatureField.page,
                x: signatureField.x,
                y: signatureField.y,
                width: signatureField.width,
                height: signatureField.height,
            },
            signerId: 'test@boloforms.com',
        };

        try {
            const API_URL = 'http://localhost:3001/sign-pdf'; 
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (newWindow) newWindow.close(); // Close placeholder window on API failure
                throw new Error(`API failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
        
            if (newWindow) {
                newWindow.location.href = data.url;
                newWindow.document.title = 'Signed Document';
            } else {
                // Fallback (for older browsers/edge cases)
                window.open(data.url, '_blank');
            }
            
            alert(`Document Signed! Original Hash: ${data.originalHash}`);

        } catch (error) {
            console.error("Submission failed:", error);
            alert(`Submission failed: ${error.message}`);
            if (newWindow) newWindow.close(); 
        }
    };


    return (
        <div className="editor-container" style={{ display: 'flex', height: '100vh' }}>
            <Sidebar onDropField={addField} /> 
            
            <div 
                style={{ flexGrow: 1, overflow: 'auto' }} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <PdfViewer 
                    pdfContainerRef={pdfContainerRef} 
                    onLoadSuccess={handlePdfLoadSuccess}
                    fields={fields}
                    pdfDimensions={pdfDimensions}
                    onFieldUpdate={updateField}
                />
            </div>

       
            <button 
                onClick={handleSignDocument} 
                style={{ 
                    position: 'fixed', 
                    bottom: 20, 
                    right: 20, 
                    padding: '12px 25px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    zIndex: 100 // Ensure button is on top
                }}
            >
                SIGN & SUBMIT DOCUMENT
            </button>
        </div>
    );
}