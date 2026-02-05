import React, { useEffect, useState } from 'react';
import './index.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LinkIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const App = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (window.electronAPI) {
      // Fetch version for the UI
      window.electronAPI.getAppVersion().then(setVersion);

      window.electronAPI.onDownloadProgress((percent) => {
        setIsDownloading(true);
        setProgress(percent);
      });

      window.electronAPI.onUpdateFinished(() => {
        setIsDownloading(false);
        // Automatically trigger restart or show prompt
        if (window.confirm("Update ready! Restart now to apply changes?")) {
          window.electronAPI.restartApp();
        }
      });
    }
  }, []);

  const baseURL = process.env.REACT_APP_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/url/shorten`, { originalUrl: url });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      alert("Something went wrong. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleGoToLink = () => {
    if (shortUrl && window.electronAPI) {
      window.electronAPI.openInBrowser(shortUrl);
    }
  };

  // Full-screen Update Overlay
  if (isDownloading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="text-center w-full max-w-sm">
          <ArrowPathIcon className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Updating TrimIt</h2>
          <p className="text-slate-400 mb-8 text-sm">Downloading version 1.0.1...</p>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-purple-400 font-mono text-sm font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100 font-sans relative">
      {/* Draggable Title Bar Area */}
      <div className="drag-region fixed top-0 left-0 w-full h-8 z-50" />

      {/* New Background Glows (Purple/Pink Theme) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          {/* Icon Color Change */}
          <div className="bg-purple-600 p-2 rounded-lg">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          {/* Gradient Text Change */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TrimIt
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="url"
              placeholder="Paste your long link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all no-drag"
            />
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="absolute right-3 p-2 text-slate-400 hover:text-purple-400 transition-colors no-drag"
              title="Paste from clipboard"
            >
              <ClipboardDocumentIcon className="h-6 w-6" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 no-drag"
          >
            {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Shorten URL"}
          </button>
        </form>

        <AnimatePresence>
          {shortUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 pt-8 border-t border-slate-700"
            >
              <label className="text-sm text-slate-400 mb-2 block">Your shortened link:</label>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                <input
                  readOnly
                  value={shortUrl}
                  className="bg-transparent flex-1 px-3 text-purple-400 font-medium outline-none truncate"
                />
                <button
                  onClick={handleGoToLink}
                  className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-all no-drag"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-lg transition-colors no-drag ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Version and Brand Text */}
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm italic">
          The smarter way to share your long links.
        </p>
        {version && (
          <p className="text-slate-700 text-[10px] mt-2 font-mono uppercase tracking-widest">
            v{version}
          </p>
        )}
      </div>
    </div>
  );
};

export default App;