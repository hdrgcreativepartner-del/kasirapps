# Konfigurasi Barcode Scanner Median

Fitur pemindaian barcode HDRG Kasir Apps memakai scanner **native** dari APK Median. Browser biasa sengaja tidak memakai Web Bluetooth maupun akses kamera browser sebagai fallback.

## Kontrak JavaScript bridge

Plugin native yang dipasang pada build Median harus menyediakan:

```js
window.HDRGBarcodeScanner = {
  // Salah satu bentuk berikut didukung:
  scan(onSuccess, onError) // callback
  // atau:
  scan() // mengembalikan Promise<string | { barcode: string }>
}
```

Nilai hasil scan dapat berupa string atau objek dengan salah satu properti: `barcode`, `text`, `data`, atau `value`.

Contoh callback Android:

```js
window.HDRGBarcodeScanner.scan = function (onSuccess, onError) {
  // Buka Activity/SDK scanner native.
  // Saat berhasil: onSuccess({ barcode: "899..." });
  // Saat gagal: onError(error);
};
```

Aplikasi juga mengenali bridge alternatif `MedianBarcodeScanner`, `Median.barcodeScanner`, dan `median.barcodeScanner`, tetapi nama yang direkomendasikan adalah `HDRGBarcodeScanner`.

## Cara kerja di aplikasi

- **Pembelian / Restock → Scan Barcode**: membuka native scanner, mengisi kolom Barcode produk, dan mencari produk terdaftar. Jika ditemukan, nama, kategori, jenis, dan satuan terisi. Jika belum ditemukan, barcode tetap tersimpan agar dapat dicatat sebagai produk baru.
- **Transaksi Kasir → Scan Produk**: mencari produk berdasarkan barcode, lalu menambahkannya ke keranjang. Pemindaian berulang atas produk yang sama menaikkan qty satu per satu.
- Bila bridge belum ada, pengguna mendapat pesan konfigurasi yang jelas: pasang plugin barcode native pada Median lalu build APK baru.

## Build

1. Tambahkan/konfigurasikan plugin native barcode scanner di Median sesuai kontrak di atas.
2. Pastikan plugin tersedia pada Android build dan izin kamera diberikan.
3. Build APK baru dari Median, instal, lalu uji kedua tombol pemindaian.

Tidak perlu mengaktifkan API kamera browser untuk fitur ini.
