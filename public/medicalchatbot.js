// Generate a unique session ID for this chat instance
const sessionId = Math.random().toString(36).substring(7);
let chatHistory = [];
let attachedImage = null;

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.getElementById('file-input').addEventListener('change', handleFileUpload);

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    
    let message = userInput.value.trim();
    if (!message && !attachedImage) return;

    try {
        // Add user message to chat
        let userMessageHTML = `
            <div class="message-container user">
                <div class="user-message">`;
        
        if (attachedImage) {
            userMessageHTML += `<img src="${attachedImage}" alt="Uploaded Image" class="uploaded-image">`;
        }
        
        if (message) {
            userMessageHTML += `<p>${message}</p>`;
        }
        
        userMessageHTML += `</div></div>`;
        chatBox.innerHTML += userMessageHTML;

        // Prepare message for backend
        let backendMessage = message;
        if (attachedImage) {
            backendMessage = `[Image Analysis Request] ${message || 'Please analyze this medical image.'}`;
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
                message: backendMessage,
                imageData: attachedImage,
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
                        ${data.reply}
                    </div>
                </div>`;
            
            // Update local chat history
            chatHistory.push({ role: 'user', content: backendMessage });
            chatHistory.push({ role: 'assistant', content: data.reply });
        } else {
            throw new Error(data.error || 'Failed to get response');
        }

        // Clear input and reset attachedImage
        userInput.value = '';
        attachedImage = null;
        updateAttachmentIndicator(false);
        
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

function updateAttachmentIndicator(hasAttachment) {
    const attachButton = document.querySelector('.file-upload .action-button');
    if (hasAttachment) {
        attachButton.innerHTML = '<i class="fas fa-times"></i>';
        attachButton.style.background = '#4CAF50';
        attachButton.setAttribute('title', 'Remove attachment');
        attachButton.onclick = removeAttachment;
    } else {
        attachButton.innerHTML = '<i class="fas fa-paperclip"></i>';
        attachButton.style.background = '';
        attachButton.setAttribute('title', 'Attach an image');
        attachButton.onclick = () => document.getElementById('file-input').click();
    }
}

function removeAttachment() {
    attachedImage = null;
    updateAttachmentIndicator(false);
    document.getElementById('file-input').value = '';
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            attachedImage = e.target.result;
            updateAttachmentIndicator(true);
            // Show preview notification
            const chatBox = document.getElementById('chat-box');
            const previewNotification = document.createElement('div');
            previewNotification.className = 'image-preview-notification';
            previewNotification.innerText = 'Image attached. Type your message and press Enter to send.';
            chatBox.appendChild(previewNotification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (previewNotification.parentNode) {
                    previewNotification.parentNode.removeChild(previewNotification);
                }
            }, 3000);
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
        reader.onload = function(e) {
            attachedImage = e.target.result;
            updateAttachmentIndicator(true);
        };
        reader.readAsDataURL(file);
    }
    dropZone.classList.remove('drag-over');
}
