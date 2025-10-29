import React, { useState } from "react";

export default function RenderPopup({ onClose }) {
  const [resolution, setResolution] = useState("1080p");

  const handleRender = () => {
    alert(`Rendering video dalam resolusi ${resolution}...`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-bold mb-4">Pilih Resolusi Video</h3>
        <select
          className="border p-2 w-full rounded mb-4"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option>720p</option>
          <option>1080p</option>
          <option>4K</option>
        </select>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            onClick={handleRender}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Render Now
          </button>
        </div>
      </div>
    </div>
  );
}