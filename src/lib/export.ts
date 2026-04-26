import jsPDF from 'jspdf';

// ─── Korean Font Loader ───────────────────────────────────────────────────────
let _koreanFontBase64: string | null = null;

async function loadKoreanFont(): Promise<string | null> {
  if (_koreanFontBase64) return _koreanFontBase64;
  try {
    const res = await fetch('/fonts/NotoSansKR-subset.ttf');
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    _koreanFontBase64 = btoa(binary);
    return _koreanFontBase64;
  } catch {
    return null;
  }
}

interface TarotCard {
  id: number;
  name: string;
  meaning: string;
}

interface SajuData {
  palja: string[];
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  fortuneScores: {
    wealth: number;
    honor: number;
    health: number;
    love: number;
    family: number;
    career: number;
    studies: number;
    relations: number;
  };
}

export interface ExportData {
  birthDate: string;
  userName?: string;
  sajuData: SajuData;
  sajuReport: string;
  tarotCards: TarotCard[];
  finalReport: string;
}

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

/** Loads an image URL into a data URL (JPEG) */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Splits long text into lines that fit within maxWidth (in mm, at current font size) */
function splitText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  return pdf.splitTextToSize(text, maxWidth);
}

/** Draws a horizontal rule */
function drawHR(pdf: jsPDF, x: number, y: number, width: number, color: [number, number, number] = [200, 180, 120]) {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.3);
  pdf.line(x, y, x + width, y);
}

/** Draws a filled rectangle with rounded-ish corners (jsPDF doesn't support real border-radius) */
function drawBox(pdf: jsPDF, x: number, y: number, w: number, h: number, fill: [number, number, number], stroke?: [number, number, number]) {
  pdf.setFillColor(...fill);
  if (stroke) pdf.setDrawColor(...stroke);
  pdf.rect(x, y, w, h, stroke ? 'FD' : 'F');
}

// ─── Page Management ──────────────────────────────────────────────────────────

class ReportBuilder {
  pdf: jsPDF;
  pageW: number;
  pageH: number;
  margin: number;
  contentW: number;
  y: number;
  pageNum: number;
  koreanFont: string = 'helvetica'; // fallback, replaced after registerFont()

  constructor() {
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.pageW = this.pdf.internal.pageSize.getWidth();   // 210mm
    this.pageH = this.pdf.internal.pageSize.getHeight();  // 297mm
    this.margin = 18;
    this.contentW = this.pageW - this.margin * 2;
    this.y = this.margin;
    this.pageNum = 1;
  }

  /** Call before building to embed Korean font */
  registerFont(base64: string) {
    // Register only once as 'normal' — jsPDF crashes at save() when the
    // same TTF data is registered twice (normal + bold) for custom fonts.
    this.pdf.addFileToVFS('KoreanFont.ttf', base64);
    this.pdf.addFont('KoreanFont.ttf', 'KoreanFont', 'normal');
    this.koreanFont = 'KoreanFont';
  }

  // style param kept for API compat but always uses 'normal' for custom fonts
  setKoreanFont(size: number, _style: 'normal' | 'bold' = 'normal') {
    this.pdf.setFontSize(size);
    this.pdf.setFont(this.koreanFont, 'normal');
  }

  /** Ensure there's at least `needed` mm left on the page, else add a new page */
  ensureSpace(needed: number) {
    if (this.y + needed > this.pageH - this.margin) {
      this.addPage();
    }
  }

  addPage() {
    this.pageFooter();
    this.pdf.addPage();
    this.pageNum++;
    this.y = this.margin;
    this.pageHeader();
  }

  pageHeader() {
    const pdf = this.pdf;
    drawBox(pdf, 0, 0, this.pageW, 6, [30, 25, 15]);
    this.setKoreanFont(7);
    pdf.setTextColor(180, 150, 80);
    pdf.text('JAY DOSA · MYSTIC ORACLE', this.margin, 4.5);
    pdf.text(`Page ${this.pageNum}`, this.pageW - this.margin, 4.5, { align: 'right' });
    this.y = Math.max(this.y, 12);
  }

