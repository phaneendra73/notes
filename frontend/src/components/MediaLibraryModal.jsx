import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api.js';
import { useToast } from './Toaster.jsx';
import { Button } from './ui/Button.jsx';
import { Input } from './ui/Input.jsx';
import {
  FiX,
  FiUploadCloud,
  FiSearch,
  FiCheck,
  FiCopy,
  FiTrash2,
  FiImage,
  FiLoader,
  FiAlertCircle,
  FiMaximize2,
} from 'react-icons/fi';

/** Compute SHA-256 hash of an ArrayBuffer in browser */
async function computeSHA256(buffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Client-side image compression to WebP via Canvas */
function compressImageToWebP(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', quality);
        resolve({ dataUrl: compressedDataUrl, width, height });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function MediaLibraryModal({ isOpen, onClose, onSelectImage }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [dragOver, setDragOver] = useState(false);

  // Fetch images from Media Library API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media/list', { params: { query: searchQuery } });
      setImages(res.data.media || []);
    } catch (err) {
      console.error('Error fetching media:', err);
      toast({ title: 'Failed to load media library', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMedia();
  }, [isOpen, searchQuery]);

  // Handle File Upload Process
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      return toast({ title: 'Invalid file type. Please upload an image.', variant: 'destructive' });
    }

    setUploading(true);
    try {
      // 1. Calculate SHA-256 hash of original file for deduplication
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeSHA256(arrayBuffer);

      // 2. Compress image to WebP client-side
      const { dataUrl, width, height } = await compressImageToWebP(file);

      // 3. Upload to API
      const res = await api.post('/media/upload', {
        filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
        dataUrl,
        hash,
        size: Math.round(dataUrl.length * 0.75),
        width,
        height,
      });

      if (res.data.deduplicated) {
        toast({ title: 'Image deduplicated!', description: 'Identical image found in Media Library.', variant: 'default' });
      } else {
        toast({ title: 'Image uploaded & compressed to WebP!', variant: 'success' });
      }

      fetchMedia();
      setActiveTab('gallery');
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Delete image from library
  const handleDeleteImage = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this image from Media Library?')) return;

    try {
      await api.delete(`/media/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast({ title: 'Image deleted from library', variant: 'success' });
    } catch {
      toast({ title: 'Failed to delete image', variant: 'destructive' });
    }
  };

  // Copy Image Link to Clipboard
  const handleCopyLink = async (url, id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast({ title: 'Image URL copied to clipboard!', variant: 'success' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* fallback */
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[85vh] rounded-[24px] border border-border bg-card shadow-[0_24px_70px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FiImage size={20} />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-lg text-foreground leading-none">
                  Media Library
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload, reuse, and manage course images & WebP diagrams
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Subheader Toolbar & Tabs */}
          <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/10">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === 'gallery' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('gallery')}
                className="rounded-xl font-bold text-xs"
              >
                <FiImage size={14} className="mr-1.5" /> All Media ({images.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'upload' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('upload')}
                className="rounded-xl font-bold text-xs"
              >
                <FiUploadCloud size={14} className="mr-1.5" /> Upload New
              </Button>
            </div>

            {/* Search filter */}
            {activeTab === 'gallery' && (
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="flex-1 p-5 overflow-y-auto min-h-[350px]">
            {activeTab === 'upload' || images.length === 0 ? (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <FiLoader size={36} className="spin text-primary" />
                    <p className="font-bold text-sm text-foreground">
                      Compressing to WebP & calculating SHA-256 hash...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <FiUploadCloud size={32} />
                    </div>
                    <h3 className="font-heading font-extrabold text-base text-foreground mb-1">
                      Drag & Drop image here, or click to browse
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Images automatically get compressed to WebP format with SHA-256 deduplication to prevent duplicate uploads.
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Gallery Grid */
              <div>
                {loading && (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <FiLoader size={28} className="spin text-primary mr-2" /> Loading Media Library...
                  </div>
                )}

                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <motion.div
                        key={img.id}
                        whileHover={{ scale: 1.02 }}
                        className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col"
                      >
                        {/* Image Preview Container */}
                        <div className="relative h-36 w-full bg-black/40 overflow-hidden flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Hover Actions Bar */}
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                            {onSelectImage && (
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => {
                                  onSelectImage(img.url, img.filename);
                                  onClose();
                                }}
                                className="w-full font-extrabold rounded-lg text-xs"
                              >
                                Insert into Slide
                              </Button>
                            )}

                            <div className="flex items-center gap-1.5 w-full">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => handleCopyLink(img.url, img.id, e)}
                                className="flex-1 text-[11px] h-7 bg-white/10 hover:bg-white/20 text-white border-white/20"
                              >
                                {copiedId === img.id ? <FiCheck className="text-emerald-400" size={12} /> : <FiCopy size={12} />}
                                {copiedId === img.id ? 'Copied' : 'Copy Link'}
                              </Button>

                              <button
                                onClick={(e) => handleDeleteImage(img.id, e)}
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-white transition-colors cursor-pointer"
                                title="Delete image"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Image Info Footer */}
                        <div className="p-2.5 bg-muted/10 border-t border-border flex flex-col gap-0.5">
                          <p className="font-semibold text-xs text-foreground truncate" title={img.filename}>
                            {img.filename}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{img.size ? `${Math.round(img.size / 1024)} KB` : 'WebP'}</span>
                            <span>{img.width ? `${img.width}x${img.height}` : ''}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
