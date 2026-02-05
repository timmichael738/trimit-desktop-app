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
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const App = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [version, setVersion] = useState('');
  
  // New State: History of links
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage on startup
    const savedHistory = JSON.parse(localStorage.getItem('trimItHistory') || '[]');
    setHistory(savedHistory);

    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setVersion);

      window.electronAPI.onDownloadProgress((percent) => {
        setIsDownloading(true);
        setProgress(percent);
      });

      window.electronAPI.onUpdateFinished(() => {
        setIsDownloading(false);
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
      const newShortUrl = res.data.shortUrl;
      setShortUrl(newShortUrl);

      // Add to history
      const newEntry = { original: url, short: newShortUrl, id: Date.now() };
      const updatedHistory = [newEntry, ...history].slice(0, 5); // Keep last 5
      setHistory(updatedHistory);
      localStorage.setItem('trimItHistory', JSON.stringify(updatedHistory));
      
    } catch (err) {
      alert("Something went wrong. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('trimItHistory');
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  if (isDownloading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="text-center w-full max-w-sm">
          <ArrowPathIcon className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Updating TrimIt</h2>
          <p className="text-slate-400 mb-8 text-sm">Downloading version 1.0.3...</p>
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start py-12 px-4 text-slate-100 font-sans relative overflow-y-auto overflow-x-hidden">
      <div className="drag-region fixed top-0 left-0 w-full h-8 z-50" />

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl mb-6"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 p-2 rounded-lg">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TrimIt
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <input
              type="url"
              placeholder="Paste your long link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all no-drag"
            />
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="absolute right-3 p-2 text-slate-400 hover:text-purple-400 transition-colors no-drag"
            >
              <ClipboardDocumentIcon className="h-6 w-6" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 no-drag"
          >
            {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Shorten URL"}
          </button>
        </form>

        <AnimatePresence>
          {shortUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 pt-8 border-t border-slate-700/50"
            >
              <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                <input
                  readOnly
                  value={shortUrl}
                  className="bg-transparent flex-1 px-3 text-purple-400 font-medium outline-none truncate"
                />
                <button
                  onClick={() => window.electronAPI.openInBrowser(shortUrl)}
                  className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-all no-drag"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className={`p-3 rounded-lg transition-colors no-drag ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* RECENT HISTORY SECTION */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-slate-400">
                <ClockIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Recent Activity</span>
              </div>
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 no-drag"
              >
                <TrashIcon className="h-3 w-3" /> Clear
              </button>
            </div>

            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="bg-slate-800/30 border border-slate-700/30 p-3 rounded-xl flex items-center justify-between group">
                  <div className="truncate pr-4">
                    <p className="text-[10px] text-slate-500 truncate mb-1">{item.original}</p>
                    <p className="text-sm text-purple-400 font-medium">{item.short}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.short)}
                    className="p-2 bg-slate-700/50 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-purple-600 transition-all no-drag"
                  >
                    <ClipboardIcon className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-8 text-center">
        {version && (
          <p className="text-slate-700 text-[10px] font-mono uppercase tracking-widest">
            TrimIt Internal Build v{version}
          </p>
        )}
      </div>
    </div>
  );
};

export default App;