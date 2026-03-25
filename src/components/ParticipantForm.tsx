import React, { useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Users, Plus, X } from "lucide-react";

interface ParticipantFormProps {
  participants: string[];
  updateParticipant: (index: number, value: string) => void;
  removeParticipant: (index: number) => void;
  addParticipant: () => void;
}

export default function ParticipantForm({
  participants,
  updateParticipant,
  removeParticipant,
  addParticipant,
}: ParticipantFormProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the last input when a new participant is added
  useEffect(() => {
    const last = participants.length - 1;
    if (participants[last] === "") {
      inputRefs.current[last]?.focus();
    }
  }, [participants.length]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < participants.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        addParticipant();
      }
    }
  };

  const filled = participants.filter((p) => p.trim()).length;

  return (
    <div className="form-group">
      <div className="form-header">
        <label className="form-label form-label--flex">
          <Users className="form-label-icon" />
          Participantes
        </label>
        <span className={`participant-badge ${filled >= 3 ? "participant-badge--ok" : ""}`}>
          {filled} confirmado{filled !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="input-group">
        {participants.map((participant, index) => (
          <div key={index} className="input-row">
            <span className="participant-number">{index + 1}</span>
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              value={participant}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateParticipant(index, e.target.value)
              }
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={`Participante ${index + 1}`}
              className="input input--small"
              autoComplete="off"
            />
            {participants.length > 1 && (
              <button
                onClick={() => removeParticipant(index)}
                className="button--remove"
                aria-label={`Remover ${participant || `participante ${index + 1}`}`}
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={addParticipant} className="button--add" type="button">
        <Plus size={15} />
        Adicionar participante
      </button>
    </div>
  );
}
