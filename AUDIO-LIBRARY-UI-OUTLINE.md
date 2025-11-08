# Audio Library - CSS & UI Code Outline

## Overview
Complete audio notification system with customizable sounds generated via Web Audio API. No external audio files required.

---

## 📁 File Structure

```
src/
├── components/
│   └── AudioSettings.jsx         # Main UI component (250 lines)
├── utils/
│   └── audioManager.js            # Audio engine & logic (400 lines)
└── styles/
    └── audioSettings.css          # Complete styling (500 lines)
```

---

## 🎨 CSS Architecture

### **File:** `src/styles/audioSettings.css`

### **1. Layout & Container Styles**

```css
.audio-settings {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0F0F0F 0%, #1a1a1a 100%);
  padding: 2rem 1rem;
}

.audio-settings-container {
  max-width: 1200px;
  margin: 0 auto;
}
```

**Purpose:** 
- Full-height dark gradient background
- Centered 1200px max-width container
- Responsive padding

---

### **2. Header Section**

```css
.audio-settings-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(230, 137, 97, 0.2);
}

.audio-settings-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #E68961 0%, #D4A05F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.audio-settings-subtitle {
  color: #999;
  font-size: 1rem;
}
```

**Features:**
- Gradient text effect (golden brand colors)
- Centered alignment
- Divider line below

---

### **3. Master Controls Section**

