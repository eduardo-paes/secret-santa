import React from "react";

export default function Loading() {
  return (
    <div className="page-container page-container--centered" role="status" aria-live="polite">
      <div className="loading-container">
        <div className="loading-dots" aria-label="Carregando">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="loading-text">Realizando sorteio...</p>
      </div>
    </div>
  );
}
