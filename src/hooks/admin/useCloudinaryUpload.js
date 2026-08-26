import { useState } from 'react';
import api from '../../api/axiosInstance';
import { compressImage } from '../../utils/Compressimage';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);

  const upload = async (file, folder = 'places') => {
    const { data: res } = await api.get('/admin/upload-signature', {
      params: { folder },
    });
    const { signature, timestamp, apiKey, cloudName } = res.data;

    const isVideo = file.type.startsWith('video/');
    const fileToUpload = isVideo ? file : await compressImage(file);

    const fd = new FormData();
    fd.append('file', fileToUpload);              // fichier compressé si image
    fd.append('signature', signature);
    fd.append('timestamp', String(timestamp));
    fd.append('api_key', apiKey);
    fd.append('folder', folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;
    const response = await fetch(endpoint, { method: 'POST', body: fd });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error?.message ?? 'Upload échoué');
    return result.secure_url;
  };

  const uploadMany = async (files, folder = 'places') =>
    Promise.all([...files].map(file => upload(file, folder)));

  return { upload, uploadMany, uploading, setUploading };
};