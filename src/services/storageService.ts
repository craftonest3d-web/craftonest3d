/**
 * CRAFTONEST3D – Storage Service (FREE PLAN VERSION)
 *
 * Firebase Storage requires the Blaze (paid) plan.
 * On the free Spark plan, product/work images are stored as external URLs only.
 *
 * This file exports stub functions so existing imports don't break.
 * The AdminProductForm uses URL input instead of file upload.
 */

export type UploadFolder = 'products' | 'categories';

/**
 * Stub — file upload not available on free plan.
 * Returns a rejected promise with a clear message.
 */
export async function uploadImage(
  _file: File,
  _folder: UploadFolder,
  _onProgress?: (pct: number) => void,
): Promise<string> {
  throw new Error(
    'Image upload requires Firebase Storage (Blaze paid plan). ' +
    'Please paste an image URL instead.',
  );
}

/**
 * Stub — no-op on free plan.
 */
export async function deleteImageByUrl(_url: string): Promise<void> {
  // Nothing to delete — images are external URLs
}
