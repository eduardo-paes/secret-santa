const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
});

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    // Criar sorteio
    const { drawName, participants } = JSON.parse(event.body);
    if (!drawName || !participants || participants.length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }
    // Embaralhar participantes
    let shuffled = [...participants];
    let validDraw = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!validDraw && attempts < maxAttempts) {
      shuffled = shuffled.sort(() => Math.random() - 0.5);
      validDraw = participants.every((p, i) => p !== shuffled[i]);
      attempts++;
    }
    if (!validDraw) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Não foi possível sortear.' })
      };
    }
    // Salvar sorteio
    const drawId = `draw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const results = participants.map((giver, i) => ({
      draw_id: drawId,
      draw_name: drawName,
      giver,
      receiver: shuffled[i],
      result_id: `result_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
    }));
    // Salvar no Supabase
    const { error } = await supabase.from('results').insert(results);
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
    // Gerar links
    const links = results.map(r => ({
      name: r.giver,
      link: `${event.headers.origin}/#result/${r.result_id}`
    }));
    return {
      statusCode: 200,
      body: JSON.stringify({ drawId, links })
    };
  }
  if (event.httpMethod === 'GET') {
    // Buscar resultado
    const resultId = event.queryStringParameters.result_id;
    if (!resultId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'result_id obrigatório' })
      };
    }
    const { data, error } = await supabase.from('results').select('*').eq('result_id', resultId).single();
    if (error || !data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resultado não encontrado' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  }
  return {
    statusCode: 405,
    body: 'Método não permitido'
  };
};
