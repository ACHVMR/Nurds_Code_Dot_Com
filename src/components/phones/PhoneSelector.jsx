import React, { useState, useEffect } from 'react';
import Nxtl from './Nxtl';        // Nextel → Nxtl
import BlkBrry from './BlkBrry';    // BlackBerry → BlkBrry
import TchScrn from './TchScrn';    // TouchScreen → TchScrn
import RcrdBx from './RcrdBx';      // RecordBox → RcrdBx
import Clssc from './Clssc';        // Classic → Clssc
import V0Chat from '../V0Chat';     // Add V0 interface option
import './PhoneSelector.css';

const PhoneSelector = ({ userId, onMessageSend, onVoiceRecord }) => {
  const [selectedPhone, setSelectedPhone] = useState('nxtl');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem(`phone_preference_${userId}`);
    if (savedPhone) setSelectedPhone(savedPhone);
  }, [userId]);

  const handlePhoneChange = (phoneType) => {
    setSelectedPhone(phoneType);
    localStorage.setItem(`phone_preference_${userId}`, phoneType);
    setShowSelector(false);
  };

  const phones = [
    { type: 'nxtl', name: 'Nxtl', icon: '📱', description: 'Chirp walkie-talkie' },
    { type: 'blkbrry', name: 'BlkBrry', icon: '🔒', description: 'Secure keyboard' },
    { type: 'tchscrn', name: 'TchScrn', icon: '📲', description: 'Modern touch' },
    { type: 'rcrdbx', name: 'RcrdBx', icon: '📼', description: 'Vintage tape' },
    { type: 'clssc', name: 'Clssc', icon: '💬', description: 'Standard chat' },
    { type: 'v0', name: 'Nurd Chat', icon: '🔊', description: 'CHIRP AI Assistant' }
  ];

  return (
    <div className="phone-selector-wrapper">
      <button 
        className="phone-selector-toggle"
        onClick={() => setShowSelector(!showSelector)}
        title="Choose Interface"
      >
        {phones.find(p => p.type === selectedPhone)?.icon} ▼
      </button>

      {showSelector && (
        <div className="phone-selector-menu">
          <h3>Choose Your Interface</h3>
          <div className="phone-grid">
            {phones.map(phone => (
              <button
                key={phone.type}
                className={`phone-option ${selectedPhone === phone.type ? 'active' : ''}`}
                onClick={() => handlePhoneChange(phone.type)}
              >
                <span className="phone-icon">{phone.icon}</span>
                <span className="phone-name">{phone.name}</span>
                <span className="phone-desc">{phone.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="phone-container">
        {selectedPhone === 'nxtl' && <Nxtl onMessageSend={onMessageSend} onVoiceRecord={onVoiceRecord} />}
        {selectedPhone === 'blkbrry' && <BlkBrry onMessageSend={onMessageSend} onVoiceRecord={onVoiceRecord} />}
        {selectedPhone === 'tchscrn' && <TchScrn onMessageSend={onMessageSend} onVoiceRecord={onVoiceRecord} />}
        {selectedPhone === 'rcrdbx' && <RcrdBx onMessageSend={onMessageSend} onVoiceRecord={onVoiceRecord} />}
        {selectedPhone === 'clssc' && <Clssc onMessageSend={onMessageSend} onVoiceRecord={onVoiceRecord} />}
        {selectedPhone === 'v0' && <V0Chat onMessageSend={onMessageSend} />}
      </div>
    </div>
  );
};

export default PhoneSelector;
