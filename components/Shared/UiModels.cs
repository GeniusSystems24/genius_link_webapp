namespace GeniusLinkWebApp.Components.Shared;

public sealed record BreadcrumbItem(
    string Label,
    string? Href = null,
    string? I18nKey = null);

public sealed record StatItem(
    string Value,
    string? Tone = null,
    string? Label = null,
    string? LabelKey = null,
    string? Sub = null,
    string? SubKey = null);

public sealed record InfoRowItem(
    string Value,
    string? KeyLabel = null,
    string? KeyI18n = null,
    string? ValueClass = null,
    bool Mono = false,
    string? ValueStyle = null);

public sealed record ProductLine(
    string Name,
    string Sku,
    int Quantity,
    decimal Price,
    decimal Total,
    string? Icon = null,
    string? SkuSub = null,
    decimal? Discount = null);

public sealed record JournalEntryItem(
    string Account,
    string Code,
    string Description,
    decimal? Debit = null,
    decimal? Credit = null,
    bool Highlight = false);

public sealed record ActivityItem(
    string Type,
    string Title,
    string Timestamp);

public sealed record PaymentListItem(
    decimal Amount,
    string Reference,
    string Label,
    string Date,
    string Account);

public sealed record NoteListItem(
    string Key,
    string Date,
    string Author,
    string? Text = null);

public sealed record InstallmentItem(
    int Number,
    string Due,
    decimal Amount,
    string Status,
    string? PaidAt = null,
    int? LateDays = null,
    string? Account = null,
    string? Note = null);

public sealed record DownPaymentItem(
    decimal Amount,
    string Date,
    string Account);

public sealed record InvoiceRowItem(
    string Reference,
    string CustomerName,
    string CustomerId,
    string Color,
    string Date,
    string Type,
    decimal Total,
    decimal Paid,
    string Status,
    decimal? Balance = null);

public enum InvoiceRowVariant
{
    Table,
    History,
    Mobile,
    MobileHistory
}

public sealed record StepperStep(
    int Id,
    string LabelKey,
    string? Label = null);

public sealed record BottomSheetAction(
    string Label,
    string? CssClass = null,
    string? I18nKey = null);
