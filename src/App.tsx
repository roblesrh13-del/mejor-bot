import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, BrainCircuit, Target, ShieldAlert, BarChart3, ChevronRight, Loader2, Info, X, Download, Settings, Key, Eye, EyeOff, Save, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeAsset, TradingSignal } from './services/geminiService';
import { domToPng } from 'modern-screenshot';
import { Logo } from './components/Logo';

declare global {
  interface Window {
    TradingView: any;
  }
}

const DEFAULT_ASSET = 'NASDAQ:AAPL';

export default function App() {
  const [symbol, setSymbol] = useState(DEFAULT_ASSET);
  const [searchInput, setSearchInput] = useState(DEFAULT_ASSET);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [appUrl, setAppUrl] = useState(() => localStorage.getItem('app_url') || '');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedUrl = localStorage.getItem('app_url');
    return !!(savedKey && savedUrl);
  });
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('app_url', appUrl);
  }, [appUrl]);

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initWidget = () => {
      if (window.TradingView && document.getElementById('tradingview_widget')) {
        try {
          new window.TradingView.widget({
            "autosize": true,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "es",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": "tradingview_widget"
          });
        } catch (e) {
          console.error("TradingView widget initialization failed:", e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = initWidget;
      script.onerror = () => console.error("Failed to load TradingView script");
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      // We don't necessarily want to remove the script on every symbol change
      // but we might want to clear the container if needed.
    };
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const newSymbol = searchInput.toUpperCase();
      setSymbol(newSymbol);
      setSearchInput(newSymbol);
      setSignal(null);
      setError(null);
    }
  };

  const quickAssets = [
    { name: 'Petróleo WTI', symbol: 'USOIL', icon: '🛢️' },
    { name: 'Petróleo Brent', symbol: 'UKOIL', icon: '🌊' },
    { name: 'Oro', symbol: 'GOLD', icon: '✨' },
    { name: 'Bitcoin', symbol: 'BTCUSD', icon: '₿' },
    { name: 'EUR/USD', symbol: 'EURUSD', icon: '💶' },
    { name: 'Nasdaq 100', symbol: 'NAS100', icon: '📈' },
    { name: 'S&P 500', symbol: 'SPX500', icon: '📊' },
  ];

  const selectAsset = (newSymbol: string) => {
    setSymbol(newSymbol);
    setSearchInput(newSymbol);
    setSignal(null);
    setError(null);
  };

  const downloadImage = async () => {
    if (!mainRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const dataUrl = await domToPng(mainRef.current, {
        backgroundColor: '#0a0e17',
        scale: 2,
        quality: 1,
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `VisionTrade-Analysis-${symbol}-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      setError("No se pudo generar la imagen del informe.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeAsset(symbol, apiKey);
      setSignal(result);
    } catch (err: any) {
      setError(err.message || "Error al analizar el activo");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSetupComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() && appUrl.trim()) {
      setIsConfigured(true);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-plus-dark flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-plus-blue/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border border-plus-border rounded-3xl shadow-2xl p-8 z-10"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-plus-blue rounded-2xl flex items-center justify-center shadow-lg shadow-plus-blue/20 mb-4">
              <Logo size={40} className="brightness-200" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Configuración Inicial</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Para comenzar a utilizar <span className="text-white font-semibold">VisionTrade</span>, por favor introduce tus credenciales de acceso.
            </p>
          </div>

          <form onSubmit={handleSetupComplete} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2">
                <Key className="w-3 h-3 text-plus-blue" /> Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Introduce tu API Key..."
                  required
                  className="w-full bg-black/40 border border-plus-border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-plus-blue/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Obtén una gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-plus-blue hover:underline">Google AI Studio</a>.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2">
                <Globe className="w-3 h-3 text-plus-blue" /> App URL
              </label>
              <input
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://tu-app.run.app"
                required
                className="w-full bg-black/40 border border-plus-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-plus-blue/50 transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-2">
                La URL donde se aloja tu aplicación.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-plus-blue hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-plus-blue/30 group"
            >
              Comenzar Aplicación <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-plus-border text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Tus datos se guardan localmente y nunca salen de tu navegador.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-plus-dark overflow-hidden">
      {/* Header */}
      <header className="h-16 border-bottom border-plus-border flex items-center px-6 bg-plus-dark/80 backdrop-blur-md sticky top-0 z-50 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-plus-blue rounded-lg flex items-center justify-center shadow-lg shadow-plus-blue/20">
            <Logo size={28} className="brightness-200" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">VisionTrade</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Intelligent Trading Solutions</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-plus-blue transition-colors" />
          <input
            type="text"
            placeholder="Buscar activo (ej: AAPL, BTCUSD, EURUSD)..."
            className="w-full bg-slate-900/50 border border-plus-border rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-plus-blue/50 transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button 
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-all ${showSettings ? 'bg-plus-blue text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Configuración de API Key"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-plus-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-plus-blue/30"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
          </button>
        </div>

        {/* Settings Dropdown */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-18 right-6 w-80 bg-slate-900 border border-plus-border rounded-2xl shadow-2xl p-5 z-[60]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-plus-blue" /> Configuración API
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Introduce tu API Key..."
                      className="w-full bg-black/40 border border-plus-border rounded-xl py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-plus-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                    Tu API Key se guarda localmente en tu navegador. Puedes obtener una gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-plus-blue hover:underline">Google AI Studio</a>.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    App URL
                  </label>
                  <input
                    type="text"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://tu-app.run.app"
                    className="w-full bg-black/40 border border-plus-border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-plus-blue transition-all"
                  />
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                    URL base de la aplicación para referencias y callbacks.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-plus-blue/10 hover:bg-plus-blue/20 text-plus-blue py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-plus-blue/20"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Ticker Bar */}
      <div className="h-10 border-bottom border-plus-border bg-slate-900/50 flex items-center px-6 overflow-x-auto no-scrollbar gap-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Tendencias:</span>
        {quickAssets.map((asset) => (
          <button
            key={`ticker-${asset.symbol}`}
            onClick={() => selectAsset(asset.symbol)}
            className={`flex items-center gap-2 text-[11px] font-medium transition-colors whitespace-nowrap ${
              symbol === asset.symbol ? 'text-plus-blue' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{asset.icon}</span>
            <span>{asset.name}</span>
            <span className="font-mono opacity-50">{asset.symbol}</span>
          </button>
        ))}
      </div>

      <main ref={mainRef} className="flex-1 flex overflow-hidden">
        {/* Left: Chart Area */}
        <div className="flex-1 relative border-right border-plus-border">
          <div id="tradingview_widget" className="h-full w-full" />
          
          {/* Floating Symbol Badge */}
          <motion.div 
            key={`badge-${symbol}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-plus-dark/80 backdrop-blur border border-plus-border px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-none z-10"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-sm tracking-tight">{symbol}</span>
          </motion.div>
        </div>

        {/* Right: AI Panel */}
        <aside className="w-[450px] bg-slate-900/30 overflow-y-auto border-left border-plus-border">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-plus-blue/20 border-t-plus-blue rounded-full animate-spin" />
                  <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-plus-blue animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">Estudio a Fondo en Curso</h3>
                <p className="text-slate-400 text-sm italic">
                  Analizando confluencias entre RSI, Fibonacci, Ichimoku y los 10 indicadores más rentables...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex gap-3 text-red-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            ) : signal ? (
              <motion.div 
                key={`signal-${symbol}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                {/* Signal Header */}
                <div className={`p-6 rounded-2xl border ${
                  signal.action === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/50' : 
                  signal.action === 'SELL' ? 'bg-red-500/10 border-red-500/50' : 
                  'bg-slate-500/10 border-slate-500/50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Recomendación IA</span>
                      <h2 className={`text-4xl font-black tracking-tighter ${
                        signal.action === 'BUY' ? 'text-emerald-400' : 
                        signal.action === 'SELL' ? 'text-red-400' : 
                        'text-slate-400'
                      }`}>
                        {signal.action}
                      </h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={downloadImage}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-slate-300 hover:text-white"
                        title="Descargar Informe como Imagen"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Confianza</span>
                        <div className="text-2xl font-mono font-bold">{signal.confidence}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/20 p-3 rounded-xl">
                      <div className="text-[9px] uppercase opacity-50 mb-1 flex items-center gap-1">
                        <ChevronRight className="w-2 h-2" /> Entrada
                      </div>
                      <div className="font-mono font-bold text-sm">{signal.entryPrice}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-red-500/20">
                      <div className="text-[9px] uppercase text-red-400/70 mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-2 h-2" /> Stop Loss
                      </div>
                      <div className="font-mono font-bold text-sm text-red-400">{signal.stopLoss}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-emerald-500/20">
                      <div className="text-[9px] uppercase text-emerald-400/70 mb-1 flex items-center gap-1">
                        <Target className="w-2 h-2" /> Objetivo
                      </div>
                      <div className="font-mono font-bold text-sm text-emerald-400">{signal.takeProfit}</div>
                    </div>
                  </div>
                </div>

                {/* Best Hours Section */}
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Horario Óptimo (España)
                  </h4>
                  <div className="bg-plus-blue/10 border border-plus-blue/30 p-4 rounded-xl flex items-start gap-3">
                    <div className="bg-plus-blue rounded-full p-2 shrink-0">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-blue-100 font-medium">
                      {signal.bestHoursSpain}
                    </p>
                  </div>
                </section>

                {/* Analysis Text */}
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Resumen del Análisis
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-plus-border">
                    {signal.analysis}
                  </p>
                </section>

                {/* Indicators Grid */}
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Matriz de 10 Indicadores de Alta Rentabilidad
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {signal.indicators.map((ind) => (
                      <div key={ind.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-plus-border/50 hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-200">{ind.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{ind.value}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                          ind.signal.includes('BUY') || ind.signal.includes('Bullish') ? 'bg-emerald-500/10 text-emerald-400' :
                          ind.signal.includes('SELL') || ind.signal.includes('Bearish') ? 'bg-red-500/10 text-red-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {ind.signal}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Listo para el Análisis</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Haz clic en el botón superior para que nuestra IA realice un estudio a fondo utilizando los 10 indicadores más rentables en tiempo real.
                </p>

                <div className="w-full space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left px-2">Activos Populares VisionTrade</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {quickAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => selectAsset(asset.symbol)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                          symbol === asset.symbol 
                            ? 'bg-plus-blue/10 border-plus-blue text-white' 
                            : 'bg-slate-800/30 border-plus-border hover:bg-slate-800/50 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{asset.icon}</span>
                          <div className="text-left">
                            <div className="text-xs font-bold">{asset.name}</div>
                            <div className="text-[10px] font-mono opacity-50">{asset.symbol}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                          symbol === asset.symbol ? 'text-plus-blue' : 'text-slate-600'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-top border-plus-border bg-plus-dark px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Market Connected</span>
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-plus-blue" /> Gemini 3.1 Pro Engine</span>
        </div>
        <div>
          &copy; 2024 VisionTrade • Intelligent Trading Solutions
        </div>
      </footer>
    </div>
  );
}
