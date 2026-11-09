import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  elementId: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Mathematical conversion of OKLAB color strings: oklab(L a b [/ alpha]) to sRGB rgb()/rgba() format.
 */
function oklabToRgb(str: string): string {
  const match = str.match(
    /oklab\(\s*([\d.]+%?)\s+([-\d.]+%?|none)\s+([-\d.]+%?|none)(?:\s*(?:\/|\s)\s*([\d.]+%?))?\s*\)/i
  );
  if (!match) return 'rgb(15, 23, 42)';

  try {
    const lStr = match[1];
    const aStr = match[2];
    const bStr = match[3];
    const alphaStr = match[4];

    const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    const a = aStr === 'none' ? 0 : (aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr));
    const b = bStr === 'none' ? 0 : (bStr.endsWith('%') ? parseFloat(bStr) / 100 : parseFloat(bStr));

    let A = 1;
    if (alphaStr) {
      A = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
    }

    const l_ = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m_ = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s_ = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);

    const r_lin = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const g_lin = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const b_lin = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    const gamma = (c: number) => {
      if (c <= 0) return 0;
      if (c >= 1) return 1;
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    const R = Math.min(255, Math.max(0, Math.round(gamma(r_lin) * 255)));
    const G = Math.min(255, Math.max(0, Math.round(gamma(g_lin) * 255)));
    const B = Math.min(255, Math.max(0, Math.round(gamma(b_lin) * 255)));

    if (isNaN(R) || isNaN(G) || isNaN(B)) {
      return 'rgb(15, 23, 42)';
    }

    return A < 1 ? `rgba(${R}, ${G}, ${B}, ${A})` : `rgb(${R}, ${G}, ${B})`;
  } catch {
    return 'rgb(15, 23, 42)';
  }
}

/**
 * Mathematical conversion of OKLCH color strings: oklch(L C H [/ alpha]) to sRGB rgb()/rgba() format.
 */
function oklchToRgb(str: string): string {
  const match = str.match(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+%?|none)\s+([\d.]+(?:deg|rad|turn)?|none)(?:\s*(?:\/|\s)\s*([\d.]+%?))?\s*\)/i
  );
  if (!match) return 'rgb(15, 23, 42)';

  try {
    const lStr = match[1];
    const cStr = match[2];
    const hStr = match[3];
    const aStr = match[4];

    const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    const C = cStr === 'none' ? 0 : (cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr));

    let H = 0;
    if (hStr && hStr !== 'none') {
      const hVal = parseFloat(hStr);
      if (hStr.endsWith('rad')) H = (hVal * 180) / Math.PI;
      else if (hStr.endsWith('turn')) H = hVal * 360;
      else H = hVal;
    }

    let A = 1;
    if (aStr) {
      A = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
    }

    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l_ = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m_ = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s_ = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);

    const r_lin = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const g_lin = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const b_lin = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    const gamma = (c: number) => {
      if (c <= 0) return 0;
      if (c >= 1) return 1;
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    const R = Math.min(255, Math.max(0, Math.round(gamma(r_lin) * 255)));
    const G = Math.min(255, Math.max(0, Math.round(gamma(g_lin) * 255)));
    const B = Math.min(255, Math.max(0, Math.round(gamma(b_lin) * 255)));

    if (isNaN(R) || isNaN(G) || isNaN(B)) {
      return 'rgb(15, 23, 42)';
    }

    return A < 1 ? `rgba(${R}, ${G}, ${B}, ${A})` : `rgb(${R}, ${G}, ${B})`;
  } catch {
    return 'rgb(15, 23, 42)';
  }
}

let _canvasCtx: CanvasRenderingContext2D | null = null;
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!_canvasCtx) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      _canvasCtx = canvas.getContext('2d');
    } catch {
      _canvasCtx = null;
    }
  }
  return _canvasCtx;
}

const colorCache = new Map<string, string>();

/**
 * Robustly converts any modern CSS color (oklab, oklch, lab, lch, color-mix, color(...))
 * to standard sRGB rgb()/rgba() or hex.
 */
export function convertColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  const trimmed = colorStr.trim();
  if (!trimmed || trimmed === 'transparent' || trimmed === 'inherit') return trimmed;

  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }

  // 1. Try native 2D canvas context (browsers natively convert all CSS colors to sRGB format)
  try {
    const ctx = getCanvasCtx();
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = trimmed;
      const res = ctx.fillStyle;
      if (
        res &&
        !res.includes('oklab') &&
        !res.includes('oklch') &&
        !res.includes('color(') &&
        !res.includes('lab(') &&
        !res.includes('color-mix')
      ) {
        colorCache.set(trimmed, res);
        return res;
      }
    }
  } catch {
    // fallback to mathematical converters below
  }

  // 2. Math converter for oklab
  if (trimmed.startsWith('oklab(')) {
    const res = oklabToRgb(trimmed);
    colorCache.set(trimmed, res);
    return res;
  }

  // 3. Math converter for oklch
  if (trimmed.startsWith('oklch(')) {
    const res = oklchToRgb(trimmed);
    colorCache.set(trimmed, res);
    return res;
  }

  // 4. Default safe fallback
  return 'rgb(15, 23, 42)';
}

