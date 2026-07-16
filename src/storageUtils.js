import { supabase } from "./supabaseClient";

export const BUCKET = "documentos";

export function compressImageToBlob(file, maxDim = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads and returns the storage PATH (not a public URL, since the bucket is private).
// Use SignedImage / createSignedUrl to display it.
export async function uploadBlob(locId, folder, blob, ext = "jpg") {
  const path = `${locId}/${folder}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  return path;
}
