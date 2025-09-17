// Modern Chat Functionality - Instagram/WhatsApp Style
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentConversation = null;
        this.conversations = [];
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        await this.loadConversations();
        this.setupEventListeners();
        this.startPolling();
    }

    async loadCurrentUser() {
        try {
            // Get current user from session or create demo user
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            } else {
                // Create demo user for testing
                this.currentUser = {
                    _id: 'demo_user_1',
                    fullName: 'Demo User',
                    email: 'demo@example.com',
                    avatar: '',
                    userType: 'student'
                };
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }

    async loadConversations() {
        try {
            const response = await fetch(`/api/chat/conversations/${this.currentUser._id}`);
            const data = await response.json();
            
            if (data.success) {
                this.conversations = data.conversations;
                this.renderConversations();
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.loadDemoConversations();
        }
    }

    loadDemoConversations() {
        // Demo conversations for testing
        this.conversations = [
            {
                _id: 'conv_1',
                participants: [
                    { _id: 'user_2', fullName: 'Aarav Mehta', avatar: '', isOnline: true, lastSeen: new Date() },
                    { _id: 'demo_user_1', fullName: 'Demo User', avatar: '', isOnline: true, lastSeen: new Date() }
                ],
                lastMessage: {
                    content: 'Hey, how are you doing?',
                    senderId: { fullName: 'Aarav Mehta' },
                    createdAt: new Date(Date.now() - 1000 * 60 * 2)
                },
                unreadCount: new Map([['demo_user_1', 1]]),
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 2)
            },
            {
                _id: 'conv_2',
                participants: [
                    { _id: 'user_3', fullName: 'Isha Kapoor', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60) },
                    { _id: 'demo_user_1', fullName: 'Demo User', avatar: '', isOnline: true, lastSeen: new Date() }
                ],
                lastMessage: {
                    content: 'Thanks for the project update',
                    senderId: { fullName: 'Isha Kapoor' },
                    createdAt: new Date(Date.now() - 1000 * 60 * 60)
                },
                unreadCount: new Map([['demo_user_1', 0]]),
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 60)
            }
        ];
        this.renderConversations();
    }

    renderConversations() {
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;

        messagesList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const otherParticipant = conversation.participants.find(p => p._id !== this.currentUser._id) || conversation.participants[0];
            const unreadCount = conversation.unreadCount.get(this.currentUser._id) || 0;
            const lastMessage = conversation.lastMessage;
            const lastSeen = otherParticipant.lastSeen || conversation.lastMessageTime;
            const timeAgo = this.formatTimeAgo(lastSeen);
            const statusText = otherParticipant.isOnline ? 'Online' : `Last seen ${timeAgo}`;

            const conversationElement = document.createElement('div');
            conversationElement.className = `conversation-item ${unreadCount > 0 ? 'unread' : ''}`;
            conversationElement.innerHTML = `
                <div class="conversation-avatar">
                    <div class="avatar ${otherParticipant.isOnline ? 'online' : ''}">
                        ${otherParticipant.avatar ? 
                            `<img src="${otherParticipant.avatar}" alt="${otherParticipant.fullName}">` :
                            `<span class="avatar-initial">${otherParticipant.fullName.charAt(0)}</span>`
                        }
                    </div>
                </div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h4 class="conversation-name">${otherParticipant.fullName}</h4>
                        <span class="conversation-time">${statusText}</span>
                    </div>
                    <div class="conversation-preview">
                        <p class="last-message">${lastMessage ? lastMessage.content : 'No messages yet'}</p>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </div>
                </div>
            `;

            conversationElement.addEventListener('click', () => {
                this.selectConversation(conversation);
            });

            messagesList.appendChild(conversationElement);
        });
    }

    async selectConversation(conversation) {
        this.currentConversation = conversation;
        
        // Update UI
        document.getElementById('no-chat-selected').style.display = 'none';
        document.getElementById('active-chat').style.display = 'block';
        
        // Update chat header
        const otherParticipant = conversation.participants.find(p => p._id !== this.currentUser._id) || conversation.participants[0];
        document.getElementById('chat-user-name').textContent = otherParticipant.fullName;
        document.getElementById('chat-user-status').textContent = otherParticipant.isOnline ? 'Online' : 'Last seen recently';
        
        // Load messages
        await this.loadMessages(conversation._id);
        
        // Mark as read
        await this.markAsRead(conversation._id);
        
        // Update conversation list
        this.renderConversations();
    }

    async loadMessages(conversationId) {
        try {
            const response = await fetch(`/api/chat/messages/${conversationId}`);
            const data = await response.json();
            
            if (data.success) {
                this.messages = data.messages;
                this.renderMessages();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.loadDemoMessages();
        }
    }

    loadDemoMessages() {
        // Demo messages for testing
        this.messages = [
            {
                _id: 'msg_1',
                content: 'Hey! How are you doing?',
                senderId: { _id: 'user_2', fullName: 'Sarah Johnson', avatar: '' },
                createdAt: new Date(Date.now() - 1000 * 60 * 30),
                status: 'read'
            },
            {
                _id: 'msg_2',
                content: 'I\'m doing great! Just working on some projects. How about you?',
                senderId: { _id: 'demo_user_1', fullName: 'Demo User', avatar: '' },
                createdAt: new Date(Date.now() - 1000 * 60 * 25),
                status: 'read'
            },
            {
                _id: 'msg_3',
                content: 'That sounds awesome! I\'ve been learning some new technologies lately.',
                senderId: { _id: 'user_2', fullName: 'Sarah Johnson', avatar: '' },
                createdAt: new Date(Date.now() - 1000 * 60 * 20),
                status: 'read'
            }
        ];
        this.renderMessages();
    }

    renderMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        chatMessages.innerHTML = '';

        this.messages.forEach(message => {
            const isOwnMessage = message.senderId._id === this.currentUser._id;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
            
            const time = this.formatMessageTime(message.createdAt);
            const statusIcon = this.getMessageStatusIcon(message.status);
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${message.content}</p>
                        <div class="message-meta">
                            <span class="message-time">${time}</span>
                            ${isOwnMessage ? `<span class="message-status">${statusIcon}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Add click handler for message options
            messageElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMessageOptions(messageElement);
            });

            // Add double-click for quick reactions
            messageElement.addEventListener('dblclick', () => {
                this.addMessageReaction(message._id, '❤️');
            });

            chatMessages.appendChild(messageElement);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const content = chatInput.value.trim();
        
        if (!content || !this.currentConversation) return;

        // Add message to UI immediately
        const tempMessage = {
            _id: 'temp_' + Date.now(),
            content,
            senderId: this.currentUser,
            createdAt: new Date(),
            status: 'sent'
        };
        
        this.messages.push(tempMessage);
        this.renderMessages();
        chatInput.value = '';

        try {
            const response = await fetch('/api/chat/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: this.currentConversation._id,
                    senderId: this.currentUser._id,
                    content
                })
            });

            const data = await response.json();
            if (data.success) {
                // Replace temp message with real message
                const messageIndex = this.messages.findIndex(m => m._id === tempMessage._id);
                if (messageIndex !== -1) {
                    this.messages[messageIndex] = data.message;
                    this.renderMessages();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Update message status to failed
            const messageIndex = this.messages.findIndex(m => m._id === tempMessage._id);
            if (messageIndex !== -1) {
                this.messages[messageIndex].status = 'failed';
                this.renderMessages();
            }
        }
    }

    async markAsRead(conversationId) {
        try {
            await fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    userId: this.currentUser._id
                })
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    setupEventListeners() {
        // Send message on Enter key
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Typing indicator
            chatInput.addEventListener('input', () => {
                this.handleTyping();
            });

            // Auto-resize input
            chatInput.addEventListener('input', () => {
                this.autoResizeInput(chatInput);
            });
        }

        // Send button
        const sendButton = document.getElementById('send-message');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }

        // Add emoji picker functionality
        this.setupEmojiPicker();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            // Send typing indicator to server
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            // Stop typing indicator
        }, 1000);
    }

    searchConversations(query) {
        const conversations = document.querySelectorAll('.conversation-item');
        conversations.forEach(conversation => {
            const name = conversation.querySelector('.conversation-name').textContent.toLowerCase();
            const message = conversation.querySelector('.last-message').textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (name.includes(searchTerm) || message.includes(searchTerm)) {
                conversation.style.display = 'flex';
            } else {
                conversation.style.display = 'none';
            }
        });
    }

    startPolling() {
        // Poll for new messages every 3 seconds
        setInterval(() => {
            if (this.currentConversation) {
                this.loadMessages(this.currentConversation._id);
            }
            this.loadConversations();
        }, 3000);
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    }

    formatMessageTime(date) {
        const messageDate = new Date(date);
        const now = new Date();
        const diff = now - messageDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return messageDate.toLocaleDateString();
    }

    getMessageStatusIcon(status) {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓';
            case 'failed': return '⚠';
            default: return '✓';
        }
    }

    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    setupEmojiPicker() {
        // Add emoji button to chat input area
        const chatInputArea = document.querySelector('.chat-input-area');
        if (chatInputArea) {
            const emojiButton = document.createElement('button');
            emojiButton.innerHTML = '😊';
            emojiButton.className = 'emoji-button';
            emojiButton.type = 'button';
            emojiButton.style.cssText = `
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            `;
            
            emojiButton.addEventListener('click', () => {
                this.showEmojiPicker(emojiButton);
            });

            chatInputArea.insertBefore(emojiButton, chatInputArea.querySelector('input'));
        }
    }

    showEmojiPicker(button) {
        // Simple emoji picker - in a real app, you'd use a proper emoji library
        const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🎉', '🔥', '💯'];
        
        let picker = document.getElementById('emoji-picker');
        if (picker) {
            picker.remove();
            return;
        }

        picker = document.createElement('div');
        picker.id = 'emoji-picker';
        picker.style.cssText = `
            position: absolute;
            bottom: 60px;
            left: 20px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            padding: 0.5rem;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.25rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;

        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.textContent = emoji;
            emojiBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 6px;
                transition: background-color 0.2s ease;
            `;
            
            emojiBtn.addEventListener('click', () => {
                this.insertEmoji(emoji);
                picker.remove();
            });

            emojiBtn.addEventListener('mouseenter', () => {
                emojiBtn.style.backgroundColor = '#f8f9fa';
            });

            emojiBtn.addEventListener('mouseleave', () => {
                emojiBtn.style.backgroundColor = 'transparent';
            });

            picker.appendChild(emojiBtn);
        });

        document.querySelector('.chat-input-area').appendChild(picker);

        // Close picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target !== button) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 0);
    }

    insertEmoji(emoji) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            const start = chatInput.selectionStart;
            const end = chatInput.selectionEnd;
            const text = chatInput.value;
            chatInput.value = text.substring(0, start) + emoji + text.substring(end);
            chatInput.selectionStart = chatInput.selectionEnd = start + emoji.length;
            chatInput.focus();
        }
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        let typingIndicator = document.getElementById('typing-indicator');
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.id = 'typing-indicator';
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);
        }
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    addMessageReaction(messageId, emoji) {
        // Add reaction to message
        console.log(`Adding reaction ${emoji} to message ${messageId}`);
        // In a real app, this would send to server
    }

    showMessageOptions(messageElement) {
        // Show message options menu (reply, react, delete, etc.)
        const options = document.createElement('div');
        options.className = 'message-options';
        options.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            gap: 0.5rem;
        `;

        const reactBtn = document.createElement('button');
        reactBtn.textContent = '😊';
        reactBtn.addEventListener('click', () => {
            this.showEmojiPicker(reactBtn);
            options.remove();
        });

        const replyBtn = document.createElement('button');
        replyBtn.textContent = '↩️';
        replyBtn.addEventListener('click', () => {
            // Implement reply functionality
            options.remove();
        });

        options.appendChild(reactBtn);
        options.appendChild(replyBtn);
        
        messageElement.appendChild(options);

        // Remove options after 3 seconds
        setTimeout(() => {
            if (options.parentNode) {
                options.remove();
            }
        }, 3000);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
