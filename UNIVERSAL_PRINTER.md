# HDRG Kasir — Universal Thermal Printer

## Target

Satu interface printer untuk sebanyak mungkin printer POS Android tanpa mengikat aplikasi ke merek tertentu.

### Transport yang ditargetkan

- Bluetooth Classic / SPP
- Bluetooth Low Energy (BLE), bila printer menyediakan service/characteristic yang sesuai
- USB OTG
- LAN / Wi-Fi TCP
- Printer internal pada POS Android, bila vendor menyediakan SDK/AIDL

### Print protocol

Backend utama: **ESC/POS**. Ini adalah format yang paling praktis untuk printer thermal POS 58 mm / 80 mm dan banyak printer generik.

Printer yang bukan ESC/POS tetap dapat didukung melalui backend/vendor SDK tanpa mengubah kode kasir.

## Native Median plugin contract

Median WebView tidak dapat mengakses Bluetooth printer secara generik. Karena itu APK harus mempunyai custom native printer plugin yang mengekspos bridge berikut:

```js
median.printer.getCapabilities()
median.printer.listPrinters({ transports: ['bluetooth', 'ble', 'usb', 'lan'] })
median.printer.connect(printer)
median.printer.disconnect()
median.printer.test(settings)
median.printer.printReceipt(receipt)
median.printer.printRaw({ data, settings })
```

`median-universal-printer.js` sudah menyediakan abstraction di sisi website.

## Printer discovery

Plugin native sebaiknya mengembalikan data seperti:

```json
{
  "id": "AA:BB:CC:DD:EE:FF",
  "name": "Xprinter XP-58",
  "model": "XP-58",
  "transport": "bluetooth",
  "protocol": "escpos",
  "paper": [58, 80]
}
```

`transport` boleh berupa `bluetooth`, `ble`, `usb`, `lan`, atau `internal`.

## Compatibility strategy

1. Deteksi perangkat printer.
2. Pilih transport yang tersedia.
3. Untuk printer POS standar, gunakan ESC/POS.
4. Pilih 58 mm atau 80 mm dari profile printer.
5. Simpan printer terakhir secara lokal.
6. Jika koneksi gagal, tampilkan daftar printer lagi tanpa mengubah transaksi.
7. Sediakan **Test Print** sebelum transaksi dicetak.
8. Jangan mengunci aplikasi ke Xprinter/Epson/Zjiang/dll.

## Android permissions

Custom native plugin harus menangani permission Bluetooth sesuai versi Android. Android 12+ menggunakan `BLUETOOTH_SCAN` dan `BLUETOOTH_CONNECT`; Android versi lama memakai permission Bluetooth lama dan, untuk discovery tertentu, permission lokasi.

Median menangani native plugin melalui JavaScript Bridge; implementasi Bluetooth printer perlu berada di layer native/plugin, bukan WebView.

## Receipt payload

Website mengirim data terstruktur, bukan command printer yang spesifik merek:

```json
{
  "store": "KOPI SUKUN",
  "invoice": "INV-001",
  "items": [
    {"name": "Kopi Susu", "qty": 2, "price": 8000, "total": 16000}
  ],
  "subtotal": 16000,
  "discount": 0,
  "tax": 0,
  "total": 16000,
  "paid": 20000,
  "change": 4000,
  "payment": "Cash",
  "footer": "Terima kasih"
}
```

Native plugin yang bertugas mengubah payload ini menjadi ESC/POS bytes sesuai lebar kertas, encoding, kemampuan printer, cut/drawer, dan transport.

## Important limitation

Tidak ada cara yang benar-benar menjamin **100% semua printer Bluetooth** kompatibel. Printer dengan protocol proprietary, Bluetooth BLE non-printing, atau SDK vendor khusus membutuhkan backend khusus. Target desain ini adalah **kompatibilitas maksimum melalui ESC/POS + beberapa transport**, bukan klaim universal absolut.

## Median setup

Tambahkan kedua file berikut sebagai Custom JavaScript di Median App Studio:

1. `median-mobile.js`
2. `median-universal-printer.js`

Lalu aktifkan QR / Barcode Scanner dan gunakan custom native printer plugin untuk menyediakan `median.printer.*`.
