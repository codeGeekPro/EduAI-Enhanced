/**
 * 🤖 Page des services IA avancés
 */

import React, { useState } from 'react';
import { Brain, MessageSquare, Eye, BarChart3, Upload, Zap } from 'lucide-react';
import AITutorChat from '../components/ai/AITutorChat';
import AdvancedAIAnalysis from '../components/ai/AdvancedAIAnalysis';
import RealTimeChat from '../components/chat/RealTimeChat';
import FileUploader from '../components/upload/FileUploader';

const AIServicesPage: React.FC = () => {
  const [activeService, setActiveService] = useState<'tutor' | 'analysis' | 'chat' | 'upload'>('tutor');

  const services = [
    {
      id: 'tutor',
      title: 'Tuteur IA',
      description: 'Assistant pédagogique intelligent avec reconnaissance vocale',
      icon: Brain,
      color: 'bg-blue-500'
    },
    {
      id: 'analysis',
      title: 'Analyse IA',
      description: 'Vision par ordinateur et analyse de texte avancée',
      icon: Eye,
      color: 'bg-purple-500'
    },
    {
      id: 'chat',
      title: 'Chat Temps Réel',
      description: 'Discussion collaborative avec d\'autres apprenants',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      id: 'upload',
      title: 'Gestionnaire de Fichiers',
      description: 'Upload et analyse intelligente de documents',
      icon: Upload,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-3">
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Services IA Avancés</h1>
            <p className="text-purple-100 mt-2">
              Exploitez la puissance de l'intelligence artificielle pour améliorer votre apprentissage
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isActive = activeService === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id as any)}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
              }`}
            >
              <div className={`${service.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </button>
          );
        })}
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'utilisation IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Interactions IA</p>
                <p className="text-2xl font-bold text-blue-900">1,234</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Analyses effectuées</p>
                <p className="text-2xl font-bold text-purple-900">567</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Messages chat</p>
                <p className="text-2xl font-bold text-green-900">2,891</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Fichiers traités</p>
                <p className="text-2xl font-bold text-orange-900">89</p>
              </div>
              <Upload className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Service Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeService === 'tutor' && (
          <div className="h-96">
            <AITutorChat />
          </div>
        )}
        
        {activeService === 'analysis' && (
          <AdvancedAIAnalysis />
        )}
        
        {activeService === 'chat' && (
          <div className="h-96">
            <RealTimeChat />
          </div>
        )}
        
        {activeService === 'upload' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Gestionnaire de Fichiers Intelligent</h3>
            <FileUploader
              acceptedTypes={['image/*', 'video/*', '.pdf', '.doc', '.docx', '.ppt', '.pptx']}
              maxFileSize={50 * 1024 * 1024} // 50MB
              maxFiles={10}
              onFilesUploaded={(files) => {
                console.log('Files uploaded:', files);
                // Ici on peut traiter les fichiers avec l'IA
              }}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Poser une question</h4>
                <p className="text-sm text-gray-600">Demandez de l'aide au tuteur IA</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Analyser une image</h4>
                <p className="text-sm text-gray-600">Extraction d'informations visuelles</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Rejoindre le chat</h4>
                <p className="text-sm text-gray-600">Discussion en temps réel</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIServicesPage;