  pageFooter() {
    const pdf = this.pdf;
    const fy = this.pageH - 8;
    drawHR(pdf, this.margin, fy - 2, this.contentW, [180, 150, 80]);
    this.setKoreanFont(7);
    pdf.setTextColor(150, 130, 80);
    pdf.text(`© ${new Date().getFullYear()} Jay Dosa · 본 리포트는 오락 목적으로 제공됩니다.`, this.pageW / 2, fy + 2, { align: 'center' });
  }

  // ── Section heading ──────────────────────────────────────────────────────────
  sectionHeading(title: string, subtitle?: string) {
    this.ensureSpace(18);
    const pdf = this.pdf;
    const x = this.margin;

    drawBox(pdf, x, this.y, this.contentW, subtitle ? 13 : 10, [25, 20, 10]);
    this.setKoreanFont(11, 'bold');
    pdf.setTextColor(220, 190, 100);
    pdf.text(title, x + 4, this.y + 6.5);
    if (subtitle) {
      this.setKoreanFont(7.5);
      pdf.setTextColor(160, 140, 80);
      pdf.text(subtitle, x + 4, this.y + 10.5);
    }
    this.y += subtitle ? 16 : 13;
  }

  // ── Body text (Markdown stripped) ────────────────────────────────────────────
  bodyText(text: string, fontSize = 9, color: [number, number, number] = [50, 45, 40]) {
    const pdf = this.pdf;
    const clean = text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^[-*]\s+/gm, '• ')
      .trim();

    this.setKoreanFont(fontSize);
    pdf.setTextColor(...color);

