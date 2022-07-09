import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import DraggableItem from "./Draggable";

const getColumns = () => ({
  TODO: {
    name: "To-do",
    items: [],
  },
  IN_PROGRESS: {
    name: "In Progress",
    items: [],
  },
  DONE: {
    name: "Done",
    items: [],
  },
});

async function getCards(db) {
  try {
    return (await db).getCards();
  } catch (error) {
    console.log(error);
  }
}

async function handleOnDragEnd(cardsMap, result, columns, setColumns, db) {
  if (!result.destination) return;
  const { source, destination } = result;

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
  }
  if (result)
    (await db).updateCardById(result?.draggableId, {
      ...cardsMap[result?.draggableId],
      status: result?.destination?.droppableId,
    });
}

function Board(props) {
  const { db } = props || {};
  const [columns, setColumns] = useState(getColumns());
  const [showNewCards, setShowNewCards] = useState("");
  const [cardsMap, setCardsMap] = useState({});
  const [newTask, setNewTask] = useState("");
  const [taskType, setTaskType] = useState("TODO");

  const onDragEnd = (result, columns, setColumns, db) => {
    handleOnDragEnd(cardsMap, result, columns, setColumns, db);
  };

  const parseCards = (cards = []) => {
    const tmpColumns = getColumns();
    const map = {};
    cards.forEach((card) => {
      if (card) {
        map[card.id] = card;
        tmpColumns[card?.status]["items"].push(card);
      }
    });
    setColumns(tmpColumns);
    setCardsMap(map);
  };

  useEffect(() => {
    getCards(db)
      .then((cards) => parseCards(cards))
      .catch((error) => console.log(error));
  }, [showNewCards, db]);

  const onAddClick = async () => {
    if (newTask) {
      (await db).addCard({
        name: newTask,
        status: taskType,
      });
    }
    setShowNewCards(newTask);
    setNewTask("");
    setShowNewCards("");
  };

  const deleteTask = async (taskId) => {
    try {
      (await db).deleteCardById(taskId);
      getCards(db)
        .then((cards) => parseCards(cards))
        .catch((error) => {
          if (error.message === "No data found.") {
            setColumns(getColumns());
          }
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="board">
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns, db)}
        >
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <div className="board-body" key={columnId}>
                <h2 className="droppable-title">{column.name}</h2>
                <div className="droppable">
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <div
                          className="droppable-body"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {column.items.map((item, index) => {
                            return (
                              <DraggableItem
                                key={item?.id}
                                item={item}
                                index={index}
                                deleteTask={deleteTask}
                              />
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </DragDropContext>
      </div>
      <div className="add-task">
        <select onChange={(e) => setTaskType(e?.currentTarget?.value)}>
          <option value="TODO">To-do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <input
          type="text"
          value={newTask}
          placeholder="e.g. Bug: TextPoll not dispatching half stars"
          onChange={(e) => setNewTask(e?.currentTarget?.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddClick();
            }
          }}
        />
        <button onClick={() => onAddClick()}>ADD NEW</button>
      </div>
    </>
  );
}

export default Board;
