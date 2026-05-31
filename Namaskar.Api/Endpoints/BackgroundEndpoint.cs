using Namaskar.Api.Services;

namespace Namaskar.Api.Endpoints;

public static class BackgroundEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/v1/background", GetBackground)
           .RequireRateLimiting("default")
           .WithName("GetDailyBackground")
           .Produces<BackgroundPhotoData>()
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> GetBackground(BackgroundPhotoService photoService)
    {
        try
        {
            var photo = await photoService.GetDailyPhotoAsync();
            return Results.Ok(photo);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
