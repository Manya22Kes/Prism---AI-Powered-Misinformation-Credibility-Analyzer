import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useExperienceStore } from '../../store/experienceStore';

export const Dropzone = ({ onFilesSelected, maxFiles = 1, acceptedTypes = "*/*", className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const emitExperienceEvent = useExperienceStore((state) => state.emitExperienceEvent);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
      emitExperienceEvent('UPLOAD_HOVER_START');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    emitExperienceEvent('UPLOAD_HOVER_END');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    emitExperienceEvent('UPLOAD_HOVER_END');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      setFiles(droppedFiles);
      if (onFilesSelected) onFilesSelected(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, maxFiles);
      setFiles(selectedFiles);
      if (onFilesSelected) onFilesSelected(selectedFiles);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, i) => i !== indexToRemove);
    setFiles(newFiles);
    if (onFilesSelected) onFilesSelected(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 transition-all duration-700 ease-out cursor-pointer overflow-hidden",
          isDragging 
            ? "border-prism-cyan bg-prism-surface-active shadow-[inset_0_0_50px_rgba(34,211,238,0.2)]" 
            : "border-prism-border border-dashed bg-prism-surface/50 hover:bg-prism-surface hover:border-prism-text-muted"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 0.995 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Cinematic Drop Effect Layer */}
        {isDragging && (
          <>
            <motion.div 
              className="absolute inset-0 border-[4px] border-prism-cyan opacity-50 rounded-2xl"
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-prism-cyan/10 to-transparent pointer-events-none" />
          </>
        )}
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              y: isDragging ? -10 : 0, 
              scale: isDragging ? 1.2 : 1,
              filter: isDragging ? "drop-shadow(0 0 10px rgba(34,211,238,0.8))" : "none"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "p-4 mb-4 rounded-full transition-colors",
              isDragging ? "bg-prism-cyan/20 text-prism-cyan" : "bg-prism-surface-active text-prism-text-secondary"
            )}
          >
            <UploadCloud size={32} />
          </motion.div>
          <motion.p 
            animate={{ scale: isDragging ? 1.05 : 1, color: isDragging ? "#fff" : "var(--color-prism-text-primary)" }}
            className="mb-2 text-sm font-medium"
          >
            <span className={cn("font-semibold", isDragging ? "text-prism-cyan" : "text-prism-accent")}>Click to upload</span> or drag and drop
          </motion.p>
          <p className="text-xs text-prism-text-secondary">
            {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Single file upload'}
          </p>
        </div>
      </motion.div>

      {/* Selected Files Queue with Dissolve Effect styling hook */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, filter: "blur(10px)", scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="mt-6 flex flex-col gap-3"
          >
            <h4 className="text-sm font-semibold text-prism-text-secondary uppercase tracking-wider mb-2">Queue</h4>
            {files.map((file, index) => (
              <motion.div 
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, filter: "blur(10px)", x: 50 }}
                className="flex items-center justify-between p-3 rounded-lg bg-prism-surface border border-prism-border shadow-[0_0_15px_rgba(0,0,0,0.5)] group relative overflow-hidden"
              >
                {/* Subtle scanning light effect across the file row */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-prism-accent/10 to-transparent w-1/2"
                  animate={{ x: ['-200%', '300%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center gap-3 overflow-hidden relative z-10">
                  <div className="p-2 bg-prism-surface-hover rounded-md text-prism-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <File size={20} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-prism-text-primary truncate">{file.name}</span>
                    <span className="text-xs text-prism-text-secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-2 text-prism-text-muted hover:text-prism-high hover:bg-prism-high/10 rounded-md transition-colors relative z-10"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
