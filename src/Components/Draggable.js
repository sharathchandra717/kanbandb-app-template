import React from "react";
import { Draggable } from "react-beautiful-dnd";
import "./Board.css"
function DraggableItem(props) {
  const { item, index } = props;
  return (
    <Draggable
      key={item?.id}
      draggableId={item?.id}
      index={index}
    >
      {(provided) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="draggable-item"
            style={{
              userSelect: "none",
              ...provided.draggableProps.style,
            }}
          >
            {item?.name}
          </div>
        );
      }}
    </Draggable>
  );
}

export default DraggableItem;
