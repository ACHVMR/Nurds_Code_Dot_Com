import { useState, useCallback, useEffect } from 'react';
import { audioManager } from '../utils/audioLibrary';

/**
 * Custom hook for Nextel phone state management
 * Handles open/closed state and chirp sounds using Audio Manager
 */
export const useNextelPhone = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Sync sounds enabled state with audio manager
  useEffect(() => {
    audioManager.setEnabled(soundsEnabled);
  }, [soundsEnabled]);

  const playChirp = useCallback((eventType) => {
    if (!soundsEnabled) return;
    audioManager.play(eventType);
  }, [soundsEnabled]);

  const openPhone = useCallback(() => {
    setIsOpen(true);
    playChirp('phoneOpen');
  }, [playChirp]);

  const closePhone = useCallback(() => {
    setIsOpen(false);
    playChirp('phoneClose');
  }, [playChirp]);

  const togglePhone = useCallback(() => {
    if (isOpen) {
      closePhone();
    } else {
      openPhone();
    }
  }, [isOpen, openPhone, closePhone]);

  const playMessageChirp = useCallback(() => {
    playChirp('messageReceived');
  }, [playChirp]);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(prev => !prev);
  }, []);

  return {
    isOpen,
    soundsEnabled,
    openPhone,
    closePhone,
    togglePhone,
    playMessageChirp,
    toggleSounds
  };
};
