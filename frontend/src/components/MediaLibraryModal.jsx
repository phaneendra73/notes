import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import { useToast } from './ui/Toast.jsx';
import { Button } from './ui/Button.jsx';
import { Input } from './ui/Input.jsx';
import {
  X,
  UploadCloud,
  Search,
  Check,
  Copy,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

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

export default function MediaLibraryModal({ isOpen, onClose, onSelectImage, mode = 'slide' }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [dragOver, setDragOver] = useState(false);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedAlign, setSelectedAlign] = useState('center');

  // Fetch images from Media Library API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/media', { params: { query: searchQuery } });
      setImages(res.data.media || []);
    } catch (err) {
      console.error('Error fetching media:', err);
      toast.error('Failed to load media library');
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
      return toast.error('Invalid file type. Please upload an image.');
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeSHA256(arrayBuffer);

      const { dataUrl, width, height } = await compressImageToWebP(file);

      const res = await client.post('/api/media/upload', {
        filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
        dataUrl,
        hash,
        size: Math.round(dataUrl.length * 0.75),
        width,
        height,
      });

      if (res.data.deduplicated) {
        toast.info('Image deduplicated!', 'Identical image found in Media Library.');
      } else {
        toast.success('Image uploaded & compressed to WebP!');
      }

      fetchMedia();
      setActiveTab('gallery');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Delete image from library
  const handleDeleteImage = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this image from Media Library?')) return;

    try {
      await client.delete(`/api/media/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success('Image deleted from library');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  // Copy Image Link to Clipboard
  const handleCopyLink = async (url, id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Image URL copied to clipboard!');
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
        className="modal-backdrop"
      >
        <motion.div
          initial={{ scale: 0.96, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[85vh] rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden text-[var(--ink)] font-sans"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-[var(--line)] flex items-center justify-between gap-4 bg-[var(--surface-2)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)]">
                <ImageIcon size={18} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[var(--ink)] leading-none">
                  Media Library
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1 font-normal">
                  Upload, reuse, and manage course images & WebP diagrams
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Subheader Toolbar & Tabs */}
          <div className="px-5 py-3 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === 'gallery' ? 'default' : 'outline'}
                onClick={() => setActiveTab('gallery')}
                className="rounded-[var(--radius-md)] font-bold text-xs"
              >
                <ImageIcon size={13} className="mr-1.5" /> All Media ({images.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => setActiveTab('upload')}
                className="rounded-[var(--radius-md)] font-bold text-xs"
              >
                <UploadCloud size={13} className="mr-1.5" /> Upload New
              </Button>
            </div>

            {/* Search filter & Image formatting options */}
            <div className="flex items-center gap-3 flex-wrap">
              {onSelectImage && mode !== 'cover' && (
                <div className="flex items-center gap-2 text-xs bg-[var(--surface-2)] px-2.5 py-1 rounded-[var(--radius-md)] border border-[var(--line)] font-semibold">
                  <span className="text-[10px] uppercase text-[var(--muted)]">Size:</span>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--accent)] outline-none cursor-pointer"
                  >
                    <option value="small">Small (~320px)</option>
                    <option value="medium">Medium (~560px)</option>
                    <option value="large">Large (~800px)</option>
                    <option value="full">Full Width</option>
                  </select>

                  <span className="text-[10px] uppercase text-[var(--muted)] ml-1">Align:</span>
                  <select
                    value={selectedAlign}
                    onChange={(e) => setSelectedAlign(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--accent)] outline-none cursor-pointer"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] w-3.5 h-3.5" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs rounded-[var(--radius-md)] bg-[var(--surface)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 p-5 overflow-y-auto min-h-[350px]">
            {activeTab === 'upload' || images.length === 0 ? (
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
                className={`border-2 border-dashed rounded-[var(--radius-lg)] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
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
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <p className="font-bold text-sm text-[var(--ink)]">
                      Compressing to WebP & calculating SHA-256 hash...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3">
                      <UploadCloud size={28} />
                    </div>
                    <h3 className="font-serif font-bold text-base text-[var(--ink)] mb-1">
                      Drag & Drop image here, or click to browse
                    </h3>
                    <p className="text-xs text-[var(--muted)] max-w-sm font-normal">
                      Images automatically get compressed to WebP format with SHA-256 deduplication to prevent duplicate uploads.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div>
                {loading && (
                  <div className="flex items-center justify-center py-16 text-[var(--muted)] text-xs font-semibold">
                    <Loader2 size={24} className="animate-spin text-[var(--accent)] mr-2" /> Loading Media Library...
                  </div>
                )}

                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <motion.div
                        key={img.id}
                        whileHover={{ scale: 1.01 }}
                        className="group relative rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] transition-all flex flex-col"
                      >
                        <div className="relative h-36 w-full bg-[var(--surface-2)] overflow-hidden flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                            {onSelectImage && (
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => {
                                  onSelectImage(img.url, img.filename, selectedSize, selectedAlign);
                                  onClose();
                                }}
                                className="w-full font-bold rounded-[var(--radius-sm)] text-xs"
                              >
                                {mode === 'cover' ? 'Set as Cover' : 'Insert into Slide'}
                              </Button>
                            )}

                            <div className="flex items-center gap-1.5 w-full">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => handleCopyLink(img.url, img.id, e)}
                                className="flex-1 text-[11px] h-7 bg-white/10 hover:bg-white/20 text-white border-white/20"
                              >
                                {copiedId === img.id ? <Check className="text-emerald-400" size={12} /> : <Copy size={12} />}
                                <span>{copiedId === img.id ? 'Copied' : 'Copy'}</span>
                              </Button>

                              <button
                                onClick={(e) => handleDeleteImage(img.id, e)}
                                className="p-1.5 rounded-[var(--radius-sm)] bg-red-500/20 hover:bg-red-500 text-white transition-colors cursor-pointer"
                                title="Delete image"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-[var(--surface-2)] border-t border-[var(--line)] flex flex-col gap-0.5">
                          <p className="font-semibold text-xs text-[var(--ink)] truncate" title={img.filename}>
                            {img.filename}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
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
