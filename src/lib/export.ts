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

  try {
      // Wait for animations and markdown to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

    const canvas = await html2canvas(element, {
      backgroundColor: '#050810',
      scale: 1.5, // Reduced from 2.0 to prevent memory issues with long reports
      useCORS: true,
      allowTaint: false,
      logging: true, // Enable logging for debugging
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc) => {
        // STRATEGY: Instead of removing ALL styles, we inject a high-priority "Safe Style"
        // to override modern colors that cause parser errors.
        const safeStyle = clonedDoc.createElement('style');
        safeStyle.innerHTML = `
          /* Force standard sRGB for all elements to prevent oklab parsing errors */
          * { 
            color-interpolation: sRGB !important;
            color: #f1e5ac !important;
            border-color: rgba(241, 229, 172, 0.2) !important;
          }
          
          /* Layout Stability for Export */
          #report-section, #saju-section {
            width: 794px !important;
            padding: 40px !important;
            background-color: #050810 !important;
            margin: 0 auto !important;
            display: block !important;
          }

          /* Ensure all flex/grid containers maintain their layout */
          .flex { display: flex !important; }
          .grid { display: grid !important; }
          
          /* Tarot Card 3D Flattening */
          .preserve-3d { transform-style: flat !important; transform: none !important; }
          .backface-hidden { backface-visibility: visible !important; }
          .rotate-y-180 { transform: none !important; position: relative !important; }
          
          /* Interpretation Text Visibility */
          .report-content, .prose { 
            font-size: 16px !important;
            line-height: 1.8 !important;
            display: block !important;
            visibility: visible !important;
            color: #f1e5ac !important;
          }

          /* Hide UI elements that might have leaked through */
          .no-export { display: none !important; }
        `;
        clonedDoc.head.appendChild(safeStyle);

        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
            // Force manual overrides on the cloned element itself
            clonedElement.style.width = '794px';
            clonedElement.style.backgroundColor = '#050810';
            
            // FIX: Force Tarot Cards to be flipped and flat in the DOM directly
            const cards = clonedElement.querySelectorAll('.preserve-3d');
            cards.forEach(card => {
               (card as HTMLElement).style.transform = 'none';
               (card as HTMLElement).style.transformStyle = 'flat';
               
               const faces = card.querySelectorAll('.backface-hidden');
               faces.forEach((face, idx) => {
                  if (idx === 0) { // Back
                    (face as HTMLElement).style.display = 'none';
                  } else { // Front
                    (face as HTMLElement).style.transform = 'none';
                    (face as HTMLElement).style.display = 'block';
                    (face as HTMLElement).style.opacity = '1';
                    (face as HTMLElement).style.visibility = 'visible';
                  }
               });
            });
        }
      }
    });



    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate scaling to fit A4 width
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add subsequent pages if content is longer than A4 height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    window.scrollTo(0, originalScrollPos);
  } catch (error) {
    window.scrollTo(0, originalScrollPos);
    console.error('PDF export failed:', error);
    throw error;
  }
};
