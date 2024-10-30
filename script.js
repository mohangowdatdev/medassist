document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const messageInput = document.querySelector('.message-input');
    const chatContainer = document.querySelector('.chat-container');
    const scanButton = document.getElementById('scanbut');
    const ocrButton = document.getElementById('ocrbut');
    
    // State variables
    let authToken = localStorage.getItem('authToken');
    let currentMode = 'chat'; // Default mode: 'chat', 'analyze', 'ocr'
    let lastMessageId = null;
    let userEmail = localStorage.getItem('userEmail');

    // Initialize the application
    initializeChat();
    fetchMessages();
    attachEventListeners();
    
    function initializeChat() {
        if (!authToken || !userEmail) {
            addMessage("Please log in to access your chat history.", 'system');
            return;
        }
        
        addMessage("Hello! I'm your medical assistant. I can help you by analyzing medical images or scanning prescriptions.", 'system');
        chatContainer.style.display = 'block';
    }

    async function fetchMessages() {
        try {
            if (!authToken || !userEmail) return;
            
            const response = await fetch(`http://127.0.0.1:5000/messages/all/${authToken}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                chatContainer.innerHTML = '';
                data.messages
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .forEach(message => {
                        addMessage(message.content || '', message.role, message._id, message.attachment);
                    });
            } else {
                addMessage(`Error fetching messages: ${data.message}`, 'system');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            addMessage('An error occurred while fetching your chat history.', 'system');
        }
    }
    
    function attachEventListeners() {
        imageUpload.addEventListener('change', handleImageUpload);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleMessageSubmit();
            }
        });
        
        // Separate button handlers
        scanButton.addEventListener('click', () => handleActionButton('analyze'));
        ocrButton.addEventListener('click', () => handleActionButton('ocr'));

        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!validateImage(file)) {
            imageUpload.value = '';
            return;
        }
        
        try {
            addMessage('Uploading image...', 'system');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            const formData = new FormData();
            formData.append('token', authToken);
            formData.append('content', 'Image upload: ' + file.name);
            formData.append('file', file);
            
            const response = await fetch('http://127.0.0.1:5000/messages', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                lastMessageId = data.message_id;
                addMessage('Image uploaded successfully. Use "Analyze Medical Image" for X-rays or "OCR Scan" for prescriptions.', 'system');
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            addMessage('Failed to upload image. Please try again.', 'system');
            imagePreview.style.display = 'none';
            imagePreview.src = '';
            imageUpload.value = '';
        }
    }
    
    function validateImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            addMessage('Invalid file type. Please upload a JPG, PNG, or GIF file.', 'system');
            return false;
        }
        
        if (file.size > maxSize) {
            addMessage('File is too large. Please upload an image smaller than 5MB.', 'system');
            return false;
        }
        
        return true;
    }
    
    async function handleMessageSubmit() {
        const content = messageInput.value.trim();
        if (!content) return;
        
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        try {
            addMessage(content, 'user');
            
            const formData = new FormData();
            formData.append('token', authToken);
            formData.append('content', content);
            
            const response = await fetch('http://127.0.0.1:5000/messages', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                lastMessageId = data.message_id;
                await generateAIResponse(data.message_id, content);
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('Failed to send message. Please try again.', 'system');
        }
    }
    
    async function generateAIResponse(messageId, content) {
        try {
            const formData = new FormData();
            formData.append('token', authToken);
            formData.append('message_id', messageId);
            formData.append('content', content);
            
            const response = await fetch('http://127.0.0.1:5000/messages/ai-response', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                addMessage(data.message, 'assistant');
                fetchMessages();
            } else {
                throw new Error(data.message || 'Failed to generate AI response');
            }
        } catch (error) {
            console.error('Error generating AI response:', error);
            addMessage('An error occurred while generating the response.', 'system');
        }
    }
    
    async function handleMedicalScan() {
        if (!imageUpload.files[0]) {
            addMessage('Please upload an image first.', 'system');
            return;
        }
        
        try {
            addMessage('Analyzing medical image...', 'system');
            
            const formData = new FormData();
            formData.append('token', authToken);
            formData.append('image', imageUpload.files[0]);
            formData.append('message_id', lastMessageId);
            
            const response = await fetch('http://127.0.0.1:5000/messages/scan', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                addMessage(data.message, 'assistant');
                fetchMessages();
                clearImagePreview();
            } else {
                throw new Error(data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Medical scan error:', error);
            addMessage('Failed to analyze medical image. Please try again.', 'system');
        }
    }

    async function handleOCRScan() {
        if (!imageUpload.files[0]) {
            addMessage('Please upload a prescription image first.', 'system');
            return;
        }
        
        try {
            addMessage('Scanning medicine...', 'system');
            
            const formData = new FormData();
            formData.append('token', authToken);
            formData.append('image', imageUpload.files[0]);
            formData.append('message_id', lastMessageId);
            
            formData.append('file', imageUpload.files[0]); // Changed from 'image' to 'file'
            const response = await fetch('http://127.0.0.1:5000/messages/ocr', { // Using specific OCR endpoint
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status_code === 0) {
                addMessage(data.message, 'assistant');
                fetchMessages();
                clearImagePreview();
            } else {
                throw new Error(data.message || 'OCR scan failed');
            }
        } catch (error) {
            console.error('OCR scan error:', error);
            addMessage('Failed to scan prescription. Please try again.', 'system');
        }
    }
    
    scanButton.addEventListener('click', () => {
        currentMode = 'analyze';
        handleMedicalScan();
    });
    
    ocrButton.addEventListener('click', () => {
        currentMode = 'ocr';
        handleOCRScan();
    });
    
    function clearImagePreview() {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        imageUpload.value = '';
    }
    // Separate button handlers
    scanButton.addEventListener('click', () => handleActionButton('analyze'));
    ocrButton.addEventListener('click', () => handleActionButton('ocr'));


    function addMessage(content, type, messageId = null, attachmentPath = null) {
        const message = document.createElement('div');
        message.classList.add('message', `${type}-message`);
        if (messageId) {
            message.dataset.messageId = messageId;
        }
        
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('message-content');
        
        content = typeof content === 'string' ? content : 'Invalid message content';
        if (!content.includes('<')) {
            content = content.replace(/\n/g, '<br>');
        }
        contentWrapper.innerHTML = content;
        message.appendChild(contentWrapper);
        
        if (attachmentPath) {
            const attachment = document.createElement('div');
            attachment.classList.add('message-attachment');
            
            const attachmentBox = document.createElement('div');
            attachmentBox.classList.add('attachment-box');
            
            const filename = attachmentPath.split('/').pop();
            
            const fileIcon = document.createElement('span');
            fileIcon.classList.add('file-icon');
            fileIcon.innerHTML = '📎';
            
            const filenameElement = document.createElement('span');
            filenameElement.classList.add('filename');
            filenameElement.textContent = filename;
            
            attachmentBox.addEventListener('click', () => {
                window.open(`http://127.0.0.1:5000/uploads/${userEmail}/${filename}`, '_blank');
            });
            
            attachmentBox.appendChild(fileIcon);
            attachmentBox.appendChild(filenameElement);
            attachment.appendChild(attachmentBox);
            message.appendChild(attachment);
        }
        
        chatContainer.appendChild(message);
        requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
    }
});