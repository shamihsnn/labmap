// Generate a unique session ID for this chat instance
const sessionId = Math.random().toString(36).substring(7);
let chatHistory = [];

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.getElementById('file-input').addEventListener('change', handleFileUpload);

async function sendMessage(imageData = null) {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    
    let message = userInput.value.trim();
    if (!message && !imageData) return;

    try {
        // Add user message to chat
        if (imageData) {
            chatBox.innerHTML += `
                <div class="message-container user">
                    <div class="user-message">
                        <img src="${imageData}" alt="Uploaded Image" class="uploaded-image">
                        ${message ? `<p>${message}</p>` : ''}
                    </div>
                </div>`;
            message = `[Image Analysis Request] ${message || 'Please analyze this medical image.'}`;
        } else {
            chatBox.innerHTML += `
                <div class="message-container user">
                    <div class="user-message">
                        <p>${message}</p>
                    </div>
                </div>`;
        }

        // Show typing indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message-container bot typing-indicator';
        loadingDiv.innerHTML = `
            <div class="bot-message">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>`;
        chatBox.appendChild(loadingDiv);

        // Send to backend with sessionId
        const response = await fetch('/api/medicalchatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message,
                imageData: imageData ? imageData : null,
                sessionId
            })
        });

        const data = await response.json();
        loadingDiv.remove();

        // Add bot response
        if (data.success) {
            chatBox.innerHTML += `
                <div class="message-container bot">
                    <div class="bot-message">
                        <p>${data.reply}</p>
                    </div>
                </div>`;
            
            // Update local chat history
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.reply });
        } else {
            throw new Error(data.error || 'Failed to get response');
        }

        userInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error('Error:', error);
        chatBox.innerHTML += `
            <div class="message-container error">
                <div class="error-message">
                    <p>Error: ${error.message}</p>
                </div>
            </div>`;
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            const imageData = e.target.result;
            await sendMessage(imageData);
        };
        reader.readAsDataURL(file);
    }
}

// Enhanced drag and drop functionality
const dropZone = document.querySelector('.chat-container');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropZone.addEventListener('dragenter', () => dropZone.classList.add('drag-over'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', handleDrop);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const imageData = e.target.result;
            await sendMessage(imageData);
        };
        reader.readAsDataURL(file);
    }
}
