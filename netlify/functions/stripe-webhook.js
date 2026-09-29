// netlify/functions/stripe-webhook.js
// Processamento seguro de webhooks do Stripe com verificação de assinatura criptográfica

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key');

exports.handler = async (event, context) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Webhooks devem ser POST.' })
    };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.warn('Aviso: Assinatura ou segredo do webhook ausente.');
    // Se o webhook secret não estiver configurado (ex: em teste local), registrar aviso
    if (!webhookSecret) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET não configurado no ambiente.' })
      };
    }
  }

  let stripeEvent;

  try {
    // Verificação estrita de assinatura contra adulterações
    // No Netlify, event.isBase64Encoded pode ser true para payloads binários
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;

    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Falha na validação da assinatura do Webhook Stripe:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Tratamento dos eventos críticos de compra
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object;
      console.log(`[Stripe Webhook] Pedido #${session.id} APROVADO!`);
      console.log(`Cliente: ${session.customer_details?.name} (${session.customer_details?.email})`);
      console.log(`Valor Total: R$ ${(session.amount_total / 100).toFixed(2)} BRL`);
      console.log(`Método: ${session.payment_method_types?.join(', ')} | Status: ${session.payment_status}`);

      // Aqui o pedido é confirmado para envio ou emissão de nota fiscal
      // Em produção, salva no banco de dados (ex: PostgreSQL/Supabase ou registro em log de auditoria)
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object;
      console.warn(`[Stripe Webhook] Falha de pagamento para Intent #${paymentIntent.id}:`, paymentIntent.last_payment_error?.message);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object;
      console.log(`[Stripe Webhook] PaymentIntent #${paymentIntent.id} liquidado com sucesso.`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Evento recebido não crítico: ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true, event: stripeEvent.type })
  };
};
