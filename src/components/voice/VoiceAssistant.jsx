import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, MessageSquare, User, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import speechService from '../../services/speechService';
import geminiService from '../../services/geminiService';

export default function VoiceAssistant({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversation, setConversation] = useState([]);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const [ttsLang, setTtsLang] = useState('en-US');
  const [ttsRate, setTtsRate] = useState(0.9);
  const [ttsPitch, setTtsPitch] = useState(1.1);
  const [ttsVoiceName, setTtsVoiceName] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const recognitionRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setRecognitionSupported(!!SpeechRecognition);
    setSynthesisSupported('speechSynthesis' in window);

    // Initialize speech recognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = i18n.language; // Can be changed to 'hi-IN' for Hindi

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuestion(transcript);
        handleQuestion(transcript);
      };

      recognitionRef.current.onerror = (event) => {
         console.error('Speech recognition error:', event.error);
         setIsListening(false);
         if (event.error === 'no-speech') {
           alert(t('voiceAssistant.noSpeechDetected'));
         } else if (event.error === 'not-allowed') {
           alert(t('voiceAssistant.microphonePermissionDenied'));
         }
       };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load voices when available
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (!ttsVoiceName && voices.length > 0) {
          setTtsVoiceName(voices[0].name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (_) {
      window.scrollTo(0, 0)
    }
  }, [])

  // Scroll to bottom when conversation updates
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

   const startListening = () => {
     if (!recognitionSupported) {
       alert(t('voiceAssistant.speechRecognitionNotSupported'));
       return;
     }

    if (recognitionRef.current) {
      try {
        setCurrentQuestion('');
        setCurrentResponse('');
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleQuestion = async (question) => {
    if (!question.trim()) return;

    setIsListening(false);
    setIsProcessing(true);
    setCurrentQuestion(question);

    try {
      // Send question to Gemini API
      const response = await geminiService.askGemini(question);
      setCurrentResponse(response);

      // Add to conversation history
      const newEntry = {
        id: Date.now(),
        question,
        answer: response,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, newEntry]);

      if (synthesisSupported && autoSpeak) {
        setIsSpeaking(true);
        try {
          await speechService.speak(response, ttsLang, { rate: ttsRate, pitch: ttsPitch, voiceName: ttsVoiceName });
       } catch (ttsError) {
           console.error('TTS Error:', ttsError);
           alert(t('voiceAssistant.textToSpeechFailed'));
         } finally {
          setIsSpeaking(false);
        }
      } else {
        
      }
    } catch (error) {
      console.error('Error processing question:', error);
      const errorMessage = t('voiceAssistant.errorMessage');
      setCurrentResponse(errorMessage);
      
      const newEntry = {
        id: Date.now(),
        question,
        answer: errorMessage,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, newEntry]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(i18n.language, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('voiceAssistant.backToDashboard')}</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-800 flex items-center space-x-2">
                <MessageSquare className="w-6 h-6" />
                <span>{t('navbar.voiceAssist')}</span>
              </h1>
            </div>
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{t('voiceAssistant.loggedInAs', { name: user.name })}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Browser Support Warning */}
         {(!recognitionSupported || !synthesisSupported) && (
           <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
             <p className="text-yellow-800 text-sm">
               <strong>{t('errors.browserSupport')}</strong> {t('errors.browserSupportWarning')}
               {!recognitionSupported && ` ${t('errors.speechRecognitionRequires')}`}
               {!synthesisSupported && ` ${t('errors.textToSpeechNotSupported')}`}
             </p>
           </div>
         )}

        {/* Main Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="flex flex-col items-center space-y-6">
            {/* Recording Status Indicator */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {isListening && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">{t('common.loading')}</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-blue-600 font-medium">{t('common.loading')}</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-purple-500 animate-pulse" />
                  <span className="text-purple-600 font-medium">{t('common.loading')}</span>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={startListening}
                disabled={isListening || isProcessing || isSpeaking}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isListening || isProcessing || isSpeaking
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                } w-full sm:w-auto`}
              >
                <Mic className="w-5 h-5" />
                <span>{t('navbar.voiceAssist')}</span>
              </button>

               <button
                 onClick={stopListening}
                 disabled={!isListening}
                 className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                   !isListening
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                 } w-full sm:w-auto`}
               >
                 <MicOff className="w-5 h-5" />
                 <span>{t('common.close')}</span>
               </button>
              <button
                onClick={async () => {
                  if (!currentResponse || !synthesisSupported) return;
                  setIsSpeaking(true);
                  try {
                    await speechService.speak(currentResponse, ttsLang, { rate: ttsRate, pitch: ttsPitch, voiceName: ttsVoiceName });
                  } catch (e) {
                    alert(t('voiceAssistant.textToSpeechFailed'));
                  } finally {
                    setIsSpeaking(false);
                  }
                }}
                 disabled={!currentResponse || isSpeaking}
                 className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                   !currentResponse || isSpeaking
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                 } w-full sm:w-auto`}
               >
                 <Volume2 className="w-5 h-5" />
                 <span>{t('voiceAssistant.speakResponse')}</span>
               </button>
               <button
                 onClick={() => speechService.stopSpeaking()}
                 className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto`}
               >
                 <span>{t('voiceAssistant.stopSpeech')}</span>
              </button>
            </div>

            {/* Current Question Display */}
             {currentQuestion && (
               <div className="w-full bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                 <div className="flex items-start space-x-2">
                   <User className="w-5 h-5 text-blue-600 mt-1" />
                   <div className="flex-1">
                     <p className="text-sm font-medium text-blue-800 mb-1">{t('voiceAssistant.detectedQuestion')}</p>
                     <p className="text-gray-700">{currentQuestion}</p>
                   </div>
                 </div>
               </div>
             )}

             {/* Current Response Display */}
             {currentResponse && (
               <div className="w-full bg-green-50 rounded-lg p-4 border-2 border-green-200">
                 <div className="flex items-start space-x-2">
                   <Bot className="w-5 h-5 text-green-600 mt-1" />
                   <div className="flex-1">
                     <p className="text-sm font-medium text-green-800 mb-1">{t('voiceAssistant.aiResponse')}</p>
                     <p className="text-gray-700 whitespace-pre-wrap">{currentResponse}</p>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>

         <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('voiceAssistant.language')}</label>
               <select
                 value={ttsLang}
                 onChange={(e) => setTtsLang(e.target.value)}
                 className="w-full border rounded-lg p-2"
               >
                 <option value="en-US">{t('voiceAssistant.englishUS')}</option>
                 <option value="hi-IN">{t('voiceAssistant.hindiIndia')}</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('voiceAssistant.autoSpeak')}</label>
               <div className="flex items-center space-x-2">
                 <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
                 <span className="text-gray-700 text-sm">{t('voiceAssistant.speakAnswersAutomatically')}</span>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('voiceAssistant.voice')}</label>
               <select
                 value={ttsVoiceName}
                 onChange={(e) => setTtsVoiceName(e.target.value)}
                 className="w-full border rounded-lg p-2"
               >
                 {availableVoices.map(v => (
                   <option key={v.name} value={v.name}>{v.name}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('voiceAssistant.rate')}</label>
               <input type="range" min="0.5" max="1.5" step="0.05" value={ttsRate} onChange={(e) => setTtsRate(parseFloat(e.target.value))} className="w-full" />
               <div className="text-xs text-gray-600 mt-1">{ttsRate.toFixed(2)}</div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('voiceAssistant.pitch')}</label>
               <input type="range" min="0.5" max="2" step="0.05" value={ttsPitch} onChange={(e) => setTtsPitch(parseFloat(e.target.value))} className="w-full" />
               <div className="text-xs text-gray-600 mt-1">{ttsPitch.toFixed(2)}</div>
             </div>
           </div>
         </div>

         {/* Conversation History */}
         <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
             <MessageSquare className="w-5 h-5" />
             <span>{t('voiceAssistant.conversationHistory')}</span>
           </h2>
           
           {conversation.length === 0 ? (
             <div className="text-center py-12 text-gray-500">
               <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
               <p>{t('voiceAssistant.noConversations')}</p>
             </div>
           ) : (
             <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
               {conversation.map((entry) => (
                 <div key={entry.id} className="space-y-3">
                   {/* Question */}
                   <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                     <div className="flex items-start space-x-2">
                       <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                       <div className="flex-1">
                         <div className="flex items-center justify-between mb-1">
                           <p className="text-sm font-medium text-blue-800">{t('voiceAssistant.you')}</p>
                           <p className="text-xs text-gray-500">{formatTime(entry.timestamp)}</p>
                         </div>
                         <p className="text-gray-700">{entry.question}</p>
                       </div>
                     </div>
                   </div>

                   {/* Answer */}
                   <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                     <div className="flex items-start space-x-2">
                       <Bot className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                       <div className="flex-1">
                         <div className="flex items-center justify-between mb-1">
                           <p className="text-sm font-medium text-green-800">{t('voiceAssistant.aiAssistant')}</p>
                           <p className="text-xs text-gray-500">{formatTime(entry.timestamp)}</p>
                         </div>
                         <p className="text-gray-700 whitespace-pre-wrap">{entry.answer}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
               <div ref={conversationEndRef} />
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
