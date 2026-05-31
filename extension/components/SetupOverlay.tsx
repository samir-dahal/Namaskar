import { useState, useRef } from 'react';
import type { UserSettings } from '../utils/storage';
import { userSettings } from '../utils/storage';

interface SetupOverlayProps {
  onComplete: (settings: UserSettings) => void;
}

export function SetupOverlay({ onComplete }: SetupOverlayProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 40) {
      setError('Name must be 40 characters or fewer.');
      return;
    }

    const updated: UserSettings = {
      ...userSettings.fallback!,
      name: trimmed,
      isSetupComplete: true,
    };
    await userSettings.setValue(updated);
    onComplete(updated);
  };

  return (
    <div className="setup-overlay" role="dialog" aria-modal="true" aria-label="Setup">
      <div className="setup-card">
        <div className="setup-header">
          <h1 className="setup-logo">Namaskar</h1>
          <p className="setup-tagline" lang="ne">तपाईंको नेपाल, हरेक नयाँ ट्याबमा।</p>
          <p className="setup-subtitle">Your Nepal, every new tab.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form" noValidate>
          <label htmlFor="setup-name" className="setup-label">
            What should we call you?
          </label>
          <input
            id="setup-name"
            ref={inputRef}
            type="text"
            className={`setup-input${error ? ' setup-input--error' : ''}`}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.form?.requestSubmit();
            }}
            maxLength={40}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <p className="setup-error" role="alert">{error}</p>
          )}
          <button type="submit" className="setup-btn">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
