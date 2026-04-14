"use client";

import * as React from "react";
import { TbPhotoPlus } from "react-icons/tb";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        onChange(data.url);
      } catch {
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      className="relative flex flex-col items-center justify-center gap-4 p-20 cursor-pointer hover:opacity-70 transition border-dashed border-2 border-neutral-300 text-neutral-600"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Uploading…</span>
        </div>
      ) : (
        <>
          <TbPhotoPlus size={50} />
          <span className="font-semibold text-lg">Upload photo</span>
        </>
      )}

      {value && !isUploading && (
        <div className="absolute inset-0 w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
