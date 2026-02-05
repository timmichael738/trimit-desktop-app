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

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onDownloadProgress((percent) => {
        setIsDownloading(true);
        setProgress(percent);
      });

      window.electronAPI.onUpdateFinished(() => {
        setIsDownloading(false);
        alert("Update ready! The app will restart to apply changes.");
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

  if (isDownloading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="text-center w-full max-w-sm">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Updating TrimIt</h2>
          <p className="text-slate-400 mb-8 text-sm">Downloading the latest features...</p>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-blue-400 font-mono text-sm font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100 font-sans relative">
      <div className="drag-region fixed top-0 left-0 w-full h-8 z-50" />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-500 p-2 rounded-lg">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
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
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all no-drag"
            />
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="absolute right-3 p-2 text-slate-400 hover:text-blue-400 transition-colors"
              title="Paste from clipboard"
            >
              <ClipboardDocumentIcon className="h-6 w-6" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
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
                  className="bg-transparent flex-1 px-3 text-blue-400 font-medium outline-none truncate"
                />
                <button
                  onClick={handleGoToLink}
                  className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-all"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-lg transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-8 text-slate-500 text-sm italic">
        The smarter way to share your long links.
      </p>
    </div>
  );
};

export default App;