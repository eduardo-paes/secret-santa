import React from "react";
import type { ChangeEvent } from "react";
import { Users } from "lucide-react";

interface ParticipantFormProps {
  participants: string[];
  updateParticipant: (index: number, value: string) => void;
  removeParticipant: (index: number) => void;
  addParticipant: () => void;
}

export default function ParticipantForm({ participants, updateParticipant, removeParticipant, addParticipant }: ParticipantFormProps) {
  return (
    <div className="form-group">
      <div className="form-header">
        <label className="form-label form-label--flex">
          <Users className="form-label-icon" />
          Participantes
        </label>
        <span className="text-count">
          {participants.filter((p) => p.trim()).length} participantes
        </span>
      </div>
      <div className="input-group">
        {participants.map((participant, index) => (
          <div key={index} className="input-row">
            <input
              type="text"
              value={participant}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateParticipant(index, e.target.value)}
              placeholder={`Participante ${index + 1}`}
              className="input input--small"
            />
            {participants.length > 1 && (
              <button onClick={() => removeParticipant(index)} className="button--remove">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addParticipant} className="button--add">
        + Adicionar Participante
      </button>
    </div>
  );
}
