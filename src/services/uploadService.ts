/**
 * CRAFTONEST3D – Image upload helper (Cloudinary unsigned + base64 fallback)
 * Supports PNG, JPG, WEBP and GIF (animated greetings).
 */
const CLOUDINARY_CLOUD_NAME    = 'papernest';
const CLOUDINARY_UPLOAD_PRESET = 'papernest_products';

/**
 * Shrink an image in the browser so the base64 fallback stays well under
 * Firestore's ~1MB field limit. Keeps GIFs untouched (animation would break),
 * so very large GIFs should be compressed by the user before upload.
 */
export async function compressImage(file: File, maxDim = 1000, quality = 0.82): Promise<string> {
  // GIFs: don't canvas-process (kills animation). Return as-is via base64.
  if (file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error('Could not read file'));
      r.readAsDataURL(file);
    });
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(r.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        // Try JPEG first (much smaller for photos). Keep PNG only when the file
        // is small enough AND likely needs transparency (e.g. a logo).
        const jpeg = canvas.toDataURL('image/jpeg', quality);
        const png  = file.type === 'image/png' ? canvas.toDataURL('image/png') : '';
        // Prefer PNG only if it is small (<400KB base64) — otherwise use JPEG.
        if (png && png.length < 400_000) {
          resolve(png);
        } else {
          resolve(jpeg);
        }
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = r.result as string;
    };
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });
}

async function uploadAsBase64(file: File, onProgress: (pct: number) => void): Promise<string> {
  onProgress(20);
  const dataUrl = await compressImage(file);
  onProgress(100);
  return dataUrl;
}

export function uploadImage(
  file: File,
  onProgress: (pct: number) => void,
  folder = 'craftonest3d/misc',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
        if (res.secure_url) { onProgress(100); resolve(res.secure_url); }
        else reject(new Error(res.error?.message ?? 'Upload failed'));
      } else {
        uploadAsBase64(file, onProgress).then(resolve).catch(reject);
      }
    };
    xhr.onerror = () => uploadAsBase64(file, onProgress).then(resolve).catch(reject);
    // "image/upload" also accepts GIF; Cloudinary keeps animation.
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
}
