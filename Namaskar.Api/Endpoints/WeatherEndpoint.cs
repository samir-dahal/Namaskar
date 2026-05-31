namespace Namaskar.Api.Endpoints;

/// <summary>
/// Optional weather proxy — forwards requests to Open-Meteo.
/// Use this as a fallback only if the extension cannot reach Open-Meteo directly.
/// Open-Meteo supports CORS so the extension should call it directly in most cases.
/// </summary>
public static class WeatherEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/v1/weather", GetWeather)
           .RequireRateLimiting("default")
           .WithName("GetWeather")
           .Produces<string>()
           .Produces(StatusCodes.Status502BadGateway);
    }

    private static async Task<IResult> GetWeather(
        double lat,
        double lon,
        IHttpClientFactory httpClientFactory)
    {
        try
        {
            var client = httpClientFactory.CreateClient("OpenMeteo");
            var url = $"/v1/forecast?latitude={lat:F4}&longitude={lon:F4}" +
                      $"&current=temperature_2m,weather_code&timezone=Asia%2FKathmandu";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return Results.StatusCode(StatusCodes.Status502BadGateway);

            var json = await response.Content.ReadAsStringAsync();
            return Results.Text(json, "application/json");
        }
        catch
        {
            return Results.StatusCode(StatusCodes.Status502BadGateway);
        }
    }
}
