import React from "react";
import { useLocation } from "react-router-dom";
import TimelineEditor from "../components/TimelineEditor";

export default function TimelinePage() {
  const { state } = useLocation();
  const timeline = state?.timeline;

  if (!timeline) return <div>Tidak ada project.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">{timeline.judul}</h1>
      <TimelineEditor timeline={timeline} />
    </div>
  );
}