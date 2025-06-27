let apiKey = '';

// Try to load API key from local environment on page load
async function loadLocalConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (config.success && config.apiKey) {
            apiKey = config.apiKey;
            document.getElementById('apiKeyContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'flex';
            document.getElementById('messageInput').focus();
            
            // Show a success message
            const messagesContainer = document.getElementById('messages');
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'system-message';
            welcomeMessage.innerHTML = `
                <div class="system-content">
                    ✅ API key loaded from environment variables.<br>
                    Ready to chat! Try asking something to see confidence levels.
                </div>
            `;
            messagesContainer.appendChild(welcomeMessage);
            
            return true;
        }
    } catch (error) {
        console.log('Local config not available, falling back to manual input');
    }
    return false;
}

function setApiKey() {
    const input = document.getElementById('apiKeyInput');
    apiKey = input.value.trim();
    
    if (apiKey) {
        document.getElementById('apiKeyContainer').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'flex';
        document.getElementById('messageInput').focus();
    } else {
        alert('Please enter a valid API key');
    }
}

function addMessage(content, isUser = false, isLoading = false, tokenUsage = null) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? 'U' : 'AI';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isLoading) {
        messageContent.innerHTML = `
            <div class="loading">
                <span>Thinking</span>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
    } else {
        messageContent.innerHTML = content;
        
        // Add token usage info for AI responses
        if (!isUser && tokenUsage) {
            const tokenInfo = document.createElement('div');
            tokenInfo.className = 'token-usage';
            tokenInfo.innerHTML = `
                <div class="token-stats">
                    <span class="token-stat">
                        <span class="token-label">Input:</span>
                        <span class="token-count">${tokenUsage.prompt_tokens} tokens</span>
                    </span>
                    <span class="token-stat">
                        <span class="token-label">Output:</span>
                        <span class="token-count">${tokenUsage.completion_tokens} tokens</span>
                    </span>
                    <span class="token-stat">
                        <span class="token-label">Total:</span>
                        <span class="token-count">${tokenUsage.total_tokens} tokens</span>
                    </span>
                </div>
            `;
            messageContent.appendChild(tokenInfo);
        }
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

function getConfidenceClass(probability) {
    const percentage = probability * 100;
    if (percentage > 70) return 'confidence-high';
    if (percentage > 30) return 'confidence-medium';
    return 'confidence-low';
}

function formatAlternatives(alternatives) {
    if (!alternatives || alternatives.length === 0) return '';
    
    return alternatives.map(alt => {
        const percentage = (alt.logprob ? Math.exp(alt.logprob) * 100 : 0).toFixed(1);
        return `• "${alt.token}" (${percentage}%)`;
    }).join('\n');
}

function processResponseWithLogprobs(content, logprobs) {
    if (!logprobs || !logprobs.content) {
        return content;
    }

    let processedContent = '';
    
    for (let i = 0; i < logprobs.content.length; i++) {
        const tokenData = logprobs.content[i];
        const token = tokenData.token;
        const probability = Math.exp(tokenData.logprob);
        const percentage = (probability * 100).toFixed(1);
        
        const confidenceClass = getConfidenceClass(probability);
        const alternatives = tokenData.top_logprobs ? 
            formatAlternatives(tokenData.top_logprobs.slice(1, 5)) : '';
        
        const tooltipText = `Confidence: ${percentage}%${alternatives ? `\n\nAlternatives:\n${alternatives}` : ''}`;
        
        processedContent += `<span class="confidence-token ${confidenceClass}">
            ${token}
            <div class="tooltip">${tooltipText}</div>
        </span>`;
    }
    
    return processedContent;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input and disable button
    input.value = '';
    sendButton.disabled = true;
    
    // Add loading message
    const loadingMessage = addMessage('', false, true);
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'AI Confidence Demo'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                logprobs: true,
                top_logprobs: 5,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        const logprobs = data.choices[0].logprobs;
        const tokenUsage = data.usage;
        
        // Remove loading message
        loadingMessage.remove();
        
        // Add AI response with confidence highlighting and token usage
        const processedResponse = processResponseWithLogprobs(aiResponse, logprobs);
        addMessage(processedResponse, false, false, tokenUsage);
        
    } catch (error) {
        // Remove loading message
        loadingMessage.remove();
        
        console.error('Error:', error);
        addMessage(`Error: ${error.message}. Please check your API key and try again.`, false);
    } finally {
        sendButton.disabled = false;
        input.focus();
    }
}

// Auto-resize textarea
document.getElementById('messageInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 128) + 'px';
});

// Send message on Enter (but not Shift+Enter)
document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Handle API key input on Enter
document.getElementById('apiKeyInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        setApiKey();
    }
});

// Load config on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Try to load local config first
    const configLoaded = await loadLocalConfig();
    
    if (!configLoaded) {
        // Show manual input if config couldn't be loaded
        document.getElementById('apiKeyContainer').style.display = 'block';
        document.getElementById('chatContainer').style.display = 'none';
    }
});

// Dynamic tooltip positioning
function positionTooltip(token, tooltip) {
    const tokenRect = token.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate preferred position (above the token, centered)
    let left = tokenRect.left + (tokenRect.width / 2) - (tooltipRect.width / 2);
    let top = tokenRect.top - tooltipRect.height - 10;
    
    // Adjust horizontal position if tooltip would go off-screen
    if (left < 10) {
        left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
    }
    
    // If tooltip would go above viewport, show it below the token instead
    if (top < 10) {
        top = tokenRect.bottom + 10;
        tooltip.classList.remove('above');
        tooltip.classList.add('below');
    } else {
        tooltip.classList.remove('below');
        tooltip.classList.add('above');
    }
    
    // Apply positioning
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// Add event listeners for tooltip positioning
document.addEventListener('DOMContentLoaded', function() {
    let currentTooltip = null;
    
    // Use event delegation for dynamically added tooltips
    document.addEventListener('mouseenter', function(e) {
        if (e.target.classList.contains('confidence-token')) {
            // Hide any currently visible tooltip
            if (currentTooltip) {
                currentTooltip.classList.remove('visible');
            }
            
            const tooltip = e.target.querySelector('.tooltip');
            if (tooltip) {
                currentTooltip = tooltip;
                // Position the tooltip before showing it
                setTimeout(() => {
                    if (currentTooltip === tooltip) { // Make sure we're still hovering the same token
                        positionTooltip(e.target, tooltip);
                        tooltip.classList.add('visible');
                    }
                }, 10);
            }
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.classList.contains('confidence-token')) {
            const tooltip = e.target.querySelector('.tooltip');
            if (tooltip) {
                tooltip.classList.remove('visible');
                if (currentTooltip === tooltip) {
                    currentTooltip = null;
                }
            }
        }
    }, true);
    
    // Also hide tooltips when mouse leaves the messages area entirely
    document.addEventListener('mouseleave', function(e) {
        if (e.target.id === 'messages' || e.target.closest('#messages')) {
            if (currentTooltip) {
                currentTooltip.classList.remove('visible');
                currentTooltip = null;
            }
        }
    }, true);
    
    // Reposition on window resize
    window.addEventListener('resize', function() {
        const visibleTooltips = document.querySelectorAll('.tooltip.visible');
        visibleTooltips.forEach(tooltip => {
            const token = tooltip.closest('.confidence-token');
            if (token) {
                positionTooltip(token, tooltip);
            }
        });
    });
});
