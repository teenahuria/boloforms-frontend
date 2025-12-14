import React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; 

export default function FieldWrapper({
    field,            
    pixelX,           
    pixelY,           
    pixelWidth,       
    pixelHeight,      
    pdfDimensions,    
    onFieldUpdate,    
}) {

    const handleDragStop = (e, data) => { 
     
        const newPixelData = { 
            pixelX: data.x, 
            pixelY: data.y, 
            pixelWidth, 
            pixelHeight 
        };
        onFieldUpdate(field.id, newPixelData);
    };

   
    const handleResizeStop = (e, direction, ref, delta, position) => { 
        
        const newPixelData = { 
            pixelX: position.x, 
            pixelY: position.y, 
            pixelWidth: ref.offsetWidth, 
            pixelHeight: ref.offsetHeight 
        };
        onFieldUpdate(field.id, newPixelData);
    };
 
    const content = field.type === 'Signature' 
        ? 'Sign Here' 
        : `${field.type} Field`; 

 
    const fieldStyle = {
        position: 'absolute',
        cursor: 'move',
        boxShadow: '0 0 0 1px #3182CE',
        zIndex: 10,
    };

    return (
     <Draggable
            bounds="parent"
            position={{ x: pixelX, y: pixelY }}
            onStop={handleDragStop}
            allowAnyClick={false}
        >
           
            <ResizableBox
                width={pixelWidth}
                height={pixelHeight}
             
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
        </Draggable>
    );
}