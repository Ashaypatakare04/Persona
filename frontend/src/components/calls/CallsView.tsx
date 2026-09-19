import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  UserCheck,
  Play,
  Clock,
  Shield,
  Bot,
  User,
  Radio,
} from 'lucide-react';
import { Call, Contact } from '../../types';
import { api } from '../../services/api';

interface CallsViewProps {
  calls: Call[];
  contacts: Contact[];
  onRefresh: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({ calls, contacts, onRefresh }) => {
  const [selectedCall, setSelectedCall] = useState<Call | null>(calls[0] || null);

  // Voice Simulator State
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  const [activeCallerName, setActiveCallerName] = useState('Prof. Sanjeev Rao');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<
    Array<{ speaker: string; text: string; time: string }>
  >([]);
  const [typedVoiceTurn, setTypedVoiceTurn] = useState('');
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'active' | 'taken_over' | 'ended'>('active');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Sync selected call when calls change
  useEffect(() => {
    if (!selectedCall && calls.length > 0) {
      setSelectedCall(calls[0]);
    }
  }, [calls, selectedCall]);

  // Call duration counter
  useEffect(() => {
    if (isSimulatingCall && callStatus !== 'ended') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSimulatingCall, callStatus]);

  // Web Speech STT Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleVoiceTurn(transcript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
  };

  // Browser TTS Speak function
  const speakText = (text: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartCall = () => {
    setIsSimulatingCall(true);
    setCallStatus('active');
    setCallDuration(0);
    const initialTranscript = [
      {
        speaker: 'system',
        text: `Incoming call started with ${activeCallerName}. Persona AI Representative connected.`,
        time: '00:00',
      },
      {
        speaker: 'ai_representative',
        text: `Hello, I am Ashay's AI representative. How can I assist you today?`,
        time: '00:01',
      },
    ];
    setVoiceTranscript(initialTranscript);
    speakText("Hello, I am Ashay's AI representative. How can I assist you today?");
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsListening(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onRefresh();
  };

  const handleTakeoverCall = () => {
    setCallStatus('taken_over');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceTranscript((prev) => [
      ...prev,
      {
        speaker: 'system',
        text: `Ashay has taken over the call in person. AI representative muted.`,
        time: formatDuration(callDuration),
      },
    ]);
  };

  const handleVoiceTurn = async (inputText: string) => {
    if (!inputText.trim()) return;

    const timeStr = formatDuration(callDuration);
    setVoiceTranscript((prev) => [
      ...prev,
      { speaker: 'caller', text: inputText, time: timeStr },
    ]);

    if (callStatus === 'taken_over') {
      return;
    }

    try {
      // Send through simulate endpoint to evaluate AI response
      const res = await api.simulateIncoming({
        channel: 'call',
        sender_name: activeCallerName,
        message_content: inputText,
      });

      const aiReply =
        res.sent_response ||
        res.trace.generated_response ||
        "I'll make sure Ashay receives your message and gets back to you.";

      const aiTimeStr = formatDuration(callDuration + 1);
      setVoiceTranscript((prev) => [
        ...prev,
        { speaker: 'ai_representative', text: aiReply, time: aiTimeStr },
      ]);

      speakText(aiReply);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Voice Call Simulator Launch */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Browser Voice Engine (STT + TTS)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Live Voice Representative Simulator
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Simulate a real voice call using your microphone (Speech-to-Text) and Persona's voice synthesis (Text-to-Speech) in the browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeCallerName}
            onChange={(e) => setActiveCallerName(e.target.value)}
            disabled={isSimulatingCall && callStatus === 'active'}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="Prof. Sanjeev Rao">Prof. Sanjeev Rao (Professor)</option>
            <option value="Rohan Sharma">Rohan Sharma (Friend)</option>
            <option value="Sarah Jenkins">Sarah Jenkins (Client)</option>
            <option value="Unknown Inquirer">Unknown Inquirer (Stranger)</option>
          </select>

          {!isSimulatingCall || callStatus === 'ended' ? (
            <button
              onClick={handleStartCall}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
            >
              <PhoneCall className="w-4 h-4" />
              Start Voice Call
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          )}
        </div>
      </div>

      {/* Active Call Live Simulation Window (When Call is Active) */}
      {isSimulatingCall && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{activeCallerName}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-emerald-400">{formatDuration(callDuration)}</span>
                  <span>•</span>
                  <span className="capitalize">{callStatus.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Live Call Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceMuted(!voiceMuted)}
                className={`p-2 rounded-xl border text-xs font-medium transition ${
                  voiceMuted
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title={voiceMuted ? 'Unmute TTS' : 'Mute TTS voice'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {callStatus === 'active' ? (
                <button
                  onClick={handleTakeoverCall}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <UserCheck className="w-4 h-4" />
                  Take Over Call
                </button>
              ) : (
                <button
                  onClick={() => setCallStatus('active')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <Play className="w-4 h-4" />
                  Continue AI
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>
          </div>

          {/* Live Transcript Turns */}
          <div className="h-64 overflow-y-auto space-y-2.5 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
            {voiceTranscript.map((t, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  t.speaker === 'caller'
                    ? 'text-slate-300'
                    : t.speaker === 'ai_representative'
                    ? 'text-purple-300 bg-purple-950/20 p-2 rounded-lg border border-purple-900/30'
                    : 'text-amber-400 italic text-[11px]'
                }`}
              >
                <span className="font-mono text-slate-500 shrink-0">{t.time}</span>
                <span className="font-semibold capitalize shrink-0">
                  {t.speaker.replace('_', ' ')}:
                </span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>

          {/* Voice Input Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold shadow transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Listening (Speak Now)...' : 'Speak via Mic'}</span>
            </button>

            <input
              type="text"
              placeholder="Or type what the caller says..."
              value={typedVoiceTurn}
              onChange={(e) => setTypedVoiceTurn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVoiceTurn(typedVoiceTurn);
                  setTypedVoiceTurn('');
                }
              }}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => {
                handleVoiceTurn(typedVoiceTurn);
                setTypedVoiceTurn('');
              }}
              disabled={!typedVoiceTurn.trim()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl"
            >
              Say Turn
            </button>
          </div>
        </div>
      )}

      {/* Historic Call Logs List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-3">Call History & Transcripts</h3>
        {calls.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No voice calls logged yet. Click "Start Voice Call" above to simulate a call!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {calls.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCall(c)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">
                      {c.caller_name || c.caller_phone || `Call #${c.id}`}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{c.summary || 'Completed Call'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {c.risk_level} RISK
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {formatDuration(c.duration_seconds)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
