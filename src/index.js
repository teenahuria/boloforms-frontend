import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { pdfjs } from "react-pdf";
import "./styles.css";


pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
