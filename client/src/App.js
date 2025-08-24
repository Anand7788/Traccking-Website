import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import TimelineItem from "./components/TimelineItem";

function App() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [autoDetect, setAutoDetect] = useState(true);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/couriers")
      .then((res) => setCouriers(res.data.couriers))
      .catch(() => setError("Failed to load couriers"));
  }, []);

  const handleTrack = async () => {
    try {
      setError("");
      let slugToUse = selectedCourier;

      if (autoDetect) {
        const detect = await axios.post("http://localhost:5000/detect", {
          tracking_number: trackingNumber,
        });
        slugToUse = detect.data.slug;
      }

      const response = await axios.post("http://localhost:5000/track", {
        tracking_number: trackingNumber,
        slug: slugToUse,
      });

      setSlug(slugToUse);
      setTrackingInfo(response.data);
    } catch (err) {
      setError("Tracking failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          📦 Shipment Tracker
        </h1>

        {/* Input Form */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={handleTrack}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Track
          </button>
        </div>

        {/* Options */}
        <div className="mb-6 text-center">
          <label className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={() => setAutoDetect(!autoDetect)}
              className="w-4 h-4"
            />
            Auto-detect Courier
          </label>

          {!autoDetect && (
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="mt-3 w-full p-3 border rounded-xl"
            >
              <option value="">Select Courier</option>
              {couriers.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}

        {/* Tracking Info */}
        {trackingInfo && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Status: {trackingInfo.tag}
            </h2>
            <div className="space-y-4">
              {trackingInfo.checkpoints?.map((cp, idx) => (
                <TimelineItem
                  key={idx}
                  location={cp.location}
                  message={cp.message}
                  time={cp.checkpoint_time}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
