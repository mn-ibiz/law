interface InvoiceEmailData {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  firmName?: string;
}

export function invoiceDeliveryEmailHtml(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e293b; margin: 0 0 16px;">Invoice ${data.invoiceNumber}</h2>
    <p style="color: #475569; line-height: 1.6;">
      Dear ${data.clientName},
    </p>
    <p style="color: #475569; line-height: 1.6;">
      Please find your invoice details below:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Invoice Number:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${data.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Amount:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${data.amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Due Date:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${data.dueDate}</td>
      </tr>
    </table>
    <p style="color: #475569; line-height: 1.6;">
      Please ensure payment is made by the due date.
    </p>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">
      ${data.firmName ?? "Law Firm Registry"}
    </p>
  </div>
</body>
</html>`.trim();
}
