/**
 * Universal Export Utilities for VRM Enterprise HRM
 * Provides standard, reliable client-side downloads for:
 * 1. Excel (.xls / SpreadsheetML)
 * 2. CSV (.csv with UTF-8 BOM)
 * 3. PDF (.pdf via formatted print/save engine)
 */

export interface ExportColumn {
  key: string;
  label: string;
}

const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Downloads data as a CSV file with UTF-8 BOM
 */
export function downloadCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: ExportColumn[]
): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const cols = columns && columns.length > 0
    ? columns
    : Object.keys(data[0]).map(k => ({ key: k, label: k }));

  const headers = cols.map(c => escapeCsv(c.label)).join(',');
  const rows = data.map(item => cols.map(c => escapeCsv(item[c.key])).join(','));

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Downloads data as a native Excel SpreadsheetML workbook (.xls)
 * Opens cleanly in Microsoft Excel, LibreOffice, and Google Sheets with formatted columns
 */
export function downloadExcel(
  data: Record<string, any>[],
  filename: string,
  columns?: ExportColumn[]
): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const cols = columns && columns.length > 0
    ? columns
    : Object.keys(data[0]).map(k => ({ key: k, label: k }));

  const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0E7490" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Report">
  <Table>`;

  const xmlColumns = cols.map(() => '<Column ss:AutoFitWidth="1" ss:Width="120"/>').join('');

  const xmlHeaderRow = `<Row ss:Height="24">` +
    cols.map(c => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`).join('') +
    `</Row>`;

  const xmlDataRows = data.map(item => {
    return `<Row ss:Height="18">` +
      cols.map(c => {
        const val = item[c.key];
        const isNum = typeof val === 'number';
        const type = isNum ? 'Number' : 'String';
        const formatted = val !== null && val !== undefined ? String(val) : '-';
        return `<Cell ss:StyleID="Data"><Data ss:Type="${type}">${escapeXml(formatted)}</Data></Cell>`;
      }).join('') +
      `</Row>`;
  }).join('');

  const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

  const excelContent = xmlHeader + xmlColumns + xmlHeaderRow + xmlDataRows + xmlFooter;
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerFileDownload(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

const escapeXml = (unsafe: string): string => {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Generates an official, publication-quality printable/saveable PDF document
 */
export function downloadPDF(
  data: Record<string, any>[],
  title: string,
  filename: string,
  columns?: ExportColumn[],
  companyName: string = 'VRM Enterprise HRM'
): void {
  const pdfWindow = window.open('', '_blank', 'width=950,height=750');
  if (!pdfWindow) {
    alert('Pop-up was blocked. Please allow pop-ups to view and save the PDF document.');
    return;
  }

  const cols = columns && columns.length > 0
    ? columns
    : Object.keys(data[0] || {}).map(k => ({ key: k, label: k }));

  const dateGenerated = new Date().toLocaleString();

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title} - ${companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #0F172A;
      padding: 28px;
      margin: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0E7490;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .pdf-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0E7490;
      margin: 0;
    }
    .pdf-meta {
      font-size: 0.78rem;
      color: #64748B;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      margin-top: 10px;
    }
    th {
      background-color: #0E7490 !important;
      color: #FFFFFF !important;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid #0891B2;
    }
    td {
      padding: 9px 12px;
      border: 1px solid #E2E8F0;
      color: #334155;
    }
    tr:nth-child(even) td {
      background-color: #F8FAFC !important;
    }
    .pdf-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94A3B8;
    }
    @media print {
      @page {
        margin: 12mm;
        size: auto;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div>
      <h1 class="pdf-title">${escapeXml(title)}</h1>
      <div class="pdf-meta">Generated: ${dateGenerated} • Total Records: ${data.length}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 800; color: #0F172A; font-size: 1.05rem;">${escapeXml(companyName)}</div>
      <div style="font-size: 0.75rem; color: #64748B;">Confidential Workforce Analytics</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        ${cols.map(c => `<th>${escapeXml(c.label)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(item => `
        <tr>
          ${cols.map(c => `<td>${escapeXml(item[c.key] !== null && item[c.key] !== undefined ? String(item[c.key]) : '-')}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="pdf-footer">
    <div>${escapeXml(companyName)} • Official Document</div>
    <div>Page 1 of 1</div>
  </div>

  <div class="no-print" style="margin-top: 24px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #0E7490; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">
      Save as PDF
    </button>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  pdfWindow.document.open();
  pdfWindow.document.write(html);
  pdfWindow.document.close();
}

/**
 * Downloads a specific styled DOM element (like Payslip, Offer Letter, Slip) as PDF
 */
export function downloadElementAsPDF(
  elementId: string,
  title: string,
  companyName: string = 'VRM Enterprise HRM'
): void {
  const elem = document.getElementById(elementId);
  if (!elem) {
    alert(`Document content "${elementId}" not found.`);
    return;
  }

  const pdfWindow = window.open('', '_blank', 'width=900,height=750');
  if (!pdfWindow) {
    alert('Pop-up was blocked. Please allow pop-ups to view and save the PDF document.');
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title} - ${companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #0F172A;
      padding: 24px;
      margin: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      @page {
        margin: 10mm;
        size: auto;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  ${elem.outerHTML}
  <div class="no-print" style="margin-top: 24px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #0E7490; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">
      Save as PDF
    </button>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  pdfWindow.document.open();
  pdfWindow.document.write(html);
  pdfWindow.document.close();
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
