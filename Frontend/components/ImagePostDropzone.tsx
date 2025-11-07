'use client'

import React, { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";

interface ImagePostDropzoneProps {
  setAvatarFile: (file: File | null) => void;
  setPreview: (url: string | ArrayBuffer | null) => void;
  setAvatarError: (message: string) => void;
}

const ImagePostDropzone: React.FC<ImagePostDropzoneProps> = ({
  setAvatarFile,
  setPreview,
  setAvatarError,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        setAvatarError(
          "File không hợp lệ. Vui lòng chọn hình ảnh (JPEG, PNG) dưới 5MB."
        );
        setAvatarFile(null);
        setPreview("");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setAvatarFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setAvatarError("");
      }
    },
    [setAvatarFile, setPreview, setAvatarError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-1 border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
        isDragActive ? "bg-gray-100 border-purple-500" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-gray-600">Thả hình ảnh tại đây...</p>
      ) : (
        <p className="text-gray-600">
          Kéo và thả hình ảnh hoặc nhấp để chọn (JPEG, PNG, {"<"} 5MB)
        </p>
      )}
    </div>
  );
};

export default ImagePostDropzone;
