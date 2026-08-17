const speechService = {
  recognition: null,
  synthesis: window.speechSynthesis,

  // Initialize speech recognition
  initRecognition: () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechService.recognition = new SpeechRecognition();
      speechService.recognition.continuous = false;
      speechService.recognition.interimResults = false;
      speechService.recognition.lang = 'hi-IN'; // Hindi by default
    }
  },

  // Start listening
  startListening: (callback) => {
    return new Promise((resolve, reject) => {
      if (!speechService.recognition) {
        speechService.initRecognition();
      }

      if (!speechService.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      speechService.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        callback(transcript);
        resolve(transcript);
      };

      speechService.recognition.onerror = (event) => {
        reject(event.error);
      };

      speechService.recognition.start();
    });
  },

  // Stop listening
  stopListening: () => {
    if (speechService.recognition) {
      speechService.recognition.stop();
    }
  },

  speak: (text, lang = 'en-US', options = {}) => {
    return new Promise((resolve, reject) => {
      if (!speechService.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechService.synthesis.cancel();

      // Helper function to get voices (with retry if not loaded)
      const getVoices = () => {
        let voices = speechService.synthesis.getVoices();
        // If voices not loaded yet, wait a bit and try again
        if (voices.length === 0) {
          // Trigger voiceschanged event by calling getVoices again
          voices = speechService.synthesis.getVoices();
        }
        return voices;
      };

      // Wait for voices to be available
      const waitForVoices = () => {
        return new Promise((voiceResolve) => {
          let voices = getVoices();
          if (voices.length > 0) {
            voiceResolve(voices);
            return;
          }

          // Wait for voices to load
          const onVoicesChanged = () => {
            voices = getVoices();
            if (voices.length > 0) {
              speechService.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
              voiceResolve(voices);
            }
          };

          speechService.synthesis.addEventListener('voiceschanged', onVoicesChanged);
          
          // Timeout after 2 seconds
          setTimeout(() => {
            speechService.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
            voiceResolve(getVoices());
          }, 2000);
        });
      };

      // Main speak logic
      waitForVoices().then((voices) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = typeof options.rate === 'number' ? options.rate : 0.9;
        utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1.1;
        utterance.volume = typeof options.volume === 'number' ? options.volume : 1.0;

        // Try to find a female voice
        const femaleVoices = voices.filter(voice => {
          const voiceName = voice.name.toLowerCase();
          return voiceName.includes('female') || 
                 voiceName.includes('zira') || 
                 voiceName.includes('samantha') ||
                 voiceName.includes('karen') ||
                 voiceName.includes('susan') ||
                 voiceName.includes('hazel') ||
                 voiceName.includes('heather') ||
                 (voiceName.includes('google') && voiceName.includes('english') && voiceName.includes('female'));
        });

        if (options.voiceName) {
          const byName = voices.find(v => v.name === options.voiceName);
          if (byName) {
            utterance.voice = byName;
          }
        }
        if (!utterance.voice) {
          if (femaleVoices.length > 0) {
            const preferredVoice = femaleVoices.find(v => 
              v.name.toLowerCase().includes('google') && 
              v.name.toLowerCase().includes('uk') &&
              v.name.toLowerCase().includes('female')
            ) || femaleVoices.find(v => 
              v.name.toLowerCase().includes('google') && 
              v.name.toLowerCase().includes('female')
            ) || femaleVoices[0];
            utterance.voice = preferredVoice;
          } else if (voices.length > 0) {
            utterance.voice = voices[0];
          }
        }

        utterance.onend = () => {
          console.log('Speech ended');
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          reject(event);
        };

        utterance.onstart = () => {
          console.log('Speech started');
        };

        try {
          speechService.synthesis.speak(utterance);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  // Get available voices
  getVoices: () => {
    return speechService.synthesis.getVoices();
  },

  // Change language
  setLanguage: (lang) => {
    if (speechService.recognition) {
      speechService.recognition.lang = lang;
    }
  },

  stopSpeaking: () => {
    if (speechService.synthesis) {
      speechService.synthesis.cancel();
    }
  }
};

export default speechService;
