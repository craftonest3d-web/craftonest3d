/**
 * CRAFTONEST3D – Image upload helper (Cloudinary unsigned + base64 fallback)
 * Supports PNG, JPG, WEBP and GIF (animated greetings).
 */
const CLOUDINARY_CLOUD_NAME    = 'papernest';
const CLOUDINARY_UPLOAD_PRESET = 'papernest_products';

function uploadAsBase64(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    onProgress(20);
    const reader = new FileReader();
    reader.onload  = () => { onProgress(100); resolve(reader.result as string); };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
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
