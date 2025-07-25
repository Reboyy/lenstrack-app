import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv<T extends Record<string, any>>(filename: string, data: T[]) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const replacer = (key: string, value: any) => value === null ? '' : value;
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    )
  ];
  
  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
