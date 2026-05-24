// Lightweight TTS helper using the browser SpeechSynthesis API
// Ensures only one utterance at a time and notifies callers via callbacks

let current = {
  id: null,
  utter: null,
  onEnd: null
};

export function speak(text, id, onStart, onEnd) {
  if (!('speechSynthesis' in window) || !text) {
    return;
  }

  // If already speaking something else, stop it and notify previous
  if (current.utter) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    if (current.onEnd) current.onEnd();
    current = { id: null, utter: null, onEnd: null };
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0; // natural rate
  utter.pitch = 1.0; // natural pitch
  utter.lang = navigator.language || 'en-US';

  utter.onstart = () => {
    if (onStart) onStart();
  };

  utter.onend = () => {
    if (onEnd) onEnd();
    if (current && current.id === id) {
      current = { id: null, utter: null, onEnd: null };
    }
  };

  utter.onerror = () => {
    if (onEnd) onEnd();
    if (current && current.id === id) {
      current = { id: null, utter: null, onEnd: null };
    }
  };

  current = { id, utter, onEnd };
  try {
    window.speechSynthesis.speak(utter);
  } catch (e) {
    // if speak fails, cleanup
    if (onEnd) onEnd();
    current = { id: null, utter: null, onEnd: null };
  }
}

export function stop() {
  if (!('speechSynthesis' in window)) return;
  if (current.utter) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    if (current.onEnd) current.onEnd();
    current = { id: null, utter: null, onEnd: null };
  }
}

export function isSpeaking(id) {
  return current && current.id === id && !!current.utter;
}
