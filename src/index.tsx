import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Gift, Users, Shuffle, Copy, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function AmigoOculto() {
  const [view, setView] = useState<string>('home');
  const [participants, setParticipants] = useState<string[]>(['']);
  const [drawName, setDrawName] = useState<string>('');
  const [links, setLinks] = useState<{ name: string; link: string }[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [copied, setCopied] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#result/')) {
      const resultId = hash.replace('#result/', '');
      loadResult(resultId);
    }
  }, []);

  const addParticipant = (): void => {
    setParticipants([...participants, '']);
  };

  const updateParticipant = (index: number, value: string): void => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const removeParticipant = (index: number): void => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_: string, i: number) => i !== index));
    }
  };

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performDraw = async (): Promise<void> => {
    setError('');
    const validParticipants = participants.filter((p: string) => p.trim() !== '');
    if (validParticipants.length < 3) {
      setError('É necessário pelo menos 3 participantes!');
      return;
    }
    if (!drawName.trim()) {
      setError('Digite um nome para o sorteio!');
      return;
    }
    setLoading(true);
    try {
      // Simulação: salvar sorteio no Supabase
      const drawId = `draw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        setError('Não foi possível sortear.');
        setLoading(false);
        return;
      }
      const results = validParticipants.map((giver, i) => ({
        draw_id: drawId,
        draw_name: drawName,
        giver,
        receiver: shuffled[i],
        result_id: `result_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
      }));
      // Salvar no Supabase
      const { error } = await supabase.from('results').insert(results);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Gerar links
      const links = results.map(r => ({
        name: r.giver,
        link: `#result/${r.result_id}`
      }));
      setLinks(links);
      setView('links');
    } catch (err) {
      setError('Erro ao realizar sorteio.');
    } finally {
      setLoading(false);
    }
  };

  const loadResult = async (resultId: string): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      // Buscar resultado no Supabase
      const { data, error } = await supabase.from('results').select('*').eq('result_id', resultId).single();
      if (error || !data) {
        setError('Resultado não encontrado! O link pode ter expirado.');
        setView('home');
        setLoading(false);
        return;
      }
      setResultData(data);
      setView('result');
    } catch (err) {
      setError('Resultado não encontrado! O link pode ter expirado.');
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, name: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(''), 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar link. Selecione e copie manualmente.');
    });
  };

  const resetApp = (): void => {
  setView('home');
  setParticipants(['']);
  setDrawName('');
  setLinks([]);
  setResultData(null);
  setError('');
  window.location.hash = '';
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: "64px",
              width: "64px",
              borderBottom: "4px solid #dc2626",
              margin: "0 auto",
            }}
          ></div>
          <p style={{ marginTop: "16px", color: "#4b5563" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (view === 'result' && resultData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          justifyContent: "center",
          padding: "32px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            padding: "32px",
            maxWidth: "400px",
            maxHeight: "400px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#fee2e2",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Gift style={{ width: "40px", height: "40px", color: "#dc2626" }} />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "8px",
            }}
          >
            {resultData.drawName}
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "16px" }}>
            Olá, {resultData.giver}!
          </p>
          <div
            style={{
              background: "#f0fdf4",
              border: "2px solid #bbf7d0",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#4b5563",
                marginBottom: "8px",
              }}
            >
              Você tirou:
            </p>
            <p
              style={{ fontSize: "24px", fontWeight: "bold", color: "#15803d" }}
            >
              {resultData.receiver}
            </p>
          </div>
          <p
            style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}
          >
            Mantenha em segredo! 🤫
          </p>
        </div>
      </div>
    );
  }

  if (view === 'links') {
    return (
      <div
        style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px" }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              padding: "32px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  background: "#dcfce7",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Check
                  style={{ width: "40px", height: "40px", color: "#16a34a" }}
                />
              </div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                Sorteio Realizado!
              </h1>
              <p style={{ color: "#4b5563", marginBottom: "8px" }}>
                Envie cada link para o participante correspondente
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#b45309",
                  background: "#fef3c7",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                ⚠️ Importante: Salve ou envie os links agora! Eles só funcionam
                durante esta sessão.
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {links.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "8px",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#1e293b",
                        fontSize: "16px",
                      }}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.link, item.name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#2563eb",
                        color: "#fff",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background 0.3s",
                      }}
                    >
                      {copied === item.name ? (
                        <>
                          <Check style={{ width: "16px", height: "16px" }} />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: "16px", height: "16px" }} />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetApp}
              style={{
                width: "100%",
                marginTop: "32px",
                background: "#dc2626",
                color: "#fff",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
            >
              Criar Novo Sorteio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ background: '#fee2e2', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Gift style={{ width: 40, height: 40, color: '#dc2626' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>Amigo Oculto</h1>
            <p style={{ color: '#475569' }}>Configure seu sorteio e gere os links</p>
          </div>

          {error && (
            <div style={{ marginBottom: 24, background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: 16, borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Nome do Sorteio</label>
            <input
              type="text"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              placeholder="Ex: Amigo Oculto 2025"
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users style={{ width: 20, height: 20 }} />
                Participantes
              </label>
              <span style={{ fontSize: 13, color: '#64748b' }}>{participants.filter(p => p.trim()).length} participantes</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              {participants.map((participant, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={participant}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParticipant(index, e.target.value)}
                    placeholder={`Participante ${index + 1}`}
                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15 }}
                  />
                  {participants.length > 1 && (
                    <button
                      onClick={() => removeParticipant(index)}
                      style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addParticipant}
              style={{ width: '100%', padding: '10px', border: '2px dashed #cbd5e1', borderRadius: 8, color: '#64748b', background: 'none', cursor: 'pointer', fontSize: 15 }}
            >
              + Adicionar Participante
            </button>
          </div>

          <button
            onClick={performDraw}
            disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? '#94a3b8' : '#dc2626', color: '#fff', borderRadius: 8, fontWeight: 'bold', fontSize: 17, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Shuffle style={{ width: 22, height: 22 }} />
            Realizar Sorteio
          </button>

          <p style={{ fontSize: 13, textAlign: 'center', color: '#64748b', marginTop: 16 }}>
            Mínimo de 3 participantes necessários
          </p>
        </div>
      </div>
    </div>
  );
}