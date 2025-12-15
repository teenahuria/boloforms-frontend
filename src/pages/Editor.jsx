import React, { useState, useRef, useCallback } from "react";
import PdfViewer from "../components/PdfViewer";
import Sidebar from "../components/Sidebar";
// FIX: Import the necessary functions from the coordinate utility file
import { calculateRelativeCoords, calculatePixelCoordsForRender } from "../utils/coordinateMath"; 
import FieldWrapper from '../components/FieldWrapper'; 
// Note: This file uses Create React App (CRA) standards (process.env.REACT_APP_)

export default function Editor() {
  const [fields, setFields] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const pdfContainerRef = useRef(null);

  const handlePdfLoadSuccess = useCallback((page) => {
    setPdfDimensions({
      width: page.width,
      height: page.height, // Total rendered height of PDF
    });
  }, []);

  const updateField = useCallback(
    (fieldId, newPixelData) => {
      setFields((prevFields) =>
        prevFields.map((field) => {
          if (field.id === fieldId) {
            const newRelativeCoords = calculateRelativeCoords(
              newPixelData,
              pdfDimensions
            );
            return {
              ...field,
              ...newRelativeCoords,
            };
          }
          return field;
        })
      );
    },
    [pdfDimensions]
  );

  const addField = useCallback(
    (type, initialPixelData) => {
      const newRelativeCoords = calculateRelativeCoords(
        initialPixelData,
        pdfDimensions
      );

      const newField = {
        id: `field-${Date.now()}`,
        type: type,
        page: 1,
        ...newRelativeCoords,
      };

      setFields((prevFields) => [...prevFields, newField]);
    },
    [pdfDimensions]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      
      const type = e.dataTransfer.getData("field/type");
      if (!type) {
        console.error("Drag data (field/type) is missing. Check Sidebar dragStart.");
        return;
      }

      const pageContainer = pdfContainerRef.current;
      
      // FIX 1: Get the scrollable container (the drop target) using e.currentTarget.
      const scrollableParent = e.currentTarget; 

      // CRITICAL GUARD: Stop if the container is not ready (although PDF load success should cover this)
      if (!pageContainer || !scrollableParent) {
        console.error(
          "PDF Container or Scrollable Parent Ref is missing. Cannot calculate drop coordinates."
        );
        return;
      }

      const rect = pageContainer.getBoundingClientRect();

      // FIX 2: Capture the current scroll offset
      const pixelScrollY = scrollableParent.scrollTop;
      
      const initialPixelData = {
        pixelX: e.clientX - rect.left,
        // FINAL Y FIX: e.clientY (mouse pos in viewport) - rect.top (PDF top in viewport) + scroll position (how far down we are)
        // This creates the definitive Y-position relative to the absolute top of the document.
        pixelY: e.clientY - rect.top + pixelScrollY, 
        pixelWidth: 100, // Default width
        pixelHeight: 30, // Default height
      };

      addField(type, initialPixelData); 
    },
    [addField]
  );

  const handleSignDocument = async () => {
    const signatureField = fields.find((f) => f.type === "Signature");
    if (!signatureField) {
      alert("Please place a Signature field on the document first.");
      return;
    }

    const signatureBase64Prompt = prompt(
      "Paste your signature image Base64 string here (e.g., QkFIRkJ...):"
    );
    if (!signatureBase64Prompt) return;

    // CRITICAL FIX FOR INVISIBLE SIGNATURES: Prepend Data URI Scheme
    const PREFIX = 'data:image/png;base64,';
    const signatureBase64 = signatureBase64Prompt.startsWith(PREFIX) 
        ? signatureBase64Prompt 
        : PREFIX + signatureBase64Prompt;

    // CRITICAL DEBUG CHECK 1: Check if the field has any size
    if (signatureField.width === 0 || signatureField.height === 0) {
        alert("The signature field has zero width or height. Please resize the box before submitting.");
        return;
    }


    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.title = "Processing Document...";
      // DEBUG CHECK 2: Display the Base64 image in the new window for immediate verification
      newWindow.document.body.innerHTML = `
            <h1>Signing in Progress... Please Wait.</h1>
            <h2>Verifying Signature Data...</h2>
            <img src="${signatureBase64}" alt="Signature Preview" style="max-width: 300px; border: 1px solid #ccc;"/>
            <p>If the image above is blank, your pasted Base64 string is invalid or incomplete.</p>
        `;
    }
    
    const payload = {
      pdfId: "document-123",
      signatureBase64: signatureBase64, // <-- Using the correctly prefixed variable
      fieldData: {
        type: signatureField.type,
        page: signatureField.page,
        x: signatureField.x,
        y: signatureField.y,
        width: signatureField.width,
        height: signatureField.height,
      },
      signerId: "test@boloforms.com",
    };

    try {
// --------------------------------------------------------------------------------------------------
// CRITICAL FIX SECTION: Changing the API URL variable to VITE_API_URL
// --------------------------------------------------------------------------------------------------
        // We must use import.meta.env.VITE_API_URL to match the variable correctly set on Render.
        // We also ensure the obsolete process.env.REACT_APP_API_URL (which was incorrectly set) is not used.
        
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        
        if (!API_BASE_URL) {
            // This check prevents the browser from trying to call an undefined address.
            alert("Configuration Error: VITE_API_URL is missing. Cannot submit.");
            throw new Error("VITE_API_URL is not configured in the deployment settings.");
        }
        
        const API_URL = `${API_BASE_URL}/sign-pdf`;
// --------------------------------------------------------------------------------------------------
// END CRITICAL FIX SECTION
// --------------------------------------------------------------------------------------------------
        
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (newWindow) newWindow.close(); // Close placeholder window on API failure
        throw new Error(
          `API failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      if (newWindow) {
        newWindow.location.href = data.url;
        newWindow.document.title = "Signed Document";
      } else {
        // Fallback (for older browsers/edge cases)
        window.open(data.url, "_blank");
      }
      alert(`Document Signed! Original Hash: ${data.originalHash}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Submission failed: ${error.message}`);
      if (newWindow) newWindow.close();
    }
  };

  return (
    <div
      className="editor-container"
      style={{ display: "flex", height: "100vh" }}
    >
      <Sidebar onDropField={addField} />
      <div
        style={{ flexGrow: 1, overflow: "auto" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <PdfViewer
          pdfContainerRef={pdfContainerRef}
          onLoadSuccess={handlePdfLoadSuccess}
          // Fields are no longer passed here
          pdfDimensions={pdfDimensions}
          onFieldUpdate={updateField}
        />

        {/* CRITICAL FIX: Conditionally render fields ONLY after PDF dimensions are set */}
        {pdfDimensions.width > 0 && fields.map(field => {
            const { pixelX, pixelY, pixelWidth, pixelHeight } = calculatePixelCoordsForRender(field, pdfDimensions);
            return (
                <FieldWrapper
                    key={field.id}
                    field={field}
                    pixelX={pixelX}
                    pixelY={pixelY}
                    pixelWidth={pixelWidth}
                    pixelHeight={pixelHeight}
                    pdfDimensions={pdfDimensions}
                    onUpdate={updateField}
                />
            );
        })}
      </div> <button 
        onClick={handleSignDocument}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: "12px 25px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 100, // Ensure button is on top
        }}
      >
        SIGN & SUBMIT DOCUMENT
      </button>
    </div>
  );
}