function normalizeCsvValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(normalizeCsvValue).filter(Boolean).join('、')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value ?? '')
}

function escapeCsvValue(value: unknown): string {
  const text = normalizeCsvValue(value)
  if (!/[",\r\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

export function exportRecordsCsv(records: Record<string, unknown>[], filename: string) {
  const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record)))).slice(0, 80)
  const rows = [
    columns,
    ...records.map((record) => columns.map((column) => record[column])),
  ]
  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n')
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
