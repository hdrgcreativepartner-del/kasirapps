/*
 * HDRG Kasir Apps — Median.co Mobile Bridge
 *
 * Adds mobile-only enhancements without changing the existing POS logic:
 * - Native Median QR/barcode scanner integration.
 * - Barcode buttons are attached automatically to barcode-like inputs.
 * - A floating scanner button is available on sales/inventory pages.
 * - Scanned values are written into the active barcode field and Enter is dispatched.
 * - Printer adapter is exposed for a future Median custom Bluetooth thermal-printer plugin.
 *
 * Median injects `window.median` only inside the native app. In a normal browser,
 * this file remains harmless and falls back to the existing web UI/print dialog.
 */
(function () {
  'use strict';

  const HDRG = window.HDRGMobile = window.HDRGMobile || {};
  const BARCODE_RE = /(barcode|bar.?code|kode.?barang|kode.?produk|kode.?item|sku|ean|upc)/i;
  const SALES_RE = /(penjualan|kasir|transaksi|sales|checkout|jual)/i;
  const INVENTORY_RE = /(barang|produk|inventory|inventori|stok|restock|pembelian|purchase)/i;
  let lastBarcodeTarget = null;
  let scanBusy = false;

  HDRG.isMedian = function () {
    return !!(window.median && typeof window.median === 'object');
  };

  HDRG.scanBarcode = async function (target) {
    if (scanBusy) return null;
    scanBusy = true;
    lastBarcodeTarget = target || lastBarcodeTarget || findBestBarcodeInput();

    try {
      if (!window.median || !window.median.barcode || typeof window.median.barcode.scan !== 'function') {
        notify('Scanner native Median belum aktif. Aktifkan Native Plugins → QR / Barcode Scanner di Median App Studio.', 'warning');
        return null;
      }

      if (typeof window.median.barcode.setPrompt === 'function') {
        try { window.median.barcode.setPrompt('Arahkan kamera ke barcode produk'); } catch (_) {}
      }

      const result = await window.median.barcode.scan();
      if (!result || !result.success || !result.code) {
        if (result && result.error) notify(result.error, 'warning');
        return null;
      }

      const code = String(result.code).trim();
      setBarcodeValue(lastBarcodeTarget || findBestBarcodeInput(), code);
      notify('Barcode: ' + code, 'success');
      return code;
    } catch (error) {
      console.error('[HDRG] Median barcode error:', error);
      notify('Scanner barcode gagal dibuka.', 'error');
      return null;
    } finally {
      scanBusy = false;
    }
  };

  function isVisible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null;
  }

  function getContextText(el) {
    const parent = el.closest('.card, form, section, .page, .modal, [role="dialog"]');
    return ((parent && parent.innerText) || '') + ' ' +
      (el.id || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '') + ' ' +
      (el.getAttribute('aria-label') || '');
  }

  function findBarcodeInputs() {
    return Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'))
      .filter(el => isVisible(el) && BARCODE_RE.test(getContextText(el)));
  }

  function findBestBarcodeInput() {
    const inputs = findBarcodeInputs();
    if (!inputs.length) return null;
    const current = inputs.find(el => el === document.activeElement);
    if (current) return current;
    return inputs[0];
  }

  function setBarcodeValue(target, code) {
    if (!target) {
      // Keep a useful fallback for apps whose barcode input is dynamically rendered.
      const inputs = findBarcodeInputs();
      target = inputs[0] || null;
    }
    if (!target) {
      notify('Barcode terbaca: ' + code + '. Field barcode tidak ditemukan.', 'warning');
      return;
    }

    lastBarcodeTarget = target;
    target.focus();

    const proto = target.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(target, code); else target.value = code;

    ['input', 'change'].forEach(type => {
      target.dispatchEvent(new Event(type, { bubbles: true }));
    });

    // Existing POS implementations commonly use Enter to search/add a barcode.
    setTimeout(() => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      target.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      target.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    }, 40);
  }

  function pageContext() {
    const text = (document.body.innerText || '').slice(0, 12000);
    return text;
  }

  function isSalesPage() {
    const text = pageContext();
    return SALES_RE.test(text) && !INVENTORY_RE.test(text.slice(0, 1200));
  }

  function createScanButton(label, small) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hdrg-mobile-scan-btn' + (small ? ' small' : '');
    btn.innerHTML = '<span aria-hidden="true">▣</span><span>' + label + '</span>';
    btn.addEventListener('click', () => HDRG.scanBarcode(btn.dataset.target ? document.querySelector(btn.dataset.target) : null));
    return btn;
  }

  function cssEscapeSafe(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function attachFieldButtons() {
    findBarcodeInputs().forEach(input => {
      if (input.dataset.hdrgBarcodeButton === '1') return;
      input.dataset.hdrgBarcodeButton = '1';
      input.addEventListener('focus', () => { lastBarcodeTarget = input; });

      const btn = createScanButton('Scan', true);
      if (input.id) btn.dataset.target = '#' + cssEscapeSafe(input.id);
      else if (input.name) btn.dataset.target = '[name="' + String(input.name).replace(/"/g, '\\"') + '"]';
      else btn.dataset.target = '';

      const wrapper = document.createElement('div');
      wrapper.className = 'hdrg-barcode-field-wrap';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(btn);
    });
  }

  function attachFloatingButton() {
    if (document.getElementById('hdrgFloatingScan')) return;
    const btn = createScanButton(isSalesPage() ? 'Scan Produk' : 'Scan Barcode', false);
    btn.id = 'hdrgFloatingScan';
    document.body.appendChild(btn);
  }

  function injectStyles() {
    if (document.getElementById('hdrgMedianMobileStyles')) return;
    const style = document.createElement('style');
    style.id = 'hdrgMedianMobileStyles';
    style.textContent = `
      .hdrg-barcode-field-wrap { display:flex; align-items:stretch; gap:8px; width:100%; }
      .hdrg-barcode-field-wrap > input, .hdrg-barcode-field-wrap > textarea { flex:1; min-width:0; }
      .hdrg-mobile-scan-btn { border:0; border-radius:12px; background:#007AFF; color:#fff; font:600 13px/1 Inter,-apple-system,BlinkMacSystemFont,sans-serif; padding:0 14px; display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:44px; box-shadow:0 6px 16px rgba(0,122,255,.22); cursor:pointer; }
      .hdrg-mobile-scan-btn.small { flex:0 0 auto; min-height:44px; padding:0 12px; }
      .hdrg-mobile-scan-btn:active { transform:scale(.97); }
      #hdrgFloatingScan { position:fixed; right:16px; bottom:94px; z-index:9998; min-height:48px; padding:0 18px; border-radius:999px; }
      @media (min-width:800px) { #hdrgFloatingScan { display:none; } }
      .hdrg-mobile-toast { position:fixed; left:50%; bottom:154px; transform:translateX(-50%) translateY(12px); z-index:10000; padding:10px 14px; border-radius:12px; background:#1d1d1f; color:#fff; font:600 13px/1.35 Inter,-apple-system,BlinkMacSystemFont,sans-serif; box-shadow:0 10px 30px rgba(0,0,0,.2); opacity:0; pointer-events:none; transition:.2s ease; max-width:calc(100vw - 32px); text-align:center; }
      .hdrg-mobile-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      .hdrg-mobile-toast.success { background:#167c3b; }
      .hdrg-mobile-toast.warning { background:#9a6700; }
      .hdrg-mobile-toast.error { background:#b42318; }
    `;
    document.head.appendChild(style);
  }

  function notify(message, type) {
    let toast = document.querySelector('.hdrg-mobile-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'hdrg-mobile-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'hdrg-mobile-toast ' + (type || '') + ' show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // Printer adapter. Median's standard WebView cannot directly use Bluetooth.
  // A custom Median plugin can implement window.median.printer.printReceipt(payload).
  HDRG.printReceipt = async function (receipt) {
    try {
      if (window.median?.printer?.printReceipt) {
        return await window.median.printer.printReceipt(receipt);
      }
      // Browser/mobile-web fallback: use the existing printable receipt UI.
      window.print();
      return { success: true, fallback: 'system-print-dialog' };
    } catch (error) {
      console.error('[HDRG] Printer error:', error);
      notify('Printer tidak dapat digunakan.', 'error');
      return { success: false, error: String(error) };
    }
  };

  HDRG.getPlatform = async function () {
    try {
      if (window.median?.getPlatform) return await window.median.getPlatform();
      return 'web';
    } catch (_) { return 'web'; }
  };

  function boot() {
    injectStyles();
    attachFieldButtons();
    attachFloatingButton();

    // The existing app renders/re-renders sections dynamically. Re-scan the DOM lightly.
    const observer = new MutationObserver(() => attachFieldButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    // Prevent duplicate aggressive scans if a page is very dynamic.
    setTimeout(() => attachFieldButtons(), 500);
    setTimeout(() => attachFieldButtons(), 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