    const paragraphs = clean.split(/\n{2,}/);
    for (const para of paragraphs) {
      const lines = splitText(pdf, para, this.contentW - 4);
      for (const line of lines) {
        this.ensureSpace(5);
        if (line.startsWith('•')) {
          pdf.setTextColor(180, 150, 80);
          pdf.text(line, this.margin + 2, this.y);
          pdf.setTextColor(...color);
        } else if (/^#+\s/.test(line)) {
          this.setKoreanFont(fontSize + 1, 'bold');
          pdf.setTextColor(200, 170, 90);
          pdf.text(line.replace(/^#+\s/, ''), this.margin, this.y);
          this.setKoreanFont(fontSize);
          pdf.setTextColor(...color);
        } else {
          pdf.text(line, this.margin + 2, this.y);
        }
        this.y += 4.8;
      }
      this.y += 2;
    }
  }

  // ── 2-column key-value table ─────────────────────────────────────────────────
  infoTable(rows: [string, string][], colW = [50, -1]) {
    const pdf = this.pdf;
    const col2W = colW[1] < 0 ? this.contentW - colW[0] : colW[1];
    const rowH = 7;
    const x = this.margin;

    for (let i = 0; i < rows.length; i++) {
      this.ensureSpace(rowH + 1);
      const bg: [number, number, number] = i % 2 === 0 ? [248, 244, 232] : [255, 252, 240];
      drawBox(pdf, x, this.y, colW[0], rowH, [240, 228, 190], [220, 200, 150]);
      drawBox(pdf, x + colW[0], this.y, col2W, rowH, bg, [220, 200, 150]);

      this.setKoreanFont(8.5, 'bold');
      pdf.setTextColor(100, 80, 30);
      pdf.text(rows[i][0], x + 2, this.y + 4.8);

      this.setKoreanFont(8.5);
      pdf.setTextColor(50, 45, 35);
      const valLines = splitText(pdf, rows[i][1], col2W - 4);
      pdf.text(valLines[0] ?? '', x + colW[0] + 3, this.y + 4.8);
      this.y += rowH;
    }
    this.y += 4;
  }

  // ── Fortune score bar ─────────────────────────────────────────────────────────
  scoreBar(label: string, score: number) {
    this.ensureSpace(8);
    const pdf = this.pdf;
    const x = this.margin;
    const labelW = 32;
    const barW = this.contentW - labelW - 18;

    this.setKoreanFont(8);
    pdf.setTextColor(60, 50, 30);
    pdf.text(label, x, this.y + 4);

    drawBox(pdf, x + labelW, this.y + 1, barW, 4.5, [230, 220, 200]);
    const fillW = (score / 100) * barW;
    const barColor: [number, number, number] = score >= 80 ? [180, 140, 50] : score >= 60 ? [120, 160, 80] : [180, 100, 80];
    drawBox(pdf, x + labelW, this.y + 1, fillW, 4.5, barColor);
    this.setKoreanFont(7.5);
    pdf.setTextColor(80, 60, 20);
    pdf.text(`${score}점`, x + labelW + barW + 2, this.y + 4.5);
    this.y += 7;
  }

  gap(mm = 5) {
    this.y += mm;
  }
}

// ─── Main Export Function ─────────────────────────────────────────────────────

export const exportToPDF = async (data: ExportData, filename = 'jaydosa-oracle-report.pdf') => {
  const rb = new ReportBuilder();
  const { pdf, margin, contentW } = rb;

  // Load and register Korean font (silently fall back to helvetica if unavailable)
  const fontBase64 = await loadKoreanFont();
  if (fontBase64) rb.registerFont(fontBase64);

  // ══ COVER PAGE ══════════════════════════════════════════════════════════════
  // Dark background
  drawBox(pdf, 0, 0, rb.pageW, rb.pageH, [12, 10, 5]);

  // Gold accent bar top
  drawBox(pdf, 0, 0, rb.pageW, 3, [180, 140, 50]);

  // Ornament lines
  const cx = rb.pageW / 2;
  drawHR(pdf, margin, 40, contentW, [180, 140, 50]);
  drawHR(pdf, margin, 42, contentW, [100, 80, 30]);

  // Title (English & Chinese - use helvetica for these)
  pdf.setFontSize(28);
  pdf.setTextColor(220, 190, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CHUNMYUNG', cx, 70, { align: 'center' });

  rb.setKoreanFont(14);
  pdf.setTextColor(160, 140, 80);
  pdf.text('天命', cx, 82, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(130, 110, 60);
  pdf.text('Minhwa Oracle Report by Jay Dosa', cx, 94, { align: 'center' });

  drawHR(pdf, margin + 30, 100, contentW - 60, [180, 140, 50]);

  // Birth info box
  drawBox(pdf, margin + 20, 115, contentW - 40, 28, [20, 17, 8], [150, 120, 50]);
  rb.setKoreanFont(9);
  pdf.setTextColor(160, 140, 80);
  pdf.text('생년월일', cx, 125, { align: 'center' });
  rb.setKoreanFont(13, 'bold');
  pdf.setTextColor(220, 195, 110);
  pdf.text(data.birthDate, cx, 135, { align: 'center' });

  // Date generated
  rb.setKoreanFont(8);
  pdf.setTextColor(100, 90, 50);
  pdf.text(`발행일: ${new Date().toLocaleDateString('ko-KR')}`, cx, 160, { align: 'center' });

  // Bottom bar
  drawBox(pdf, 0, rb.pageH - 3, rb.pageW, 3, [180, 140, 50]);

  // ══ PAGE 2: SAJU OVERVIEW ══════════════════════════════════════════════════
  rb.pdf.addPage();
  rb.pageNum++;
  rb.y = margin;
  rb.pageHeader();

  // 팔자 table
  rb.sectionHeading('① 천간지지 팔자 (八字)', 'Four Pillars of Destiny');
  rb.gap(2);

  const pillarLabels = ['연주 (年柱)', '월주 (月柱)', '일주 (日柱)', '시주 (時柱)'];
  const palja = data.sajuData.palja;
  const pillarRows: [string, string][] = pillarLabels.map((label, i) => [
    label,
    `天干: ${palja[i * 2] ?? '-'}   地支: ${palja[i * 2 + 1] ?? '-'}`
  ]);
  rb.infoTable(pillarRows);

  // 오행 분포
  rb.sectionHeading('② 오행 분포 (五行)', 'Elemental Balance');
  rb.gap(2);

  const elementLabels: Record<string, string> = {
    wood: '木 (목 · Wood)',
    fire: '火 (화 · Fire)',
    earth: '土 (토 · Earth)',
    metal: '金 (금 · Metal)',
    water: '水 (수 · Water)',
  };
  const total = Object.values(data.sajuData.elements).reduce((a, b) => a + b, 0) || 1;
  for (const [key, label] of Object.entries(elementLabels)) {
    const count = data.sajuData.elements[key as keyof typeof data.sajuData.elements];
    const pct = Math.round((count / total) * 100);
    rb.scoreBar(label, pct);
  }

  // 운세 점수
  rb.gap(4);
  rb.sectionHeading('③ 천기 운세 점수 (天氣 分析)', 'Fortune Scores');
  rb.gap(2);

  const scoreLabels: Record<string, string> = {
    wealth: '재물운 (財)',
    honor: '명예운 (名)',
    health: '건강운 (健)',
    love: '연애운 (愛)',
    family: '가족운 (家)',
    career: '직업운 (職)',
    studies: '학업운 (學)',
    relations: '대인관계 (人)',
  };
  for (const [key, label] of Object.entries(scoreLabels)) {
    rb.scoreBar(label, data.sajuData.fortuneScores[key as keyof typeof data.sajuData.fortuneScores]);
  }

  // ══ PAGE 3: SAJU INTERPRETATION ════════════════════════════════════════════
  rb.addPage();
  rb.sectionHeading('④ Jay 도사의 사주 해석', 'Saju Interpretation');
  rb.gap(3);
  rb.bodyText(data.sajuReport || '사주 해석 데이터 없음.');

  // ══ TAROT SECTION ══════════════════════════════════════════════════════════
  if (data.tarotCards.length === 3) {
    rb.addPage();
    rb.sectionHeading('⑤ 민화 타로 — 선택된 카드 3장', 'Minhwa Tarot — Selected Cards');
    rb.gap(4);

    const cardLabels = ['과거의 기운', '현재의 흐름', '미래의 계시'];
    const cardW = 42;
    const cardH = 63; // 2:3 ratio
    const totalRowW = cardW * 3 + 10 * 2; // 3 cards + 2 gaps
    const startX = (rb.pageW - totalRowW) / 2;

    rb.ensureSpace(cardH + 25);

    // Load all 3 card images in parallel
    const imageDataUrls = await Promise.all(
      data.tarotCards.map(card => loadImageAsDataUrl(`/assets/tarot/card_${card.id}.png`))
    );

    for (let i = 0; i < 3; i++) {
      const cardX = startX + i * (cardW + 10);
      const cardY = rb.y;

      // Card border
      drawBox(pdf, cardX - 1, cardY - 1, cardW + 2, cardH + 2, [180, 140, 50]);
      drawBox(pdf, cardX, cardY, cardW, cardH, [240, 235, 220]);

      // Card image or fallback
      if (imageDataUrls[i]) {
        try {
          pdf.addImage(imageDataUrls[i]!, 'JPEG', cardX, cardY, cardW, cardH);
        } catch {
          pdf.setFontSize(8);
          pdf.setTextColor(120, 100, 60);
          pdf.text(data.tarotCards[i].name, cardX + cardW / 2, cardY + cardH / 2, { align: 'center' });
        }
      }

      // Position label below
      rb.setKoreanFont(7.5, 'bold');
      pdf.setTextColor(140, 110, 40);
      pdf.text(cardLabels[i], cardX + cardW / 2, cardY + cardH + 5, { align: 'center' });

      rb.setKoreanFont(7);
      pdf.setTextColor(80, 65, 35);
      const nameLines = splitText(pdf, data.tarotCards[i].name, cardW + 5);
      pdf.text(nameLines[0] ?? '', cardX + cardW / 2, cardY + cardH + 10, { align: 'center' });
    }

    rb.y += cardH + 22;
    rb.gap(4);

    // Card meanings table
    rb.sectionHeading('⑥ 카드별 핵심 의미', 'Card Meanings');
    rb.gap(2);
    for (let i = 0; i < 3; i++) {
      rb.infoTable([
        [cardLabels[i], `${data.tarotCards[i].name} — ${data.tarotCards[i].meaning}`]
      ], [36, -1]);
    }

    // ══ FINAL INTERPRETATION ═══════════════════════════════════════════════
    rb.addPage();
    rb.sectionHeading('⑦ Jay 도사의 민화 타로 종합 해석', 'Final Oracle Interpretation');
    rb.gap(3);
    rb.bodyText(data.finalReport || '최종 해석 데이터 없음.');
  }

  // ══ CLOSE ═════════════════════════════════════════════════════════════════
  rb.pageFooter();
  pdf.save(filename);
};
