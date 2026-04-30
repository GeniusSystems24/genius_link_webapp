using Microsoft.AspNetCore.Components;

namespace GeniusLinkWebApp.Components.Shared;

public static class UiIcons
{
    public static readonly MarkupString Check = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><path d=\"M5 12l5 5 9-11\"/></svg>");
    public static readonly MarkupString File = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/></svg>");
    public static readonly MarkupString Note = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h12l4 4v12H4z\"/><path d=\"M8 12h8M8 16h5\"/></svg>");
    public static readonly MarkupString Print = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z\"/></svg>");
    public static readonly MarkupString Refund = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9M3 12l3-3m-3 3l3 3\"/></svg>");
    public static readonly MarkupString Reminder = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0\"/></svg>");
    public static readonly MarkupString View = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M1 12S5 5 12 5s11 7 11 7-4 7-11 7-11-7-11-7z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>");
    public static readonly MarkupString More = new("<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"5\" r=\"1.5\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/><circle cx=\"12\" cy=\"19\" r=\"1.5\"/></svg>");
}
