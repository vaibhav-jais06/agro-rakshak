import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, ArrowLeft, Bug, Droplets, AlertTriangle, CheckCircle, Info, RefreshCw, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/apiService';
import { isNativePlatform, takePhoto, pickImage } from '../services/capacitorService';
import toast from 'react-hot-toast';

const loadingKeys = [
  "cropAnalysis.loadingMessages.analyzing",
  "cropAnalysis.loadingMessages.detectingSpecies",
  "cropAnalysis.loadingMessages.examiningHealth",
  "cropAnalysis.loadingMessages.identifyingDiseases",
  "cropAnalysis.loadingMessages.checkingPestDamage",
  "cropAnalysis.loadingMessages.evaluatingSoil",
  "cropAnalysis.loadingMessages.analyzingNutrients",
  "cropAnalysis.loadingMessages.assessingSeverity",
  "cropAnalysis.loadingMessages.generatingRecommendations",
  "cropAnalysis.loadingMessages.preparingReport",
  "cropAnalysis.loadingMessages.finalizing"
];

export default function CropAnalysisPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('plant');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'capture'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % loadingKeys.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const startCamera = async () => {
    try {
      // Use Capacitor camera on native platforms
      if (isNativePlatform()) {
        const result = await takePhoto({ quality: 90, allowEditing: false });
        
        if (result.success) {
          // Convert Capacitor photo to File object
          const response = await fetch(result.webPath);
          const blob = await response.blob();
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          
          setSelectedImage(file);
          setPreviewUrl(result.webPath);
          setError(null);
          setAnalysisResult(null);
          toast.success(t('cropAnalysis.imageCaptured') || 'Image captured successfully');
        } else {
          throw new Error(result.error || 'Camera capture failed');
        }
        return;
      }

      // Web platform - use MediaDevices API
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setError(t('errors.cameraAccessDenied'));
      toast.error(t('errors.cameraAccessDenied') || 'Camera access denied');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
        setError(null);
        setAnalysisResult(null);
      }, 'image/jpeg', 0.95);
    }
  };

  const handleImageSelect = async (e) => {
    // Use Capacitor image picker on native platforms
    if (isNativePlatform() && !e.target.files) {
      try {
        const result = await pickImage({ quality: 90, allowEditing: false });
        
        if (result.success) {
          // Convert Capacitor photo to File object
          const response = await fetch(result.webPath);
          const blob = await response.blob();
          const file = new File([blob], 'gallery-image.jpg', { type: 'image/jpeg' });
          
          setSelectedImage(file);
          setPreviewUrl(result.webPath);
          setError(null);
          setAnalysisResult(null);
          toast.success(t('cropAnalysis.imageSelected') || 'Image selected successfully');
        }
      } catch (err) {
        console.error('Gallery picker error:', err);
        toast.error(t('errors.galleryAccessDenied') || 'Gallery access denied');
      }
      return;
    }

    // Web platform - standard file input
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(t('errors.imageSizeError'));
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setAnalysisResult(null);
    }
  };

   const compressImage = (file) => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = (event) => {
         const img = new Image();
         img.src = event.target.result;
         img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 300; // Small size to save tokens!
           const MAX_HEIGHT = 300;
           let width = img.width;
           let height = img.height;

           if (width > height) {
             if (width > MAX_WIDTH) {
               height *= MAX_WIDTH / width;
               width = MAX_WIDTH;
             }
           } else {
             if (height > MAX_HEIGHT) {
               width *= MAX_HEIGHT / height;
               height = MAX_HEIGHT;
             }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, width, height);
           canvas.toBlob((blob) => {
             resolve(new File([blob], file.name || "image.jpg", {
               type: 'image/jpeg',
               lastModified: Date.now()
             }));
           }, 'image/jpeg', 0.6); // 60% quality
         };
         img.onerror = (error) => reject(error);
       };
       reader.onerror = (error) => reject(error);
     });
   };

   const handleAnalyze = async () => {
     if (!selectedImage) {
       setError(t('cropAnalysis.selectImageFirst'));
       return;
     }

     setIsAnalyzing(true);
     setError(null);
     setCurrentMessage(0);

    try {
      const compressedImage = await compressImage(selectedImage);
      const result = await apiService.diagnoseCrop(compressedImage, analysisType);

      if (result.success) {
        setAnalysisResult({
          success: true,
          analysis: result.analysis || result.data?.aiAnalysis || result.data?.diagnosis,
          metadata: result.metadata,
        });
      } else {
        setError(result?.message || result?.metadata?.errorMessage || t('cropAnalysis.analysisFailed'));
      }
     } catch (err) {
       console.error('Analysis error:', err);
       setError(err.message || t('cropAnalysis.analysisError'));
     } finally {
       setIsAnalyzing(false);
     }
   };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Mild': 'bg-green-100 text-green-800 ring-green-600/20',
      'Moderate': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
      'Severe': 'bg-orange-100 text-orange-800 ring-orange-600/20',
      'Critical': 'bg-red-100 text-red-800 ring-red-600/20',
      'Healthy': 'bg-blue-100 text-blue-800 ring-blue-600/20'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 ring-gray-600/20';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'Low': 'bg-green-50/50 border-green-100',
      'Medium': 'bg-yellow-50/50 border-yellow-100',
      'High': 'bg-orange-50/50 border-orange-100',
      'Critical': 'bg-red-50/50 border-red-100'
    };
    return colors[urgency] || 'bg-gray-50/50 border-gray-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-text-primary pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="font-semibold text-lg">{t('cropAnalysis.title')}</h1>
          <div className="w-8" /> 
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        {/* Type Selection */}
        {!analysisResult && !isAnalyzing && (
          <div className="glass-card rounded-3xl p-2 flex gap-2">
            <button
              onClick={() => setAnalysisType('plant')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl transition-all font-medium ${
                analysisType === 'plant'
                  ? 'bg-primary text-white shadow-lg'
                  : 'hover:bg-gray-50 text-text-secondary'
              }`}
            >
              <img src="/logo.png" alt="Agro-Rakshak" className="w-4 h-4" />
              {t('cropAnalysis.plantIdentification')}
            </button>
            <button
              onClick={() => setAnalysisType('soil')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl transition-all font-medium ${
                analysisType === 'soil'
                  ? 'bg-primary text-white shadow-lg'
                  : 'hover:bg-gray-50 text-text-secondary'
              }`}
            >
              <Droplets className="w-4 h-4" />
              {t('cropAnalysis.soilAnalysis')}
            </button>
          </div>
        )}

        {/* Main Interaction Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {inputMode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!selectedImage ? (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-white group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block w-full h-full">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">{t('cropAnalysis.clickToUpload')}</h3>
                        <p className="text-text-secondary text-sm">{t('cropAnalysis.imageFormats')}</p>
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-text-secondary">Or</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setInputMode('capture');
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      className="w-full py-4 bg-white border border-border rounded-2xl font-medium text-text-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      {t('cropAnalysis.captureDesc')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                      <img
                        src={previewUrl}
                        alt="Selected"
                        className="w-full max-h-[500px] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={handleReset}
                          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {!isAnalyzing && !analysisResult && (
                      <button
                        onClick={handleAnalyze}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{t('cropAnalysis.startAnalysisNow')}</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!selectedImage ? (
                  <div className="space-y-6">
                    {!isCameraActive ? (
                      <button
                        onClick={startCamera}
                        className="w-full aspect-[4/3] bg-black rounded-3xl flex flex-col items-center justify-center text-white hover:bg-gray-900 transition-colors"
                      >
                        <Camera className="w-12 h-12 mb-4 opacity-50" />
                        <span className="font-medium text-lg">{t('cropAnalysis.tapToStartCamera')}</span>
                      </button>
                    ) : (
                      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
                          <button
                            onClick={stopCamera}
                            className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                          <button
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                          >
                            <div className="w-16 h-16 bg-white rounded-full active:scale-90 transition-transform" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!isCameraActive && (
                       <button
                        onClick={() => setInputMode('upload')}
                        className="w-full py-4 bg-white border border-border rounded-2xl font-medium text-text-primary hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg">
                      <img
                        src={previewUrl}
                        alt="Captured"
                        className="w-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(null);
                          startCamera();
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>

                    {!isAnalyzing && !analysisResult && (
                      <button
                        onClick={handleAnalyze}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{t('cropAnalysis.startAnalysisNow')}</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl z-10 flex flex-col items-center justify-center p-8"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-border border-t-primary rounded-full mb-8"
                />
                <h3 className="text-xl font-semibold text-text-primary text-center mb-2">
                  {t(loadingKeys[currentMessage])}
                </h3>
                <p className="text-text-secondary text-sm">{t('cropAnalysis.analysisTime')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-4"
              >
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-800 shadow-lg">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && analysisResult.analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">{t('common.analysisRecommendations')}</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-text-primary rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {t('cropAnalysis.analyzeAnother')}
                </button>
              </div>

              {analysisResult.analysis.summary && (
                <div className="glass-card rounded-3xl p-6 border border-blue-100 bg-blue-50/50">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">{t('common.summary')}</h3>
                      <p className="text-blue-800/80 leading-relaxed text-sm">{analysisResult.analysis.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Plant ID */}
              {analysisResult.analysis.plant && analysisResult.analysis.plant.identified && (
                <div className="glass-card rounded-3xl p-8 bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/logo.png" alt="Agro-Rakshak" className="w-10 h-10" />
                    <h3 className="text-xl font-bold text-text-primary">{t('cropAnalysis.plantIdentification')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{t('common.species')}</p>
                      <p className="font-semibold text-lg text-text-primary">{analysisResult.analysis.plant.species}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{t('common.healthStatus')}</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getSeverityColor(analysisResult.analysis.plant.healthStatus)}`}>
                        {analysisResult.analysis.plant.healthStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{t('common.cropType')}</p>
                      <p className="font-semibold text-text-primary">{analysisResult.analysis.plant.cropType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{t('common.confidence')}</p>
                      <p className="font-semibold text-text-primary">{analysisResult.analysis.plant.confidenceScore}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {analysisResult.analysis.diagnosis && analysisResult.analysis.diagnosis.hasIssue && (
                <div className="glass-card rounded-3xl p-8 bg-white border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Bug className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{t('common.diagnosis')}</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{t('common.primaryIssue')}</p>
                      <p className="text-xl font-bold text-text-primary">{analysisResult.analysis.diagnosis.primaryIssue}</p>
                      {analysisResult.analysis.diagnosis.scientificName && (
                        <p className="text-sm text-text-secondary italic mt-1">{analysisResult.analysis.diagnosis.scientificName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">{t('common.cause')}</p>
                        <p className="font-medium text-text-primary">{analysisResult.analysis.diagnosis.causativeAgent}</p>
                      </div>
                       <div>
                        <p className="text-sm text-text-secondary mb-1">{t('common.severity')}</p>
                         <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getSeverityColor(analysisResult.analysis.diagnosis.severity)}`}>
                          {analysisResult.analysis.diagnosis.severity}
                        </span>
                      </div>
                    </div>

                     {analysisResult.analysis.diagnosis.symptoms && analysisResult.analysis.diagnosis.symptoms.length > 0 && (
                      <div>
                        <p className="text-sm text-text-secondary mb-3">{t('common.symptoms')}</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.diagnosis.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-gray-100 text-text-primary rounded-lg text-sm font-medium">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment */}
              {analysisResult.analysis.treatment && (
                <div className={`glass-card rounded-3xl p-8 border ${getUrgencyColor(analysisResult.analysis.treatment.urgency)}`}>
                  <h3 className="text-xl font-bold text-text-primary mb-6">{t('common.treatmentRecommendations')}</h3>
                  
                  <div className="space-y-8">
                    {analysisResult.analysis.treatment.immediateActions && analysisResult.analysis.treatment.immediateActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common.immediateActions')}</h4>
                        <ul className="space-y-2">
                          {analysisResult.analysis.treatment.immediateActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-text-primary">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                       {analysisResult.analysis.treatment.organicTreatments?.length > 0 && (
                        <div>
                           <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3">{t('common.organicTreatments')}</h4>
                           <div className="space-y-3">
                            {analysisResult.analysis.treatment.organicTreatments.map((treatment, idx) => (
                              <div key={idx} className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm">
                                <p className="font-semibold text-text-primary mb-1">{treatment.name}</p>
                                <div className="text-sm text-text-secondary space-y-1">
                                  <p>{treatment.application}</p>
                                  <p><span className="font-medium text-text-primary">{t('common.dosage')}:</span> {treatment.dosage}</p>
                                </div>
                              </div>
                            ))}
                           </div>
                        </div>
                       )}

                       {analysisResult.analysis.treatment.chemicalTreatments?.length > 0 && (
                        <div>
                           <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider mb-3">{t('common.chemicalTreatments')}</h4>
                           <div className="space-y-3">
                            {analysisResult.analysis.treatment.chemicalTreatments.map((treatment, idx) => (
                              <div key={idx} className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
                                <p className="font-semibold text-text-primary mb-1">{treatment.name}</p>
                                <div className="text-sm text-text-secondary space-y-1">
                                  <p>{treatment.type}</p>
                                  <p><span className="font-medium text-text-primary">{t('common.dosage')}:</span> {treatment.dosage}</p>
                                </div>
                              </div>
                            ))}
                           </div>
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
