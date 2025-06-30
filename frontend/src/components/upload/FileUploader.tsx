/**
 * 📁 Composant d'upload de fichiers avancé avec prévisualisation et progression
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, Image, Video, Music, X, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { useUIStore } from "../../stores/uiStore";

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  error?: string;
}

interface FileUploaderProps {
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  onFilesUploaded?: (files: File[]) => void;
  allowPreview?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  onFilesUploaded,
  allowPreview = true
}) => {
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useUIStore(state => state.addToast);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return File;
  };

  const createPreviewUrl = (file: File): string | undefined => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxFileSize) {
      return `Le fichier dépasse la taille maximale de ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Vérifier le type
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('/')) {
        return file.type.match(type.replace('*', '.*'));
      }
      return false;
    });

    if (!isAccepted) {
      return `Type de fichier non autorisé. Types acceptés: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const filesArray = Array.from(files);
    
    // Vérifier le nombre maximum de fichiers
    if (uploadQueue.length + filesArray.length > maxFiles) {
      addToast({
        type: 'error',
        title: 'Trop de fichiers',
        message: `Maximum ${maxFiles} fichiers autorisés`
      });
      return;
    }

    const newItems: FileUploadItem[] = [];

    filesArray.forEach(file => {
      const error = validateFile(file);
      const item: FileUploadItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        previewUrl: allowPreview ? createPreviewUrl(file) : undefined,
        error: error || undefined
      };
      newItems.push(item);
    });

    setUploadQueue(prev => [...prev, ...newItems]);

    // Commencer l'upload automatiquement pour les fichiers valides
    newItems.forEach(item => {
      if (item.status === 'pending') {
        uploadFile(item);
      }
    });
  }, [uploadQueue.length, maxFiles, allowPreview, addToast]);

  const uploadFile = async (item: FileUploadItem) => {
    setUploadQueue(prev => prev.map(f => 
      f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('type', 'course_material');

      // Simuler la progression (en pratique, utiliser XMLHttpRequest pour le vrai suivi)
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadQueue(prev => prev.map(f => 
            f.id === item.id ? { ...f, progress } : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadQueue(prev => prev.map(f => 
            f.id === item.id ? { ...f, status: 'completed', progress: 100 } : f
          ));
          
          addToast({
            type: 'success',
            title: 'Upload terminé',
            message: `${item.file.name} uploadé avec succès`
          });
        } else {
          throw new Error(`Upload failed: ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', '/api/files/upload');
      
      // Ajouter les headers d'authentification
      const token = localStorage.getItem('access_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);

    } catch (error) {
      setUploadQueue(prev => prev.map(f => 
        f.id === item.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));

      addToast({
        type: 'error',
        title: 'Erreur d\'upload',
        message: `Impossible d'uploader ${item.file.name}`
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadQueue(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const retryUpload = (item: FileUploadItem) => {
    uploadFile(item);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFilesToQueue(files);
    }
  }, [addFilesToQueue]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFilesToQueue(files);
    }
    // Reset input pour permettre la re-sélection du même fichier
    e.target.value = '';
  }, [addFilesToQueue]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedFiles = uploadQueue.filter(f => f.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Sélectionner des fichiers"
        />

        <Upload className={`h-12 w-12 mx-auto mb-4 ${
          isDragOver ? 'text-blue-500' : 'text-gray-400'
        }`} />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Glissez-déposez vos fichiers ici
        </h3>
        
        <p className="text-gray-600 mb-4">
          ou cliquez pour sélectionner des fichiers
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sélectionner des fichiers
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Types acceptés: {acceptedTypes.join(', ')}</p>
          <p>Taille max: {(maxFileSize / 1024 / 1024).toFixed(1)}MB par fichier</p>
          <p>Maximum {maxFiles} fichiers</p>
        </div>
      </div>

      {/* Queue d'upload */}
      {uploadQueue.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Fichiers ({uploadQueue.length}/{maxFiles})
          </h4>
          
          {uploadQueue.map((item) => {
            const FileIcon = getFileIcon(item.file);
            
            return (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {/* Prévisualisation ou icône */}
                  <div className="flex-shrink-0">
                    {item.previewUrl && item.file.type.startsWith('image/') ? (
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Informations du fichier */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {item.file.name}
                      </h5>
                      <div className="flex items-center space-x-2">
                        {/* Actions */}
                        {item.previewUrl && allowPreview && (
                          <button
                            onClick={() => window.open(item.previewUrl, '_blank')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Prévisualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {item.status === 'completed' && (
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(item.file.size)}
                      </span>
                      
                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        {item.status === 'uploading' && (
                          <span className="text-xs text-blue-600">
                            {item.progress}%
                          </span>
                        )}
                        
                        {item.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        
                        {item.status === 'error' && (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <button
                              onClick={() => retryUpload(item)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    {item.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Message d'erreur */}
                    {item.status === 'error' && item.error && (
                      <div className="mt-2 text-xs text-red-600">
                        {item.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Résumé */}
      {completedFiles.length > 0 && onFilesUploaded && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-800 font-medium">
                {completedFiles.length} fichier(s) uploadé(s) avec succès
              </span>
            </div>
            <button
              onClick={() => onFilesUploaded(completedFiles.map(f => f.file))}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Traiter les fichiers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
