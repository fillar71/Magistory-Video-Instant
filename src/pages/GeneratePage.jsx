import React, { useState } from "react";
import { generateVideoScript } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function GeneratePage() {
  const [idea, setIdea] = useState("");
  const [duration, setDuration] = useState(60);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [style, setStyle] = useState("Cinematic");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const timeline = await generateVideoScript({ idea, duration, aspectRatio, style });
      navigate("/timeline", { state: { timeline } });
    } catch (err) {
      alert("Gagal generate: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🎥 Magistory Video Generator</h1>
      <textarea
        placeholder="Tuliskan ide videomu..."
        className="border w-96 h-32 p-3 rounded mb-4"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />
      <div className="flex gap-3 mb-4">
        <input
          type="number"
          className="border p-2 w-24 rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        >
          <option>16:9</option>
          <option>9:16</option>
          <option>1:1</option>
        </select>
        <select
          className="border p-2 rounded"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option>Cinematic</option>
          <option>Documentary</option>
          <option>Explainer</option>
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Membuat Script..." : "Generate"}
      </button>
    </div>
  );
}