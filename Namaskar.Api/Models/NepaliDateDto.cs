namespace Namaskar.Api.Models;

public class NepaliDateDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public string MonthNameNe { get; set; } = string.Empty;
    public string DayNe { get; set; } = string.Empty;
    public string YearNe { get; set; } = string.Empty;
    public string Weekday { get; set; } = string.Empty;
    public string WeekdayNe { get; set; } = string.Empty;
    public string FullDisplay { get; set; } = string.Empty;
    public string TithiNe { get; set; } = string.Empty;
    public string TithiEn { get; set; } = string.Empty;
}

public class GregorianDateDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public string Weekday { get; set; } = string.Empty;
    public string Formatted { get; set; } = string.Empty;
}
