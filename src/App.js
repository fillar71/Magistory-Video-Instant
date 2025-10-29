import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GeneratePage from "./pages/GeneratePage";
import TimelinePage from "./pages/TimelinePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GeneratePage />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Routes>
    </BrowserRouter>
  );
}