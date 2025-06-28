let apiKey = '';
let temperature = 0.7; // Default temperature value
let isProduction = false;

// Initialize the application
function initializeApp() {
    // Check if we're in production mode
    if (window.AI_DEMO_CONFIG && window.AI_DEMO_CONFIG.isProduction) {
        isProduction = true;
        apiKey = window.AI_DEMO_CONFIG.apiKey;
        
        if (!apiKey || apiKey === '%API_KEY%') {
            showError('Production environment not properly configured. Please contact the administrator.');
            return;
        }
        
        // Hide API key container and show chat in production
        const apiKeyContainer = document.getElementById('apiKeyContainer');
        if (apiKeyContainer) {
            apiKeyContainer.style.display = 'none';
        }
        
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.style.display = 'flex';
        }
        
        document.getElementById('messageInput').focus();
    } else {
        // Local development mode - show API key input
        const apiKeyContainer = document.getElementById('apiKeyContainer');
        if (apiKeyContainer) {
            apiKeyContainer.style.display = 'block';
        }
        
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notice';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>⚠️ Configuration Error</h3>
            <p>${message}</p>
        </div>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);
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
                temperature: temperature
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

// Handle API key input on Enter (only in local mode)
const apiKeyInput = document.getElementById('apiKeyInput');
if (apiKeyInput) {
    apiKeyInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            setApiKey();
        }
    });
}

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
    // Initialize the app after DOM is loaded
    initializeApp();
    
    // Initialize temperature slider
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    
    if (temperatureSlider && temperatureValue) {
        // Update temperature value display and variable when slider changes
        temperatureSlider.addEventListener('input', function() {
            const sliderValue = parseInt(this.value);
            temperature = sliderValue / 10; // Convert slider value (0-20) to temperature (0-2)
            temperatureValue.textContent = temperature.toFixed(1);
        });
        
        // Initialize display with current temperature
        temperatureSlider.value = Math.round(temperature * 10);
        temperatureValue.textContent = temperature.toFixed(1);
    }
    
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
    
    // Convert build timestamp to local time
    function formatBuildTimestamp() {
        const timestampElement = document.getElementById('buildTimestamp');
        if (timestampElement) {
            const utcTimestamp = timestampElement.getAttribute('data-utc');
            if (utcTimestamp && utcTimestamp !== 'undefined' && utcTimestamp !== '#') {
                try {
                    const date = new Date(utcTimestamp);
                    if (!isNaN(date.getTime())) {
                        // Format as local time with timezone abbreviation
                        const options = {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short'
                        };
                        const localTime = date.toLocaleString('en-US', options);
                        timestampElement.textContent = localTime;
                        timestampElement.title = `UTC: ${utcTimestamp}`;
                    }
                } catch (error) {
                    console.warn('Could not parse build timestamp:', error);
                }
            }
        }
    }
    
    // Format timestamp when page loads
    formatBuildTimestamp();
});
