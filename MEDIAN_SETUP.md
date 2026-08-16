# HDRG Kasir Apps — Median.co Android Setup

## 1. Website URL

Use the GitHub Pages URL as the Median website URL:

`https://hdrgcreativepartner-del.github.io/kasirapps/`

## 2. Enable native barcode scanning

In Median App Studio:

1. Open **Native Plugins**.
2. Add **QR / Barcode Scanner**.
3. Keep the scanner enabled for Android.
4. The web app already contains `median-mobile.js` and is designed to call:

```js
median.barcode.scan()
```

Median's scanner returns `{ success, type, code, error }`.

## 3. Add the bridge script in Median

Because the existing project is a single-file HTML app, the safest deployment method is to load the mobile helper as Median Custom JavaScript rather than changing the production HTML bundle.

In **Website Overrides → Custom JavaScript**, load the content of `median-mobile.js` from this repository. If your Median plan supports a custom JS URL, use:

`https://hdrgcreativepartner-del.github.io/kasirapps/median-mobile.js`

Otherwise copy/paste the file contents into the Custom JavaScript editor.

The helper is safe in a normal browser and only uses native barcode functionality when `window.median.barcode.scan` is available.

## 4. Barcode behaviour

The helper automatically detects visible inputs whose ID/name/placeholder/context contains terms such as:

- barcode
- bar code
- kode barang
- kode produk
- SKU
- EAN
- UPC

It adds a **Scan** button beside those fields.

After scanning, the value is inserted into the field and `input`, `change`, and Enter keyboard events are dispatched. This allows the existing HDRG Kasir search/add logic to process the barcode without rewriting the POS data model.

A floating **Scan Produk** / **Scan Barcode** button is also added on mobile screens.

## 5. Bluetooth thermal printer

A normal Android WebView cannot directly access generic Bluetooth printers. Median's current documentation states that Bluetooth support in Android WebView is not sufficient for generic printer access; Bluetooth hardware is supported through vendor SDKs or custom native plugins.

The repository therefore exposes this adapter:

```js
HDRGMobile.printReceipt(receipt)
```

When a Median custom printer plugin is installed, it can implement:

```js
window.median.printer.printReceipt(receipt)
```

The helper will call that native method automatically. Outside the native plugin it falls back to `window.print()`.

### Recommended printer integration

For a common 58mm/80mm Android thermal printer, ask Median for a **private/custom native Bluetooth printer plugin** for the exact printer brand/model or Android SDK. The native plugin should expose:

```js
median.printer.printReceipt({
  width: 58,
  storeName: 'HDRG Kasir',
  transactionId: 'TRX-001',
  items: [
    { name: 'Kopi Susu', qty: 2, price: 10000, total: 20000 }
  ],
  subtotal: 20000,
  discount: 0,
  total: 20000,
  paid: 50000,
  change: 30000,
  footer: 'Terima kasih'
})
```

The native implementation should handle Bluetooth discovery/pairing, connection, ESC/POS formatting, printing, and reconnect/error handling.

## 6. Build Android APK

In Median App Studio:

1. Set the app name to **HDRG Kasir Apps**.
2. Set the GitHub Pages URL above as the website URL.
3. Add the **QR / Barcode Scanner** plugin.
4. Add the Custom JavaScript helper.
5. Configure Android app icon/splash screen.
6. Use **Build & Deploy → Build All**.
7. Install the generated Android build on a real Android phone and test barcode scanning.

## 7. Test checklist

- [ ] Open login page.
- [ ] Open inventory/product input.
- [ ] Tap Scan beside barcode field.
- [ ] Scan a Code 128 / EAN-13 product barcode.
- [ ] Confirm barcode field is populated.
- [ ] Confirm existing product-save logic stores the barcode.
- [ ] Open sales/cashier page.
- [ ] Tap Scan Produk.
- [ ] Scan a registered product.
- [ ] Confirm product is added to cart.
- [ ] Scan the same product again and confirm quantity increases according to existing POS behaviour.
- [ ] Test receipt preview/system print.
- [ ] For Bluetooth printing, test only after the native printer plugin is installed and configured for the exact printer model.

## Important

The barcode scanner is ready at the web-code level, but the **Bluetooth printer cannot honestly be marked as implemented until a native Median printer plugin exists for the selected printer hardware**. Generic Web Bluetooth is not a reliable solution inside Android WebView.
