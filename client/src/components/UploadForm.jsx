import { useRef, useState } from 'react';

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

function validatePdfFile(file) {
  if (!file) {
    return '';
  }
  const isPdfType = file.type === 'application/pdf';
  const isPdfName = file.name.toLowerCase().endsWith('.pdf');
  if ((!isPdfType && !isPdfName) || (file.type && !isPdfType)) {
    return 'Please choose a PDF file.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Keep the PDF under 4 MB.';
  }
  return '';
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function UploadForm({ onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function applyChosenFile(file) {
    if (!file) {
      setSelectedFile(null);
      setValidationError('');
      return;
    }

    const reason = validatePdfFile(file);
    if (reason) {
      setSelectedFile(null);
      setValidationError(reason);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setValidationError('');
  }

  function handleFileChange(event) {
    applyChosenFile(event.target.files?.[0] ?? null);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    applyChosenFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setValidationError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }
    const reason = validatePdfFile(selectedFile);
    if (reason) {
      setValidationError(reason);
      return;
    }
    onSubmit(selectedFile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/90 sm:p-6"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Upload your rental agreement</h2>
        <p className="text-sm text-slate-600">
          Text-based PDFs up to 4 MB. Checked in memory and never saved.
        </p>
      </div>

      <input
        ref={inputRef}
        id="agreement-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="sr-only"
      />

      {!selectedFile ? (
        <label
          htmlFor="agreement-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            isDragging
              ? 'border-slate-900 bg-slate-100/90 ring-4 ring-slate-900/5'
              : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-100/60'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
              isDragging ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-xs ring-1 ring-slate-200'
            }`}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M20 16.5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-2" />
            </svg>
          </div>
          <p className="mt-3 text-base font-medium text-slate-900">
            {isDragging ? 'Drop your PDF here' : 'Drop your PDF here or tap to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-500">PDF only · Maximum 4 MB</p>
        </label>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4 transition ${
            isDragging
              ? 'border-slate-900 bg-slate-100/90 ring-4 ring-slate-900/5'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/80">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 15h6" />
                <path d="M9 11h2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                PDF · {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 active:scale-[0.98]"
          >
            Remove
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedFile}
        className="mt-4 w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3.5 text-base font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
      >
        Check my agreement
      </button>

      {validationError && (
        <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
          {validationError}
        </p>
      )}
    </form>
  );
}