/**
 * Replace all occurrences of unsupported modern CSS colors (oklab, oklch, lab, lch, color-mix, color(...))
 * inside any CSS string with standard rgb/rgba format.
 */
export function sanitizeCssColors(input: string): string {
  if (!input || typeof input !== 'string') return input;

  if (
    !input.includes('oklab') &&
    !input.includes('oklch') &&
    !input.includes('color-mix') &&
    !input.includes('color(') &&
    !input.includes('lab(') &&
    !input.includes('lch(')
  ) {
    return input;
  }

  let res = input;

  // color-mix(in oklab, ...) or color-mix(in srgb, ...)
  res = res.replace(/color-mix\([^)]+(?:\([^)]+\)[^)]*)*\)/gi, (match) => convertColorToRgb(match));

  // oklab(...)
  res = res.replace(/oklab\([^)]+\)/gi, (match) => convertColorToRgb(match));

  // oklch(...)
  res = res.replace(/oklch\([^)]+\)/gi, (match) => convertColorToRgb(match));

  // lab(...)
  res = res.replace(/lab\([^)]+\)/gi, (match) => convertColorToRgb(match));

  // lch(...)
  res = res.replace(/lch\([^)]+\)/gi, (match) => convertColorToRgb(match));

  // color(...)
  res = res.replace(/color\([^)]+\)/gi, (match) => convertColorToRgb(match));

  return res;
}

