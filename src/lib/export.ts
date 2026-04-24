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
      scale: 1.5, // Slightly lower for better stability
      useCORS: true,
      allowTaint: false,
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc) => {
        // Show hidden elements meant only for export
        const exportOnlyElements = clonedDoc.querySelectorAll('.export-only');
        exportOnlyElements.forEach(el => {
          (el as HTMLElement).style.display = 'block';
        });

        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
           clonedElement.style.padding = '30px';
           clonedElement.style.background = '#050810';
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
