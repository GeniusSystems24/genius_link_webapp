using GeniusLinkWebApp.Components.Shared;

namespace GeniusLinkWebApp.Data;

public sealed class DemoDataService
{
    private static readonly IReadOnlyList<InvoiceRowItem> InvoiceRows =
    [
        new("INV-2023-014", "Daniel Park", "F-177", "#2d5bff", "Apr 25, 2026", "cash", 40.15m, 40.15m, "paid"),
        new("INV-2023-007", "Alex Thompson", "F-062", "#7c3aed", "Nov 01, 2023", "installment", 53.49m, 37.83m, "partial"),
        new("INV-2023-019", "Sara Mendes", "F-018", "#16a34a", "Nov 15, 2023", "credit", 215.00m, 0m, "overdue"),
        new("INV-2023-025", "Northfield Catering", "W-204", "#c68b00", "Nov 22, 2023", "installment", 845.50m, 281.83m, "partial"),
        new("INV-2023-031", "Daniel Park", "F-177", "#2d5bff", "Dec 01, 2023", "cash", 34.75m, 34.75m, "paid"),
        new("INV-2023-038", "Alex Thompson", "F-062", "#7c3aed", "Dec 10, 2023", "advance", 120.00m, 120.00m, "paid"),
        new("INV-2023-042", "Sara Mendes", "F-018", "#16a34a", "Dec 18, 2023", "cash", 89.20m, 89.20m, "paid"),
        new("INV-2023-049", "Northfield Catering", "W-204", "#c68b00", "Jan 05, 2024", "installment", 1240.00m, 0m, "draft"),
        new("INV-2023-055", "Daniel Park", "F-177", "#2d5bff", "Jan 12, 2024", "cash", 45.99m, 45.99m, "paid"),
        new("INV-2023-061", "Alex Thompson", "F-062", "#7c3aed", "Jan 20, 2024", "credit", 310.00m, 0m, "voided")
    ];

    public InvoiceListData GetInvoiceList()
    {
        return new(
            new InvoiceListSummary(248, 248, "$84,320", "$12,440", 34, "$3,180", 8),
            InvoiceRows);
    }

    public CustomerProfileData GetCustomerProfile()
    {
        var customer = new CustomerInfo(
            "F-062",
            "Alex Thompson",
            "A",
            "alex.thompson@example.com",
            "+1 555 010 2233",
            "Retail",
            "Main Flagship Store",
            "Jan 2021",
            "USD",
            "Gold",
            true);

        var stats = new CustomerStats(
            "$1,284.98",
            "$1,243.32",
            "$41.66",
            "$0.00",
            14,
            1284,
            2000,
            64,
            716);

        var history =
            InvoiceRows
                .Where(row => row.CustomerId == "F-062" || row.CustomerName == "Alex Thompson")
                .Take(5)
                .ToArray();

        return new(
            customer,
            stats,
            history,
            [
                new PaymentListItem(7.83m, "INV-2023-007", "Installment #1", "Dec 03, 2023", "Petty Cash (1001-01)"),
                new PaymentListItem(30.00m, "INV-2023-007", "Down Payment", "Nov 01, 2023", "Bank Account (1002-01)"),
                new PaymentListItem(34.75m, "INV-2023-031", "Cash settled", "Dec 01, 2023", "Petty Cash (1001-01)"),
                new PaymentListItem(120.00m, "INV-2023-038", "Advance settled", "Dec 10, 2023", "Bank Account (1002-01)")
            ],
            [
                new NoteListItem("note-1", "Oct 15, 2023", "Sara Mendes", "Prefers delivery on weekends. Usually orders large quantities in December."),
                new NoteListItem("note-2", "Nov 28, 2023", "Ahmed Khalil", "Sometimes late on installments. Send reminder five days before due date.")
            ]);
    }

