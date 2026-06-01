namespace Namaskar.Api.Endpoints;

public static class PrivacyPolicyEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/privacy-policy", (IWebHostEnvironment env) =>
        {
            var path = Path.Combine(env.WebRootPath, "privacy-policy.html");
            return Results.File(path, contentType: "text/html; charset=utf-8");
        })
        .WithName("PrivacyPolicy")
        .Produces(StatusCodes.Status200OK, contentType: "text/html");
    }
}
