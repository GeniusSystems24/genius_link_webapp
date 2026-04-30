(function () {
  function route(name, fallback) {
    return (window.GeniusRoutes && window.GeniusRoutes[name]) || fallback;
  }

  const ROUTES = {
    installment: route('saleInvoiceDetails', '/sale-invoice-details'),
    credit: route('saleInvoiceDetails', '/sale-invoice-details'),
    advance: route('saleInvoiceDetails', '/sale-invoice-details'),
    cash: route('saleInvoiceDetailsCash', '/sale-invoice-details-cash'),
    paidCashRefs: new Set(['INV-2023-014', 'INV-2023-031', 'INV-2023-042', 'INV-2023-055']),
  };

  const EXACT_AR = {
    'Ledgerly': 'ليدجرلي',
    'Invoices': 'الفواتير',
    'Customers': 'العملاء',
    'Desktop': 'سطح المكتب',
    'Mobile': 'الجوال',
    'Light': 'فاتح',
    'Dark': 'داكن',
    'Sale Invoices': 'فواتير المبيعات',
    'All transactions across stores and sale types.': 'كل المعاملات عبر المتاجر وأنواع البيع.',
    'Filters': 'الفلاتر',
    'New Invoice': 'فاتورة جديدة',
    'More Filters': 'فلاتر إضافية',
    'Search by reference, customer, amount…': 'ابحث بالمرجع أو العميل أو المبلغ...',
    'Search invoices…': 'ابحث في الفواتير...',
    'Min $': 'الحد الأدنى $',
    'Max $': 'الحد الأعلى $',
    'Showing 1–10 of 248': 'عرض 1-10 من 248',
    'View': 'عرض',
    'More': 'المزيد',
    'Paid': 'مدفوعة',
    'Partial': 'جزئية',
    'Overdue': 'متأخرة',
    'Draft': 'مسودة',
    'Voided': 'ملغية',
    'Settled': 'مسددة',
    'paid': 'مدفوع',
    'Filter Invoices': 'تصفية الفواتير',
    'Date Range': 'النطاق الزمني',
    'Store': 'المتجر',
    'All Stores': 'كل المتاجر',
    'Sale Type': 'نوع البيع',
    'All Types': 'كل الأنواع',
    'Cash': 'نقدي',
    'Installment': 'تقسيط',
    'Credit': 'آجل',
    'Advance': 'مقدم',
    'Amount Range': 'نطاق المبلغ',
    'Sort By': 'ترتيب حسب',
    'Date (Newest first)': 'التاريخ (الأحدث أولاً)',
    'Date (Oldest first)': 'التاريخ (الأقدم أولاً)',
    'Amount (High to Low)': 'المبلغ (من الأعلى)',
    'Balance (High to Low)': 'الرصيد (من الأعلى)',
    'Reset': 'إعادة ضبط',
    'Apply Filters': 'تطبيق الفلاتر',
    'Reference': 'المرجع',
    'Customer': 'العميل',
    'Date': 'التاريخ',
    'Type': 'النوع',
    'Total': 'الإجمالي',
    'Paid': 'المدفوع',
    'Balance': 'الرصيد',
    'Status': 'الحالة',

    'New Transaction · Installment Sale': 'معاملة جديدة · بيع بالتقسيط',
    'Create Sale Invoice': 'إنشاء فاتورة مبيعات',
    'Create Invoice': 'إنشاء فاتورة',
    'Record a new sale, capture payment terms, and generate an installment plan.': 'سجل عملية بيع جديدة وحدد شروط الدفع وأنشئ خطة التقسيط.',
    'Save draft': 'حفظ كمسودة',
    'Cancel': 'إلغاء',
    'Submit Sale': 'تسجيل البيع',
    'Submit Invoice': 'تسجيل الفاتورة',
    'Sale Type': 'نوع البيع',
    'Transaction Details': 'تفاصيل المعاملة',
    'Invoice identifiers, customer account and payment terms.': 'معرفات الفاتورة وحساب العميل وشروط الدفع.',
    'Currency': 'العملة',
    'Date Posted': 'تاريخ الترحيل',
    'Customer Account': 'حساب العميل',
    'Cash Account (A/R)': 'حساب النقدية (ذمم مدينة)',
    'Has Down Payment': 'توجد دفعة مقدمة',
    'Enabled': 'مفعل',
    'Disabled': 'معطل',
    'Down Payment Cash / Bank Account': 'حساب الدفعة المقدمة نقداً/بنك',
    'Down Payment Amount': 'مبلغ الدفعة المقدمة',
    'Additional Info': 'معلومات إضافية',
    'Description': 'الوصف',
    'Internal notes or specific customer instructions…': 'ملاحظات داخلية أو تعليمات خاصة بالعميل...',
    'Attachments': 'المرفقات',
    'Click to upload files': 'انقر لرفع الملفات',
    'Tap to upload': 'اضغط للرفع',
    'PDF, PNG, JPG up to 10 MB': 'PDF أو PNG أو JPG حتى 10 ميجابايت',
    'Products': 'المنتجات',
    'Add Product': 'إضافة منتج',
    'Product Name': 'اسم المنتج',
    'SKU': 'كود المنتج',
    'Qty': 'الكمية',
    'Unit Price': 'سعر الوحدة',
    'Line Total': 'إجمالي السطر',
    'Extra Costs': 'تكاليف إضافية',
    'Additional Costs & Discounts': 'تكاليف وخصومات إضافية',
    'Line-item charges and discounts. Taxes are handled separately below.': 'رسوم وخصومات على مستوى السطر. تتم معالجة الضريبة بشكل منفصل أدناه.',
    'Add Cost': 'إضافة تكلفة',
    'Rate / Basis': 'النسبة / الأساس',
    'Amount': 'المبلغ',
    'Tax': 'الضريبة',
    'Tax Scheme': 'نظام الضريبة',
    'Tax Exclusive · 5%': 'ضريبة خارجية · 5%',
    'Tax Exclusive ? 5%': 'ضريبة خارجية · 5%',
    'Tax Rate (%)': 'نسبة الضريبة (%)',
    'Tax Basis': 'أساس الضريبة',
    'Tax Amount': 'مبلغ الضريبة',
    'Tax exclusive (added)': 'ضريبة خارجية (تضاف)',
    'Tax inclusive (built-in)': 'ضريبة شاملة',
    'No tax': 'بدون ضريبة',
    'Subtotal − Discounts': 'الإجمالي الفرعي - الخصومات',
    'Installment Plan': 'خطة التقسيط',
    'Payment schedule for the balance remaining after down payment.': 'جدول السداد للرصيد المتبقي بعد الدفعة المقدمة.',
    'Invoice Total': 'إجمالي الفاتورة',
    'Down Payment': 'الدفعة المقدمة',
    'Installment Base': 'أساس التقسيط',
    'Number of Installments': 'عدد الأقساط',
    'Start Date': 'تاريخ البدء',
    'Frequency': 'الدورية',
    'Monthly': 'شهري',
    'Bi-weekly': 'كل أسبوعين',
    'Weekly': 'أسبوعي',
    'Quarterly': 'ربع سنوي',
    'Regenerate': 'إعادة إنشاء',
    'Due Date': 'تاريخ الاستحقاق',
    'Pending': 'معلق',
    'Sum of installments equals the installment base exactly. The final installment absorbs any rounding remainder.': 'مجموع الأقساط يساوي أساس التقسيط بدقة. القسط الأخير يستوعب أي فرق تقريب.',
    'Accounting flow.': 'مسار المحاسبة.',
    'Subtotal (net of line discounts)': 'الإجمالي الفرعي (بعد خصومات السطر)',
    'Additional Charges': 'تكاليف إضافية',
    'Discounts': 'الخصومات',
    'Taxable Net': 'الصافي الخاضع للضريبة',
    'Balance to Finance': 'الرصيد الممول',
    'Search or select customer…': 'ابحث عن العميل أو اختره...',
    'Accounts Receivable — Customers (1200-01)': 'الذمم المدينة - العملاء (1200-01)',
    'Optional notes…': 'ملاحظات اختيارية...',
    'Search customers…': 'ابحث عن العملاء...',
    'Search products or scan…': 'ابحث عن المنتجات أو امسح الباركود...',
    'Optional line note…': 'ملاحظة سطر اختيارية...',
    'e.g. Shipping, Tip, Loyalty Discount': 'مثلاً: شحن، إكرامية، خصم ولاء',
    'e.g. 0123456789012': 'مثلاً: 0123456789012',
    'Can\'t scan? Enter barcode manually.': 'لا يمكن المسح؟ أدخل الباركود يدوياً.',
    'Scan Manually': 'مسح يدوي',
    'Invoice Summary': 'ملخص الفاتورة',
    'Charges': 'الرسوم',
    'Per-Installment Payment': 'قيمة القسط',

    'Customer Profile': 'ملف العميل',
    'Customer since': 'عميل منذ',
    'Retail': 'تجزئة',
    'Gold Member': 'عضو ذهبي',
    'Active': 'نشط',
    'Call': 'اتصال',
    'Email': 'بريد إلكتروني',
    'Record Payment': 'تسجيل دفعة',
    'Total Spent': 'إجمالي الإنفاق',
    'Lifetime value': 'القيمة الإجمالية',
    'Total Invoices': 'إجمالي الفواتير',
    'All time': 'منذ البداية',
    'Outstanding': 'المستحقات',
    '1 invoice open': 'فاتورة مفتوحة',
    'Loyalty Points': 'نقاط الولاء',
    'Gold tier · 716 to Platinum': 'المستوى الذهبي · 716 إلى البلاتيني',
    'Invoice History': 'سجل الفواتير',
    'invoices': 'فواتير',
    'View All': 'عرض الكل',
    'Payment History': 'سجل المدفوعات',
    'Internal Notes': 'ملاحظات داخلية',
    '+ Add Note': '+ إضافة ملاحظة',
    'Prefers delivery on weekends. Usually orders large quantities in December.': 'يفضل التسليم في عطلة نهاية الأسبوع. يطلب عادة كميات كبيرة في ديسمبر.',
    'Sometimes late on installments — send reminder 5 days before due date.': 'يتأخر أحياناً في الأقساط - أرسل تذكيراً قبل الاستحقاق بخمسة أيام.',
    'Write a new note…': 'اكتب ملاحظة جديدة...',
    'Contact Info': 'معلومات الاتصال',
    'Name': 'الاسم',
    'Customer ID': 'رقم العميل',
    'Phone': 'الهاتف',
    'Segment': 'القطاع',
    'Since': 'منذ',
    'Member Since': 'عضو منذ',
    'Account Balance': 'رصيد الحساب',
    'Total Paid': 'إجمالي المدفوع',
    'Loyalty Program': 'برنامج الولاء',
    'Silver': 'فضي',
    'Gold': 'ذهبي',
    'Gold ★': 'ذهبي ★',
    'Platinum': 'بلاتيني',
    'Platinum: 2,000': 'بلاتيني: 2,000',
    '716 more points to reach Platinum tier.': '716 نقطة إضافية للوصول إلى المستوى البلاتيني.',
    'Quick Actions': 'إجراءات سريعة',
    'Send Payment Reminder': 'إرسال تذكير بالدفع',
    'Email Invoice PDF': 'إرسال PDF الفاتورة بالبريد',
    'View Journal Entries': 'عرض القيود المحاسبية',
    'Export PDF': 'تصدير PDF',
    'Export Statement': 'تصدير كشف الحساب',
    'View All Invoices': 'عرض كل الفواتير',
    'Deactivate Customer': 'تعطيل العميل',
    'Statement': 'كشف حساب',
    'Points': 'النقاط',

    'Record Payment': 'تسجيل دفعة',
    'Select Invoice': 'اختيار الفاتورة',
    'Payment Details': 'تفاصيل الدفع',
    'Review': 'المراجعة',
    'Receipt': 'الإيصال',
    'Select Invoice to Pay': 'اختر الفاتورة للسداد',
    'Choose one or more outstanding invoices for this customer.': 'اختر فاتورة واحدة أو أكثر من الفواتير المستحقة لهذا العميل.',
    'Outstanding Invoices': 'الفواتير المستحقة',
    'Next': 'التالي',
    'Back': 'السابق',
    'Enter the amount, method, and account for this payment.': 'أدخل المبلغ وطريقة الدفع والحساب.',
    'Installment #2': 'القسط الثاني',
    'Pay All ($41.66)': 'سداد الكل ($41.66)',
    'Payment Method': 'طريقة الدفع',
    'Bank Transfer': 'تحويل بنكي',
    'Card': 'بطاقة',
    'Account': 'الحساب',
    'Main Bank Account (1002-01)': 'الحساب البنكي الرئيسي (1002-01)',
    'Petty Cash (1001-01)': 'النقدية الصغيرة (1001-01)',
    'Payment Date': 'تاريخ الدفع',
    'Allocate to Installments': 'توزيع على الأقساط',
    'Reference / Receipt #': 'المرجع / رقم الإيصال',
    'Notes': 'ملاحظات',
    'e.g. BANK-TXN-20240101': 'مثلاً: BANK-TXN-20240101',
    'Optional…': 'اختياري...',
    'Review Payment': 'مراجعة الدفع',
    'Confirm all details before posting the journal entry.': 'أكد كل التفاصيل قبل ترحيل القيد المحاسبي.',
    'Payment': 'الدفع',
    'Journal Entry Preview': 'معاينة القيد المحاسبي',
    'Cash / Bank Account': 'النقد / الحساب البنكي',
    'Accounts Receivable': 'الذمم المدينة',
    'Invoice Total': 'إجمالي الفاتورة',
    'Previously Paid': 'المدفوع سابقاً',
    'This Payment': 'هذه الدفعة',
    'Balance After': 'الرصيد بعد الدفع',
    'Once confirmed, this payment will post a journal entry immediately. This cannot be undone without voiding the payment.': 'بعد التأكيد، سيتم ترحيل القيد المحاسبي فوراً. لا يمكن التراجع دون إلغاء الدفعة.',
    'Once confirmed, a journal entry will be posted immediately.': 'بعد التأكيد، سيتم ترحيل قيد محاسبي فوراً.',
    'Confirm & Post': 'تأكيد وترحيل',
    'Payment Posted': 'تم ترحيل الدفعة',
    'Successfully recorded and posted to ledger': 'تم التسجيل والترحيل إلى الأستاذ بنجاح',
    'Method': 'الطريقة',
    'Remaining': 'المتبقي',
    'Total Collected': 'إجمالي المحصل',
    'Payment Recorded Successfully': 'تم تسجيل الدفعة بنجاح',
    'Journal entries have been posted automatically.': 'تم ترحيل القيود المحاسبية تلقائياً.',
    'Print': 'طباعة',
    'View Invoice': 'عرض الفاتورة',
    'New Payment': 'دفعة جديدة',
    'Payment Recorded!': 'تم تسجيل الدفعة!',
    'Journal entries posted automatically.': 'تم ترحيل القيود تلقائياً.',
    'Posted': 'مرحلة',
    'Search customer…': 'ابحث عن عميل...',
    'BANK-TXN-…': 'BANK-TXN-...',

    'Sale Invoice Details': 'تفاصيل فاتورة المبيعات',
    'Sale Invoice Details — Cash': 'تفاصيل فاتورة المبيعات - نقدي',
    'Partially Paid': 'مدفوعة جزئياً',
    'Installment · 3×': 'تقسيط · 3×',
    'Sale Invoice — Alex Thompson': 'فاتورة مبيعات - أليكس طومسون',
    'Posted': 'مرحلة',
    'Due': 'مستحقة',
    '1 / 3 paid': '1 / 3 مدفوع',
    'Void invoice': 'إلغاء الفاتورة',
    'Void': 'إلغاء',
    'Edit': 'تعديل',
    'After tax · Before DP': 'بعد الضريبة · قبل الدفعة المقدمة',
    'Paid So Far': 'المدفوع حتى الآن',
    'Down pmt + 1 installment': 'دفعة مقدمة + قسط واحد',
    'Balance Remaining': 'الرصيد المتبقي',
    '2 installments left': 'قسطان متبقيان',
    'Per Installment': 'لكل قسط',
    'Next due Dec 01, 2023': 'الاستحقاق التالي 01 ديسمبر 2023',
    'Payment Progress': 'تقدم الدفع',
    'of $92.49 collected': 'محصل من $92.49',
    '55% paid': '55% مدفوع',
    'Invoice Details': 'تفاصيل الفاتورة',
    'Tax Exclusive · 5%': 'ضريبة خارجية · 5%',
    'A/R Account': 'حساب الذمم',
    'Created By': 'أنشئت بواسطة',
    'Retail since 2021': 'تجزئة منذ 2021',
    'Customer #F-062 · Retail since 2021': 'العميل #F-062 · تجزئة منذ 2021',
    '2 lines': 'سطران',
    'Product Subtotal': 'إجمالي المنتجات الفرعي',
    'Shipping': 'الشحن',
    'Holiday Discount (10%)': 'خصم العطلات (10%)',
    'Net after costs & discounts': 'الصافي بعد التكاليف والخصومات',
    'Installment Payment Schedule': 'جدول سداد الأقساط',
    '3 installments · Monthly · Down payment recorded': '3 أقساط · شهري · تم تسجيل الدفعة المقدمة',
    '1 Paid': '1 مدفوع',
    '1 Due': '1 مستحق',
    '1 Upcoming': '1 قادم',
    'Received via Main Bank Account (1002-01)': 'تم الاستلام عبر الحساب البنكي الرئيسي (1002-01)',
    'Received': 'مستلم',
    'Installment #1': 'القسط الأول',
    'Installment #3': 'القسط الثالث',
    'Paid Dec 03, 2023 · 2 days late': 'دفع في 03 ديسمبر 2023 · متأخر يومين',
    'Due in 5 days · Reminder sent': 'مستحق خلال 5 أيام · تم إرسال تذكير',
    'Pay Now': 'ادفع الآن',
    'Scheduled': 'مجدول',
    'Upcoming': 'قادم',
    'Auto-generated': 'منشأ تلقائياً',
    'Account': 'الحساب',
    'Debit (DR)': 'مدين (DR)',
    'Credit (CR)': 'دائن (CR)',
    'Invoice total — Alex Thompson': 'إجمالي الفاتورة - أليكس طومسون',
    'Net revenue (products − disc)': 'صافي الإيراد (المنتجات - الخصم)',
    'Shipping Income': 'إيراد الشحن',
    'Shipping charge': 'رسوم الشحن',
    'Sales Discounts': 'خصومات المبيعات',
    'Holiday discount applied': 'تم تطبيق خصم العطلات',
    'VAT / Tax Payable': 'ضريبة القيمة المضافة / الضريبة المستحقة',
    'Cash / Bank Account': 'النقد / الحساب البنكي',
    'Down payment received': 'تم استلام الدفعة المقدمة',
    'Down payment offset': 'تسوية الدفعة المقدمة',
    'Activity Log': 'سجل النشاط',
    'Invoice created & posted': 'تم إنشاء الفاتورة وترحيلها',
    'Journal entries posted automatically': 'تم ترحيل القيود المحاسبية تلقائياً',
    'Auto-generated': 'منشأ تلقائياً',
    'DR': 'مدين',
    'CR': 'دائن',
    'Installment payments will post additional DR Cash / CR A/R entries as each is recorded.': 'دفعات الأقساط ستنشئ قيوداً إضافية: مدين نقد/بنك ودائن ذمم مدينة عند تسجيل كل دفعة.',

    'Paid in Full': 'مدفوعة بالكامل',
    'Cash Sale': 'بيع نقدي',
    'Sale Invoice — Daniel Park': 'فاتورة مبيعات - دانيال بارك',
    'Posted & settled': 'مرحلة ومسددة',
    'Immediate settlement': 'تسوية فورية',
    'Refund': 'استرداد',
    'Print Receipt': 'طباعة الإيصال',
    'Email Receipt': 'إرسال الإيصال',
    'Payment Received in Full': 'تم استلام الدفعة بالكامل',
    'Invoice total · Fully settled': 'إجمالي الفاتورة · مسددة بالكامل',
    'Tax inclusive': 'شاملة الضريبة',
    'Amount Tendered': 'المبلغ المستلم',
    'Cash paid by customer': 'نقد مدفوع من العميل',
    'Change Returned': 'الباقي المعاد',
    'Returned to customer': 'أعيد للعميل',
    'Balance Remaining': 'الرصيد المتبقي',
    'Fully settled': 'مسددة بالكامل',
    'Date & Time': 'التاريخ والوقت',
    'Cash Account': 'حساب النقدية',
    'Served By': 'خدم بواسطة',
    'Customer #F-177 · Walk-in retail': 'العميل #F-177 · عميل تجزئة مباشر',
    '3 lines': '3 أسطر',
    'Line Total': 'إجمالي السطر',
    'Member Loyalty Discount (5%)': 'خصم ولاء العضو (5%)',
    'Net after discounts': 'الصافي بعد الخصومات',
    'Payment Record': 'سجل الدفع',
    'Single transaction · settled at point of sale': 'معاملة واحدة · تمت تسويتها عند نقطة البيع',
    'Cash Payment — Full Amount': 'دفعة نقدية - كامل المبلغ',
    'Amount Tendered': 'المبلغ المستلم',
    'Change Returned': 'الباقي المعاد',
    'Balance After': 'الرصيد بعد الدفع',
    'Auto-generated on post': 'منشأ تلقائياً عند الترحيل',
    'Cash / Petty Cash': 'النقد / النقدية الصغيرة',
    'Cash received — Daniel Park': 'نقد مستلم - دانيال بارك',
    'Sales Revenue': 'إيرادات المبيعات',
    'Net revenue (products − discounts)': 'صافي الإيراد (المنتجات - الخصومات)',
    'Line disc. $1.00 + Loyalty $2.01': 'خصم السطر $1.00 + الولاء $2.01',
    'Balancing check — DR must equal CR': 'فحص التوازن - يجب أن يساوي المدين الدائن',
    'Invoice created (cash sale)': 'تم إنشاء الفاتورة (بيع نقدي)',
    'Receipt #RC-00441 printed': 'تمت طباعة الإيصال #RC-00441',
    'Cash Summary': 'ملخص النقد',
    'Sale Amount': 'مبلغ البيع',
    'Cash Tendered': 'النقد المستلم',
    'Change Given': 'الباقي المسلم',
  };

  const PHRASE_AR = [
    ['Alex Thompson', 'أليكس طومسون'],
    ['Daniel Park', 'دانيال بارك'],
    ['Sara Mendes', 'سارة مينديز'],
    ['Northfield Catering', 'نورثفيلد للتموين'],
    ['Ahmed Khalil', 'أحمد خليل'],
    ['Main Flagship Store', 'المتجر الرئيسي'],
    ['Main Downtown Hub', 'فرع وسط المدينة'],
    ['Airport Kiosk', 'كشك المطار'],
    ['Register #3', 'الصندوق #3'],
    ['Classic Beef Burger', 'برجر لحم كلاسيكي'],
    ['Crispy Chicken Wings', 'أجنحة دجاج مقرمشة'],
    ['Sparkling Lemonade', 'ليموناضة غازية'],
    ['Pepperoni Pizza (Large)', 'بيتزا ببروني (كبيرة)'],
    ['Signature grill', 'مشوي مميز'],
    ['14" hand-tossed', '14 بوصة محضرة يدوياً'],
    ['Bank Account', 'حساب بنكي'],
    ['Main Bank Account', 'الحساب البنكي الرئيسي'],
    ['Petty Cash', 'النقدية الصغيرة'],
    ['Installments #2 & #3 pending', 'القسطان الثاني والثالث معلقان'],
    ['Overdue since Dec 01', 'متأخرة منذ 01 ديسمبر'],
    ['Installment · 3 payments · $92.49 total', 'تقسيط · 3 دفعات · الإجمالي $92.49'],
    ['Credit · $215.00 total', 'آجل · الإجمالي $215.00'],
    ['Due Jan 01, 2024', 'مستحق 01 يناير 2024'],
    ['Due Feb 01, 2024', 'مستحق 01 فبراير 2024'],
    ['Jan 01, 2024', '01 يناير 2024'],
    ['Feb 01, 2024', '01 فبراير 2024'],
    ['Dec 01, 2023', '01 ديسمبر 2023'],
    ['Dec 03, 2023', '03 ديسمبر 2023'],
    ['Dec 10, 2023', '10 ديسمبر 2023'],
    ['Nov 01, 2023', '01 نوفمبر 2023'],
    ['November 01, 2023', '01 نوفمبر 2023'],
    ['Apr 25, 2026', '25 أبريل 2026'],
    ['09:42 AM', '09:42 ص'],
    ['Jan 2021', 'يناير 2021'],
    ['Oct 15, 2023', '15 أكتوبر 2023'],
    ['Nov 28, 2023', '28 نوفمبر 2023'],
    ['Dec 01 – Feb 01, 2024', '01 ديسمبر - 01 فبراير 2024'],
    ['Apr', 'أبريل'],
    ['Jan', 'يناير'],
    ['Feb', 'فبراير'],
    ['Nov', 'نوفمبر'],
    ['Dec', 'ديسمبر'],
    ['Cash', 'نقدي'],
    ['Installment', 'تقسيط'],
    ['Credit', 'آجل'],
    ['Advance', 'مقدم'],
    ['Paid', 'مدفوعة'],
    ['Partial', 'جزئية'],
    ['Overdue', 'متأخرة'],
    ['Draft', 'مسودة'],
    ['Voided', 'ملغية'],
  ];

  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();

  function translateText(original) {
    const trimmed = original.replace(/\s+/g, ' ').trim();
    if (!trimmed) return original;
    let translated = EXACT_AR[trimmed] || trimmed;
    for (const [from, to] of PHRASE_AR) {
      translated = translated.split(from).join(to);
    }
    if (translated === trimmed) return original;
    const lead = original.match(/^\s*/)[0];
    const tail = original.match(/\s*$/)[0];
    return lead + translated + tail;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest('script,style,svg,[data-cfemail]'));
  }

  function applyTextNodes(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (shouldSkipTextNode(node)) continue;
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
      const original = textOriginals.get(node);
      node.nodeValue = lang === 'ar' ? translateText(original) : original;
    }
  }

  function applyAttributes(lang) {
    const attrs = ['placeholder', 'title', 'aria-label'];
    document.querySelectorAll('[placeholder],[title],[aria-label]').forEach((el) => {
      let store = attrOriginals.get(el);
      if (!store) {
        store = {};
        attrOriginals.set(el, store);
      }
      for (const attr of attrs) {
        if (!el.hasAttribute(attr)) continue;
        if (store[attr] === undefined) store[attr] = el.getAttribute(attr);
        const original = store[attr];
        el.setAttribute(attr, lang === 'ar' ? translateText(original) : original);
      }
    });
  }

  function invoiceUrlFromRef(ref, fallbackType) {
    if (ROUTES.paidCashRefs.has(ref) || fallbackType === 'cash') return ROUTES.cash;
    return ROUTES[fallbackType] || ROUTES.installment;
  }

  function patchNavigation() {
    document.querySelectorAll('.crumbs a[href="/create-sale-invoice"]').forEach((a) => {
      a.href = route('invoiceList', '/invoice-list');
    });

    document.querySelectorAll('button, a').forEach((el) => {
      const label = el.textContent.replace(/\s+/g, ' ').trim();
      if (label === 'Record Payment' || label === 'تسجيل دفعة') {
        if (el.tagName === 'A') el.href = route('recordPayment', '/record-payment');
        else el.addEventListener('click', (event) => {
          event.preventDefault();
          window.location.href = route('recordPayment', '/record-payment');
        });
      }
    });

    document.querySelectorAll('.cust-card, .hero-left, .m-hero').forEach((el) => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (event) => {
        if (event.target.closest('a,button')) return;
        window.location.href = route('customerProfile', '/customer-profile');
      });
    });

    document.querySelectorAll('.inv-row, .m-inv-row').forEach((row) => {
      const ref = row.querySelector('.inv-ref,.ref')?.textContent.trim();
      if (!ref) return;
      row.style.cursor = 'pointer';
      row.onclick = () => {
        window.location.href = invoiceUrlFromRef(ref);
      };
    });

    document.querySelectorAll('.inv-row .icon-btn').forEach((btn) => {
      const row = btn.closest('.inv-row');
      const ref = row?.querySelector('.inv-ref,.ref')?.textContent.trim();
      if (!ref) return;
      const title = btn.getAttribute('title') || '';
      if (title === 'View' || title === 'عرض') {
        btn.onclick = (event) => {
          event.stopPropagation();
          window.location.href = invoiceUrlFromRef(ref);
        };
      }
    });

    const cancelButton = document.querySelector('.page-footer [data-i18n="btn-cancel"]');
    if (cancelButton && !cancelButton.dataset.linkedCancel) {
      cancelButton.dataset.linkedCancel = '1';
      cancelButton.addEventListener('click', () => {
        window.location.href = route('invoiceList', '/invoice-list');
      });
    }

    document.querySelectorAll('.page-footer .btn.primary, [data-i18n="btn-submit-mobile"]').forEach((btn) => {
      if (btn.dataset.linkedSubmit) return;
      btn.dataset.linkedSubmit = '1';
      btn.addEventListener('click', () => {
        const active = document.querySelector('#sale-type button.active, #m-sale-type button.active');
        window.location.href = invoiceUrlFromRef('', active?.dataset.v || 'installment');
      });
    });
  }

  function applyPageArabic(lang) {
    applyTextNodes(lang);
    applyAttributes(lang);
    patchNavigation();
  }

  function wrapFunction(name) {
    const fn = window[name] || globalThis[name];
    if (typeof fn !== 'function' || fn.__arabicWrapped) return;
    const wrapped = function (...args) {
      const result = fn.apply(this, args);
      applyPageArabic(document.documentElement.lang || 'en');
      return result;
    };
    wrapped.__arabicWrapped = true;
    try {
      window[name] = wrapped;
      globalThis[name] = wrapped;
      eval(`${name} = window["${name}"]`);
    } catch (_) {
      window[name] = wrapped;
    }
  }

  ['renderRows', 'renderInvHistory', 'renderInvOptions', 'renderAllocItems', 'render', 'goStep', 'setMStep', 'setFilter', 'filterRows'].forEach(wrapFunction);

  if (typeof window.applyLang === 'function' || typeof applyLang === 'function') {
    const originalApplyLang = window.applyLang || applyLang;
    if (!originalApplyLang.__arabicWrapped) {
      const wrappedApplyLang = function (lang) {
        const result = originalApplyLang.apply(this, arguments);
        applyPageArabic(lang);
        return result;
      };
      wrappedApplyLang.__arabicWrapped = true;
      try {
        window.applyLang = wrappedApplyLang;
        applyLang = wrappedApplyLang;
      } catch (_) {
        window.applyLang = wrappedApplyLang;
      }
    }
  }

  window.applyPageArabic = applyPageArabic;
  applyPageArabic(document.documentElement.lang || localStorage.getItem('invoice-lang') || 'en');
})();