    public CreateInvoiceSeed GetCreateInvoiceSeed()
    {
        return new(
            [
                new CatalogItem("BRG-001", "Classic Beef Burger", "Signature grill", 12.50m, "BR"),
                new CatalogItem("PIZ-022", "Pepperoni Pizza (Large)", "14 inch hand-tossed", 19.99m, "PZ"),
                new CatalogItem("CHK-007", "Crispy Chicken Wings", "6 pcs, choice of sauce", 9.75m, "CH"),
                new CatalogItem("SLD-004", "Caesar Salad", "Fresh romaine", 7.50m, "SD"),
                new CatalogItem("DRK-101", "Sparkling Lemonade", "500 ml", 3.25m, "DR"),
                new CatalogItem("DST-014", "New York Cheesecake", "Slice", 5.50m, "DS")
            ],
            [
                new CustomerPickerItem("F-062", "Alex Thompson", "Retail, since 2021", 120.00m),
                new CustomerPickerItem("F-018", "Sara Mendes", "Retail, since 2019", 0m),
                new CustomerPickerItem("W-204", "Northfield Catering Co.", "Wholesale", 845.50m),
                new CustomerPickerItem("F-177", "Daniel Park", "Retail", 32.00m)
            ],
            ["Main Flagship Store", "Main Downtown Hub", "Airport Kiosk", "Seaside Outlet"],
            ["USD - US Dollar", "EUR - Euro", "GBP - Pound Sterling", "JPY - Japanese Yen", "SAR - Saudi Riyal"],
            ["Main Bank Account (1002-01)", "Merchant Operating (Chase)", "Petty Cash (1001-01)", "Square Payout"],
            [
                new CreateProductDraft(1, "BRG-001", "Classic Beef Burger", "Signature grill", "BR", 12.50m, 2, "amount", 5.00m, string.Empty),
                new CreateProductDraft(2, "PIZ-022", "Pepperoni Pizza (Large)", "14 inch hand-tossed", "PZ", 19.99m, 1, "amount", 0m, string.Empty)
            ],
            [
                new CreateCostDraft(1, "Shipping", "charge", "fixed", 15.00m),
                new CreateCostDraft(2, "Holiday Discount", "discount", "percent", 10m)
            ],
            new PlanConfig(3, "12/01/2023", "Monthly"));
    }

    public PaymentOptionsData GetPaymentOptions()
    {
        return new(
            [
                new PaymentInvoiceOption("INV-2023-007", "Alex Thompson", "Installment, 3 payments, $53.49 total", 15.66m, "partial", "Installments #2 and #3 pending"),
                new PaymentInvoiceOption("INV-2023-019", "Sara Mendes", "Credit, $215.00 total", 215.00m, "overdue", "Overdue since Dec 01")
            ],
            [
                new PaymentAllocationOption("Installment #2", "Due Jan 01, 2024", 7.83m, false, true),
                new PaymentAllocationOption("Installment #3", "Due Feb 01, 2024", 7.83m, false, false)
            ]);
    }

    public InvoiceDetailData GetInvoiceDetail(bool cash)
    {
        return cash ? CashInvoice() : InstallmentInvoice();
    }

    private static InvoiceDetailData InstallmentInvoice()
    {
        var customer = new InvoiceCustomer(
            "F-062",
            "Alex Thompson",
            "A",
            "alex@email.com",
            "+1 555 010 2233",
            "Retail",
            2021);

        return new(
            "INV-2023-007",
            "installment",
            "partial",
            "Main Flagship Store",
            "Sara Mendes",
            "November 01, 2023",
            "USD - US Dollar",
            "Tax Exclusive - 5%",
            "1200-01",
            customer,
            new InvoiceTotalsData
            {
                InvoiceTotal = 53.49m,
                PaidSoFar = 37.83m,
                Balance = 15.66m,
                PerInstallment = 7.83m,
                Subtotal = 39.99m,
                Shipping = 15.00m,
                Discount = -4.00m,
                TaxableNet = 50.99m,
                Tax = 2.50m,
                DownPayment = 30.00m,
                BalanceToFinance = 23.49m,
                TotalCollected = 37.83m,
                Remaining = 15.66m
            },
            71,
            [
                new ProductLine("Classic Beef Burger", "BRG-001", 2, 12.50m, 20.00m, "BR", "Signature grill", -5.00m),
                new ProductLine("Pepperoni Pizza (Large)", "PIZ-022", 1, 19.99m, 19.99m, "PZ", "14 inch hand-tossed")
            ],
            [
                new AdditionalCostLine("charge", "Shipping", 15.00m),
                new AdditionalCostLine("discount", "Holiday Discount (10%)", -4.00m)
            ],
            new DownPaymentItem(30.00m, "Nov 01, 2023", "Main Bank Account (1002-01)"),
            [
                new InstallmentItem(1, "Dec 01, 2023", 7.83m, "paid", "Dec 03, 2023", 2, "Petty Cash (1001-01)"),
                new InstallmentItem(2, "Jan 01, 2024", 7.83m, "due", Note: "Due in 5 days - reminder sent"),
                new InstallmentItem(3, "Feb 01, 2024", 7.83m, "upcoming", Note: "Scheduled")
            ],
            [
                new JournalEntryItem("Accounts Receivable", "1200-01", "Invoice total - Alex Thompson", 53.49m),
                new JournalEntryItem("Sales Revenue", "4000-01", "Net revenue after discounts", Credit: 35.99m),
                new JournalEntryItem("Shipping Income", "4100-02", "Shipping charge", Credit: 15.00m),
                new JournalEntryItem("VAT / Tax Payable", "2200-01", "5% tax on net $50.99", Credit: 2.50m),
                new JournalEntryItem("Cash / Bank Account", "1002-01", "Down payment received", 30.00m, Highlight: true),
                new JournalEntryItem("Accounts Receivable", "1200-01", "Down payment offset", Credit: 30.00m, Highlight: true)
            ],
            [
                new ActivityItem("created", "Invoice created and posted", "Nov 01, 2023 - 09:14 AM by Sara Mendes"),
                new ActivityItem("paid", "Down payment $30.00 received", "Nov 01, 2023 - 09:17 AM - Bank Account 1002-01"),
                new ActivityItem("reminder", "Payment reminder sent for Installment #1", "Nov 28, 2023 - Auto-notification"),
                new ActivityItem("paid", "Installment #1 - $7.83 received", "Dec 03, 2023 - 11:42 AM by Ahmed Khalil")
            ]);
    }

