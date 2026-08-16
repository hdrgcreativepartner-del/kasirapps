# HDRG Kasir Apps — Median.co Android Setup

## 1. Website URL

Use the GitHub Pages URL as the Median website URL:

`https://hdrgcreativepartner-del.github.io/kasirapps/`

## 2. Enable native barcode scanning

In Median App Studio:

1. Open **Native Plugins**.
2. Add **QR / Barcode Scanner**.
3. Keep the scanner enabled for Android.
4. The web app is designed to call `median.barcode.scan()`.

Median's scanner returns `{ success, type, code, error }`.

## 3. Barcode Custom JavaScript

In **Website Overrides → Custom JavaScript**, load the contents of `median-mobile.js` from this repository, or copy/paste the file into Median's Custom JavaScript editor.

The helper automatically adds **Scan** buttons beside barcode/SKU fields and a mobile **Scan Produk / Scan Barcode** action. Scanned values are dispatched as normal input/change/Enter events so the existing POS logic can process them.

## 4. IMPORTANT — Bluetooth Print fix

The old `printBluetoothNota()` used `navigator.bluetooth`. That is a browser Web Bluetooth implementation and is the reason an Android WebView can show:

> Web Bluetooth tidak didukung pada browser ini.

**Do not use Web Bluetooth for the Median APK.** Median's JavaScript Bridge is the correct web-to-native boundary, and Median supports custom/private native plugins for external hardware. citehttps://docs.median.co/docs/javascript-bridge

The repository now contains:

- `median-universal-printer.js` — universal printer abstraction.
- `median-printer-override.js` — replaces the old Web Bluetooth `BT Print` function with a Median native printer picker.

Add **both** files to Median **Website Overrides → Custom JavaScript**, in this order:

1. `median-mobile.js`
2. `median-universal-printer.js`
3. `median-printer-override.js`

If your Median setup does not support loading a JS URL, copy/paste their contents into the Custom JavaScript configuration.

## 5. Native printer contract

The native Median printer plugin should expose:

```js
window.median.printer.listPrinters({
  transports: ['bluetooth', 'ble', 'usb', 'lan', 'wifi', 'internal']
})

window.median.printer.connect(printer)
window.median.printer.printReceipt(receipt)
window.median.printer.disconnect()
```

The web application sends one normalized receipt format regardless of printer brand or transport. The native layer is responsible for Bluetooth Classic/SPP, BLE, USB OTG, LAN/Wi-Fi, internal POS printers, ESC/POS commands, permissions, reconnects, and device-specific quirks.

This is intentionally **brand-neutral**. The app does not hard-code Xprinter, EPPOS, Zjiang, Goojprt, or another manufacturer.

Median documents that custom/private plugins can integrate external hardware such as Bluetooth devices. citehttps://docs.median.co/docs/native-plugins-overview

## 6. Printer UI behaviour

When the user taps **BT Print**:

1. HDRG Kasir checks for `median.printer`.
2. If available, it opens a **Pilih Printer** dialog.
3. The native plugin searches Bluetooth/BLE/USB/LAN/Wi-Fi/internal printers.
4. The user selects a printer.
5. HDRG Kasir calls `connect()` and then `printReceipt()`.
6. If the plugin is missing, the app shows a clear setup message instead of the Web Bluetooth error.

## 7. Build / rebuild APK

**Yes — after these Custom JavaScript and native-plugin changes, the APK must be rebuilt.** Median injects Custom JavaScript into the native app at load time, and the native printer capability must be included in the Android build. Median's build flow generates the Android build from the configured app. citehttps://docs.median.co/docs/custom-js

In Median App Studio:

1. Confirm website URL is the latest GitHub Pages deployment.
2. Enable **QR / Barcode Scanner**.
3. Configure the **native/custom printer plugin**.
4. Add the three Custom JavaScript files above.
5. Configure Android permissions required by the printer plugin (Bluetooth/nearby devices, USB, and/or network as applicable).
6. Save/publish the configuration.
7. Run **Build & Deploy → Build All**.
8. Install the new APK on the Android POS device.

## 8. Test checklist

- [ ] Login works.
- [ ] Scan barcode when adding/editing a product.
- [ ] Barcode is saved to the product.
- [ ] Scan barcode on the sales page.
- [ ] Product is added to cart.
- [ ] Scanning the same product again follows the POS quantity behaviour.
- [ ] Open Nota Penjualan.
- [ ] Tap **BT Print**.
- [ ] Printer picker opens instead of a Web Bluetooth browser alert.
- [ ] Bluetooth printer appears in the native printer list.
- [ ] Connect succeeds.
- [ ] Receipt prints.
- [ ] Test another 58mm/80mm ESC/POS printer without changing the web POS code.
- [ ] Test reconnect after turning the printer off/on.

## Important limitation

The web-side integration is now prepared to be brand/transport-neutral, but **a real Bluetooth print connection still requires a native Median printer plugin**. A JavaScript file alone cannot create a generic Android Bluetooth printer driver inside a WebView. Median explicitly supports custom/private native plugins for external hardware when a standard plugin does not cover the device. citehttps://docs.median.co/docs/native-plugins-overview
