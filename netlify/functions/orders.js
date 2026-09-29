// netlify/functions/orders.js
// Consulta de detalhes de pedidos e sessões de pagamento Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { session_id } = event.queryStringParameters || {};

  if (!session_id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Parâmetro session_id é obrigatório.' })
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer_details']
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: session.id,
        customerName: session.customer_details?.name || 'Cliente Prime Story',
        customerEmail: session.customer_details?.email || '',
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        lineItems: (session.line_items?.data || []).map(li => ({
          description: li.description,
          quantity: li.quantity,
          amount: li.amount_total / 100
        }))
      })
    };
  } catch (err) {
    console.error('Erro ao recuperar sessão Stripe:', err.message);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Sessão do Stripe não encontrada ou expirada.' })
    };
  }
};
