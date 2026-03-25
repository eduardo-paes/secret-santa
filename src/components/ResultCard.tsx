import React from "react";
import { Gift } from "lucide-react";

interface ResultCardProps {
  drawName: string;
  giver: string;
  receiver: string;
}

export default function ResultCard({ drawName, giver, receiver }: ResultCardProps) {
  return (
    <div className="page-container page-container--centered">
      <div className="card card--result">
        {drawName && <p className="result-event">{drawName}</p>}
        <div className="icon-circle icon-circle--red">
          <Gift className="icon--red" />
        </div>
        <p className="result-greeting">
          Olá, <strong>{giver}</strong>!
        </p>
        <p className="result-hint">Você tirou:</p>
        <div className="result-box">
          <p className="result-name">{receiver}</p>
        </div>
        <p className="result-secret">🤫 Mantenha em segredo!</p>
      </div>
    </div>
  );
}
