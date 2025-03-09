import { createRoot } from "react-dom/client";
import RouterMain from "./RouterMain.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <RouterMain />
  </BrowserRouter>
);
