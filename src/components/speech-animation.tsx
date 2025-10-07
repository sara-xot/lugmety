import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

interface SpeechAnimationProps {
  isVisible: boolean;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onTranscriptComplete: (text: string) => void;
}

export function SpeechAnimation({ 
  isVisible, 
  isListening, 
  transcript, 
  onClose, 
  onTranscriptComplete
}: SpeechAnimationProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(0));
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Initialize audio visualization and timer
  useEffect(() => {
    if (isListening && isVisible) {
      startSimulatedVisualization();
      startTimeRef.current = Date.now();
    } else {
      stopSimulatedVisualization();
    }

    return () => stopSimulatedVisualization();
  }, [isListening, isVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && isVisible) {
      interval = setInterval(() => {
        if (startTimeRef.current) {
          setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, isVisible]);

  const startSimulatedVisualization = () => {
    let lastUpdateTime = 0;
    const targetFPS = 30; // Limit to 30 FPS to reduce CPU usage
    const frameInterval = 1000 / targetFPS;
    
    const updateVisualization = (currentTime: number) => {
      // Throttle updates to target FPS
      if (currentTime - lastUpdateTime < frameInterval) {
        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
        return;
      }
      
      lastUpdateTime = currentTime;
      
      // Simulate audio levels with random values that look natural
      const baseLevel = 0.3;
      const variation = 0.4;
      const currentLevel = baseLevel + (Math.random() * variation);
      setAudioLevel(currentLevel);
      
      // Create simulated waveform data (40 bars like Claude)
      const waveform = [];
      for (let i = 0; i < 40; i++) {
        // Create a natural looking wave pattern
        const baseHeight = 0.2;
        const wave = Math.sin((Date.now() / 1000 + i * 0.5) * 2) * 0.3 + 0.5;
        const randomVariation = Math.random() * 0.3;
        const height = Math.max(0.1, baseHeight + wave * randomVariation);
        waveform.push(height);
      }
      setWaveformData(waveform);
      
      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(updateVisualization);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  };

  const stopSimulatedVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    setAudioLevel(0);
    setWaveformData(new Array(40).fill(0.1));
    setRecordingDuration(0);
    startTimeRef.current = 0;
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        >
          {/* Main Content Container */}
          <div className="flex flex-col h-full">
            {/* Top Section with conversation */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12"
              >
                <motion.div 
                  animate={{ 
                    scale: isListening ? [1, 1.1, 1] : 1,
                    boxShadow: isListening 
                      ? ['0 0 0 0 rgba(212, 175, 55, 0.7)', '0 0 0 20px rgba(212, 175, 55, 0)', '0 0 0 0 rgba(212, 175, 55, 0)']
                      : 'none'
                  }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 1.5 },
                    boxShadow: { repeat: Infinity, duration: 1.5 }
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <motion.div 
                    animate={{ opacity: isListening ? [0.5, 1, 0.5] : 1 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 bg-white rounded-full" 
                  />
                </motion.div>
                <h2 className="text-2xl text-white mb-2">
                  {isListening ? 'Listening...' : 'Hold to speak'}
                </h2>
                <p className="text-white/70 text-sm">
                  {isListening ? 'Say something!' : 'Release when finished speaking'}
                </p>
              </motion.div>

              {/* Live Transcript */}
              <AnimatePresence>
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full"
                  >
                    <p className="text-white text-center">
                      {transcript}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Audio Control Bar */}
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="relative h-[140px] bg-gradient-to-t from-[#D4AF37]/90 via-[#E6C547]/90 to-[#B8941F]/90 rounded-t-3xl backdrop-blur-sm"
            >
                {/* Waveform Visualization */}
                <div className="flex items-center justify-center h-16 px-8 pt-6">
                  <div className="flex items-center space-x-1">
                    {waveformData.map((value, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          height: `${Math.max(3, value * (isListening ? 40 : 8))}px`,
                          opacity: isListening ? 0.8 + value * 0.2 : 0.3,
                        }}
                        transition={{
                          height: { duration: 0.15, ease: "easeOut" },
                          opacity: { duration: 0.15 }
                        }}
                        className="w-[2px] bg-white rounded-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-6 py-4">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 w-10 h-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  {/* Time Display */}
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-mono">{formatTime(recordingDuration)}</span>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSend}
                    disabled={!transcript.trim()}
                    size="icon"
                    className="bg-white text-[#D4AF37] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}