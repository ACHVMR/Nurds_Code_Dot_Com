import React, { useMemo, useRef, useState } from 'react';

function formatTime(date) {
  return date.toLocaleTimeString();
}

export default function TestPermissions() {
  const [lines, setLines] = useState([]);
  const statusRef = useRef(null);

  const log = (message, level = 'info') => {
    setLines((prev) => {
      const next = [...prev, { t: new Date(), message, level }];
      return next;
    });

    // Scroll after render
    setTimeout(() => {
      if (statusRef.current) {
        statusRef.current.scrollTop = statusRef.current.scrollHeight;
      }
    }, 0);
  };

  const levelClass = useMemo(
    () => ({
      info: 'text-slate-200',
      warn: 'text-yellow-300',
      ok: 'text-green-300',
      err: 'text-red-300',
    }),
    []
  );

  const testCamera = async () => {
    try {
      log('Requesting camera permission...', 'warn');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      log('Camera access granted.', 'ok');
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      log(`Camera error: ${err?.message || String(err)}`, 'err');
    }
  };

  const testMic = async () => {
    try {
      log('Requesting microphone permission...', 'warn');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      log('Microphone access granted.', 'ok');
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      log(`Mic error: ${err?.message || String(err)}`, 'err');
    }
  };

  const testSpeaker = async () => {
    try {
      log('Testing speaker...', 'warn');
      // Tiny silent WAV; enough to exercise the output pipeline.
      const audio = new Audio(
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
      );
      await audio.play();
      log('Speaker playback started.', 'ok');
    } catch (err) {
      log(`Speaker error: ${err?.message || String(err)}`, 'err');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">Permission Tests</h1>

      <div className="space-y-3">
        <button
          onClick={testCamera}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
        >
          Test Camera
        </button>

        <button
          onClick={testMic}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
        >
          Test Microphone
        </button>

        <button
          onClick={testSpeaker}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
        >
          Test Speaker
        </button>

        <div
          ref={statusRef}
          className="mt-4 p-4 rounded-lg bg-black/30 border border-white/10 min-h-[140px] max-h-[320px] overflow-auto font-mono text-sm"
        >
          {lines.length === 0 ? (
            <div className="text-slate-400">No events yet.</div>
          ) : (
            lines.map((l, idx) => (
              <div key={idx} className={levelClass[l.level] || levelClass.info}>
                {formatTime(l.t)}: {l.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
