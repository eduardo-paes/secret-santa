import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Gift, Users, Shuffle, Copy, Check } from 'lucide-react';

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
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawName: drawName.trim(), participants: validParticipants })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Erro ao realizar sorteio');
        setLoading(false);
        return;
      }
      setLinks(data.links);
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
      const response = await fetch(`/api/draw?result_id=${resultId}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Resultado não encontrado! O link pode ter expirado.');
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (view === 'result' && resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {resultData.drawName}
          </h1>
          
          <p className="text-gray-600 mb-4">Olá, {resultData.giver}!</p>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Você tirou:</p>
            <p className="text-3xl font-bold text-green-700">{resultData.receiver}</p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Mantenha em segredo! 🤫
          </p>
          
          <button
            onClick={resetApp}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Criar Novo Sorteio
          </button>
        </div>
      </div>
    );
  }

  if (view === 'links') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sorteio Realizado!
              </h1>
              <p className="text-gray-600 mb-2">
                Envie cada link para o participante correspondente
              </p>
              <p className="text-xs text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
                ⚠️ Importante: Salve ou envie os links agora! Eles só funcionam durante esta sessão.
              </p>
            </div>

            <div className="space-y-3">
              {links.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <button
                      onClick={() => copyToClipboard(item.link, item.name)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      {copied === item.name ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 break-all bg-white p-2 rounded border border-gray-200">
                    {item.link}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetApp}
              className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
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
            style={{ width: '100%', padding: '16px', background: loading ? '#94a3b8' : '#dc2626', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 17, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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