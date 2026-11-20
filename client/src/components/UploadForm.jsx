import { useState } from 'react';

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

function validatePdfFile(file) {
  if (!file) {
    return '';
  }
  const isPdfType = file.type === 'application/pdf';
  const isPdfName = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType && !isPdfName) {
    return 'Please choose a PDF file.';
  }
  if (file.type && !isPdfType) {
    return 'Please choose a PDF file.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Keep the PDF under 4 MB.';
  }
  return '';
}

export default function UploadForm({ onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setValidationError(validatePdfFile(file));
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
    setValidationError('');
    onSubmit(selectedFile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
    >
      <label
        htmlFor="agreement-upload"
        className="block text-base font-medium text-slate-900"
      >
        Upload your rental agreement (PDF)
      </label>
      <p className="mt-1 text-sm text-slate-600">
        Text-based PDFs only, up to 4 MB. Nothing is saved.
      </p>

      <input
        id="agreement-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mt-4 block w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-900 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
      />

      <button
        type="submit"
        disabled={!selectedFile}
        className="mt-4 w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        Check my agreement
      </button>

      {validationError && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {validationError}
        </p>
      )}
    </form>
  );
}