```css
.master-controls {
  background: rgba(230, 137, 97, 0.1);
  border: 1px solid rgba(230, 137, 97, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.master-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

**Layout:**
- Highlighted container with golden tint
- Auto-responsive grid (min 250px columns)
- 1.5rem gap between items

---

### **4. Volume Slider (Custom Styling)**

```css
.volume-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #E68961;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  background: #D4A05F;
  transform: scale(1.1);
}
```

**Features:**
- Cross-browser slider styling
- Custom golden thumb
- Hover scale effect
- Smooth transitions

---

### **5. Toggle Button States**

```css
.toggle-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 2px solid;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.toggle-button.enabled {
  background: linear-gradient(135deg, #E68961 0%, #D4A05F 100%);
  border-color: #E68961;
  color: #0F0F0F;
}

.toggle-button.disabled {
  background: transparent;
  border-color: #666;
  color: #666;
}
```

**States:**
- **Enabled:** Golden gradient, dark text
- **Disabled:** Transparent, grey text
- Uppercase with letter-spacing
- Lift effect on hover

---

### **6. Sound Library Grid**

```css
.sounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.sound-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.sound-card:hover {
  background: rgba(230, 137, 97, 0.1);
  border-color: rgba(230, 137, 97, 0.3);
  transform: translateY(-2px);
}
```

**Grid System:**
- Auto-fill columns (min 280px)
- Responsive to screen size
- Cards lift on hover
- Golden tint on hover

---

### **7. Play Button**

```css
.play-button {
  background: rgba(230, 137, 97, 0.2);
  border: 1px solid rgba(230, 137, 97, 0.4);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #E68961;
}

.play-button:hover {
  background: #E68961;
  color: #0F0F0F;
  transform: scale(1.1);
}

.play-button.playing {
  background: #E68961;
  color: #0F0F0F;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

**Features:**
- Circular button (36px)
- Centered icon
- Scale on hover
- Pulse animation when playing

---

### **8. Event Mappings Section**

```css
.mappings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.mapping-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.mapping-dropdown {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.mapping-dropdown:focus {
  border-color: #E68961;
  box-shadow: 0 0 0 3px rgba(230, 137, 97, 0.1);
}
```

**Features:**
- Grid layout (min 320px)
- Custom dropdown styling
- Golden focus ring
- Smooth transitions

---

### **9. Action Buttons**

```css
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #E68961 0%, #D4A05F 100%);
  border-color: #E68961;
  color: #0F0F0F;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(230, 137, 97, 0.5);
}

.reset-btn {
  background: transparent;
  border-color: #666;
  color: #999;
}

.test-btn {
  background: rgba(230, 137, 97, 0.1);
  border-color: #E68961;
  color: #E68961;
}
```

**Button Types:**
- **Save:** Golden gradient (primary action)
- **Reset:** Ghost button (destructive)
- **Test:** Golden outline (secondary)

---

### **10. Responsive Design**

```css
@media (max-width: 768px) {
  .audio-settings {
    padding: 1rem 0.5rem;
  }

  .audio-settings-title {
    font-size: 2rem;
  }

  .master-controls-grid,
  .sounds-grid,
  .mappings-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
```

**Mobile Adjustments:**
- Reduced padding
- Smaller title
- Single column grids
- Stacked buttons

---

## 🎯 React Component Structure

### **File:** `src/components/AudioSettings.jsx`

### **Component Breakdown**

```jsx
export default function AudioSettings() {
  // State Management
  const [settings, setSettings] = useState(audioManager.getSettings());
  const [playingSound, setPlayingSound] = useState(null);

  // Event Handlers
  const handleToggleSounds = () => { /* ... */ };
  const handleVolumeChange = (e) => { /* ... */ };
  const handlePlaySound = (soundId) => { /* ... */ };
  const handleMappingChange = (event, soundId) => { /* ... */ };
  const handleSave = () => { /* ... */ };
  const handleReset = () => { /* ... */ };
  const handleTestAll = () => { /* ... */ };

  // Helper Functions
  const getEventIcon = (event) => { /* ... */ };
  const getEventLabel = (event) => { /* ... */ };

  return (
    <div className="audio-settings">
      {/* 1. Header Section */}
      {/* 2. Master Controls */}
      {/* 3. Sound Library */}
      {/* 4. Event Mappings */}
      {/* 5. Action Buttons */}
    </div>
  );
}
```

---

### **Section 1: Header**

```jsx
<div className="audio-settings-header">
  <h1 className="audio-settings-title">
    <Music className="inline-block mr-3" size={32} />
    Audio Settings
  </h1>
  <p className="audio-settings-subtitle">
    Customize your notification sounds and audio experience
  </p>
</div>
```

**Elements:**
- Title with icon
- Subtitle description
- Centered layout

---

### **Section 2: Master Controls**

```jsx
<div className="master-controls">
  <div className="master-controls-grid">
    {/* Toggle Sounds */}
    <div className="control-group">
      <label className="control-label">
        {settings.enabled ? <Volume2 /> : <VolumeX />}
        Sound Effects
      </label>
      <button
        onClick={handleToggleSounds}
        className={`toggle-button ${settings.enabled ? 'enabled' : 'disabled'}`}
      >
        {settings.enabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>

    {/* Volume Slider */}
    <div className="control-group">
      <label className="control-label">
        <Volume2 />
        Master Volume
      </label>
      <div className="volume-control">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.masterVolume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <span className="volume-value">
          {Math.round(settings.masterVolume * 100)}%
        </span>
      </div>
    </div>
  </div>
</div>
```

**Features:**
- Enable/disable toggle
- Volume slider (0-100%)
- Live percentage display
- Conditional icons

---

### **Section 3: Sound Library**

```jsx
<div className="sound-library">
  <h2 className="section-title">
    <Music size={24} />
    Available Sounds
  </h2>
  <div className="sounds-grid">
    {Object.entries(AVAILABLE_SOUNDS).map(([soundId, sound]) => (
      <div
        key={soundId}
        className={`sound-card ${playingSound === soundId ? 'playing' : ''}`}
      >
        {/* Card Header */}
        <div className="sound-card-header">
          <span className="sound-name">{sound.name}</span>
          <button
            onClick={() => handlePlaySound(soundId)}
            className={`play-button ${playingSound === soundId ? 'playing' : ''}`}
          >
            <Play size={16} fill="currentColor" />
          </button>
        </div>

        {/* Description */}
        <p className="sound-description">{sound.description}</p>

        {/* Parameters */}
        <div className="sound-params">
          <span className="param-badge">{sound.duration}ms</span>
          <span className="param-badge">
            {sound.frequencies.join('Hz + ')}Hz
          </span>
          <span className="param-badge">{sound.type}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Features:**
- Grid of 11 sound cards
- Play button per sound
- Technical details (duration, frequencies, type)
- Visual feedback when playing

---

### **Section 4: Event Mappings**

```jsx
<div className="event-mappings">
  <h2 className="section-title">
    <Bell size={24} />
    Event Sound Mappings
  </h2>
  <div className="mappings-grid">
    {Object.values(SOUND_EVENTS).map((event) => (
      <div key={event} className="mapping-card">
        {/* Header with Icon */}
        <div className="mapping-header">
          <div className="mapping-icon">
            <span style={{ fontSize: '1.5rem' }}>
              {getEventIcon(event)}
            </span>
          </div>
          <h3 className="mapping-title">
            {getEventLabel(event)}
          </h3>
        </div>

        {/* Dropdown Selector */}
        <select
          value={settings.soundMappings[event] || ''}
          onChange={(e) => handleMappingChange(event, e.target.value)}
          className="mapping-dropdown"
        >
          {Object.entries(AVAILABLE_SOUNDS).map(([soundId, sound]) => (
            <option key={soundId} value={soundId}>
              {sound.name}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
</div>
```

**Features:**
- 12 event cards
- Emoji icons per event
- Dropdown to select sound
- Plays preview on change

---

### **Section 5: Action Buttons**

```jsx
<div className="action-buttons">
  {/* Save Button */}
  <button onClick={handleSave} className="action-btn save-btn">
    <CheckCircle size={20} className="inline mr-2" />
    Save Settings
  </button>

  {/* Reset Button */}
  <button onClick={handleReset} className="action-btn reset-btn">
    <AlertCircle size={20} className="inline mr-2" />
    Reset to Defaults
  </button>

  {/* Test All Button */}
  <button
    onClick={handleTestAll}
    className="action-btn test-btn"
    disabled={!settings.enabled}
  >
    <Zap size={20} className="inline mr-2" />
    Test All Sounds
  </button>
</div>
```

**Features:**
- Save to localStorage
- Reset to defaults (with confirm)
- Test all sounds sequentially
- Icons from lucide-react

---

## 🎵 Audio System (audioManager.js)

### **11 Available Sounds**

```javascript
AVAILABLE_SOUNDS = {
  nextel_chirp:      // Classic dual-tone chirp (850Hz + 1200Hz, 150ms)
  ptt_start:         // PTT start (ascending, 100ms)
  ptt_end:           // PTT end (descending, 100ms)
  message_received:  // Notification chime (660Hz + 880Hz, 200ms)
  message_sent:      // Confirmation beep (880Hz + 1100Hz, 150ms)
  success:           // Major chord (523Hz + 659Hz + 784Hz, 250ms)
  error:             // Dissonant buzz (200Hz + 180Hz, 200ms)
  warning:           // Attention beep (440Hz, 300ms)
  click:             // Button click (800Hz, 50ms)
  toggle_on:         // Enable sound (600Hz → 900Hz, 100ms)
  toggle_off:        // Disable sound (900Hz → 600Hz, 100ms)
}
```

### **12 Mappable Events**

```javascript
SOUND_EVENTS = {
  PHONE_OPEN:        'phone_open'
  PHONE_CLOSE:       'phone_close'
  PTT_START:         'ptt_start'
  PTT_END:           'ptt_end'
  MESSAGE_RECEIVED:  'message_received'
  MESSAGE_SENT:      'message_sent'
  SUCCESS:           'success'
  ERROR:             'error'
  WARNING:           'warning'
  BUTTON_CLICK:      'button_click'
  TOGGLE_ON:         'toggle_on'
  TOGGLE_OFF:        'toggle_off'
}
```

---

## 🎨 Design System

### **Color Palette**

```css
Primary Golden:    #E68961
Secondary Golden:  #D4A05F
Accent Golden:     #C49350
Dark Background:   #0F0F0F
Dark Secondary:    #1a1a1a
Text White:        #fff
Text Grey:         #999
Border Subtle:     rgba(255, 255, 255, 0.1)
```

### **Typography**

- **Title:** 2.5rem, weight 800, gradient
- **Section Title:** 1.5rem, weight 700
- **Body:** 1rem
- **Small:** 0.875rem
- **Badge:** 0.75rem, monospace

### **Spacing**

- Container: 1200px max-width
- Grid gaps: 1rem - 1.5rem
- Card padding: 1.25rem - 1.5rem
- Section margins: 2rem - 3rem

### **Borders & Radius**

- Card radius: 12px
- Button radius: 8px
- Badge radius: 6px
- Input radius: 8px

---

## 📱 Responsive Breakpoints

### **Desktop (> 768px)**
- Multi-column grids
- Horizontal action buttons
- Full padding

### **Mobile (≤ 768px)**
- Single column layout
- Stacked buttons
- Reduced padding
- Smaller title

---

## ✨ Interactive Features

### **Hover States**
- Cards lift (-2px)
- Buttons scale or lift
- Border color change
- Background tint

### **Active States**
- Playing cards: Golden background
- Playing button: Pulse animation
- Focus: Golden ring (3px)

### **Transitions**
- Standard: 0.2s ease
- Cards: 0.3s ease
- Smooth property changes

---

## 🔧 Usage Example

```jsx
import AudioSettings from './components/AudioSettings';

// In your router
<Route path="/audio-settings" element={
  <AudioSettings />
} />
```

---

## 💾 LocalStorage Schema

```javascript
{
  "enabled": true,
  "masterVolume": 0.3,
  "soundMappings": {
    "phone_open": "nextel_chirp",
    "ptt_start": "ptt_start",
    // ... all 12 events
  }
}
```

---

## 📊 Component Hierarchy

```
AudioSettings
├── Header
│   ├── Title (with icon)
│   └── Subtitle
├── Master Controls
│   ├── Toggle Button
│   └── Volume Slider
├── Sound Library
│   └── Sound Cards (×11)
│       ├── Name
│       ├── Play Button
│       ├── Description
│       └── Parameter Badges
├── Event Mappings
│   └── Mapping Cards (×12)
│       ├── Icon
│       ├── Event Name
│       └── Sound Dropdown
└── Action Buttons
    ├── Save
    ├── Reset
    └── Test All
```

---

## 🎯 Key CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.audio-settings` | Main container |
| `.master-controls` | Controls section |
| `.volume-slider` | Custom range input |
| `.toggle-button` | Enable/disable button |
| `.sounds-grid` | Sound cards grid |
| `.sound-card` | Individual sound card |
| `.play-button` | Play icon button |
| `.mappings-grid` | Event mappings grid |
| `.mapping-dropdown` | Custom select |
| `.action-btn` | Action buttons |

---

## 🚀 Performance Notes

- **Web Audio API:** Zero external dependencies
- **CSS Animations:** GPU-accelerated transforms
- **Grid Layouts:** Native CSS Grid (no framework)
- **LocalStorage:** Instant persistence
- **No Re-renders:** Efficient state management

---

## ✅ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators (golden ring)
- Disabled states clearly visible
- Color contrast compliance

---

**Total Lines of Code:**
- CSS: ~500 lines
- JSX: ~250 lines
- Audio Logic: ~400 lines
- **Total: ~1,150 lines**
