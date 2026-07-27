'use client';

import { useState, useRef } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

// The service's signature purple, and boxes that guarantee text contrast on it.
const PDF_PURPLE = '#241442';
const PDF_BOX_BG = 'rgba(12,8,28,0.62)';
const PDF_BOX_BORDER = 'rgba(201,168,76,0.35)';
const PDF_TEXT = '#efe9ff';
const PDF_GOLD = '#e6c15a';
const PDF_MUTED = '#b9a9e0';

interface FTheme { id: string; name: string; icon: string; d2: number; desc: string; }

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string; gender?: string };
  themes: ReadonlyArray<FTheme>;
  premiumToken: string;
  lang: 'ko' | 'zh' | 'en';
  title?: string; // cover title override, e.g. the love report's own name
  persona?: string;
}

const STRINGS = {
  ko: {
    title: 'AI 베딕 프리미엄 통합 보고서',
    start: (n: number) => `📕 ${n}개 챕터 통합 보고서 생성`,
    note: (n: number) => `${n}개 챕터를 이어서 해석합니다 — 약 3~5분 걸리니 페이지를 닫지 마세요`,
    generating: (name: string, i: number, n: number) => `${i}/${n} · ${name} 해석 중...`,
    resume: '▶ 이어서 생성',
    failed: '생성이 중단되었습니다. 이어서 다시 시도할 수 있어요.',
    pdf: '📥 PDF로 다운로드',
    pdfBusy: '📥 PDF 만드는 중...',
    done: (n: number) => `${n}개 챕터 해석이 모두 완성되었습니다`,
    toc: '차례',
  },
  zh: {
    title: 'AI吠陀高级完整报告',
    start: (n: number) => `📕 生成${n}章完整报告`,
    note: (n: number) => `将连续解读${n}个章节 — 大约需要3~5分钟，请勿关闭页面`,
    generating: (name: string, i: number, n: number) => `${i}/${n} · 正在解读 ${name}...`,
    resume: '▶ 继续生成',
    failed: '生成中断，可以继续重试。',
    pdf: '📥 下载PDF',
    pdfBusy: '📥 正在生成PDF...',
    done: (n: number) => `${n}个章节的解读已全部完成`,
    toc: '目录',
  },
  en: {
    title: 'AI Vedic Premium Full Report',
    start: (n: number) => `📕 Generate the Full ${n}-Chapter Report`,
    note: (n: number) => `Reads all ${n} chapters in sequence — takes about 3–5 minutes, keep this page open`,
    generating: (name: string, i: number, n: number) => `${i}/${n} · Reading ${name}...`,
    resume: '▶ Resume',
    failed: 'Generation was interrupted. You can resume where it stopped.',
    pdf: '📥 Download PDF',
    pdfBusy: '📥 Building PDF...',
    done: (n: number) => `All ${n} chapter readings are complete`,
    toc: 'Contents',
  },
} as const;

