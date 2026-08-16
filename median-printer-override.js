/* HDRG Kasir Apps — Median native printer override
 *
 * Replaces the old navigator.bluetooth() implementation used by BT Print.
 * The web app never talks to Bluetooth directly. Inside Median, the native
 * printer plugin handles Bluetooth Classic/BLE, USB, LAN/Wi-Fi and ESC/POS.
 *
 * Expected native bridge:
 *   median.printer.listPrinters({transports: [...]})
 *   median.printer.connect(printer)
 *   median.printer.printReceipt(receipt)
 *   median.printer.disconnect()
 *
 * If the native plugin is not installed, the user gets a clear configuration
 * message instead of the misleading Web Bluetooth browser error.
 */
(function () {
  'use strict';

  function toast(message, type) {
    if (typeof window.HDRGMobileToast === 'function') return window.HDRGMobileToast(message, type);
    let el = document.getElementById('hdrgPrinterToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hdrgPrinterToast';
      el.style.cssText = 'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:100000;max-width:calc(100vw - 32px);padding:12px 16px;border-radius:14px;background:#1d1d1f;color:#fff;font:600 13px/1.4 Inter,system-ui,sans-serif;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.25);opacity:0;transition:.2s;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.background = type === 'error' ? '#b42318' : type === 'success' ? '#167c3b' : '#1d1d1f';
    el.style.opacity = '1';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.opacity = '0'; }, 3200);
  }

  function nativePrinter() {
    return window.median && window.median.printer ? window.median.printer : null;
  }

  function buildReceipt() {
    const sale = currentNotaSale;
    if (!sale) return null;
    const p = profile || {};
    return {
      version: 1,
      store: p.name || (storeData && storeData.name) || 'Toko',
      address: p.address || '',
      phone: p.phone || '',
      social: p.social || '',
      date: sale.date,
      cashier: sale.cashier || '',
      invoice: sale.id || '',
      items: (sale.items || []).map(i => ({
        name: i.name || 'Produk',
        qty: Number(i.qty || 1),
        price: Number(i.price || 0),
        total: Number(i.price || 0) * Number(i.qty || 1),
        unit: i.unit || 'pcs'
      })),
      subtotal: Number(sale.total || 0),
      discount: 0,
      tax: 0,
      total: Number(sale.total || 0),
      paid: Number(sale.paid || sale.total || 0),
      change: Number(sale.change || 0),
      payment: sale.method || 'Cash',
      footer: 'Terima kasih!'
    };
  }

  function ensureModal() {
    let modal = document.getElementById('hdrgPrinterPicker');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'hdrgPrinterPicker';
    modal.style.cssText = 'position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;padding:16px;';
    modal.innerHTML = `
      <div style="width:100%;max-width:520px;background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:Inter,system-ui,sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div><strong style="font-size:1.15rem;">Pilih Printer</strong><div style="font-size:.75rem;color:#86868b;margin-top:3px;">Bluetooth • USB • LAN/Wi-Fi • POS</div></div>
          <button id="hdrgPrinterClose" style="border:0;background:#f2f2f7;border-radius:50%;width:38px;height:38px;font-size:18px;">×</button>
        </div>
        <button id="hdrgPrinterRefresh" style="width:100%;padding:12px;border:1.5px solid #007aff;border-radius:12px;background:#fff;color:#007aff;font-weight:700;margin-bottom:10px;">↻ Cari Printer</button>
        <div id="hdrgPrinterList" style="max-height:48vh;overflow:auto;"><div style="padding:24px;text-align:center;color:#86868b;">Tekan “Cari Printer”.</div></div>
        <div style="font-size:.7rem;color:#86868b;margin-top:12px;text-align:center;">Printer Bluetooth tidak perlu Web Bluetooth. Koneksi ditangani oleh native Median.</div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#hdrgPrinterClose').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#hdrgPrinterRefresh').onclick = scanPrinters;
    return modal;
  }

  function printerLabel(printer) {
    const transport = String(printer.transport || printer.type || 'auto').toUpperCase();
    return `${printer.name || printer.model || 'Printer'} • ${transport}`;
  }

  async function scanPrinters() {
    const modal = ensureModal();
    const list = modal.querySelector('#hdrgPrinterList');
    list.innerHTML = '<div style="padding:24px;text-align:center;color:#86868b;">Mencari printer…</div>';
    const api = nativePrinter();
    if (!api || typeof api.listPrinters !== 'function') {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#b42318;">Native Printer Plugin Median belum aktif.</div>';
      return;
    }
    try {
      const result = await api.listPrinters({ transports: ['bluetooth', 'ble', 'usb', 'lan', 'wifi', 'internal'] });
      const printers = Array.isArray(result) ? result : (result && result.printers) || [];
      if (!printers.length) {
        list.innerHTML = '<div style="padding:24px;text-align:center;color:#86868b;">Tidak ada printer ditemukan.</div>';
        return;
      }
      list.innerHTML = printers.map((p, index) => `<button data-printer-index="${index}" style="display:block;width:100%;text-align:left;padding:14px;margin:6px 0;border:1px solid #e5e5ea;border-radius:14px;background:#fff;"><strong>${String(p.name || p.model || 'Printer').replace(/[<>]/g,'')}</strong><br><small style="color:#86868b;">${String(p.transport || p.type || 'AUTO').toUpperCase()} ${p.address ? '• ' + String(p.address) : ''}</small></button>`).join('');
      list.querySelectorAll('[data-printer-index]').forEach(btn => {
        btn.onclick = () => connectAndPrint(printers[Number(btn.dataset.printerIndex)], modal);
      });
    } catch (e) {
      console.error('[HDRG] listPrinters:', e);
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#b42318;">Gagal mencari printer. Periksa izin Bluetooth/USB/LAN di aplikasi.</div>';
    }
  }

  async function connectAndPrint(printer, modal) {
    const api = nativePrinter();
    if (!api) return;
    try {
      toast('Menghubungkan ke ' + printerLabel(printer) + '…');
      if (typeof api.connect === 'function') {
        const connected = await api.connect(printer);
        if (connected && connected.success === false) throw new Error(connected.error || 'Koneksi printer gagal');
      }
      const receipt = buildReceipt();
      if (!receipt) throw new Error('Nota tidak tersedia.');
      if (typeof api.printReceipt !== 'function') throw new Error('Fungsi printReceipt belum tersedia pada native plugin.');
      const result = await api.printReceipt(receipt);
      if (result && result.success === false) throw new Error(result.error || 'Printer menolak pekerjaan cetak');
      modal.style.display = 'none';
      toast('✓ Nota berhasil dikirim ke printer.', 'success');
    } catch (e) {
      console.error('[HDRG] native print:', e);
      toast('Gagal mencetak: ' + (e.message || e), 'error');
    }
  }

  window.printBluetoothNota = async function () {
    if (!currentNotaSale) {
      toast('Nota belum tersedia.', 'error');
      return;
    }
    if (!nativePrinter()) {
      toast('Native Printer Plugin Median belum aktif. Jangan gunakan Web Bluetooth di APK.', 'error');
      return;
    }
    const modal = ensureModal();
    modal.style.display = 'flex';
    await scanPrinters();
  };

  // Optional helper for the Median Custom JavaScript panel.
  window.HDRGNativePrinterReady = function () { return !!nativePrinter(); };
})();
