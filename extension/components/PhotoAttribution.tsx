interface PhotoAttributionProps {
  photographer: string;
  source: string;
  sourceUrl: string;
  location: string;
}

export function PhotoAttribution({
  photographer,
  source,
  sourceUrl,
  location,
}: PhotoAttributionProps) {
  return (
    <div className="photo-attribution">
      {location && <span className="attr-location">{location}</span>}
      {location && <span className="attr-sep" aria-hidden="true"> · </span>}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="attr-link"
        title={`View photo by ${photographer} on ${source}`}
      >
        {photographer} — {source}
      </a>
    </div>
  );
}
