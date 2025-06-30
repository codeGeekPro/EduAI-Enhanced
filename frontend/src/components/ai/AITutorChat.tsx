/**
 * 🤖 Composant de chat IA avancé avec reconnaissance vocale et analyse d'émotion
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Camera, Image, Volume2, Bot, User, Loader2 } from 'lucide-react';
import { useAITutorChat, useEmotionDetection, useSpeechToText, useTextToSpeech } from '../../hooks/useAPI';
import { useUIStore } from '../../stores/uiStore';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    emotion?: string;
    confidence?: number;
    audioUrl?: string;
    imageUrl?: string;
  };
}

const AITutorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Bonjour ! Je suis votre tuteur IA. Comment puis-je vous aider dans votre apprentissage aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const chatMutation = useAITutorChat();
  const emotionMutation = useEmotionDetection();
  const speechToTextMutation = useSpeechToText();
  const textToSpeechMutation = useTextToSpeech();
  const addToast = useUIStore(state => state.addToast);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Ajouter le message utilisateur
    addMessage({
      type: 'user',
      content: userMessage
    });

    try {
      // Analyser l'émotion du message
      const emotionResult = await emotionMutation.mutateAsync({ text: userMessage });
      
      // Envoyer au tuteur IA
      const chatResult = await chatMutation.mutateAsync({
        message: userMessage,
        context: emotionResult.primary_emotion
      });

      // Ajouter la réponse de l'IA
      addMessage({
        type: 'assistant',
        content: chatResult.response,
        metadata: {
          emotion: emotionResult.primary_emotion,
          confidence: emotionResult.confidence
        }
      });

    } catch (error) {
      addMessage({
        type: 'assistant',
        content: '🚨 Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?'
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        try {
          const transcriptionResult = await speechToTextMutation.mutateAsync(audioBlob);
          setInputMessage(transcriptionResult.transcription);
          
          addToast({
            type: 'success',
            title: 'Transcription terminée',
            message: `Confiance: ${Math.round(transcriptionResult.confidence * 100)}%`
          });
        } catch (error) {
          addToast({
            type: 'error',
            title: 'Erreur de transcription',
            message: 'Impossible de transcrire l\'audio'
          });
        }
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur microphone',
        message: 'Impossible d\'accéder au microphone'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      // Analyser l'émotion dans l'image
      const emotionResult = await emotionMutation.mutateAsync({ image: file });
      
      // Créer l'URL de l'image pour l'affichage
      const imageUrl = URL.createObjectURL(file);
      
      addMessage({
        type: 'user',
        content: 'Image partagée',
        metadata: {
          imageUrl,
          emotion: emotionResult.primary_emotion,
          confidence: emotionResult.confidence
        }
      });

      // Réponse de l'IA basée sur l'analyse d'émotion
      addMessage({
        type: 'assistant',
        content: `Je vois que l'émotion principale dans cette image est "${emotionResult.primary_emotion}" avec une confiance de ${Math.round(emotionResult.confidence * 100)}%. Comment puis-je vous aider en fonction de cela ?`
      });

    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur d\'analyse',
        message: 'Impossible d\'analyser l\'image'
      });
    }
  };

  const playTextToSpeech = async (text: string) => {
    try {
      const audioBlob = await textToSpeechMutation.mutateAsync({
        text,
        voice: 'fr-FR-DeniseNeural',
        speed: 1.0
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur de synthèse vocale',
        message: 'Impossible de lire le texte'
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-2">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Tuteur IA EduAI</h3>
            <p className="text-blue-100 text-sm">Assistant pédagogique intelligent</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg p-3 shadow-sm`}>
              
              {/* Avatar */}
              <div className="flex items-start space-x-2">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  {/* Image si présente */}
                  {message.metadata?.imageUrl && (
                    <img 
                      src={message.metadata.imageUrl} 
                      alt="Shared image" 
                      className="w-full rounded-lg mb-2 max-w-xs"
                    />
                  )}
                  
                  {/* Contenu du message */}
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Métadonnées */}
                  {message.metadata?.emotion && (
                    <div className="mt-2 text-xs opacity-75">
                      😊 Émotion: {message.metadata.emotion} 
                      ({Math.round((message.metadata.confidence || 0) * 100)}%)
                    </div>
                  )}
                  
                  {/* Heure */}
                  <div className="mt-1 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {/* Bouton synthèse vocale pour les messages IA */}
                {message.type === 'assistant' && (
                  <button
                    onClick={() => playTextToSpeech(message.content)}
                    disabled={textToSpeechMutation.isPending}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {textToSpeechMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicateur de frappe */}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-gray-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          {/* Upload d'image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Sélectionner une image"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Ajouter une image"
            title="Ajouter une image"
          >
            <Image className="h-5 w-5" />
          </button>

          {/* Enregistrement vocal */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={speechToTextMutation.isPending}
            className={`p-2 transition-colors ${
              isRecording 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {speechToTextMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Champ de texte */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={chatMutation.isPending}
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Indicateur d'enregistrement */}
        {isRecording && (
          <div className="mt-2 flex items-center justify-center text-red-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Enregistrement en cours...
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutorChat;
