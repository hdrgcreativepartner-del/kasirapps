/* HDRG Kasir Apps — Universal Thermal Printer Bridge
 *
 * Printer abstraction for Median Android/iOS custom native plugin.
 * Goal: one web API for Bluetooth Classic, BLE, USB and LAN ESC/POS printers.
 * The native Median plugin chooses the transport and handles permissions.
 */
(function () {
  'use strict';
  const P = window.HDRGPrinter = window.HDRGPrinter || {};
  const KEY = 'hdrg.printer.settings.v1';

  const defaults = {
    paper: 58,
    encoding: 'CP437',
    charsPerLine: 32,
    autoCut: true,
    openDrawer: false,
    density: 0,
    printerId: null,
    printerName: null,
    transport: 'auto'
  };

  function settings() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (_) { return Object.assign({}, defaults); }
  }
  P.getSettings = () => settings();
  P.saveSettings = function (patch) {
    const next = Object.assign({}, settings(), patch || {});
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };

  P.isNativePrinterAvailable = function () {
    return !!(window.median && window.median.printer);
  };

  P.getCapabilities = async function () {
    if (window.median?.printer?.getCapabilities) return window.median.printer.getCapabilities();
    return { success: false, transports: [], reason: 'Median printer plugin not installed' };
  };

  P.listPrinters = async function (options) {
    if (window.median?.printer?.listPrinters) return window.median.printer.listPrinters(options || { transports: ['bluetooth', 'ble', 'usb', 'lan'] });
    return { success: false, printers: [], reason: 'Median printer plugin not installed' };
  };

  P.connect = async function (printer) {
    if (!printer) throw new Error('Printer belum dipilih.');
    P.saveSettings({ printerId: printer.id || printer.address || printer.host, printerName: printer.name || printer.model, transport: printer.transport || 'auto' });
    if (window.median?.printer?.connect) return window.median.printer.connect(printer);
    return { success: false, reason: 'Median printer plugin not installed' };
  };

  P.disconnect = async function () {
    if (window.median?.printer?.disconnect) return window.median.printer.disconnect();
    return { success: true };
  };

  P.test = async function () {
    if (window.median?.printer?.test) return window.median.printer.test(settings());
    window.print();
    return { success: true, fallback: 'system-print-dialog' };
  };

  // Normalize receipts so every printer backend receives the same data model.
  P.normalizeReceipt = function (receipt) {
    const r = receipt || {};
    return {
      version: 1,
      printer: settings(),
      store: r.store || r.storeName || 'HDRG Kasir',
      address: r.address || '',
      phone: r.phone || '',
      invoice: r.invoice || r.invoiceNo || '',
      date: r.date || new Date().toISOString(),
      cashier: r.cashier || '',
      items: (r.items || []).map(x => ({
        name: String(x.name || x.productName || 'Produk'),
        qty: Number(x.qty || x.quantity || 1),
        price: Number(x.price || x.unitPrice || 0),
        total: Number(x.total || (Number(x.qty || x.quantity || 1) * Number(x.price || x.unitPrice || 0)))
      })),
      subtotal: Number(r.subtotal || 0),
      discount: Number(r.discount || 0),
      tax: Number(r.tax || 0),
      total: Number(r.total || 0),
      paid: Number(r.paid || 0),
      change: Number(r.change || 0),
      payment: r.payment || r.paymentMethod || 'Cash',
      footer: r.footer || 'Terima kasih'
    };
  };

  P.print = async function (receipt) {
    const payload = P.normalizeReceipt(receipt);
    if (window.median?.printer?.printReceipt) {
      return window.median.printer.printReceipt(payload);
    }
    // Safe fallback for normal browser testing.
    window.print();
    return { success: true, fallback: 'system-print-dialog' };
  };

  P.printRaw = async function (data) {
    if (!window.median?.printer?.printRaw) throw new Error('Raw ESC/POS memerlukan Median custom printer plugin.');
    return window.median.printer.printRaw({ data, settings: settings() });
  };
})();
