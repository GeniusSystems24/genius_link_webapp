using System.Globalization;

namespace GeniusLinkWebApp.Components.Shared;

public static class UiFormat
{
    public static string Money(decimal? value, bool dashOnNull = true)
    {
        if (value is null && dashOnNull)
        {
            return "-";
        }

        var amount = value ?? 0m;
        var sign = amount < 0 ? "-" : string.Empty;
        return string.Create(CultureInfo.InvariantCulture, $"{sign}${Math.Abs(amount):0.00}");
    }

    public static int Percent(decimal numerator, decimal denominator)
    {
        if (denominator <= 0)
        {
            return 0;
        }

        return (int)Math.Round((numerator / denominator) * 100m, MidpointRounding.AwayFromZero);
    }
}
