const topicInput = document.getElementById('tweetTopic');
const apiKeyInput = document.getElementById('openaiKey');
const generateBtn = document.getElementById('generateBtn');
const tweetsContainer = document.getElementById('tweetsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    if (type === 'success') {
        notification.className += ' bg-green-500 text-white';
    } else if (type === 'error') {
        notification.className += ' bg-red-500 text-white';
    } else {
        notification.className += ' bg-blue-500 text-white';
    }
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2500);
}

function renderTweets(tweets) {
    tweetsContainer.innerHTML = '';
    tweets.forEach((tweet, idx) => {
        const tweetBox = document.createElement('div');
        tweetBox.className = 'bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between';
        tweetBox.innerHTML = `
            <div class="text-lg text-gray-800 flex-1 mb-4 md:mb-0">${tweet.replace(/\n/g, '<br>')}</div>
            <button class="copyTweetBtn bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-lg transition-colors ml-0 md:ml-6 mt-4 md:mt-0" data-tweet-idx="${idx}">
                <i class="fas fa-copy mr-2"></i>Copy
            </button>
        `;
        tweetsContainer.appendChild(tweetBox);
    });
    // Add event listeners for copy buttons
    document.querySelectorAll('.copyTweetBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-tweet-idx');
            const tweetText = tweets[idx];
            navigator.clipboard.writeText(tweetText).then(() => {
                showNotification('Tweet copied!', 'success');
            }).catch(() => {
                showNotification('Failed to copy.', 'error');
            });
        });
    });
}

async function generateTweets(topic, apiKey) {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    tweetsContainer.innerHTML = '';
    try {
        const prompt = `Write 3 engaging, original tweets about "${topic}". Each tweet should be creative, concise, and suitable for Twitter. Number them 1, 2, 3. Do not include hashtags unless relevant. Do not add explanations.`;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 400,
                temperature: 0.85
            })
        });
        if (!response.ok) {
            throw new Error('OpenAI API error: ' + response.status);
        }
        const data = await response.json();
        let text = data.choices[0].message.content.trim();
        // Parse tweets (expecting 1. ... 2. ... 3. ...)
        let tweets = text.split(/\n\s*\d+\.\s/).map(t => t.trim()).filter(Boolean);
        // If the first tweet is missing (because split removes it), try to recover
        if (!/^\d+\./.test(text)) {
            tweets[0] = text.split(/\d+\.\s/)[1]?.trim() || tweets[0];
        }
        // If still not 3, try splitting by newlines
        if (tweets.length < 3) {
            tweets = text.split(/\n+/).map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
        }
        tweets = tweets.slice(0, 3);
        if (tweets.length === 0) throw new Error('No tweets generated.');
        renderTweets(tweets);
    } catch (err) {
        errorState.textContent = err.message || 'Failed to generate tweets.';
        errorState.classList.remove('hidden');
    } finally {
        loadingState.classList.add('hidden');
    }
}

generateBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    if (!topic) {
        showNotification('Please enter a topic.', 'error');
        return;
    }
    if (!apiKey || !apiKey.startsWith('sk-')) {
        showNotification('Please enter a valid OpenAI API key.', 'error');
        return;
    }
    generateTweets(topic, apiKey);
}); 