/**
 * 💬 Composant de chat temps réel avec WebSocket
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Wifi, WifiOff, Paperclip, Smile } from 'lucide-react';
import { useWebSocket, ChatMessage, TypingIndicator } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../stores/authStore';
import FileUploader from '../upload/FileUploader';

const RealTimeChat: React.FC = () => {
  const { connected, messages, typing, sendMessage, startTyping, stopTyping } = useWebSocket();
  const user = useAuthStore(state => state.user);
  
  const [inputMessage, setInputMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const emojis = ['😀', '😊', '😂', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !connected) return;

    sendMessage(inputMessage.trim());
    setInputMessage('');
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Gérer l'indicateur de frappe
    startTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageBubbleClass = (message: ChatMessage) => {
    const isOwn = message.userId === user?.id;
    const baseClass = "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm";
    
    if (message.type === 'system') {
      return `${baseClass} bg-gray-100 text-gray-600 text-center mx-auto text-sm`;
    }
    
    if (isOwn) {
      return `${baseClass} bg-blue-600 text-white ml-auto`;
    }
    
    return `${baseClass} bg-gray-100 text-gray-900`;
  };

  const renderTypingIndicators = () => {
    const typingUsers = typing.filter(t => t.isTyping && t.userId !== user?.id);
    
    if (typingUsers.length === 0) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
            </div>
            <span className="text-sm text-gray-600">
              {typingUsers.length === 1 
                ? `${typingUsers[0].username} écrit...`
                : `${typingUsers.length} personnes écrivent...`
              }
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Chat en temps réel</h3>
              <p className="text-blue-100 text-sm">Discussion collaborative</p>
            </div>
          </div>

          {/* Indicateur de connexion */}
          <div className="flex items-center space-x-2">
            {connected ? (
              <>
                <Wifi className="h-5 w-5 text-green-300" />
                <span className="text-green-100 text-sm">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-300" />
                <span className="text-red-100 text-sm">Déconnecté</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucun message
            </h4>
            <p className="text-gray-600">
              Commencez la conversation en envoyant un message
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'system' ? 'justify-center' : 
                message.userId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={getMessageBubbleClass(message)}>
                {/* Avatar et nom pour les messages des autres */}
                {message.type !== 'system' && message.userId !== user?.id && (
                  <div className="text-xs text-gray-500 mb-1">
                    {message.userId || 'Utilisateur'}
                  </div>
                )}

                {/* Contenu du message */}
                <div className="break-words">
                  {message.metadata?.attachment ? (
                    <div className="space-y-2">
                      {message.metadata.attachment.type === 'image' ? (
                        <img
                          src={message.metadata.attachment.url}
                          alt={message.metadata.attachment.name}
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <div className="bg-white/10 rounded-lg p-2 flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{message.metadata.attachment.name}</span>
                        </div>
                      )}
                      {message.content && <p>{message.content}</p>}
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>

                {/* Heure */}
                <div className={`text-xs mt-1 ${
                  message.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Indicateurs de frappe */}
        {renderTypingIndicators()}

        <div ref={messagesEndRef} />
      </div>

      {/* Upload de fichiers */}
      {showFileUpload && (
        <div className="border-t bg-white p-4">
          <FileUploader
            acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
            maxFileSize={5 * 1024 * 1024} // 5MB
            maxFiles={1}
            onFilesUploaded={(files) => {
              const file = files[0];
              if (file) {
                const attachment = {
                  type: file.type.startsWith('image/') ? 'image' : 'file',
                  url: URL.createObjectURL(file),
                  name: file.name
                };
                sendMessage('', { attachment });
              }
              setShowFileUpload(false);
            }}
          />
        </div>
      )}

      {/* Sélecteur d'emoji */}
      {showEmojiPicker && (
        <div className="border-t bg-white p-4">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          {/* Bouton fichier */}
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ajouter un fichier"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Bouton emoji */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ajouter un emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Champ de texte */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={!connected}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !connected}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Envoyer le message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Status de connexion */}
        {!connected && (
          <div className="mt-2 text-center text-sm text-red-600">
            Chat déconnecté - Tentative de reconnexion...
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChat;
