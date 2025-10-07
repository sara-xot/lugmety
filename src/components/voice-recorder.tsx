import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button';

interface VoiceRecorderProps {
  isVisible: boolean;
  onClose: () => void;
  onSend: (transcript: string) => void;
}

interface WaveformBarProps {
  height: number;
  delay: number;
  isRecording: boolean;
}

const WaveformBar = ({ height, delay, isRecording }: WaveformBarProps) => (
  <motion.div
    className="bg-primary rounded-full w-1"
    initial={{ height: 4 }}
    animate={{
      height: isRecording ? [4, height, 4] : 4,
    }}
    transition={{
      duration: 1.2,
      repeat: isRecording ? Infinity : 0,
      delay: delay,
      ease: "easeInOut"
    }}
  />
);

export function VoiceRecorder({ isVisible, onClose, onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition when component mounts
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = () => {
        // Silent error handling for prototype
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start recording when component becomes visible
  useEffect(() => {
    if (isVisible && !isRecording) {
      startRecording();
    }
  }, [isVisible]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscript('');
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      try {
        recognitionRef.current.start();
      } catch (error) {
        // Silent error for prototype
        console.log('Mock recording started');
        // For prototype: simulate some text appearing
        setTimeout(() => {
          setTranscript('This is a mock transcription for prototype purposes');
        }, 2000);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Silent error handling
      }
    }
    
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClose = () => {
    stopRecording();
    onClose();
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSend(transcript.trim());
      stopRecording();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Voice Recording Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-3xl"
          >
            <div className="px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Recording</div>
                  <div className="text-lg font-medium text-primary">
                    {formatTime(recordingTime)}
                  </div>
                </div>
                
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={handleSend}
                  disabled={!transcript.trim()}
                  className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30 disabled:bg-muted"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Waveform Visualization */}
              <div className="flex items-center justify-center gap-1 mb-8 h-20">
                {Array.from({ length: 20 }, (_, i) => (
                  <WaveformBar
                    key={i}
                    height={Math.random() * 60 + 20}
                    delay={i * 0.1}
                    isRecording={isRecording}
                  />
                ))}
              </div>

              {/* Transcript Preview */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-2xl p-4 min-h-[60px] mb-6"
                >
                  <div className="text-sm text-muted-foreground mb-2">Transcript:</div>
                  <div className="text-foreground">{transcript}</div>
                </motion.div>
              )}

              {/* Recording Indicator */}
              <div className="text-center">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {isRecording ? "Listening..." : "Processing..."}
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Speak naturally and tap send when finished
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}