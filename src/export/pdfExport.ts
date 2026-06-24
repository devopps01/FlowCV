import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  filename: string;
  scale?: number;
}

export const exportResumeToPdf = async (element: HTMLElement, options: ExportPdfOptions): Promise<void> => {
  const scale = options.scale ?? 2;
  const canvas = await html2canvas(element, { scale, useCORS: true, backgroundColor: '#ffffff' });
  const image = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;

  if (imageHeight <= pageHeight) {
    pdf.addImage(image, 'PNG', 0, 0, pageWidth, imageHeight);
  } else {
    let remaining = imageHeight;
    let position = 0;
    pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight);
    remaining -= pageHeight;
    while (remaining > 0) {
      position = remaining - imageHeight;
      pdf.addPage();
      pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight);
      remaining -= pageHeight;
    }
  }
  pdf.save(options.filename);
};
