import React from "react";

export default function Loading() {
  return (
    <div className="page-container page-container--centered" role="status" aria-live="polite">
      <div className="loading-container">
        <div className="loading-spinner" aria-label="Carregando"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    </div>
  );
}
