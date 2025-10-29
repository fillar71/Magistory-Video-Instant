import React from "react";

export default function SceneCard({ scene }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-2">
        Adegan {scene.nomor_adegan} ({scene.durasi})
      </h3>
      <p className="text-sm mb-2 text-gray-600">{scene.narasi}</p>
      <div className="grid grid-cols-3 gap-2">
        {scene.klip_media.map((k, i) => (
          <div
            key={i}
            className="border rounded h-24 flex items-center justify-center text-xs text-gray-500"
          >
            {k.keyword}
          </div>
        ))}
      </div>
    </div>
  );
}