import React, { useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import imageService from '../services/imageService';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    folder?: string;
    className?: string;
    label?: string;
    circle?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImageUrl,
    onImageUploaded,
    folder = 'general',
    className = '',
    label = 'Upload Image',
    circle = false,
}) => {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create local preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Upload
            const url = await imageService.uploadImage(file, folder);
            onImageUploaded(url);
        } catch (err) {
            console.error('Upload failed', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onImageUploaded('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`relative inline-block overflow-hidden ${className}`}>
            <div
                onClick={handleClick}
                className={`
          relative cursor-pointer overflow-hidden border-2 border-dashed border-gray-300
          hover:border-primary-500 transition-colors bg-gray-50 flex items-center justify-center
          ${circle ? 'rounded-full w-32 h-32' : 'rounded-lg w-full h-48'}
        `}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className={`w-full h-full object-cover ${circle ? 'rounded-full' : 'rounded-lg'}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-8 h-8" />
                        </div>
                        {!uploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 text-red-500"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center p-4">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        ) : (
                            <>
                                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-500 block">{label}</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && <p className="text-red-500 text-xs mt-1 absolute -bottom-6 w-full text-center">{error}</p>}
        </div>
    );
};
