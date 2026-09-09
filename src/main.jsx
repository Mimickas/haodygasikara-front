import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import CursorClient from "./components/client/layout/cursor/CursorClient";
import './index.css'
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <CursorClient />
    </React.StrictMode>
);