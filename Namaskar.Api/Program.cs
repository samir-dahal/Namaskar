using System.Text.Json;
using System.Threading.RateLimiting;
using Namaskar.Api.Endpoints;
using Namaskar.Api.Services;
using PexelsDotNetSDK.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

// Use snake_case JSON to match the extension API contract
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

// Services
var pexelsApiKey = builder.Configuration["Pexels:ApiKey"]
    ?? throw new InvalidOperationException("Pexels:ApiKey is not configured.");
builder.Services.AddSingleton(new PexelsClient(pexelsApiKey));
builder.Services.AddSingleton<BackgroundPhotoService>();
builder.Services.AddScoped<NepaliDateService>();

// Named HttpClient for the Open-Meteo weather proxy
builder.Services.AddHttpClient("OpenMeteo", client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com");
});

// CORS — allow extension origins and localhost in development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // Production: allow only browser extension origins
            // Replace <YOUR_CHROME_EXTENSION_ID> with the published extension ID
            policy.SetIsOriginAllowed(origin =>
                      origin.StartsWith("chrome-extension://") ||
                      origin.StartsWith("moz-extension://"))
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

// Rate limiting — 60 requests per IP per hour
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("default", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

#if !DEBUG
app.UseHttpsRedirection();
#endif
app.UseStaticFiles();
app.UseCors();
app.UseRateLimiter();

// ── Endpoints ────────────────────────────────────────────────────────────
DailyEndpoint.Map(app);
BackgroundEndpoint.Map(app);
WeatherEndpoint.Map(app);
HealthEndpoint.Map(app);
PrivacyPolicyEndpoint.Map(app);

app.Run();

