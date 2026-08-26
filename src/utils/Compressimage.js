export async function compressImage(file, { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = {}) {
    const bitmap = await createImageBitmap(file);
  
    let { width, height } = bitmap;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
  
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );
  
    return new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
      type: 'image/webp',
    });
  }