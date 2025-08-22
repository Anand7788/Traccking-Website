import React from "react";
import "./TimelineItem";

const TimelineItem = ({ location, message, time }) => (
  <div className="timeline-item">
    <div className="icon">
      <svg width="20" height="20" fill="currentColor">
        <circle cx="10" cy="10" r="8" stroke="black" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
    <div className="details">
      <p className="message">{message}</p>
      <p className="location">{location}</p>
      <p className="time">{new Date(time).toLocaleString()}</p>
    </div>
  </div>
);

export default TimelineItem;
