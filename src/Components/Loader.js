
import React from "react";


export default function Loader({ fullScreen = true, message = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className="loader-overlay" role="status" aria-live="polite" aria-busy="true">
        <div className="loader-card">
          <div className="loader-spinner" aria-hidden="true" />
          <div className="loader-dots" aria-hidden="true">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="loader-msg">{message}</div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="loader-inline" role="status" aria-live="polite" aria-busy="true">
      <div className="loader-spinner small" aria-hidden="true" />
      <div className="loader-msg small">{message}</div>
    </div>
  );
}
