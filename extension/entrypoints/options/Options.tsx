import { useState, useEffect } from 'react';
import { userSettings, dailyCache, type UserSettings } from '../../utils/storage';

export default function Options() {
  const [form, setForm] = useState<UserSettings>(userSettings.fallback!);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userSettings.getValue().then((s) => {
      setForm(s);
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await userSettings.setValue({ ...form, isSetupComplete: true });
    // Clear cache so next new tab fetches fresh data
    await dailyCache.setValue(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    if (!confirm('Reset all Namaskar data? This cannot be undone.')) return;
    await userSettings.setValue(userSettings.fallback!);
    await dailyCache.setValue(null);
    setForm(userSettings.fallback!);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="options-page">
        <div className="options-loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="options-page">
      <div className="options-container">
        <header className="options-header">
          <h1 className="options-title">Namaskar</h1>
          <p className="options-sub">Settings</p>
        </header>

        <form onSubmit={handleSave} className="options-form" noValidate>
          {/* Personal */}
          <section className="options-section">
            <h2 className="section-title">Personal</h2>

            <div className="field">
              <label className="field-label" htmlFor="opt-name">Your name</label>
              <input
                id="opt-name"
                type="text"
                className="field-input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={40}
                placeholder="Enter your name"
              />
            </div>
          </section>

          {/* Location */}
          <section className="options-section">
            <h2 className="section-title">Location</h2>

            <div className="field">
              <label className="field-label" htmlFor="opt-city">City name</label>
              <input
                id="opt-city"
                type="text"
                className="field-input"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                maxLength={60}
                placeholder="e.g. Kathmandu"
              />
              <p className="field-hint">Shown next to the weather temperature.</p>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="opt-lat">Latitude</label>
                <input
                  id="opt-lat"
                  type="number"
                  className="field-input"
                  value={form.latitude}
                  onChange={(e) => update('latitude', parseFloat(e.target.value) || 0)}
                  step="0.0001"
                  min="-90"
                  max="90"
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="opt-lon">Longitude</label>
                <input
                  id="opt-lon"
                  type="number"
                  className="field-input"
                  value={form.longitude}
                  onChange={(e) => update('longitude', parseFloat(e.target.value) || 0)}
                  step="0.0001"
                  min="-180"
                  max="180"
                />
              </div>
            </div>
          </section>

          {/* Display */}
          <section className="options-section">
            <h2 className="section-title">Display</h2>

            <label className="toggle-row">
              <span className="toggle-label">Show weather</span>
              <span className="toggle-track">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={form.showWeather}
                  onChange={(e) => update('showWeather', e.target.checked)}
                />
                <span className="toggle-thumb" />
              </span>
            </label>

            <label className="toggle-row">
              <span className="toggle-label">Show tithi</span>
              <span className="toggle-track">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={form.showTithi}
                  onChange={(e) => update('showTithi', e.target.checked)}
                />
                <span className="toggle-thumb" />
              </span>
            </label>

            <div className="field">
              <label className="field-label">Date language</label>
              <p className="field-hint">
                Controls how the Nepali date, weekday, tithi, and events are displayed.
              </p>
              <div className="segmented">
                <button
                  type="button"
                  className={`seg-btn${form.dateLanguage === 'en' ? ' seg-btn--active' : ''}`}
                  onClick={() => update('dateLanguage', 'en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`seg-btn${form.dateLanguage === 'ne' ? ' seg-btn--active' : ''}`}
                  onClick={() => update('dateLanguage', 'ne')}
                >
                  नेपाली
                </button>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="options-actions">
            <button type="submit" className="btn-save">
              {saved ? 'Saved' : 'Save settings'}
            </button>
            <button type="button" className="btn-danger" onClick={handleReset}>
              Reset all data
            </button>
          </div>
        </form>

        <footer className="options-footer">
          <span>Namaskar v0.1.1</span>
        </footer>
      </div>
    </div>
  );
}
