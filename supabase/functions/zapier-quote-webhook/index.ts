import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('ZAPIER_QUOTE_WEBHOOK_URL');
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'ZAPIER_QUOTE_WEBHOOK_URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();

    const zapRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        triggered_at: new Date().toISOString(),
        source: 'tasktroopers-quote-form',
      }),
    });

    const text = await zapRes.text();
    if (!zapRes.ok) {
      console.error('Zapier webhook failed', zapRes.status, text);
      return new Response(JSON.stringify({ error: `Zapier responded ${zapRes.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('zapier-quote-webhook error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});