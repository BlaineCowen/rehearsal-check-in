"use client";

import { useState, useRef } from "react";
import ReactCrop, { type Crop as ReactCropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

interface Crop extends ReactCropType {
  aspect?: number;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 400,
    height: 400,
    x: 0,
    y: 0,
    aspect: 1,
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height, 400);
    setCrop({
      unit: "px",
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
      aspect: 1,
    });
  };

  const getCroppedImage = () => {
    if (!imageRef.current) return;

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.beginPath();
    ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Image = canvas.toDataURL("image/png");
    onCropComplete(base64Image);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[60vh]"
              minWidth={100}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                style={{
                  maxHeight: "60vh",
                  width: "auto",
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={getCroppedImage}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
