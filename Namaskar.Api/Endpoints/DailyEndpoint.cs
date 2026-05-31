using Microsoft.Extensions.Caching.Memory;
using Namaskar.Api.Models;
using Namaskar.Api.Services;

namespace Namaskar.Api.Endpoints;

public static class DailyEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/v1/daily", GetDaily)
           .RequireRateLimiting("default")
           .WithName("GetDaily")
           .Produces<DailyResponse>()
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> GetDaily(
        NepaliDateService dateService,
        BackgroundPhotoService photoService,
        IMemoryCache cache)
    {
        try
        {
            var nst = NepaliDateService.GetNepalTime();
            var cacheKey = $"daily:{nst:yyyy-MM-dd}";

            if (!cache.TryGetValue<DailyResponse>(cacheKey, out var response) || response is null)
            {
                var (nepaliDate, gregorianDate, events) = dateService.GetToday();
                var background = await photoService.GetDailyPhotoAsync();

                response = new DailyResponse
                {
                    GeneratedAt = DateTimeOffset.UtcNow
                        .ToOffset(TimeSpan.FromHours(5) + TimeSpan.FromMinutes(45))
                        .ToString("o"),
                    NepaliDate = nepaliDate,
                    GregorianDate = gregorianDate,
                    Events = events,
                    Background = background,
                    CacheTtlSeconds = 3600,
                };

                // Cache until midnight NST
                var expiresAt = nst.Date.AddDays(1) - nst;
                cache.Set(cacheKey, response, expiresAt);
            }

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
