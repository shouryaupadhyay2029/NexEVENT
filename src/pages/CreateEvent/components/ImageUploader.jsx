import React, { useState, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { uploadEventImage } from '../../../services/storageService';

const presetImages = [
  { name: "Tech Stage", url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=600&auto=format&fit=crop" },
  { name: "AI/Code", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop" },
  { name: "Exhibition", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop" }
];

export const ImageUploader = ({ value, onChange, error, onUploadStateChange }) => {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'file'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [tempEventId] = useState(() => Math.random().toString(36).substring(2, 11));
  const fileInputRef = useRef(null);
  const lastSelectedFileRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return "Only PNG, JPEG and WEBP images are allowed.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Maximum image size is 5MB.";
    }
    return null;
  };

  const startUpload = async (file) => {
    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);
    if (onUploadStateChange) onUploadStateChange(true);

    try {
      const downloadURL = await uploadEventImage(file, tempEventId, (progress) => {
        setUploadProgress(progress);
      });
      onChange(downloadURL);
      setUploadError('');
    } catch (err) {
      console.error("Storage upload error: ", err);
      setUploadError("Upload failed. Connection closed by server.");
    } finally {
      setIsUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileValidationError = validateFile(file);
    if (fileValidationError) {
      setUploadError(fileValidationError);
      return;
    }

    lastSelectedFileRef.current = file;
    await startUpload(file);
  };

  const handleRetry = async (e) => {
    e.stopPropagation();
    if (lastSelectedFileRef.current) {
      await startUpload(lastSelectedFileRef.current);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-micro text-primary">Event Image</label>
      
      {/* Tab bar */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => setActiveTab('url')}
          className={cn(
            "text-micro focus:outline-none pb-1 disabled:opacity-50",
            activeTab === 'url' ? "border-b border-accent text-accent" : "text-white/40"
          )}
        >
          Image URL
        </button>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => setActiveTab('file')}
          className={cn(
            "text-micro focus:outline-none pb-1 disabled:opacity-50",
            activeTab === 'file' ? "border-b border-accent text-accent" : "text-white/40"
          )}
        >
          File Upload
        </button>
      </div>

      {activeTab === 'url' ? (
        <div className="flex flex-col gap-3">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-[#111] border border-white/10 px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent font-ui rounded-none transition-colors"
          />
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] text-white/30 font-technical uppercase">Presets:</span>
            <div className="flex gap-2">
              {presetImages.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => onChange(img.url)}
                  className="px-2.5 py-1 border border-white/5 hover:border-white/20 text-[0.6rem] font-technical text-white/40 hover:text-white uppercase transition-colors"
                >
                  {img.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "relative border border-dashed py-8 flex flex-col items-center justify-center transition-colors bg-[#111] cursor-pointer",
              isUploading ? "border-accent/40 cursor-not-allowed" : "border-white/10 hover:border-white/20"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center w-full px-6">
                <span className="text-xs text-accent font-ui mb-2">Uploading image... {uploadProgress}%</span>
                <div className="w-full max-w-[200px] h-[1px] bg-white/5 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs text-white/40 font-ui mb-1">Click to select image</span>
                <span className="text-[0.6rem] text-white/20 font-technical uppercase">PNG, JPEG, WEBP up to 5MB</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Error / Retry banner */}
      {uploadError && (
        <div className="flex items-center justify-between border border-red-500/20 bg-red-950/20 px-4 py-2.5 text-xs text-red-400 font-ui">
          <span>{uploadError}</span>
          {lastSelectedFileRef.current && (
            <button
              type="button"
              onClick={handleRetry}
              className="text-[0.6rem] font-technical border border-red-400/30 px-2 py-0.5 hover:bg-red-400 hover:text-red-950 transition-colors uppercase"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Image Preview */}
      {value && !isUploading && (
        <div className="mt-2 w-full max-w-[320px] aspect-[16/10] border border-white/10 overflow-hidden relative group">
          <img
            src={value}
            alt="Upload Preview"
            className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 text-[0.6rem] font-technical text-white/80 hover:text-white uppercase focus:outline-none"
          >
            Remove
          </button>
        </div>
      )}

      {(error && !uploadError) && <span className="text-[0.7rem] text-red-400 font-technical uppercase tracking-wide">{error}</span>}
    </div>
  );
};
