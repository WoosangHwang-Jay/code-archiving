import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0e17', // Match the Jay Dosa theme background
      scale: 2,
      logging: true, // Enable logging temporarily to help identify issues
      useCORS: true, // Crucial for external images/fonts
      allowTaint: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2] // Scale back for proper PDF sizing
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error; // Rethrow to let the UI handle it
  }
};
