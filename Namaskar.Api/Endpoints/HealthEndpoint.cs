namespace Namaskar.Api.Endpoints;

public static class HealthEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
           .WithName("Health")
           .Produces<object>();
    }
}
