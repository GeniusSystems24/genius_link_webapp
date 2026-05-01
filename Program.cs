using GeniusLinkWebApp.Components;
using GeniusLinkWebApp.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddRazorComponents()
    .AddInteractiveServerComponents();
builder.Services.AddSingleton<DemoDataService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

app.MapGet("/Create Sale Invoice.html", static context =>
{
    context.Response.Redirect("/create-sale-invoice", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/Customer Profile.html", static context =>
{
    context.Response.Redirect("/customer-profile", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/Invoice List.html", static context =>
{
    context.Response.Redirect("/invoice-list", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/Record Payment.html", static context =>
{
    context.Response.Redirect("/record-payment", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/Sale Invoice Details - Cash.html", static context =>
{
    context.Response.Redirect("/sale-invoice-details-cash", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/Sale Invoice Details.html", static context =>
{
    var target = string.Equals(context.Request.Query["type"], "cash", StringComparison.OrdinalIgnoreCase)
        ? "/sale-invoice-details-cash"
        : "/sale-invoice-details";

    context.Response.Redirect(target, permanent: false);
    return Task.CompletedTask;
});

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
