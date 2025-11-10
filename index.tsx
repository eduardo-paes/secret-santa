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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Amigo Oculto
            </h1>
            <p className="text-gray-600">
              Configure seu sorteio e gere os links
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Sorteio
            </label>
            <input
              type="text"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              placeholder="Ex: Amigo Oculto 2025"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participantes
              </label>
              <span className="text-xs text-gray-500">
                {participants.filter(p => p.trim()).length} participantes
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={participant}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParticipant(index, e.target.value)}
                    placeholder={`Participante ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {participants.length > 1 && (
                    <button
                      onClick={() => removeParticipant(index)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addParticipant}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-400 hover:text-red-600 transition"
            >
              + Adicionar Participante
            </button>
          </div>

          <button
            onClick={performDraw}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-5 h-5" />
            Realizar Sorteio
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Mínimo de 3 participantes necessários
          </p>
        </div>
      </div>
    </div>
  );
}