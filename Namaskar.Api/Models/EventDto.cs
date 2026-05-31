namespace Namaskar.Api.Models;

public class EventDto
{
    public string NameEn { get; set; } = string.Empty;
    public string NameNe { get; set; } = string.Empty;
    public string Type { get; set; } = "religious";
    public bool IsPublicHoliday { get; set; }
}