export default function PremiumFullReport({ chart, birthInfo, themes, premiumToken, lang, title, persona = 'tara' }: Props) {
  // Session cache: finished sections survive tab switches and page reloads for
  // the same chart, so buyers never pay the 3-5 minute generation twice.
  // The theme-id list keeps different reports (premium vs love) apart.
  const cacheKey = `jyoti_fullreport_${lang}|${themes.map(t => t.id).join('.')}|${birthInfo.name}|${birthInfo.date}|${birthInfo.time}|${birthInfo.place}|${birthInfo.gender ?? ''}|${persona}`;
  const [sections, setSections] = useState<{ theme: FTheme; text: string }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const arr = JSON.parse(cached) as { id: string; text: string }[];
        return arr
          .map(({ id, text }) => {
            const t = themes.find(th => th.id === id);
            return t ? { theme: t, text } : null;
          })
          .filter((x): x is { theme: FTheme; text: string } => x !== null);
      }
    } catch {}
    return [];
  });
  const [current, setCurrent] = useState(-1); // index being generated; -1 idle
  const [error, setError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const S = STRINGS[lang];
  const doneAll = sections.length === themes.length;

  // Renders the hidden purple report to a real PDF file and downloads it in one
  // click — no browser print dialog. html2canvas rasterizes the off-screen
  // node; jsPDF slices that tall image across A4 pages.
  async function downloadPdf() {
    const node = pdfRef.current;
    if (!node || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      // Capture the whole report ONCE so every line renders correctly (per-block
      // capture clipped line bottoms). Then slice it only at paragraph bottoms.
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: PDF_PURPLE, useCORS: true, logging: false });
      const scale = canvas.height / node.offsetHeight; // css px -> canvas px
      const nodeTop = node.getBoundingClientRect().top;
      const yOf = (el: Element) => (el.getBoundingClientRect().bottom - nodeTop) * scale;

      const cover = node.querySelector<HTMLElement>('[data-pdf-cover]')!;
      const coverBottom = yOf(cover);
      // Cut only after a paragraph (not a heading) so lines stay whole and a
      // heading always travels onto the next page with the paragraph beneath it.
      const cuts = Array.from(node.querySelectorAll('[data-pdf-body] p'))
        .map(yOf).filter(y => y > coverBottom && y <= canvas.height)
        .sort((a, b) => a - b);
      cuts.push(canvas.height);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 210, pageH = 297, margin = 16;
      const contentW = pageW - margin * 2;
      const pxPerMm = canvas.width / contentW;
      const usablePx = (pageH - margin * 2) * pxPerMm;

      const place = (fromPx: number, toPx: number, firstPage: boolean) => {
        const h = toPx - fromPx;
        const slice = document.createElement('canvas');
        slice.width = canvas.width; slice.height = h;
        const ctx = slice.getContext('2d')!;
        ctx.fillStyle = PDF_PURPLE; ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, fromPx, canvas.width, h, 0, 0, canvas.width, h);
        if (!firstPage) pdf.addPage();
        pdf.setFillColor(PDF_PURPLE); pdf.rect(0, 0, pageW, pageH, 'F');
        pdf.addImage(slice.toDataURL('image/jpeg', 0.94), 'JPEG', margin, margin, contentW, h / pxPerMm);
      };

      // Page 1: the cover and table of contents alone.
      place(0, coverBottom, true);
      // Chapters from page 2, each page filled up to the last paragraph that fits.
      let startPx = coverBottom;
      while (startPx < canvas.height - 1) {
        const maxEnd = startPx + usablePx;
        let endPx = cuts.filter(c => c > startPx && c <= maxEnd).pop() ?? maxEnd;
        if (endPx <= startPx) endPx = Math.min(maxEnd, canvas.height);
        place(startPx, Math.min(endPx, canvas.height), false);
        startPx = endPx;
      }
      const base = (title ?? S.title).replace(/[\\/:*?"<>|]/g, '');
      pdf.save(`${base} - ${birthInfo.name}.pdf`);
    } catch {
      // Raster/library failure is rare; fall back to the browser print dialog.
      window.print();
    }
    setPdfBusy(false);
  }

  async function generate() {
    setError('');
    const RETRY_DELAYS = [1500, 3500];
    let acc = sections;
    outer:
    for (let i = acc.length; i < themes.length; i++) {
      const t = themes[i];
      setCurrent(i);
      // Silently retry transient throttles so one hiccup doesn't stall the report.
      for (let attempt = 0; ; attempt++) {
        try {
          const res = await fetch('/api/interpret', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chart, birthInfo, lang, persona,
              theme: { name: t.name, desc: t.desc, d2: t.d2, premiumId: t.id },
              premiumToken,
            }),
          });
          const data = await res.json();
          if (res.ok && data.interpretation) {
            acc = [...acc, { theme: t, text: data.interpretation }];
            setSections(acc);
            try { sessionStorage.setItem(cacheKey, JSON.stringify(acc.map(s => ({ id: s.theme.id, text: s.text })))); } catch {}
            break;
          }
          if ((res.status === 429 || res.status >= 500) && attempt < RETRY_DELAYS.length) {
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt])); continue;
          }
          setError(data.error ?? S.failed); break outer;
        } catch {
          if (attempt < RETRY_DELAYS.length) { await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt])); continue; }
          setError(S.failed); break outer;
        }
      }
    }
    setCurrent(-1);
  }

  function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} style={{ color: 'var(--gold-light)' }}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  }

  function formatInterpretation(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { elements.push(<div key={key++} className='h-3' />); continue; }
      // Markdown horizontal rules (---, ***, ___) render as literal dashes —
      // drop them so no stray divider shows between paragraphs.
      if (/^([-*_])\1{2,}$/.test(trimmed)) continue;
      const hMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (hMatch) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {hMatch[2].replace(/\*\*/g, '')}
        </h2>); continue;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {trimmed.slice(2, -2)}
        </h2>); continue;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<p key={key++} className='text-sm leading-relaxed mb-1.5 pl-3' style={{ color: 'var(--text)' }}>
          <span style={{ color: 'var(--gold-light)', marginRight: '6px' }}>·</span>
          {renderInline(trimmed.slice(2))}
        </p>); continue;
      }
      const numBold = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (numBold) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {numBold[1]}
        </h2>); continue;
      }
      elements.push(<p key={key++} className='text-sm leading-relaxed mb-2' style={{ color: 'var(--text)' }}>
        {renderInline(trimmed)}
      </p>);
    }
    return elements;
  }

  return (
    <div>
      {sections.length === 0 && current < 0 && (
        <div className='text-center py-6'>
          <div className='text-4xl mb-3'>📕</div>
          <p className='text-xs mb-4' style={{ color: 'var(--text-muted)' }}>{S.note(themes.length)}</p>
          <button className='btn-gold' onClick={generate}>{S.start(themes.length)}</button>
          {error && <p className='text-xs mt-3' style={{ color: '#fca5a5' }}>{error}</p>}
        </div>
      )}

      {(sections.length > 0 || current >= 0) && (
        <div className='print-report'>
          <div className='mb-6 pb-4 text-center' style={{ borderBottom: '2px solid rgba(201,168,76,0.35)' }}>
            <p className='text-xs font-cinzel tracking-widest' style={{ color: 'var(--gold-dim)' }}>{title ?? S.title}</p>
            <p className='font-cinzel font-bold text-xl mt-1' style={{ color: 'var(--gold-light)' }}>{birthInfo.name}</p>
            <p className='text-xs mt-0.5 mb-4' style={{ color: 'var(--text-muted)' }}>{birthInfo.date} · {birthInfo.time} · {birthInfo.place}</p>
            <div className='inline-block text-left px-6 py-3 rounded-lg' style={{ border: '1px solid rgba(201,168,76,0.25)' }}>
              <p className='text-[10px] font-cinzel tracking-widest mb-1.5 text-center' style={{ color: 'var(--gold-dim)' }}>✦ {S.toc} ✦</p>
              {themes.map((t, i) => (
                <p key={t.id} className='text-xs mb-0.5' style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--gold-dim)' }}>{i + 1}.</span> {t.icon} {t.name}
                </p>
              ))}
            </div>
          </div>

          {sections.map(({ theme, text }, idx) => (
            <div key={theme.id} className='report-section mb-10'>
              <h2 className='font-cinzel font-bold text-lg mb-4 pb-2'
                style={{ color: 'var(--gold-light)', borderBottom: '2px solid rgba(201,168,76,0.3)' }}>
                {theme.icon} {idx + 1}. {theme.name}
              </h2>
              <div className='ai-prose'>{formatInterpretation(text)}</div>
            </div>
          ))}

          {current >= 0 && (
            <div className='text-center py-8 no-print'>
              <div className='relative w-16 h-16 mx-auto mb-3'>
                <svg viewBox='0 0 80 80' className='spin-slow absolute inset-0 w-full h-full'>
                  <circle cx='40' cy='40' r='35' fill='none' stroke='rgba(201,168,76,0.3)' strokeWidth='1' strokeDasharray='4 4' />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center text-xl'>🔮</div>
              </div>
              <p className='font-cinzel text-sm' style={{ color: 'var(--gold)' }}>
                {S.generating(themes[current].name, current + 1, themes.length)}
              </p>
            </div>
          )}

          {error && current < 0 && !doneAll && (
            <div className='text-center py-4 no-print'>
              <p className='text-xs mb-3' style={{ color: '#fca5a5' }}>{error}</p>
              <button className='btn-gold' onClick={generate}>{S.resume}</button>
            </div>
          )}

          {doneAll && (
            <div className='mt-4 pt-4 text-center no-print' style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
              <p className='text-xs mb-3' style={{ color: 'var(--gold-dim)' }}>✨ {S.done(themes.length)}</p>
              <button className='btn-gold' onClick={downloadPdf} disabled={pdfBusy}>
                {pdfBusy ? S.pdfBusy : S.pdf}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Off-screen purple report captured for the one-click PDF download. */}
      {doneAll && (
        <div aria-hidden style={{ position: 'absolute', left: '-99999px', top: 0, pointerEvents: 'none' }}>
          <div ref={pdfRef} style={{
            width: '794px', background: PDF_PURPLE, padding: '52px 44px',
            fontFamily: '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif', color: PDF_TEXT,
          }}>
            <div data-pdf-cover style={{ textAlign: 'center', paddingTop: '70px' }}>
              <p style={{ fontSize: '15px', letterSpacing: '0.34em', color: PDF_GOLD, margin: 0 }}>✦ {(title ?? S.title).toUpperCase()} ✦</p>
              <p style={{ fontSize: '38px', fontWeight: 700, color: PDF_GOLD, margin: '22px 0 8px' }}>{birthInfo.name}</p>
              <p style={{ fontSize: '14px', color: PDF_MUTED, margin: '0 0 52px' }}>{birthInfo.date} · {birthInfo.time} · {birthInfo.place}</p>
              <div style={{ textAlign: 'left', padding: '32px 40px', borderRadius: '16px', background: PDF_BOX_BG, border: `1px solid ${PDF_BOX_BORDER}` }}>
                <p style={{ fontSize: '14px', letterSpacing: '0.28em', textAlign: 'center', color: PDF_GOLD, margin: '0 0 24px' }}>✦ {S.toc} ✦</p>
                {themes.map((t, i) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'baseline', gap: '14px',
                    fontSize: '20px', padding: '13px 6px', color: PDF_TEXT,
                    borderBottom: i < themes.length - 1 ? `1px solid ${PDF_BOX_BORDER}` : 'none',
                  }}>
                    <span style={{ color: PDF_GOLD, fontWeight: 700, minWidth: '26px' }}>{i + 1}</span>
                    <span>{t.icon} {t.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-pdf-body>
              {sections.map(({ theme, text }, idx) => (
                <div key={theme.id} style={{ marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '19px', fontWeight: 700, color: PDF_GOLD, margin: '0 0 16px', paddingBottom: '10px', borderBottom: `1.5px solid ${PDF_BOX_BORDER}` }}>
                    {theme.icon} {idx + 1}. {theme.name}
                  </h2>
                  <div className='pdf-prose'>{formatInterpretation(text)}</div>
                </div>
              ))}
              <p style={{ textAlign: 'center', fontSize: '11px', color: PDF_MUTED, marginTop: '10px' }}>✦ Jyoti — Vedic Astrology ✦</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
