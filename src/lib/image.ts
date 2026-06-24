/**
 * Perkecil gambar di sisi klien menjadi data URL (base64) yang ringkas,
 * supaya cukup kecil untuk disimpan langsung di Firestore (batas dokumen ~1 MB).
 *
 * @param file    File gambar dari input.
 * @param max     Sisi terpanjang maksimum (px). Avatar ~256, banner berita ~1000.
 * @param quality Kualitas JPEG 0..1 (default 0.8).
 */
export function resizeImage(file: File, max: number, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas tidak tersedia'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gambar tidak valid'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}
