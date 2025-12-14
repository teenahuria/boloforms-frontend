export default function Sidebar() {
    

    const handleDragStart = (e, type) => {
        
        e.dataTransfer.setData("field/type", type);
  
    };

    return (
        <div className="sidebar">
            <h3>Fields</h3>
            <ul>
                <li draggable onDragStart={(e) => handleDragStart(e, 'Text')}>Text</li>
                <li draggable onDragStart={(e) => handleDragStart(e, 'Signature')}>Signature</li>
                <li draggable onDragStart={(e) => handleDragStart(e, 'Image')}>Image</li>
                <li draggable onDragStart={(e) => handleDragStart(e, 'Date')}>Date</li>
                <li draggable onDragStart={(e) => handleDragStart(e, 'Radio')}>Radio</li>
            </ul>
        </div>
    );
}