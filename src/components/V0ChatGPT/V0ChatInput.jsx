/**
 * V0ChatInput
 * Message input component with voice, attachments, and Web3 features
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, AlertCircle } from 'lucide-react';

const V0ChatInput = ({
  onSendMessage,
  isLoading,
  walletConnected,
  onWalletConnect,
  config,
  maxLength,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Auto-expand textarea
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = config.input.minHeight;
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = parseInt(config.input.maxHeight);
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [message, config.input.minHeight, config.input.maxHeight]);

  // Handle message change
  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // Handle send
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    if (!walletConnected) {
      // Optional: require wallet connection
      console.log('Note: Wallet not connected. Consider connecting for Web3 features.');
    }

    await onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  // Handle file upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Handle voice recording
  const handleVoiceRecord = async () => {
    if (!config.input.enableVoice) return;

    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);

          // Transcribe audio (in real implementation)
          try {
            const formData = new FormData();
            formData.append('file', blob);

            const response = await fetch('/api/v0/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const { text } = await response.json();
              setMessage((prev) => (prev ? prev + ' ' + text : text));
            }
          } catch (err) {
            console.error('Transcription error:', err);
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        // Timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="v0-chat-input-container">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment, i) => (
            <div key={i} className="attachment-item">
              {attachment.type.startsWith('image/') ? (
                <img src={attachment.url} alt="preview" />
              ) : (
                <div className="attachment-icon">📎</div>
              )}
              <button
                className="attachment-remove"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wallet Connection Warning */}
      {!walletConnected && config.web3Components.enableWalletDisplay && (
        <div className="input-warning">
          <AlertCircle size={14} />
          <span>Web3 features available. </span>
          <button onClick={onWalletConnect}>Connect wallet →</button>
        </div>
      )}

      {/* Input Area */}
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={config.input.placeholder}
          disabled={isLoading}
          rows="1"
          style={{
            minHeight: config.input.minHeight,
            maxHeight: config.input.maxHeight,
          }}
        />

        {/* Character count */}
        {message.length > maxLength * 0.8 && (
          <div className="character-count">
            {message.length} / {maxLength}
          </div>
        )}

        {/* Actions */}
        <div className="input-actions">
          {/* Attach File */}
          {config.input.enableAttachments && (
            <>
              <button
                className="action-icon"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
              />
            </>
          )}

          {/* Voice Recording */}
          {config.input.enableVoice && (
            <button
              className={`action-icon voice ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceRecord}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <Mic size={20} />
              {isRecording && <span className="recording-time">{formatTime(recordingTime)}</span>}
            </button>
          )}

          {/* Send Button */}
          <button
            className={`send-button ${isLoading || (!message.trim() && attachments.length === 0) ? 'disabled' : ''}`}
            onClick={handleSendMessage}
            disabled={isLoading || (!message.trim() && attachments.length === 0)}
            title="Send message"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="input-helper">
        <small>
          {config.input.enableCommands && 'Commands: / | '}
          {config.input.enableMentions && 'Mentions: @ | '}
          Shift + Enter for new line
        </small>
      </div>
    </div>
  );
};

export default V0ChatInput;
