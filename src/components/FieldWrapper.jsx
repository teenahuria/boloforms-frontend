import React, { useRef, useCallback, useEffect, useState } from 'react'; // <-- CRITICAL FIX: Imported all required hooks
// REMOVED: import Draggable from 'react-draggable'; // Still removed
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; 
// Note: Keeping native drag logic from previous step, assuming it is functioning

export default function FieldWrapper({
    field,            
    pixelX,           
    pixelY,           
    pixelWidth,       
    pixelHeight,      
    pdfDimensions,    
    onUpdate, 
}) {
    const fieldRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleDragStart = useCallback((e) => {
        setIsDragging(true);
        // Store the initial mouse position and the current field position
        setDragStart({ 
            x: e.clientX, 
            y: e.clientY,
            offsetX: e.clientX - pixelX,
            offsetY: e.clientY - pixelY,
        });
        e.preventDefault(); 
    }, [pixelX, pixelY]);

    const handleDragging = useCallback((e) => {
        if (!isDragging) return;
        
        // Calculate new pixel position based on mouse movement relative to drag start
        let newPixelX = e.clientX - dragStart.offsetX;
        let newPixelY = e.clientY - dragStart.offsetY;

        // Temporarily move the field component in the DOM
        if (fieldRef.current) {
            fieldRef.current.style.left = `${newPixelX}px`;
            fieldRef.current.style.top = `${newPixelY}px`;
        }

    }, [isDragging, dragStart]);

    const handleDragStop = useCallback((e) => {
        if (!isDragging) return;
        setIsDragging(false);

        const newPixelX = e.clientX - dragStart.offsetX;
        const newPixelY = e.clientY - dragStart.offsetY;

        const newPixelData = { 
            pixelX: newPixelX, 
            pixelY: newPixelY, 
            pixelWidth, 
            pixelHeight 
        };
        // This is the CRITICAL step: update the state and persist the new position
        onUpdate(field.id, newPixelData);

    }, [isDragging, dragStart, pixelWidth, pixelHeight, onUpdate, field.id]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragging);
            window.addEventListener('mouseup', handleDragStop);
        } else {
            window.removeEventListener('mousemove', handleDragging);
            window.removeEventListener('mouseup', handleDragStop);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragging);
            window.removeEventListener('mouseup', handleDragStop);
        };
    }, [isDragging, handleDragging, handleDragStop]);


    const handleResizeStop = (e, direction, elementRef, delta, position) => { 
        
        // Ensure the DOM element reference exists before accessing its properties
        if (!elementRef) {
            console.error("Resize failed: Element reference is undefined.");
            return;
        }

        const newPixelData = { 
            // The position is provided via props, use the calculated position 
            // if available from the resize event, otherwise use original position.
            pixelX: position.x || pixelX, 
            pixelY: position.y || pixelY,
            
            // FIX: Access the new dimensions safely
            pixelWidth: elementRef.offsetWidth, 
            pixelHeight: elementRef.offsetHeight 
        };
        
        onUpdate(field.id, newPixelData);
    };
 
    const content = field.type === 'Signature' 
        ? 'Sign Here' 
        : `${field.type} Field`; 
    
    // Position style is now inline, handled by the state's pixelX/pixelY
    const fieldStyle = {
        position: 'absolute',
        left: pixelX,
        top: pixelY,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 20 : 10,
    };
    
    // We replace Draggable with a native div and mouse handlers
    return (
        <div
            ref={fieldRef}
            style={fieldStyle}
            onMouseDown={handleDragStart} // Attach the drag start handler here
        >
            <ResizableBox
                width={pixelWidth}
                height={pixelHeight}
                onResizeStop={handleResizeStop}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    border: '2px dashed #3182CE',
                    background: 'rgba(49, 130, 206, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#1A4D8B',
                    fontWeight: 'bold',
                }}>
                    {content} 
                </div>
            </ResizableBox>
        </div>
    );
}