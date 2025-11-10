import React, { useState, useEffect } from "react";
import { Gift, Shuffle, Copy, Check } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";
import Loading from "./components/Loading";
import ResultCard from "./components/ResultCard";
import ParticipantForm from "./components/ParticipantForm";
import ErrorAlert from "./components/ErrorAlert";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY || "";
const appUrl: string = import.meta.env.VITE_APP_URL || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function SecretSanta() {
  const [view, setView] = useState<string>("home");
  const [participants, setParticipants] = useState<string[]>([""]);
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
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const removeParticipant = (index: number): void => {
    if (participants.length > 1) {
      setParticipants(
        participants.filter((_: string, i: number) => i !== index)
      );
    }
  };

  const performDraw = async (): Promise<void> => {
    setError("");
    const validParticipants = participants.filter(
      (p: string) => p.trim() !== ""
    );
    if (validParticipants.length < 3) {
      setError("É necessário pelo menos 3 participantes!");
      return;
    }
    if (!drawName.trim()) {
      setError("Digite um nome para o sorteio!");
      return;
    }
    setLoading(true);
    try {
      const drawId = `draw_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      let shuffled = [...validParticipants];
      let validDraw = false;
      let attempts = 0;
      const maxAttempts = 100;
      while (!validDraw && attempts < maxAttempts) {
        shuffled = shuffled.sort(() => Math.random() - 0.5);
        validDraw = validParticipants.every((p, i) => p !== shuffled[i]);
        attempts++;
      }
      if (!validDraw) {
        setError("Não foi possível sortear.");
        setLoading(false);
        return;
      }

      const results = validParticipants.map((giver, i) => ({
        draw_id: drawId,
        draw_name: drawName,
        giver,
        receiver: shuffled[i],
        result_id: `result_${Date.now()}_${i}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      }));

      const { error } = await supabase.from("results").insert(results);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const links = results.map((r) => ({
        name: r.giver,
        link: `#result/${r.result_id}`,
      }));
      setLinks(links);
      setView("links");
    } catch (err) {
      setError("Erro ao realizar sorteio.");
    } finally {
      setLoading(false);
    }
  };

  const loadResult = async (resultId: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("result_id", resultId)
        .single();
      if (error || !data) {
        setError("Resultado não encontrado! O link pode ter expirado.");
        setView("home");
        setLoading(false);
        return;
      }
      setResultData(data);
      setView("result");
    } catch (err) {
      setError("Resultado não encontrado! O link pode ter expirado.");
      setView("home");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, name: string): void => {
    navigator.clipboard
      .writeText(`${appUrl}/${text}`)
      .then(() => {
        setCopied(name);
        setTimeout(() => setCopied(""), 2000);
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
        alert("Erro ao copiar link. Selecione e copie manualmente.");
      });
  };

  const resetApp = (): void => {
    setView("home");
    setParticipants([""]);
    setDrawName("");
    setLinks([]);
    setResultData(null);
    setError("");
    window.location.hash = "";
  };

  if (loading) {
    return <Loading />;
  }

  if (view === "result" && resultData) {
    return (
      <ResultCard
        drawName={resultData.drawName}
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
              <h1 className="title title--medium">Sorteio Realizado!</h1>
              <p className="subtitle subtitle--dark">
                Envie cada link para o participante correspondente.
              </p>
              <p
                className="alert alert--warning"
                role="alert"
                aria-live="assertive"
              >
                ⚠️ Os links abaixo são únicos para cada participante. Salve ou envie-os agora!
              </p>
            </div>
            <div className="links-list">
              {links.map((item, index) => (
                <div key={index} className="link-item">
                  <div className="link-item-content">
                    <span className="link-item-name">{item.name}</span>
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
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={resetApp} className="button--reset">
              Criar Novo Sorteio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper content-wrapper--small">
        <div className="card card--small">
          <div className="links-header">
            <div className="icon-circle icon-circle--red">
              <Gift className="icon--red" />
            </div>
            <h1 className="title title--center">Amigo Oculto</h1>
            <p className="subtitle subtitle--center">
              Configure seu sorteio e gere os links
            </p>
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="form-group">
            <label className="form-label">Nome do Sorteio</label>
            <input
              type="text"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              placeholder="Ex: Amigo Oculto 2025"
              className="input"
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
            Realizar Sorteio
          </button>

          <p className="text-tiny">Mínimo de 3 participantes necessários</p>
        </div>
      </div>
    </div>
  );
}
