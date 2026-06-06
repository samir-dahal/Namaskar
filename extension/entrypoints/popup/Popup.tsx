import { useState, useEffect } from 'react';
import { userSettings, dailyCache } from '../../utils/storage';
import { getGreeting } from '../../utils/greeting';

export default function Popup() {
  const [name, setName] = useState('');
  const [nepaliDisplay, setNepaliDisplay] = useState('');
  const [gregFormatted, setGregFormatted] = useState('');

  useEffect(() => {
    Promise.all([
      userSettings.getValue(),
      dailyCache.getValue(),
    ]).then(([s, c]) => {
      setName(s.name);
      if (c?.data) {
        setNepaliDisplay(c.data.nepali_date.full_display);
        setGregFormatted(c.data.gregorian_date.formatted);
      }
    });
  }, []);

  const greeting = getGreeting();
  const optionsUrl = browser.runtime.getURL('/options.html');

  return (
    <div className="popup">
      <div className="popup-top">
        <p className="popup-greeting">{greeting}{name ? `, ${name}` : ''}</p>
        {nepaliDisplay && (
          <p className="popup-nepali" lang="ne">{nepaliDisplay}</p>
        )}
        {gregFormatted && (
          <p className="popup-greg">{gregFormatted}</p>
        )}
        {!nepaliDisplay && (
          <p className="popup-empty">Open a new tab to load today's data.</p>
        )}
      </div>

      <div className="popup-footer">
        <a href={optionsUrl} target="_blank" rel="noopener noreferrer" className="popup-settings-link">
          Settings
        </a>
        <span className="popup-version">v{browser.runtime.getManifest().version}</span>
      </div>
    </div>
  );
}
