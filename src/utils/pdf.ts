import { jsPDF } from 'jspdf';
import type { ShootingGuide, VideoScenario } from '@/types';

const normalizeLine = (value: string | undefined): string => (value ?? '').replace(/\s+/g, ' ').trim();

const addSectionTitle = (doc: jsPDF, text: string, y: number): number => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 14, y);
  return y + 7;
};

const addParagraph = (doc: jsPDF, text: string, y: number): number => {
  if (!text) return y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 14, y);
  return y + lines.length * 6 + 2;
};

const ensurePageSpace = (doc: jsPDF, y: number, needed = 20): number => {
  if (y + needed < doc.internal.pageSize.height - 10) {
    return y;
  }
  doc.addPage();
  return 14;
};

const addList = (doc: jsPDF, label: string, values: string[], cursor: number): number => {
  if (values.length === 0) return cursor;
  let nextCursor = addSectionTitle(doc, label, cursor);
  values.forEach((value) => {
    nextCursor = addParagraph(doc, `- ${value}`, nextCursor);
  });
  return nextCursor;
};

export const downloadScenarioPdf = (scenarios: VideoScenario[], guide: ShootingGuide | null) => {
  if (scenarios.length === 0) return;
  const doc = new jsPDF();
  let cursor = 16;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VIRAL OS - сценарии и план съёмки', 14, cursor);
  cursor += 10;

  scenarios.forEach((scenario, index) => {
    cursor = ensurePageSpace(doc, cursor, 40);
    cursor = addSectionTitle(doc, `${index + 1}. ${scenario.title}`, cursor);
    cursor = addParagraph(doc, `ЦА: ${scenario.targetAudience} | Призыв: ${scenario.callToAction}`, cursor);
    cursor = addParagraph(doc, `Визуальный стиль: ${scenario.visualStyle}`, cursor);
    cursor = addParagraph(doc, normalizeLine(scenario.hook), cursor);
    cursor = addParagraph(doc, normalizeLine(scenario.narrative), cursor);

    scenario.beats.slice(0, 5).forEach((beat) => {
      cursor = ensurePageSpace(doc, cursor, 20);
      cursor = addSectionTitle(doc, `- ${beat.title} (${beat.durationSeconds}s)`, cursor);
      cursor = addParagraph(doc, normalizeLine(beat.description), cursor);
    });
  });

  if (guide) {
    cursor = ensurePageSpace(doc, cursor, 40);
    cursor = addList(doc, 'Ключевые моменты', guide.keyMoments, cursor);
    cursor = ensurePageSpace(doc, cursor, 30);
    cursor = addList(doc, 'Производственный календарь', guide.productionCalendar, cursor);

    guide.tips.slice(0, 5).forEach((tip, idx) => {
      cursor = ensurePageSpace(doc, cursor, 40);
      cursor = addSectionTitle(doc, `Тактика ${idx + 1}: ${tip.headline}`, cursor);
      cursor = addParagraph(doc, `Категория: ${tip.category}`, cursor);
      cursor = addParagraph(doc, normalizeLine(tip.summary), cursor);
      cursor = addList(doc, 'Шаги', tip.tips.map(normalizeLine), cursor);
      if (tip.equipment.length > 0) {
        cursor = addParagraph(doc, `Оборудование: ${tip.equipment.join(', ')}`, cursor);
      }
      if (tip.backupPlan) {
        cursor = addParagraph(doc, `План Б: ${tip.backupPlan}`, cursor);
      }
    });
  }

  doc.save('viral-os-guide.pdf');
};
