/**
 * Native RFC-4180 Compliant CSV Builder & Streamer
 */

export function convertToCSV(data, fields) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return fields ? fields.map(f => `"${f}"`).join(',') + '\r\n' : '';
  }

  const headers = fields || Object.keys(data[0]);

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCSV).join(',');
  const rows = data.map((item) =>
    headers.map((h) => escapeCSV(item[h] !== undefined ? item[h] : '')).join(',')
  );

  return [headerRow, ...rows].join('\r\n');
}

export function streamCSVResponse(res, filename, data, fields) {
  const csvContent = convertToCSV(data, fields);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
}

