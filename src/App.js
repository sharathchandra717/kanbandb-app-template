import React from "react";
import "./App.css";
import KanbanDB from "kanbandb";
import Board from './Components/Board'



async function initialize() {
  const instance = await KanbanDB.connect(null);
  return instance;
}

function App() {
  const db = initialize()
  const props = {
    db
  }
  return (
      <Board {...props} />
  );
}

export default App;
