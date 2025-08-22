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
    axios.get("http://localhost:5000/couriers")
      .then((res) => setCouriers(res.data.couriers))
      .catch(() => setError("Failed to load couriers"));
  }, []);

  const handleTrack = async () => {
    try {
      setError("");
      let slugToUse = selectedCourier;

      if (autoDetect) {
        const detect = await axios.post("http://localhost:5000/detect", { tracking_number: trackingNumber });
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
    <div className="app">
      <h1>📦 Shipment Tracker</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={() => setAutoDetect(!autoDetect)}
            />
            Auto-detect Courier
          </label>
          {!autoDetect && (
            <select value={selectedCourier} onChange={(e) => setSelectedCourier(e.target.value)}>
              <option value="">Select Courier</option>
              {couriers.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <button onClick={handleTrack}>Track</button>
      </div>

      {error && <p className="error">{error}</p>}

      {trackingInfo && (
        <div className="timeline">
          <h2>Status: {trackingInfo.tag}</h2>
          {trackingInfo.checkpoints?.map((cp, idx) => (
            <TimelineItem key={idx} location={cp.location} message={cp.message} time={cp.checkpoint_time} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
