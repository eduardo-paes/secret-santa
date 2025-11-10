import React from "react";
import { Gift } from "lucide-react";

interface ResultCardProps {
  drawName: string;
  giver: string;
  receiver: string;
}

export default function ResultCard({ drawName, giver, receiver }: ResultCardProps) {
  return (
    <div className="page-container page-container--result">
      <div className="card card--result">
        <div className="icon-circle icon-circle--red icon-circle--result">
          <Gift className="icon--red" />
        </div>
        <h1 className="title title--medium title--center">{drawName}</h1>
        <p className="subtitle subtitle--gray">Olá, {giver}!</p>
        <div className="result-box">
          <p className="result-label">Você tirou:</p>
          <p className="result-name">{receiver}</p>
        </div>
        <p className="text-small">Mantenha em segredo! 🤫</p>
      </div>
    </div>
  );
}
