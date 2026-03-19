import { useState, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Camera01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { useMealsStore } from '../store/mealsStore';

type ImageUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mealId: string;
  currentImageUrl?: string;
};

function ImageUploadModal({ isOpen, onClose, mealId, currentImageUrl }: ImageUploadModalProps) {
  const uploadImage = useMealsStore((s) => s.uploadImage);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  // Animation
  if (isOpen && !visible) {
    requestAnimationFrame(() => setVisible(true));
  }

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    selectedFile.current = file;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile.current) return;
    setUploading(true);
    await uploadImage(mealId, selectedFile.current);
    setUploading(false);
    handleClose();
  }

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setPreview(currentImageUrl ?? null);
      selectedFile.current = null;
      onClose();
    }, 200);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 md:items-center ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Adicionar foto da refeição"
    >
      <div
        className={`w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl transition-transform duration-200 md:rounded-2xl ${
          visible
            ? 'translate-y-0 md:scale-100'
            : 'translate-y-full md:translate-y-0 md:scale-95'
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Foto da Refeição
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Fechar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
          </button>
        </div>

        {/* Preview area */}
        <div className="mb-4">
          {preview ? (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={preview}
                alt="Preview da refeição"
                className="h-64 w-full object-cover"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  selectedFile.current = null;
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                aria-label="Remover foto"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="#fff" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <HugeiconsIcon icon={Camera01Icon} size={24} color="#FF6B6B" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">Toque para adicionar foto</p>
                <p className="text-xs text-text-muted">JPG, PNG ou HEIC</p>
              </div>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!preview && (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-gray-50"
            >
              <HugeiconsIcon icon={Image01Icon} size={18} aria-hidden="true" />
              Escolher da galeria
            </button>
          )}

          {preview && selectedFile.current && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {uploading ? 'Enviando...' : 'Salvar foto'}
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageUploadModal;
