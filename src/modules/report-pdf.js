/* report-pdf.js: saves the visible content of a module page as a real PDF file (no print dialog).
 * Reuses the jsPDF library and the Arabic shaping helper already loaded by the app (same approach as the Costing PDF export).
 * API: SIYBReportPdf.save({ root, title, filename, lang })  -> Promise<boolean> */
(function () {
  'use strict';
  const SKIP = 'button,script,style,.num-step,.gyb-noprint,.gyb-actions,.ps-actions,.gyb-steps,.gyb-pager,nav,[hidden],[aria-hidden="true"]';
  const BLOCK = /^(DIV|P|UL|OL|TABLE|H1|H2|H3|H4|H5|H6|SECTION|ARTICLE|HEADER|FIELDSET|DETAILS|SUMMARY|FORM|MAIN)$/;
  const hasAr = (s) => /[\u0600-\u065F\u066A-\u06FF]/.test(s); // letters only: Arabic-Indic digits alone must not flip a line to RTL

  function textOf(el) {
    let out = '';
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) out += n.nodeValue;
      else if (n.nodeType === 1) {
        if (n.matches(SKIP)) return;
        const tag = n.tagName;
        if (tag === 'BR') out += '\n';
        else if (tag === 'INPUT') { if (n.type !== 'checkbox' && n.type !== 'radio' && n.type !== 'file') out += ' ' + n.value; else if (n.checked) out += ' ✓'; }
        else if (tag === 'TEXTAREA') out += ' ' + n.value;
        else if (tag === 'SELECT') out += ' ' + (n.selectedOptions[0] ? n.selectedOptions[0].textContent : '');
        else out += textOf(n);
      }
    });
    return out.replace(/[ \t\r\f]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
  }

  function collect(root) {
    const blocks = [];
    (function walk(el) {
      Array.from(el.children).forEach((c) => {
        if (c.matches(SKIP)) return;
        const tag = c.tagName;
        if (/^H[1-6]$/.test(tag)) { const t = textOf(c); if (t) blocks.push({ t: 'h', level: Math.min(4, +tag[1]), text: t }); }
        else if (tag === 'UL' || tag === 'OL') Array.from(c.children).forEach((li, i) => { if (li.matches(SKIP)) return; const t = textOf(li); if (t) blocks.push({ t: 'li', text: (tag === 'OL' ? (i + 1) + '. ' : '• ') + t }); });
        else if (tag === 'TABLE') {
          const rows = Array.from(c.querySelectorAll('tr')).map((tr) => Array.from(tr.children).map((td) => textOf(td)));
          const hasHead = !!c.querySelector('thead');
          if (rows.length) blocks.push({ t: 'table', heads: hasHead ? rows.shift() : null, rows });
        } else if (c.classList.contains('gyb-bar')) { /* progress bar: no text */ }
        else if (Array.from(c.children).some((k) => BLOCK.test(k.tagName) && !k.matches(SKIP))) walk(c);
        else { const t = textOf(c); if (t) blocks.push({ t: 'p', text: t }); }
      });
    })(root);
    return blocks;
  }

  function suspendArabicParser(pdf, JsPDFClass) {
    const restores = [];
    try {
      const events = pdf.internal && pdf.internal.events;
      const topics = events && typeof events.getTopics === 'function' ? events.getTopics() : null;
      if (topics && topics.preProcessText) {
        Object.keys(topics.preProcessText).forEach((token) => {
          const fn = topics.preProcessText[token][0];
          if (fn === JsPDFClass.API.processArabic || (JsPDFClass.API.__arabicParser__ && fn === JsPDFClass.API.__arabicParser__.processArabic)) {
            events.unsubscribe(token); restores.push(() => events.subscribe('preProcessText', fn));
          }
        });
      }
    } catch (e) { /* keep going */ }
    try {
      const original = JsPDFClass.API.processArabic;
      if (original) { JsPDFClass.API.processArabic = undefined; restores.push(() => { JsPDFClass.API.processArabic = original; }); }
    } catch (e) { /* keep going */ }
    return () => restores.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
  }

  function toast(msg) {
    let t = document.getElementById('siybPdfToast');
    if (!t) { t = document.createElement('div'); t.id = 'siybPdfToast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1d3f58;color:#fff;padding:10px 16px;border-radius:12px;z-index:9999;font:600 14px Cairo,sans-serif;max-width:90vw;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.25)'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = 'none'; }, 3500);
  }

  async function save(opts) {
    const ar = (opts.lang || document.documentElement.lang) !== 'en';
    const M = (a, e) => (ar ? a : e);
    const JsPDF = window.jspdf && window.jspdf.jsPDF || window.jsPDF; const arabic = window.SIYBArabicPDF;
    if (!JsPDF || !arabic) { toast(M('تعذر تحميل مكتبة PDF', 'The PDF library could not be loaded')); return false; }
    const rootEl = opts.root; if (!rootEl) return false;
    toast(M('جارٍ إنشاء ملف PDF…', 'Creating the PDF file…'));
    const restore = (() => { try { return suspendArabicParser(new JsPDF(), JsPDF); } catch (e) { return () => {}; } })();
    try {
      const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const restorePdf = suspendArabicParser(pdf, JsPDF);
      const font = await arabic.loadArabicFont(pdf);
      if (!font) throw new Error('Arabic font unavailable');
      pdf.setFont(font, 'normal'); pdf.setR2L(false);
      const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
      const mg = 14, usable = W - 2 * mg; let y = 0;
      const vis = { isInputVisual: true, isOutputVisual: true, isInputRtl: false, isOutputRtl: false };
      const wrap = (s, w) => String(s).split('\n').flatMap((ln) => (hasAr(ln) ? pdf.splitTextToSize(arabic.shapeArabic(ln), Math.max(3, w)).map((l) => arabic.bidiVisual(l)) : pdf.splitTextToSize(ln, Math.max(3, w))));
      const put = (line, x, base, align) => { pdf.text(line, x, base, Object.assign({ align }, hasAr(line) || ar ? vis : {})); };
      const alignFor = (line) => (ar || hasAr(line) ? 'right' : 'left');
      const xFor = (a) => (a === 'right' ? W - mg : mg);
      const banner = (cont) => {
        pdf.setFillColor(29, 63, 88); pdf.rect(0, 0, W, 20, 'F');
        pdf.setFont(font, 'normal'); pdf.setFontSize(14); pdf.setTextColor(255, 255, 255);
        const ttl = String(opts.title || ''); const L = wrap(ttl, usable)[0] || '';
        put(L, ar ? W - mg : mg, 9, ar ? 'right' : 'left');
        pdf.setFontSize(8); pdf.setTextColor(214, 232, 242);
        const sub = (cont ? M('متابعة', 'continued') + ' · ' : '') + new Date().toLocaleDateString(ar ? 'ar-IQ' : 'en-GB');
        put(sub, ar ? W - mg : mg, 16, ar ? 'right' : 'left');
        y = 28;
      };
      const room = (h) => { if (y + h > H - 14) { pdf.addPage('a4', 'portrait'); banner(true); } };
      banner(false);
      const sizes = { 1: 15, 2: 13, 3: 11.5, 4: 10 };
      collect(rootEl).forEach((b) => {
        if (b.t === 'h') {
          const size = sizes[b.level]; pdf.setFontSize(size); const lines = wrap(b.text, usable); const lh = size * 0.42;
          room(lines.length * lh + 5); y += b.level <= 2 ? 3 : 1;
          pdf.setTextColor(15, 90, 122);
          lines.forEach((l) => { put(l, xFor(alignFor(l)), y, alignFor(l)); y += lh; });
          if (b.level <= 3) { pdf.setDrawColor(36, 168, 224); pdf.setLineWidth(0.3); pdf.line(mg, y - 1.2, W - mg, y - 1.2); }
          y += 1.5;
        } else if (b.t === 'p' || b.t === 'li') {
          pdf.setFontSize(9.5); pdf.setTextColor(38, 57, 68); const lines = wrap(b.text, usable - (b.t === 'li' ? 3 : 0)); const lh = 4.4;
          lines.forEach((l, i) => { room(lh + 1); const a = alignFor(l); put(l, xFor(a) + (b.t === 'li' ? (a === 'right' ? -3 : 3) : 0), y, a); y += lh; });
          y += 1.2;
        } else if (b.t === 'table') {
          const n = Math.max(b.heads ? b.heads.length : 0, ...b.rows.map((r) => r.length)); if (!n) return;
          const lens = Array.from({ length: n }, (_, i) => Math.min(38, Math.max(6, ...[(b.heads || [])[i] || ''].concat(b.rows.map((r) => r[i] || '')).map((s) => String(s).length))));
          const sum = lens.reduce((a, c) => a + c, 0); const ws = lens.map((l) => (l * usable) / sum);
          const colX = (i) => { const off = ws.slice(0, i).reduce((a, c) => a + c, 0); return ar ? W - mg - off : mg + off; };
          const drawRow = (cells, head) => {
            pdf.setFontSize(8); const lh = 3.7;
            const wr = cells.map((c, i) => wrap(c || '—', ws[i] - 3)); const rh = Math.max(...wr.map((l) => l.length)) * lh + 2.4;
            room(rh + 1); const top = y;
            if (head) { pdf.setFillColor(234, 246, 252); pdf.rect(mg, top, usable, rh, 'F'); }
            pdf.setDrawColor(207, 227, 236); pdf.setLineWidth(0.2); pdf.rect(mg, top, usable, rh);
            pdf.setTextColor(head ? 15 : 38, head ? 90 : 57, head ? 122 : 68);
            cells.forEach((c, i) => { wr[i].forEach((l, k) => { const a = ar ? 'right' : (hasAr(l) ? 'right' : 'left'); const x = ar ? colX(i) - 1.5 : (a === 'right' ? colX(i) + ws[i] - 1.5 : colX(i) + 1.5); put(l, x, top + 3.6 + k * lh, a); }); if (i) { pdf.line(ar ? colX(i) : colX(i), top, colX(i), top + rh); } });
            y += rh;
          };
          if (b.heads) drawRow(b.heads, true);
          b.rows.forEach((r) => drawRow(Array.from({ length: n }, (_, i) => r[i]), false));
          y += 3;
        }
      });
      const pages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= pages; p++) { pdf.setPage(p); pdf.setFont(font, 'normal'); pdf.setFontSize(8); pdf.setTextColor(120, 135, 145); pdf.text(String(p) + ' / ' + String(pages), W / 2, H - 6, { align: 'center' }); }
      pdf.save(opts.filename || ('SIYB-report-' + new Date().toISOString().slice(0, 10) + '.pdf'));
      restorePdf();
      toast(M('تم حفظ ملف PDF', 'PDF file saved'));
      return true;
    } catch (e) {
      console.error('SIYB report PDF failed:', e);
      toast(M('تعذر إنشاء ملف PDF، حاول مجدداً', 'Could not create the PDF file, please try again'));
      return false;
    } finally { restore(); }
  }
  window.SIYBReportPdf = { save, collect };
})();
