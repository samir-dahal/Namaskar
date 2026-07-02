using System.Text.Json.Serialization;
using System.Collections.Concurrent;
using Google.GenAI;
using Microsoft.Extensions.Caching.Memory;
using PexelsDotNetSDK.Api;

namespace Namaskar.Api.Services;

public class BackgroundPhotoService
{
    private readonly PexelsClient _pexels;
    private readonly IMemoryCache _cache;
    private readonly ILogger<BackgroundPhotoService> _logger;
    private readonly IConfiguration _config;
    private static readonly ConcurrentDictionary<string, Lazy<Task<BackgroundPhotoData>>> InFlight = new();

    // Minimal fallback if appsettings has no queries configured
    private static readonly string[] FallbackQueries =
    [
        "nepal mountains",
        "himalaya nepal",
        "nepal lake",
        "nepal waterfall",
        "nepal sunrise",
        "nepal sunset",
    ];

    /// <summary>
    /// Reads BackgroundPhotos:Queries from configuration, falling back to a minimal hardcoded list.
    /// </summary>
    private string[] GetQueries()
    {
        var queries = _config.GetSection("BackgroundPhotos:Queries").Get<string[]>();
        return queries is { Length: > 0 } ? queries : FallbackQueries;
    }

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
        ILogger<BackgroundPhotoService> logger,
        IConfiguration config)
    {
        _pexels = pexels;
        _cache  = cache;
        _logger = logger;
        _config = config;
    }

    /// <summary>
    /// Asks Gemini AI to generate a Nepal-specific photo search query.
    /// Returns null if the API key / prompt is missing, the call fails, or the response is empty.
    /// </summary>
    private async Task<string?> GetGeminiQueryAsync()
    {
        var apiKey = _config["GeminiAI:ApiKey"];
        var prompt = _config["GeminiAI:Prompt"];
        var model = _config["GeminiAI:Model"];

        if (string.IsNullOrWhiteSpace(apiKey) || 
            string.IsNullOrWhiteSpace(prompt) || 
            string.IsNullOrWhiteSpace(model))
            return null;

        try
        {
            var client = new Client(apiKey: apiKey);
            //timeout - don't want to wait too long for AI response
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var response = await client.Models.GenerateContentAsync(
                model: model,
                contents: prompt,
                cancellationToken: cts.Token);

            var text = response?.Candidates?[0]?.Content?.Parts?[0]?.Text?.Trim();
            return string.IsNullOrWhiteSpace(text) ? null : text;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini AI failed to generate query; falling back to static list");
            return null;
        }
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

        // Coalesce concurrent requests for the same day so only one call hits external APIs.
        var inFlight = InFlight.GetOrAdd(
            cacheKey,
            _ => new Lazy<Task<BackgroundPhotoData>>(
                () => FetchAndCacheDailyPhotoAsync(nst, cacheKey),
                LazyThreadSafetyMode.ExecutionAndPublication));

        try
        {
            return await inFlight.Value;
        }
        finally
        {
            InFlight.TryRemove(cacheKey, out _);
        }
    }

    private async Task<BackgroundPhotoData> FetchAndCacheDailyPhotoAsync(DateTime nst, string cacheKey)
    {
        if (_cache.TryGetValue<BackgroundPhotoData>(cacheKey, out var cached) && cached is not null)
            return cached;

        // Deterministic seed: same date always produces the same query + page + slot
        var seed   = nst.Year * 10000 + nst.DayOfYear;
        var rng    = new Random(seed);

        // Primary: ask Gemini AI for a tailored Nepal keyword
        var query = await GetGeminiQueryAsync();

        if (query is null)
        {
            // Fallback: deterministic pick from configured list
            var queries = GetQueries();
            query = queries[rng.Next(queries.Length)];
            _logger.LogInformation("Using static fallback query: {Query}", query);
        }
        else
        {
            _logger.LogInformation("Using Gemini-generated query: {Query}", query);
        }

        var page   = rng.Next(1, 16); // pages 1–15 (most relevant Pexels results)
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
                //var photo = photos[seed % photos.Count];
                var photo = photos[rng.Next(photos.Count)];
                var data  = new BackgroundPhotoData
                {
                    Url       = photo.source?.original ?? photo.source?.large2x ?? photo.source?.large ?? Fallback.Url,
                    Url4K     = photo.source?.original ?? Fallback.Url4K,
                    Photographer = photo.photographer ?? "Unknown",
                    Source    = "Pexels",
                    SourceUrl = photo.photographerUrl ?? photo.url ?? "https://www.pexels.com",
                    Location  = "Nepal",
                    SearchedQuery = query,
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
    [JsonPropertyName("searched_query")]
    public string SearchedQuery { get; set; } = string.Empty;

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
