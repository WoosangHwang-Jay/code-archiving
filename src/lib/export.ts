import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Scroll to top to ensure full capture
  const originalScrollPos = window.scrollY;
  window.scrollTo(0, 0);

  // Create a temporary style to fix html2canvas issues (3D transforms, blurs, etc.)
  // Crucial: Tailwind v4 uses oklch/oklab which html2canvas doesn't support.
  // We force standard RGB/HEX colors for the export process.
  const style = document.createElement('style');
  style.innerHTML = `
    * { 
      color-interpolation: sRGB !important;
      /* Fallback for modern colors */
      --tw-text-opacity: 1 !important;
      color: rgb(241, 229, 172) !important; 
    }
    .prose, .report-content, p, span, h1, h2, h3 { 
      color: #f1e5ac !important; 
    }
    .bg-accent { background-color: #d4af37 !important; }
    .text-accent { color: #f1e5ac !important; }
    .preserve-3d { transform-style: flat !important; }
    .backface-hidden { backface-visibility: visible !important; }
    .rotate-y-180 { transform: none !important; position: relative !important; }
    .glass { 
      backdrop-filter: none !important; 
      background-color: #050810 !important; 
      background: #050810 !important;
    }
    #saju-bagua-image { animation: none !important; }
    .motion-safe-none { animation: none !important; transition: none !important; }
    
    /* Force ignore any oklch/oklab variables */
    :root {
      --color-accent: #d4af37 !important;
      --color-background: #050810 !important;
    }
  `;
  document.head.appendChild(style);

  try {
    // Wait for animations to settle (increased delay for complex charts)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const canvas = await html2canvas(element, {
      backgroundColor: '#050810',
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc) => {
        // STRATEGY: Remove all existing styles to avoid "oklab" parsing errors
        const originalStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        originalStyles.forEach(s => s.remove());

        // Inject only "Safe CSS" that html2canvas understands
        const safeStyle = clonedDoc.createElement('style');
        safeStyle.innerHTML = `
          * { 
            box-sizing: border-box; 
            margin: 0; padding: 0;
            color: #f1e5ac !important;
            border-color: rgba(241, 229, 172, 0.1) !important;
          }
          body { background-color: #050810 !important; font-family: sans-serif; }
          .glass { background: #0a0e17 !important; border: 1px solid rgba(241, 229, 172, 0.2) !important; }
          .bg-accent { background-color: #d4af37 !important; color: #050810 !important; }
          .text-accent { color: #f1e5ac !important; }
          .prose, .report-content { line-height: 1.8; font-size: 16px; color: #f1e5ac !important; }
          .font-mystic { font-family: serif; font-weight: bold; }
          .hidden { display: none !important; }
          .flex { display: flex !important; }
          .flex-col { flex-direction: column !important; }
          .grid { display: grid !important; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .gap-4 { gap: 1rem !important; }
          .mt-8 { margin-top: 2rem !important; }
          .p-8 { padding: 2rem !important; }
          .rounded-3xl { border-radius: 1.5rem !important; }
          .text-center { text-center: center !important; }
          
          /* Show elements meant for export */
          .export-only { display: block !important; }
          .no-export { display: none !important; }
        `;
        clonedDoc.head.appendChild(safeStyle);

        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
           clonedElement.style.padding = '30px';
           clonedElement.style.background = '#050810';
           clonedElement.style.display = 'block';
        }
      }
    });
    
    document.head.removeChild(style);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(filename);
    window.scrollTo(0, originalScrollPos);
  } catch (error) {
    if (style.parentNode) document.head.removeChild(style);
    window.scrollTo(0, originalScrollPos);
    console.error('PDF export failed:', error);
    throw error;
  }
};
