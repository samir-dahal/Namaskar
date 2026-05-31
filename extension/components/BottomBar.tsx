import { RefreshIcon, SettingsIcon } from './icons';

interface BottomBarProps {
  location: string;
  photographer: string;
  source: string;
  sourceUrl: string;
  isRefreshing: boolean;
  isOffline: boolean;
  onRefresh: () => void;
}

export function BottomBar({
  location,
  photographer,
  source,
  sourceUrl,
  isRefreshing,
  isOffline,
  onRefresh,
}: BottomBarProps) {
  const optionsUrl = browser.runtime.getURL('/options.html');

  return (
    <div className="bottom-bar" role="toolbar" aria-label="Controls">
      {/* Left — photo attribution */}
      <div className="bottom-bar-left">
        {location && <span className="attr-location">{location}</span>}
        {location && photographer && (
          <span className="attr-sep" aria-hidden="true"> · </span>
        )}
        {photographer && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="attr-link"
            title={`View photo by ${photographer} on ${source}`}
          >
            {photographer}
          </a>
        )}
        {isOffline && <span className="offline-badge">Offline</span>}
      </div>

      {/* Right — icon buttons */}
      <div className="bottom-bar-right">
        <button
          className={`icon-btn${isRefreshing ? ' icon-btn--spinning' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshIcon size={16} />
        </button>
        <a
          href={optionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          title="Settings"
          aria-label="Open settings"
        >
          <SettingsIcon size={16} />
        </a>
      </div>
    </div>
  );
}

