import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mic, MicOff, Send } from 'lucide-react';
import { Location } from '../types/navigation';

interface ChatbotInputProps {
  locations: Location[];
  onRouteRequest: (startId: string, endId: string) => void;
  disabled?: boolean;
}

export function ChatbotInput({ locations, onRouteRequest, disabled = false }: ChatbotInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hi! I can help you navigate the campus. Try saying something like 'Take me from Main Gate 1 to Food Court' or 'Navigate from Admin Block 1 to Hostel 1'", isUser: false }
  ]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findLocationByName = (text: string): Location | null => {
    const normalizedText = text.toLowerCase().trim();
    
    // Direct matches
    const directMatch = locations.find(loc => 
      loc.name.toLowerCase() === normalizedText ||
      loc.name.toLowerCase().includes(normalizedText) ||
      normalizedText.includes(loc.name.toLowerCase())
    );
    
    if (directMatch) return directMatch;

    // Fuzzy matching for common variations
    const variations: { [key: string]: string } = {
      'gate 1': 'gate1',
      'gate 2': 'gate2',
      'main gate 1': 'gate1',
      'main gate 2': 'gate2',
      'admin 1': 'admin1',
      'admin 2': 'admin2',
      'admin block 1': 'admin1',
      'admin block 2': 'admin2',
      'flag post': 'flagpost',
      'flagpost': 'flagpost',
      'parents stay': 'parents_stay',
      'parents area': 'parents_stay',
      'staff quarters': 'staff_quarters',
      'food court': 'food_court',
      'hostel 1': 'hostel1',
      'hostel one': 'hostel1',
      'sports area': 'sports_area',
      'sports ground': 'sports_area',
      'ground': 'sports_area'
    };

    for (const [variation, locationId] of Object.entries(variations)) {
      if (normalizedText.includes(variation)) {
        return locations.find(loc => loc.id === locationId) || null;
      }
    }

    return null;
  };

  const parseNavigationRequest = (text: string): { start: Location | null; end: Location | null } => {
    const normalizedText = text.toLowerCase();
    
    // Common patterns for navigation requests
    const patterns = [
      /(?:take me |go |navigate |route )?from (.+?) to (.+?)(?:\.|$)/i,
      /(?:take me |go |navigate |route )?(.+?) to (.+?)(?:\.|$)/i,
      /(?:how to get |directions )?from (.+?) to (.+?)(?:\.|$)/i,
      /(?:show me the way |find route )?from (.+?) to (.+?)(?:\.|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        const startLocation = findLocationByName(match[1].trim());
        const endLocation = findLocationByName(match[2].trim());
        
        if (startLocation && endLocation) {
          return { start: startLocation, end: endLocation };
        }
      }
    }

    return { start: null, end: null };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');

    // Parse the navigation request
    const { start, end } = parseNavigationRequest(userMessage);

    if (start && end) {
      if (start.id === end.id) {
        setMessages(prev => [...prev, { 
          text: "Start and end locations cannot be the same. Please choose different locations.", 
          isUser: false 
        }]);
        return;
      }

      setMessages(prev => [...prev, { 
        text: `Great! I'll show you the route from ${start.name} to ${end.name}.`, 
        isUser: false 
      }]);
      
      // Trigger the route generation
      setTimeout(() => {
        onRouteRequest(start.id, end.id);
      }, 500);
    } else {
      // Try to identify individual locations mentioned
      const mentionedLocations = locations.filter(loc => 
        userMessage.toLowerCase().includes(loc.name.toLowerCase()) ||
        findLocationByName(userMessage) === loc
      );

      if (mentionedLocations.length === 0) {
        setMessages(prev => [...prev, { 
          text: "I couldn't identify any campus locations in your message. Try saying something like 'Take me from Main Gate 1 to Food Court' or mention specific location names.", 
          isUser: false 
        }]);
      } else if (mentionedLocations.length === 1) {
        setMessages(prev => [...prev, { 
          text: `I found ${mentionedLocations[0].name}. Please specify both start and end locations for navigation. For example: 'from ${mentionedLocations[0].name} to Food Court'`, 
          isUser: false 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: `I found these locations: ${mentionedLocations.map(l => l.name).join(', ')}. Please specify which one is your start and which is your destination.`, 
          isUser: false 
        }]);
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const supportsSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center mr-3">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Chat Navigation</h3>
        </div>
        <p className="text-slate-600 text-sm">Type or speak your navigation request</p>
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto mb-4 space-y-3 p-3 bg-slate-50/50 rounded-xl">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                message.isUser
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your navigation request..."
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white/80 
                       backdrop-blur-sm text-slate-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
          />
          {supportsSpeechRecognition && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={disabled}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg
                         transition-all duration-200 ${
                isListening
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 
                     text-white hover:from-teal-600 hover:to-teal-700
                     disabled:from-slate-300 disabled:to-slate-400
                     disabled:cursor-not-allowed
                     transform transition-all duration-200 
                     hover:scale-105 disabled:hover:scale-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {isListening && (
        <div className="mt-3 flex items-center justify-center text-red-600 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          Listening...
        </div>
      )}
    </div>
  );
}