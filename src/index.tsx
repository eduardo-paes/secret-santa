import React, { useState, useEffect } from "react";
import { Gift, Shuffle, Copy, Check } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";
import Loading from "./components/Loading";
import ResultCard from "./components/ResultCard";
import ParticipantForm from "./components/ParticipantForm";
import ErrorAlert from "./components/ErrorAlert";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";
const appUrl: string = import.meta.env.VITE_APP_URL || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function SecretSanta() {
  const [view, setView] = useState<string>("home");
  const [participants, setParticipants] = useState<string[]>(["", "", ""]);
  const [drawName, setDrawName] = useState<string>("");
  const [links, setLinks] = useState<{ name: string; link: string }[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [copied, setCopied] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#result/")) {
      const resultId = hash.replace("#result/", "");
      loadResult(resultId);
    }
  }, []);

  const addParticipant = (): void => {
    setParticipants([...participants, ""]);
  };

  const updateParticipant = (index: number, value: string): void => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const removeParticipant = (index: number): void => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_: string, i: number) => i !== index));
    }
  };

  const performDraw = async (): Promise<void> => {
    setError("");
    const valid = participants.filter((p: string) => p.trim() !== "");
    if (valid.length < 3) {
      setError("É necessário pelo menos 3 participantes!");
      return;
    }
    if (!drawName.trim()) {
      setError("Digite um nome para o sorteio!");
      return;
    }

    setLoading(true);
    try {
      const drawId = `draw_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      let shuffled = [...valid];
      let validDraw = false;
      let attempts = 0;
      while (!validDraw && attempts < 100) {
        shuffled = shuffled.sort(() => Math.random() - 0.5);
        validDraw = valid.every((p, i) => p !== shuffled[i]);
        attempts++;
      }

      if (!validDraw) {
        setError("Não foi possível realizar o sorteio. Tente novamente.");
        setLoading(false);
        return;
      }

      const results = valid.map((giver, i) => ({
        draw_id: drawId,
        draw_name: drawName,
        giver,
        receiver: shuffled[i],
        result_id: `result_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 11)}`,
      }));

      const { error: dbError } = await supabase.from("results").insert(results);
      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      setLinks(results.map((r) => ({ name: r.giver, link: `#result/${r.result_id}` })));
      setView("links");
    } catch {
      setError("Erro ao realizar sorteio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loadResult = async (resultId: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("results")
        .select("*")
        .eq("result_id", resultId)
        .single();

      if (dbError || !data) {
        setError("Resultado não encontrado! O link pode ter expirado.");
        setView("home");
        return;
      }
      setResultData(data);
      setView("result");
    } catch {
      setError("Resultado não encontrado! O link pode ter expirado.");
      setView("home");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string, name: string): void => {
    navigator.clipboard
      .writeText(`${appUrl}/${link}`)
      .then(() => {
        setCopied(name);
        setTimeout(() => setCopied(""), 2000);
      })
      .catch(() => {
        alert("Erro ao copiar link. Selecione e copie manualmente.");
      });
  };

  const resetApp = (): void => {
    setView("home");
    setParticipants(["", ""]);
    setDrawName("");
    setLinks([]);
    setResultData(null);
    setError("");
    window.location.hash = "";
  };

  if (loading) return <Loading />;

  if (view === "result" && resultData) {
    return (
      <ResultCard
        drawName={resultData.draw_name}
        giver={resultData.giver}
        receiver={resultData.receiver}
      />
    );
  }

  if (view === "links") {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="card">
            <div className="links-header" role="status" aria-live="polite">
              <div className="icon-circle icon-circle--green">
                <Check className="icon--green" />
              </div>
              <h1 className="title title--medium title--center">Sorteio realizado!</h1>
              <p className="subtitle subtitle--center subtitle--dark">
                Envie cada link para o participante correspondente.
              </p>
              <div className="alert alert--warning">
                Salve ou envie os links agora — eles são únicos para cada participante.
              </div>
            </div>

            <div className="links-list">
              {links.map((item, index) => (
                <div key={index} className="link-item">
                  <div className="link-item-content">
                    <span className="link-item-name">{item.name}</span>
                    <div className="link-item-actions">
                      <button
                        onClick={() => copyToClipboard(item.link, item.name)}
                        className="button button--blue"
                      >
                        {copied === item.name ? (
                          <>
                            <Check className="button-icon--small" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="button-icon--small" />
                            Copiar
                          </>
                        )}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${appUrl}/${item.link}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button--whatsapp"
                      >
                        <svg className="button-icon--small" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.858L.057 23.998l6.306-1.434A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.657-.52-5.166-1.424l-.371-.22-3.844.874.912-3.741-.241-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={resetApp} className="button--reset">
              Criar novo sorteio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper content-wrapper--small">
        <div className="card">
          <div className="links-header">
            <div className="icon-circle icon-circle--red">
              <Gift className="icon--red" />
            </div>
            <h1 className="title title--center">Amigo Oculto</h1>
            <p className="subtitle subtitle--center">
              Configure o sorteio e compartilhe os links
            </p>
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="form-group">
            <label className="form-label" htmlFor="draw-name">
              Nome do sorteio
            </label>
            <input
              id="draw-name"
              type="text"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // Focus first participant input
                  const first = document.querySelector<HTMLInputElement>(".input--small");
                  first?.focus();
                }
              }}
              placeholder="Ex: Amigo Oculto 2025"
              className="input"
              autoComplete="off"
            />
          </div>

          <ParticipantForm
            participants={participants}
            updateParticipant={updateParticipant}
            removeParticipant={removeParticipant}
            addParticipant={addParticipant}
          />

          <button
            onClick={performDraw}
            disabled={loading}
            className="button button--full button--primary"
          >
            <Shuffle className="button-icon" />
            Realizar sorteio
          </button>

          <p className="text-tiny">Mínimo de 3 participantes</p>
        </div>
      </div>
    </div>
  );
}
