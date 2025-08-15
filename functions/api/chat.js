/**
 * Cloudflare Function to proxy OpenRouter API calls securely
 * This keeps the OpenRouter API key secure on the server side
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Get the OpenRouter API key from environment variables
        // In Cloudflare Pages Functions, secrets are available via env
        const apiKey = env.OPENROUTER_API_KEY_V2;
        
        console.log('Context env keys:', Object.keys(env || {}));
        console.log('OPENROUTER_API_KEY_V2 from env:', !!apiKey);
        
        // In Cloudflare Workers/Pages Functions, only use env
        const finalApiKey = apiKey;
        
        if (!finalApiKey) {
            return new Response(JSON.stringify({
                success: false,
                error: 'API key not configured',
                debug: {
                    envKeys: Object.keys(env || {}),
                    hasEnvKey: !!apiKey
                }
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Parse the request body
        const body = await request.json();
        
        // Validate required fields
        if (!body.messages || !Array.isArray(body.messages)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: messages required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Prepare the request to OpenRouter
        const openRouterRequest = {
            model: body.model || 'openai/gpt-4o-mini',
            messages: body.messages,
            temperature: body.temperature || 0.7,
            logprobs: true,
            top_logprobs: 3
        };
        
        // Make the request to OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${finalApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': request.headers.get('referer') || 'https://ai-confidence-demo.pages.dev',
                'X-Title': 'AI Confidence Demo'
            },
            body: JSON.stringify(openRouterRequest)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenRouter API Error:', data);
            return new Response(JSON.stringify({
                success: false,
                error: data.error?.message || 'API request failed'
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Return the response
        return new Response(JSON.stringify({
            success: true,
            data: data
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
        
    } catch (error) {
        console.error('Function error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            debug: {
                errorMessage: error.message,
                errorStack: error.stack,
                envKeys: Object.keys(env || {}),
                hasEnvKey: !!env.OPENROUTER_API_KEY_V2
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}