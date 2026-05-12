import { Donation, Donor } from '../types';

const ORG_NAME = 'Donation Impact Tracker';
const ORG_EIN = '12-3456789';
const ORG_ADDRESS = '123 Impact Street, San Francisco, CA 94102';

export interface ReceiptData {
  donation: Donation;
  donor?: Donor;
  receiptNumber: string;
}

export interface YearEndSummaryData {
  donor: Donor;
  donations: Donation[];
  year: number;
  totalAmount: number;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const getRecipientName = (donation: Donation, donor?: Donor): string =>
  donor?.name || donation.donorName;

const getSharedStyles = (): string => `
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; background: #f3f4f6; }
  .receipt { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white; }
  .receipt-header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
  .receipt-header h1 { margin: 0 0 8px 0; font-size: 24px; }
  .receipt-header p { margin: 0; opacity: 0.9; font-size: 14px; }
  .receipt-body { padding: 30px; }
  .receipt-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
  .receipt-row:last-of-type { border-bottom: none; }
  .receipt-label { color: #6b7280; font-size: 14px; }
  .receipt-value { font-weight: 600; color: #1f2937; text-align: right; }
  .receipt-amount { font-size: 32px; font-weight: 700; color: #4f46e5; text-align: center; margin: 20px 0; }
  .receipt-footer { background: #f9fafb; padding: 20px 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .tax-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin: 20px 0; font-size: 13px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; }
  td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
  tfoot td { font-weight: 700; background: #f9fafb; }
  .summary-total { font-size: 24px; font-weight: 700; color: #4f46e5; text-align: center; margin: 24px 0 8px; }
  .summary-total-label { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 20px; }
  @media print { body { background: white; padding: 0; } }
`;

export const generateReceiptHTML = (data: ReceiptData): string => {
  const { donation, donor, receiptNumber } = data;
  const receiptDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt #${receiptNumber} - ${ORG_NAME}</title>
  <style>${getSharedStyles()}</style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>&#x1F49D; ${ORG_NAME}</h1>
      <p>Official Tax-Deductible Donation Receipt</p>
    </div>
    <div class="receipt-body">
      <div class="receipt-amount">${formatCurrency(donation.amount)}</div>
      <div class="receipt-row">
        <span class="receipt-label">Receipt Number</span>
        <span class="receipt-value">#${receiptNumber}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Receipt Date</span>
        <span class="receipt-value">${receiptDate}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Donor Name</span>
        <span class="receipt-value">${getRecipientName(donation, donor)}</span>
      </div>
      ${donor ? `<div class="receipt-row">
        <span class="receipt-label">Donor Email</span>
        <span class="receipt-value">${donor.email}</span>
      </div>` : ''}
      <div class="receipt-row">
        <span class="receipt-label">Donation Date</span>
        <span class="receipt-value">${formatDate(donation.date)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Campaign</span>
        <span class="receipt-value">${donation.campaign}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Region</span>
        <span class="receipt-value">${donation.region}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Transaction ID</span>
        <span class="receipt-value">${donation.id}</span>
      </div>
      <div class="tax-notice">
        <strong>Tax Deductibility Notice:</strong> This contribution is tax-deductible to the extent allowed by law.
        No goods or services were provided in exchange for this donation. Please retain this receipt for your tax records.
      </div>
    </div>
    <div class="receipt-footer">
      <p><strong>${ORG_NAME}</strong> &nbsp;|&nbsp; EIN: ${ORG_EIN} &nbsp;|&nbsp; ${ORG_ADDRESS}</p>
      <p>For questions, contact <strong>support@donationimpacttracker.org</strong></p>
    </div>
  </div>
</body>
</html>`;
};

export const generateYearEndSummaryHTML = (data: YearEndSummaryData): string => {
  const { donor, donations, year, totalAmount } = data;
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const campaignBreakdown: { [key: string]: number } = {};
  donations.forEach(d => {
    campaignBreakdown[d.campaign] = (campaignBreakdown[d.campaign] || 0) + d.amount;
  });

  const donationRows = donations
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(
      d => `<tr>
      <td>${formatDate(d.date)}</td>
      <td>${d.campaign}</td>
      <td>${d.region}</td>
      <td style="text-align:right">${formatCurrency(d.amount)}</td>
      <td style="color:#6b7280">${d.id}</td>
    </tr>`
    )
    .join('');

  const campaignRows = Object.entries(campaignBreakdown)
    .map(
      ([campaign, amount]) => `<tr>
      <td>${campaign}</td>
      <td style="text-align:right">${formatCurrency(amount)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${year} Year-End Donation Summary - ${donor.name}</title>
  <style>${getSharedStyles()}</style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>&#x1F49D; ${ORG_NAME}</h1>
      <p>${year} Year-End Donation Summary &amp; Tax Document</p>
    </div>
    <div class="receipt-body">
      <div class="receipt-row">
        <span class="receipt-label">Donor Name</span>
        <span class="receipt-value">${donor.name}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Email</span>
        <span class="receipt-value">${donor.email}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Tax Year</span>
        <span class="receipt-value">${year}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Generated On</span>
        <span class="receipt-value">${generatedDate}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Total Donations</span>
        <span class="receipt-value">${donations.length}</span>
      </div>

      <div class="summary-total">${formatCurrency(totalAmount)}</div>
      <div class="summary-total-label">Total Donated in ${year}</div>

      <h3 style="color:#374151;margin-bottom:8px">Donation History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Campaign</th>
            <th>Region</th>
            <th style="text-align:right">Amount</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>${donationRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3">Total for ${year}</td>
            <td style="text-align:right">${formatCurrency(totalAmount)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <h3 style="color:#374151;margin-bottom:8px">Campaign Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th style="text-align:right">Total Amount</th>
          </tr>
        </thead>
        <tbody>${campaignRows}</tbody>
      </table>

      <div class="tax-notice">
        <strong>Tax Deductibility Notice:</strong> All donations listed above are tax-deductible to the extent allowed by law.
        No goods or services were provided in exchange for these donations. Please retain this document for your tax records.
      </div>
    </div>
    <div class="receipt-footer">
      <p><strong>${ORG_NAME}</strong> &nbsp;|&nbsp; EIN: ${ORG_EIN} &nbsp;|&nbsp; ${ORG_ADDRESS}</p>
      <p>For questions, contact <strong>support@donationimpacttracker.org</strong></p>
    </div>
  </div>
</body>
</html>`;
};

export const downloadHTMLFile = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadReceipt = (donation: Donation, donor?: Donor): void => {
  const receiptNumber = `RCP-${donation.id.toUpperCase()}`;
  const html = generateReceiptHTML({ donation, donor, receiptNumber });
  downloadHTMLFile(html, `receipt-${donation.id}-${donation.date}.html`);
};

export const downloadYearEndSummary = (donor: Donor, donations: Donation[], year: number): void => {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const html = generateYearEndSummaryHTML({ donor, donations, year, totalAmount });
  const safeName = donor.name.replace(/\s+/g, '-').toLowerCase();
  downloadHTMLFile(html, `tax-summary-${safeName}-${year}.html`);
};

export const generateEmailContent = (donation: Donation, donor?: Donor): { subject: string; body: string } => {
  const receiptNumber = `RCP-${donation.id.toUpperCase()}`;
  const donationDate = formatDate(donation.date);
  const amount = formatCurrency(donation.amount);
  const recipientName = getRecipientName(donation, donor);

  const subject = `Thank You for Your Donation – Receipt ${receiptNumber}`;
  const body = `Dear ${recipientName},

Thank you for your generous donation to ${ORG_NAME}. Your contribution makes a real difference in the lives of those we serve.

Donation Details
────────────────────────────────────────
Receipt Number : ${receiptNumber}
Date           : ${donationDate}
Amount         : ${amount}
Campaign       : ${donation.campaign}
Region         : ${donation.region}
Transaction ID : ${donation.id}
────────────────────────────────────────

This donation is tax-deductible to the extent allowed by law. No goods or services were provided in exchange for this donation.

Organization : ${ORG_NAME}
EIN          : ${ORG_EIN}
Address      : ${ORG_ADDRESS}

You can download your official receipt from the Donation Impact Tracker portal at any time.

With gratitude,
The ${ORG_NAME} Team`;

  return { subject, body };
};
