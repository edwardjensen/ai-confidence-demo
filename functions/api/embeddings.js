/**
 * Cloudflare Function to proxy OpenAI embeddings API calls securely
 * This keeps the OpenAI API key secure on the server side
 * Note: OpenRouter doesn't support embeddings, so we use OpenAI directly
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Get the OpenAI API key from environment variables
        const apiKey = env.OPENAI_KEY || env.OPENAI_EMBEDDINGS_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({
                success: false,
                error: 'API key not configured'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Parse the request body
        const body = await request.json();
        
        // Validate required fields
        if (!body.input || (Array.isArray(body.input) && body.input.length === 0)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: input required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Limit the number of inputs to prevent abuse
        const inputs = Array.isArray(body.input) ? body.input : [body.input];
        if (inputs.length > 200) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Too many inputs. Maximum 200 allowed.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Limit input length to prevent abuse
        const totalLength = inputs.join(' ').length;
        if (totalLength > 25000) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Input too long. Maximum 25,000 characters allowed.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Prepare the request to OpenAI
        const openAIRequest = {
            input: body.input,
            model: body.model || 'text-embedding-3-small'
            // Note: dimensions parameter removed - using default 1536 for text-embedding-3-small
        };
        
        // Add dimensions only if explicitly specified and different from default
        if (body.dimensions && body.dimensions !== 1536) {
            openAIRequest.dimensions = body.dimensions;
        }
        
        // Make the request to OpenAI
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(openAIRequest)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenAI API Error:', data);
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
            error: 'Internal server error'
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