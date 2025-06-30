/**
 * 🔍 Composant d'analyse IA avancée avec vision et analytics
 */

import React, { useState, useRef } from 'react';
import { Upload, Eye, BarChart3, Loader2, Download, Share2 } from 'lucide-react';
import { useVisionAnalysis, useNLPAnalysis } from '../../hooks/useAPI';
import { useUIStore } from '../../stores/uiStore';

interface AnalysisResult {
  type: 'vision' | 'nlp';
  input: string | File;
  result: any;
  timestamp: Date;
}

const AdvancedAIAnalysis: React.FC = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [currentTab, setCurrentTab] = useState<'vision' | 'nlp' | 'analytics'>('vision');
  const [textInput, setTextInput] = useState('');
  
  const visionMutation = useVisionAnalysis();
  const nlpMutation = useNLPAnalysis();
  const addToast = useUIStore(state => state.addToast);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageAnalysis = async (file: File) => {
    try {
      const result = await visionMutation.mutateAsync(file);
      
      const analysisResult: AnalysisResult = {
        type: 'vision',
        input: file,
        result,
        timestamp: new Date()
      };
      
      setAnalysisHistory(prev => [analysisResult, ...prev]);
      
      addToast({
        type: 'success',
        title: 'Analyse d\'image terminée',
        message: `${result.objects?.length || 0} objets détectés`
      });

      // Dessiner les détections sur le canvas
      drawDetections(file, result);
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur d\'analyse',
        message: 'Impossible d\'analyser l\'image'
      });
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;

    try {
      const result = await nlpMutation.mutateAsync({
        text: textInput,
        task: 'comprehensive'
      });
      
      const analysisResult: AnalysisResult = {
        type: 'nlp',
        input: textInput,
        result,
        timestamp: new Date()
      };
      
      setAnalysisHistory(prev => [analysisResult, ...prev]);
      
      addToast({
        type: 'success',
        title: 'Analyse de texte terminée',
        message: `Sentiment: ${result.sentiment?.label || 'N/A'}`
      });
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur d\'analyse',
        message: 'Impossible d\'analyser le texte'
      });
    }
  };

  const drawDetections = (file: File, result: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !result.objects) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Dessiner l'image
      ctx.drawImage(img, 0, 0);
      
      // Dessiner les boîtes de détection
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#3B82F6';
      
      result.objects.forEach((obj: any) => {
        const { bbox, label, confidence } = obj;
        
        // Boîte de détection
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        
        // Label avec confiance
        const text = `${label} (${Math.round(confidence * 100)}%)`;
        const textWidth = ctx.measureText(text).width;
        
        // Fond du label
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(bbox.x, bbox.y - 25, textWidth + 10, 25);
        
        // Texte du label
        ctx.fillStyle = 'white';
        ctx.fillText(text, bbox.x + 5, bbox.y - 5);
        ctx.fillStyle = '#3B82F6';
      });
    };
    
    img.src = URL.createObjectURL(file);
  };

  const exportAnalysis = (analysis: AnalysisResult) => {
    const dataStr = JSON.stringify(analysis.result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_${analysis.timestamp.getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getAnalyticsStats = () => {
    const visionAnalyses = analysisHistory.filter(a => a.type === 'vision');
    const nlpAnalyses = analysisHistory.filter(a => a.type === 'nlp');
    
    const objectsDetected = visionAnalyses.reduce((total, analysis) => {
      return total + (analysis.result.objects?.length || 0);
    }, 0);
    
    const sentiments = nlpAnalyses.map(a => a.result.sentiment?.label).filter(Boolean);
    const mostCommonSentiment = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAnalyses: analysisHistory.length,
      visionAnalyses: visionAnalyses.length,
      nlpAnalyses: nlpAnalyses.length,
      objectsDetected,
      mostCommonSentiment: Object.keys(mostCommonSentiment).reduce((a, b) => 
        mostCommonSentiment[a] > mostCommonSentiment[b] ? a : b, 'N/A'
      )
    };
  };

  const stats = getAnalyticsStats();

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header avec onglets */}
      <div className="border-b">
        <div className="flex space-x-0">
          {[
            { id: 'vision', label: 'Vision IA', icon: Eye },
            { id: 'nlp', label: 'Analyse de Texte', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Vision IA Tab */}
        {currentTab === 'vision' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Analyse d'Images avec IA</h3>
              
              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageAnalysis(file);
                  }}
                  className="hidden"
                  aria-label="Sélectionner une image à analyser"
                />
                
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Télécharger une image
                </h4>
                <p className="text-gray-600 mb-4">
                  Glissez-déposez ou cliquez pour sélectionner une image
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={visionMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {visionMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyse...</>
                  ) : (
                    'Sélectionner une image'
                  )}
                </button>
              </div>

              {/* Canvas pour afficher les résultats */}
              <canvas
                ref={canvasRef}
                className={`max-w-full border rounded-lg mt-4 ${
                  analysisHistory.some(a => a.type === 'vision') ? 'block' : 'hidden'
                } max-h-96`}
              />
            </div>
          </div>
        )}

        {/* NLP Tab */}
        {currentTab === 'nlp' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Analyse de Texte</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte à analyser
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Entrez le texte que vous souhaitez analyser..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleTextAnalysis}
                  disabled={!textInput.trim() || nlpMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {nlpMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyse...</>
                  ) : (
                    'Analyser le texte'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {currentTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques d'Analyse</h3>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
                <div className="text-sm text-blue-800">Analyses totales</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.visionAnalyses}</div>
                <div className="text-sm text-green-800">Analyses d'images</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.nlpAnalyses}</div>
                <div className="text-sm text-purple-800">Analyses de texte</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.objectsDetected}</div>
                <div className="text-sm text-orange-800">Objets détectés</div>
              </div>
            </div>
            
            {stats.mostCommonSentiment !== 'N/A' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Sentiment le plus courant</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {stats.mostCommonSentiment}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Historique des analyses */}
        {analysisHistory.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Historique des analyses</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analysisHistory.map((analysis, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {analysis.type === 'vision' ? (
                        <Eye className="h-5 w-5 text-blue-600" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          {analysis.type === 'vision' ? 'Analyse d\'image' : 'Analyse de texte'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysis.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportAnalysis(analysis)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Exporter l'analyse"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Partager l'analyse"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Résumé des résultats */}
                  <div className="mt-3 text-sm text-gray-600">
                    {analysis.type === 'vision' && analysis.result.objects && (
                      <div>
                        {analysis.result.objects.length} objets détectés: {' '}
                        {analysis.result.objects.slice(0, 3).map((obj: any) => obj.label).join(', ')}
                        {analysis.result.objects.length > 3 && '...'}
                      </div>
                    )}
                    {analysis.type === 'nlp' && analysis.result.sentiment && (
                      <div>
                        Sentiment: {analysis.result.sentiment.label} 
                        ({Math.round(analysis.result.sentiment.confidence * 100)}%)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAIAnalysis;