export async function downloadElementAsPDF({
  elementId,
  filename,
  orientation = 'portrait'
}: PDFExportOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element #${elementId} not found for PDF export.`);
    window.print();
    return false;
  }

  // Indonesian F4 / Folio paper size in mm: 215mm x 330mm
  const margin: [number, number, number, number] = orientation === 'landscape' ? [4, 4, 4, 4] : [6, 6, 6, 6];
  const format: [number, number] = orientation === 'landscape' ? [330, 215] : [215, 330];

  const opt = {
    margin: margin,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: orientation === 'landscape' ? 1280 : 980,
      onclone: (clonedDoc: Document) => {
        // 0. Explicitly remove any elements marked with .no-print, .no-pdf, or data-html2canvas-ignore
        const ignoreElements = clonedDoc.querySelectorAll(
          '.no-print, .no-pdf, [data-html2canvas-ignore="true"]'
        );
        ignoreElements.forEach((el) => {
          el.remove();
        });

        // If the action column was removed in Daftar Mutasi, adjust empty cell colspan from 10 to 9
        clonedDoc.querySelectorAll('.mutasi-empty-cell').forEach((el) => {
          el.setAttribute('colspan', '9');
        });

        // Reset gaps, outer margins and box-shadows on printable container to prevent multi-page spillover
        const printableAreas = clonedDoc.querySelectorAll(
          '#printable-rekap-area, #printable-usia-area, #printable-form8355-area, #printable-daftarsiswa-area, #printable-daftarabsen-area, #printable-daftarmutasi-area, #printable-rekapmutasi-area'
        );
        printableAreas.forEach((area) => {
          const el = area as HTMLElement;
          el.style.gap = '0px';
          el.style.margin = '0px';
          el.style.padding = '0px';
          el.style.transform = 'none';
          if (orientation === 'landscape') {
            el.style.width = '1080px';
            el.style.maxWidth = '1080px';
          }
        });

        const f4Pages = clonedDoc.querySelectorAll('.f4-landscape-page, .paper-f4');
        f4Pages.forEach((page) => {
          const p = page as HTMLElement;
          p.style.boxShadow = 'none';
          p.style.margin = '0px';
          p.style.marginBottom = '0px';
          p.style.borderRadius = '0px';
          p.style.transform = 'none';
        });

        // For landscape F4 pages, ensure full 1080px width, prevent clipping, and let content fit cleanly
        const landscapePages = clonedDoc.querySelectorAll('.f4-landscape-page');
        landscapePages.forEach((page) => {
          const p = page as HTMLElement;
          p.style.width = '1080px';
          p.style.maxWidth = '1080px';
          p.style.minHeight = '680px';
          p.style.overflow = 'visible';
          p.style.boxSizing = 'border-box';
          p.style.transform = 'none';
        });

        // 1. Sanitize all <style> tags in the cloned document for any unsupported colors
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((styleTag) => {
          if (styleTag.textContent) {
            styleTag.textContent = sanitizeCssColors(styleTag.textContent);
          }
        });

        // 2. Inject an override stylesheet with standard sRGB hex values for all Tailwind colors
        const overrideStyle = clonedDoc.createElement('style');
        overrideStyle.setAttribute('id', 'html2canvas-srgb-override');
        overrideStyle.textContent = `
          *, *::before, *::after, :root, html, body {
            --color-slate-50: #f8fafc !important;
            --color-slate-100: #f1f5f9 !important;
            --color-slate-200: #e2e8f0 !important;
            --color-slate-300: #cbd5e1 !important;
            --color-slate-400: #94a3b8 !important;
            --color-slate-500: #64748b !important;
            --color-slate-600: #475569 !important;
            --color-slate-700: #334155 !important;
            --color-slate-800: #1e293b !important;
            --color-slate-900: #0f172a !important;
            --color-slate-950: #020617 !important;
            --color-blue-50: #eff6ff !important;
            --color-blue-100: #dbeafe !important;
            --color-blue-200: #bfdbfe !important;
            --color-blue-500: #3b82f6 !important;
            --color-blue-600: #2563eb !important;
            --color-blue-700: #1d4ed8 !important;
            --color-blue-900: #1e3a8a !important;
            --color-pink-50: #fdf2f8 !important;
            --color-pink-100: #fce7f3 !important;
            --color-pink-500: #ec4899 !important;
            --color-pink-600: #db2777 !important;
            --color-pink-900: #831843 !important;
            --color-emerald-50: #ecfdf5 !important;
            --color-emerald-500: #10b981 !important;
            --color-emerald-600: #059669 !important;
            --color-rose-50: #fff1f2 !important;
            --color-rose-600: #e11d48 !important;
            --color-amber-50: #fffbeb !important;
            --color-amber-500: #f59e0b !important;
            --color-amber-600: #d97706 !important;
            --color-white: #ffffff !important;
            --color-black: #000000 !important;
          }
          table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
          }
          th, td {
            box-sizing: border-box !important;
          }
          thead th {
            vertical-align: middle !important;
            line-height: 1.25 !important;
            overflow: visible !important;
          }
        `;
        clonedDoc.head.appendChild(overrideStyle);

        // 3. Normalize all elements in the cloned document so no computed style has oklab, oklch, lab, or color(...)
        const allElements = clonedDoc.querySelectorAll('*') as NodeListOf<HTMLElement>;
        const colorAttributes = [
          'color',
          'backgroundColor',
          'borderTopColor',
          'borderRightColor',
          'borderBottomColor',
          'borderLeftColor',
          'borderColor',
          'outlineColor',
          'textDecorationColor'
        ] as const;

        const defaultView = clonedDoc.defaultView || window;

        allElements.forEach((el) => {
          if (!el || !el.style) return;
          try {
            // Check direct style attribute string
            if (el.hasAttribute('style')) {
              const currentStyle = el.getAttribute('style');
              if (
                currentStyle &&
                (currentStyle.includes('oklab') ||
                  currentStyle.includes('oklch') ||
                  currentStyle.includes('color-mix') ||
                  currentStyle.includes('color(') ||
                  currentStyle.includes('lab('))
              ) {
                el.setAttribute('style', sanitizeCssColors(currentStyle));
              }
            }

            const computed = defaultView.getComputedStyle(el);
            if (!computed) return;

            for (const attr of colorAttributes) {
              const val = computed[attr as keyof CSSStyleDeclaration] as string;
              if (
                val &&
                typeof val === 'string' &&
                (val.includes('oklab') ||
                  val.includes('oklch') ||
                  val.includes('color-mix') ||
                  val.includes('color(') ||
                  val.includes('lab(') ||
                  val.includes('lch('))
              ) {
                (el.style as any)[attr] = sanitizeCssColors(val);
              }
            }

            if (computed.boxShadow) {
              const bs = computed.boxShadow;
              if (
                bs.includes('oklab') ||
                bs.includes('oklch') ||
                bs.includes('color-mix') ||
                bs.includes('color(') ||
                bs.includes('lab(')
              ) {
                el.style.boxShadow = sanitizeCssColors(bs);
              }
            }

            if (computed.textShadow) {
              const ts = computed.textShadow;
              if (
                ts.includes('oklab') ||
                ts.includes('oklch') ||
                ts.includes('color-mix') ||
                ts.includes('color(') ||
                ts.includes('lab(')
              ) {
                el.style.textShadow = sanitizeCssColors(ts);
              }
            }
          } catch {
            // Continue gracefully
          }
        });
      }
    },
    jsPDF: {
      unit: 'mm',
      format: format,
      orientation: orientation
    },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.error('html2pdf generation error, falling back to window.print():', err);
    window.print();
    return false;
  }
}
