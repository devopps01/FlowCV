import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'json';
  quality?: number;
  filename?: string;
}

export interface ExportData {
  content: any;
  elements?: any[];
  design?: any;
  title?: string;
}

export async function exportToPDF(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}

export async function exportToPNG(
  element: HTMLElement,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2 * (options.quality || 1),
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png',
        options.quality
      );
    });
  } catch (error) {
    console.error('PNG export error:', error);
    throw error;
  }
}

export function exportToJSON(data: ExportData): Blob {
  const exportObj = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    title: data.title || 'Resume',
    content: data.content,
    elements: data.elements,
    design: data.design,
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);
  return new Blob([jsonStr], { type: 'application/json' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportResume(
  element: HTMLElement,
  data: ExportData,
  options: ExportOptions
): Promise<void> {
  const filename = options.filename || `resume-${Date.now()}`;

  let blob: Blob;

  switch (options.format) {
    case 'pdf':
      blob = await exportToPDF(element, options);
      downloadBlob(blob, `${filename}.pdf`);
      break;

    case 'png':
      blob = await exportToPNG(element, options);
      downloadBlob(blob, `${filename}.png`);
      break;

    case 'json':
      blob = exportToJSON(data);
      downloadBlob(blob, `${filename}.json`);
      break;

    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function copyImageToClipboard(element: HTMLElement): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );

    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    }
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    throw error;
  }
}
