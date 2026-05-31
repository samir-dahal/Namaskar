using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;
using PexelsDotNetSDK.Api;

namespace Namaskar.Api.Services;

public class BackgroundPhotoService
{
    private readonly PexelsClient _pexels;
    private readonly IMemoryCache _cache;
    private readonly ILogger<BackgroundPhotoService> _logger;

    // Rotate through Nepal-themed queries for variety
    private static readonly string[] Queries =
    [
        "nepal landscape",
        "kathmandu nepal",
        "himalaya nepal",
        "pokhara nepal",
        "nepal mountains",
    ];

    // Reliable fallback photo (Pexels public domain)
    private static readonly BackgroundPhotoData Fallback = new()
    {
        Url     = "https://images.pexels.com/photos/14892590/pexels-photo-14892590.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        Url4K   = "https://images.pexels.com/photos/14892590/pexels-photo-14892590.jpeg",
        Photographer = "Nishess Shakya",
        Source  = "Pexels",
        SourceUrl = "https://www.pexels.com/@nishess-shakya-401526881",
        Location = "Nepal",
    };

    public BackgroundPhotoService(
        PexelsClient pexels,
        IMemoryCache cache,
        ILogger<BackgroundPhotoService> logger)
    {
        _pexels = pexels;
        _cache  = cache;
        _logger = logger;
    }

    /// <summary>
    /// Returns a deterministic daily Nepal photo from Pexels.
    /// Same date always yields the same photo — restart-safe (deterministic from seed).
    /// Adjacent days use different queries/pages, so photos rarely repeat.
    /// Result is cached in memory until midnight NST.
    /// </summary>
    public async Task<BackgroundPhotoData> GetDailyPhotoAsync()
    {
        var nst      = GetNepalTime();
        var cacheKey = $"pexels:photo:{nst:yyyy-MM-dd}";

        if (_cache.TryGetValue<BackgroundPhotoData>(cacheKey, out var cached) && cached is not null)
            return cached;

        // Deterministic seed: same date always produces the same query + page + slot
        var seed   = nst.Year * 10000 + nst.DayOfYear;
        var rng    = new Random(seed);
        var query  = Queries[rng.Next(Queries.Length)];
        var page   = rng.Next(1, 6); // pages 1–5 (most relevant Pexels results)
        const int pageSize = 15;

        try
        {
            var result = await _pexels.SearchPhotosAsync(
                query,
                orientation: "landscape",
                page: page,
                pageSize: pageSize);

            var photos = result?.photos;
            if (photos is { Count: > 0 })
            {
                var photo = photos[seed % photos.Count];
                var data  = new BackgroundPhotoData
                {
                    Url       = photo.source?.large2x ?? photo.source?.large ?? photo.source?.original ?? Fallback.Url,
                    Url4K     = photo.source?.original ?? Fallback.Url4K,
                    Photographer = photo.photographer ?? "Unknown",
                    Source    = "Pexels",
                    SourceUrl = photo.photographerUrl ?? photo.url ?? "https://www.pexels.com",
                    Location  = "Nepal",
                };

                var expiresAt = nst.Date.AddDays(1) - nst;
                _cache.Set(cacheKey, data, expiresAt);
                return data;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch photo from Pexels (query={Query}, page={Page})", query, page);
        }

        // Cache fallback too so we don't hammer Pexels on every request
        var fallbackExpiry = TimeSpan.FromMinutes(15);
        _cache.Set(cacheKey, Fallback, fallbackExpiry);
        return Fallback;
    }

    public static DateTime GetNepalTime()
    {
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kathmandu");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
        catch
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById("Nepal Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
            }
            catch
            {
                return DateTime.UtcNow.AddHours(5).AddMinutes(45);
            }
        }
    }
}

public class BackgroundPhotoData
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("url_4k")]
    public string Url4K { get; set; } = string.Empty;

    [JsonPropertyName("photographer")]
    public string Photographer { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("source_url")]
    public string SourceUrl { get; set; } = string.Empty;

    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;
}
