// netlify/functions/create-checkout-session.js
// Criação segura de sessão do Stripe Checkout com suporte a Cartão de Crédito e Pix em BRL

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key');
const { catalogModel } = require('../../src/models/catalog-model');
const { commerceService } = require('../../src/services/commerce-service');

exports.handler = async (event, context) => {
  // Configuração de CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, coupon, shippingCep, successUrl, cancelUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'A sacola de compras está vazia.' })
      };
    }

    // 1. Recalcular e validar preços estritamente no backend contra o catálogo oficial
    const line_items = [];
    let backendSubtotal = 0;

    for (const item of items) {
      const product = catalogModel.getById(item.id);
      if (!product) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Produto ID ${item.id} não foi encontrado no catálogo oficial.` })
        };
      }

      if (product.stock <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `O produto "${product.name}" encontra-se esgotado no momento.` })
        };
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const unitAmountInCents = Math.round(product.price * 100);
      backendSubtotal += product.price * qty;

      line_items.push({
        price_data: {
          currency: 'brl',
          unit_amount: unitAmountInCents,
          product_data: {
            name: `${product.name} (Tam: ${item.size || 'Único'})`,
            description: `${product.category} · Ref: ${product.sku || 'PS-' + product.id}`,
            images: product.image ? [product.image] : []
          }
        },
        quantity: qty
      });
    }

    // 2. Aplicação de cupom no backend
    let couponDiscount = 0;
    if (coupon) {
      const couponResult = commerceService.applyCoupon(backendSubtotal, coupon);
      if (couponResult.valid && couponResult.discount > 0) {
        couponDiscount = couponResult.discount;
      }
    }

    // 3. Cálculo de Frete no backend
    const shippingData = commerceService.calculateShipping(shippingCep || '49000000', backendSubtotal);
    const selectedShipping = shippingData.selected || { price: 0, name: 'Entrega Padrão' };
    const shippingPriceInCents = Math.round(selectedShipping.price * 100);

    // Se houver desconto de cupom, adiciona como item de desconto ou ajusta o preço
    if (couponDiscount > 0) {
      line_items.push({
        price_data: {
          currency: 'brl',
          unit_amount: -Math.round(couponDiscount * 100),
          product_data: {
            name: `Desconto Cupom (${coupon.toUpperCase()})`,
            description: 'Desconto promocional aplicado na finalização'
          }
        },
        quantity: 1
      });
    }

    // 4. Criação da Checkout Session no Stripe
    const sessionConfig = {
      payment_method_types: ['card', 'pix'],
      line_items,
      mode: 'payment',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingPriceInCents,
              currency: 'brl'
            },
            display_name: selectedShipping.name || 'Entrega Prime Story',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['BR']
      },
      payment_method_options: {
        pix: {
          expires_after_seconds: 86400 // 24 horas para expiração do Pix
        }
      },
      locale: 'pt-BR',
      metadata: {
        store: 'Prime Story Aracaju',
        coupon: coupon || 'nenhum',
        shipping_cep: shippingCep || '49000000',
        total_items: items.length
      },
      success_url: successUrl || 'https://primestory.com.br/pages/sucesso.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://primestory.com.br/pages/cancelado.html'
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: session.id,
        url: session.url
      })
    };
  } catch (err) {
    console.error('Erro ao criar sessão Stripe:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro no processamento do Stripe Checkout.',
        details: err.message
      })
    };
  }
};