    private static InvoiceDetailData CashInvoice()
    {
        var customer = new InvoiceCustomer(
            "F-177",
            "Daniel Park",
            "D",
            "daniel@email.com",
            "+1 555 088 4412",
            "Walk-in retail",
            null);

        return new(
            "INV-2023-014",
            "cash",
            "paid",
            "Main Flagship Store",
            "Ahmed Khalil",
            "Apr 25, 2026",
            "USD - US Dollar",
            "Tax Exclusive - 5%",
            "1001-01",
            customer,
            new InvoiceTotalsData
            {
                Tendered = 45.00m,
                Change = 4.85m,
                Balance = 0m,
                Subtotal = 41.25m,
                LineDiscount = -1.00m,
                LoyaltyDiscount = -2.01m,
                TaxableNet = 38.24m,
                Tax = 1.91m,
                InvoiceTotal = 40.15m,
                DisplayedTotal = 40.15m,
                PaidSoFar = 40.15m,
                TotalCollected = 40.15m,
                Remaining = 0m
            },
            100,
            [
                new ProductLine("Classic Beef Burger", "BRG-001", 2, 12.50m, 25.00m, "BR"),
                new ProductLine("Crispy Chicken Wings", "CHK-007", 1, 9.75m, 8.75m, "CH", Discount: -1.00m),
                new ProductLine("Sparkling Lemonade", "DRK-101", 2, 3.25m, 6.50m, "DR")
            ],
            [
                new AdditionalCostLine("discount", "Member Loyalty Discount (5%)", -2.01m)
            ],
            null,
            [],
            [
                new JournalEntryItem("Cash / Petty Cash", "1001-01", "Cash received - Daniel Park", 40.15m, Highlight: true),
                new JournalEntryItem("Sales Revenue", "4000-01", "Net revenue after discounts", Credit: 38.24m),
                new JournalEntryItem("VAT / Tax Payable", "2200-01", "5% tax on net $38.24", Credit: 1.91m)
            ],
            [
                new ActivityItem("created", "Invoice created (cash sale)", "Apr 25, 2026 - 09:42:08 AM by Ahmed Khalil - Register #3"),
                new ActivityItem("paid", "Payment of $40.15 received in cash, tendered $45.00, change $4.85", "Apr 25, 2026 - 09:42:11 AM - Auto-settled at POS"),
                new ActivityItem("print", "Receipt #RC-00441 printed", "Apr 25, 2026 - 09:42:14 AM"),
                new ActivityItem("created", "Journal entries posted automatically", "Apr 25, 2026 - 09:42:11 AM - System")
            ],
            Register: "Register #3",
            Time: "09:42 AM",
            CashAccountName: "Petty Cash",
            CashAccountCode: "1001-01",
            ReceiptNo: "RC-00441",
            TransactionReference: "CASH-25042026");
    }
}

public sealed record InvoiceListData(InvoiceListSummary Summary, IReadOnlyList<InvoiceRowItem> Invoices);

