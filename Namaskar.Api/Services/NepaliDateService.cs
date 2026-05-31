using System.Globalization;
using NepDate;
using Namaskar.Api.Models;

namespace Namaskar.Api.Services;

public class NepaliDateService
{
    private static readonly string[] WeekdayNepali =
        ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"];

    private static readonly string[] MonthNepali =
        ["", "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"];

    private static readonly HashSet<string> NationalKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "Republic", "Constitution", "Democracy", "National", "Prithvi", "Martyr",
        "Revolution", "Unification", "Loktantra", "Janajati", "Dalit", "Minority"
    };

    public (NepaliDateDto nepaliDate, GregorianDateDto gregorianDate, List<EventDto> events) GetToday()
    {
        var nst = GetNepalTime();
        var today = new NepaliDate(nst);
        var cal = today.GetCalendarInfo();

        var weekdayNe = WeekdayNepali[(int)today.DayOfWeek];
        var monthNe = MonthNepali[today.Month];
        var dayNe = ToDevanagari(today.Day);
        var yearNe = ToDevanagari(today.Year);

        var nepaliDate = new NepaliDateDto
        {
            Year = today.Year,
            Month = today.Month,
            Day = today.Day,
            MonthName = today.MonthName.ToString(),
            MonthNameNe = monthNe,
            DayNe = dayNe,
            YearNe = yearNe,
            Weekday = today.DayOfWeek.ToString(),
            WeekdayNe = weekdayNe,
            FullDisplay = $"{weekdayNe}, {monthNe} {dayNe}, {yearNe}",
            TithiNe = cal.TithiNp,
            TithiEn = cal.TithiEn,
        };

        var engDate = today.EnglishDate;
        var gregorianDate = new GregorianDateDto
        {
            Year = engDate.Year,
            Month = engDate.Month,
            Day = engDate.Day,
            Weekday = engDate.DayOfWeek.ToString(),
            Formatted = engDate.ToString("dddd, MMMM d, yyyy", CultureInfo.InvariantCulture),
        };

        var events = cal.EventsEn
            .Zip(cal.EventsNp, (en, ne) => new EventDto
            {
                NameEn = en,
                NameNe = ne,
                Type = ClassifyEvent(en),
                IsPublicHoliday = cal.IsPublicHoliday,
            })
            .ToList();

        return (nepaliDate, gregorianDate, events);
    }

    private static string ClassifyEvent(string nameEn)
    {
        foreach (var kw in NationalKeywords)
            if (nameEn.Contains(kw, StringComparison.OrdinalIgnoreCase))
                return "national";
        return "religious";
    }

    private static string ToDevanagari(int number)
    {
        const string digits = "०१२३४५६७८९";
        return string.Concat(number.ToString().Select(c => digits[c - '0']));
    }

    public static DateTime GetNepalTime()
    {
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kathmandu");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
        catch { }
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Nepal Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
        catch { }
        return DateTime.UtcNow.AddHours(5).AddMinutes(45);
    }
}
