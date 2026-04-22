import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileType, CheckCircle, XCircle } from 'lucide-react';

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setResult({ type: 'error', message: 'Only CSV files are allowed' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Handle partial success warnings from backend
      setResult({ 
        type: 'success', 
        message: res.data.message || `Processed ${res.data.count} transactions successfully.`,
        details: res.data.errors || []
      });
      setFile(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setResult({ type: 'error', message: msg, details: err.response?.data?.details || err.response?.data?.errors });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel p-5">
      <h2 className="font-semibold flex items-center gap-2 mb-4 text-white">
        <UploadCloud className="text-primary" />
        Data Ingestion
      </h2>

      <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800/50 transition-colors">
        <input 
          type="file" 
          accept=".csv" 
          id="csv-upload" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
          <FileType className="w-10 h-10 text-gray-500 mb-2" />
          <span className="text-sm font-medium text-gray-300">
            {file ? file.name : 'Select CSV File'}
          </span>
          <span className="text-xs text-gray-500 mt-1">Accepts specific required columns</span>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'INGESTING DATA...' : 'UPLOAD TO ENGINE'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded text-sm flex items-start gap-2 ${
          result.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {result.type === 'success' ? <CheckCircle size={18} className="mt-0.5" /> : <XCircle size={18} className="mt-0.5" />}
          <div>
            <div className="font-medium">{result.message}</div>
            {result.details && result.details.length > 0 && (
              <ul className="list-disc ml-5 mt-1 text-xs opacity-80">
                {result.details.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                {result.details.length > 3 && <li>+ {result.details.length - 3} more errors</li>}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
