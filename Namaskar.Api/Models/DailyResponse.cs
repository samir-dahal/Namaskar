using Namaskar.Api.Services;

namespace Namaskar.Api.Models;

public class DailyResponse
{
    public string GeneratedAt { get; set; } = string.Empty;
    public NepaliDateDto NepaliDate { get; set; } = new();
    public GregorianDateDto GregorianDate { get; set; } = new();
    public List<EventDto> Events { get; set; } = [];
    public BackgroundPhotoData Background { get; set; } = new();
    public int CacheTtlSeconds { get; set; } = 3600;
}
