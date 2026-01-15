
import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetSize,
      targetSize
    );

    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const handleDone = async () => {
    if (croppedAreaPixels) {
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(cropped);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-square bg-stone-800 rounded-3xl overflow-hidden shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropAreaComplete}
          onZoomChange={setZoom}
          cropShape="round"
          showGrid={false}
        />
      </div>
      
      <div className="mt-8 w-full max-w-md space-y-6">
        <div className="flex items-center gap-4 text-white">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-amber-500 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDone}
            className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-900/20 hover:bg-amber-400 transition-all"
          >
            Apply Crop
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-stone-800 text-stone-400 py-4 rounded-2xl font-bold hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropper;
