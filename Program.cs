var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "."
});

var app = builder.Build();

// Enable default file (index.html) and static files from root directory
app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "index.html" }
});
app.UseStaticFiles();

app.Run();