public sealed record InvoiceListSummary(
    int TotalCount,
    int MonthlyTotal,
    string Revenue,
    string Outstanding,
    int OutstandingCount,
    string Overdue,
    int OverdueCount);

public sealed record CustomerProfileData(
    CustomerInfo Customer,
    CustomerStats Stats,
    IReadOnlyList<InvoiceRowItem> History,
    IReadOnlyList<PaymentListItem> Payments,
    IReadOnlyList<NoteListItem> Notes);

public sealed record CustomerInfo(
    string Id,
    string Name,
    string Initial,
    string Email,
    string Phone,
    string Segment,
    string Store,
    string Since,
    string Currency,
    string Tier,
    bool Active);

public sealed record CustomerStats(
    string TotalSpent,
    string TotalPaid,
    string Outstanding,
    string Overdue,
    int TotalInvoices,
    int LoyaltyPoints,
    int LoyaltyTarget,
    int LoyaltyProgressPct,
    int LoyaltyToNext);

public sealed record CreateInvoiceSeed(
    IReadOnlyList<CatalogItem> Catalog,
    IReadOnlyList<CustomerPickerItem> Customers,
    IReadOnlyList<string> Stores,
    IReadOnlyList<string> Currencies,
    IReadOnlyList<string> DownPaymentAccounts,
    IReadOnlyList<CreateProductDraft> Products,
    IReadOnlyList<CreateCostDraft> Costs,
    PlanConfig Plan);

public sealed record CatalogItem(string Id, string Name, string Sub, decimal Price, string Icon);

public sealed record CustomerPickerItem(string Id, string Name, string Sub, decimal Balance);

public sealed record CreateProductDraft(
    int Id,
    string Sku,
    string Name,
    string Sub,
    string Icon,
    decimal Price,
    int Quantity,
    string DiscountType,
    decimal DiscountValue,
    string Note);

public sealed record CreateCostDraft(int Id, string Description, string Type, string Mode, decimal Value);

public sealed record PlanConfig(int InstallmentCount, string StartDate, string Frequency);

public sealed record PaymentOptionsData(
    IReadOnlyList<PaymentInvoiceOption> OutstandingInvoices,
    IReadOnlyList<PaymentAllocationOption> Allocations);

public sealed record PaymentInvoiceOption(
    string Reference,
    string Customer,
    string Sub,
    decimal Balance,
    string Status,
    string Note);

public sealed record PaymentAllocationOption(
    string Label,
    string Sub,
    decimal Amount,
    bool Overdue,
    bool Checked);

public sealed record InvoiceDetailData(
    string Reference,
    string Type,
    string Status,
    string Store,
    string CreatedBy,
    string DatePosted,
    string Currency,
    string TaxScheme,
    string AccountCode,
    InvoiceCustomer Customer,
    InvoiceTotalsData Totals,
    int ProgressPct,
    IReadOnlyList<ProductLine> Products,
    IReadOnlyList<AdditionalCostLine> AdditionalCosts,
    DownPaymentItem? DownPayment,
    IReadOnlyList<InstallmentItem> Installments,
    IReadOnlyList<JournalEntryItem> JournalEntries,
    IReadOnlyList<ActivityItem> Activity,
    string? Register = null,
    string? Time = null,
    string? CashAccountName = null,
    string? CashAccountCode = null,
    string? ReceiptNo = null,
    string? TransactionReference = null);

public sealed record InvoiceCustomer(
    string Id,
    string Name,
    string Initial,
    string Email,
    string Phone,
    string Label,
    int? Since);

public sealed class InvoiceTotalsData
{
    public decimal InvoiceTotal { get; init; }
    public decimal PaidSoFar { get; init; }
    public decimal Balance { get; init; }
    public decimal PerInstallment { get; init; }
    public decimal Subtotal { get; init; }
    public decimal Shipping { get; init; }
    public decimal Discount { get; init; }
    public decimal TaxableNet { get; init; }
    public decimal Tax { get; init; }
    public decimal DownPayment { get; init; }
    public decimal BalanceToFinance { get; init; }
    public decimal TotalCollected { get; init; }
    public decimal Remaining { get; init; }
    public decimal Tendered { get; init; }
    public decimal Change { get; init; }
    public decimal DisplayedTotal { get; init; }
    public decimal LineDiscount { get; init; }
    public decimal LoyaltyDiscount { get; init; }
}

public sealed record AdditionalCostLine(string Type, string Label, decimal Amount);
