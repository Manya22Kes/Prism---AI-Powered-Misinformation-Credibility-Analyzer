import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Link2, FileUp, Layers, Activity, History, Zap, ArrowRight, Cpu, Network, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropzone } from '../components/upload/Dropzone';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { AnalysisPipeline } from '../components/report/AnalysisPipeline';
import { analysisApi } from '../services/api/analysis.api';
import { useCinematicStore } from '../store/cinematicStore';
import { useExperienceStore } from '../store/experienceStore';
import { useThemeStore } from '../store/themeStore';
import { cn } from '../utils/cn';

const tabs = [
  { id: 'file', label: 'Document', icon: FileUp },
  { id: 'url', label: 'Web Link', icon: Link2 },
  { id: 'text', label: 'Raw Text', icon: Type },
  { id: 'batch', label: 'Batch Analysis', icon: Layers },
];

export const UploadWorkspace = () => {
  const [activeTab, setActiveTab] = useState('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState(null);
  
  const { theme } = useThemeStore();
  
  // Input states
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileInput, setFileInput] = useState([]);
  
  const navigate = useNavigate();
  const { setPrismState, setPrismPosition, setPrismScale, setEnvironmentWorkspace, setEnvironmentProcessing } = useCinematicStore();

  // Reset to workspace environment on mount
  const emitExperienceEvent = useExperienceStore((state) => state.emitExperienceEvent);

  useEffect(() => {
    setEnvironmentWorkspace();
    // Position the prism on the right side of the screen for the hero section
    setPrismPosition([4, 0, 0]);
    setPrismScale(1.8);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleCancelPipeline = () => {
    setIsProcessing(false);
    setCurrentStage('');
    setError(null);
    setEnvironmentWorkspace();
    setPrismPosition([4, 0, 0]);
    setPrismScale(1.8);
  };

  const startPipeline = async (apiCall, workloadIntensity = 4) => {
    setIsProcessing(true);
    setCurrentStage('extracting');
    setError(null);
    
    // Dispatch semantic experience event with intensity
    emitExperienceEvent('ANALYSIS_STARTED', { workloadIntensity });
    
    // Move prism to the center for Mission Control
    setPrismPosition([0, 0, 0]);
    setPrismScale(2.5);

    try {
      await apiCall((event) => {
        if (event.stage === 'error') {
          setError(event.message || 'An error occurred during analysis.');
          emitExperienceEvent('ANALYSIS_FAILED', { error: event.message });
        } else if (event.stage === 'complete') {
          setCurrentStage('complete');
          emitExperienceEvent('ANALYSIS_COMPLETED');
          setTimeout(() => {
            if (event.batchStatus) {
              navigate(`/batch/${event.reportId}`);
            } else {
              navigate(`/report/${event.reportId}`);
            }
          }, 500); // Fast transition on complete
        } else if (event.stage) {
          setCurrentStage(event.stage);
          emitExperienceEvent('ANALYSIS_STAGE_CHANGED', { stage: event.stage });
        }
      });
    } catch (err) {
      console.error("PIPELINE FETCH ERROR:", err);
      setError(err.message || 'Failed to connect to intelligence engine.');
      emitExperienceEvent('ANALYSIS_FAILED', { error: err.message });
    }
  };

  const handleAnalyzeText = () => {
    if (!textInput.trim()) return;
    const wordCount = textInput.split(/\s+/).length;
    let intensity = 3;
    if (wordCount > 500) intensity = 3.5;
    if (wordCount > 1500) intensity = 4;
    
    startPipeline((onEvent) => analysisApi.analyzeText({ content: textInput }, onEvent), intensity);
  };

  const handleAnalyzeUrl = () => {
    if (!urlInput.trim()) return;
    startPipeline((onEvent) => analysisApi.analyzeUrl({ url: urlInput }, onEvent), 4.5);
  };

  const handleAnalyzeFile = () => {
    if (fileInput.length === 0) return;
    const file = fileInput[0];
    const name = file.name.toLowerCase();
    
    let endpoint = '';
    let intensity = 5; // Default for files
    
    if (file.type.includes('image/')) {
      endpoint = 'image';
      intensity = 6.5; // OCR
    }
    else if (file.type.includes('audio/')) {
      endpoint = 'audio';
      intensity = 7; // Transcription
    }
    else if (name.endsWith('.docx')) {
      endpoint = 'docx';
      intensity = 4.5;
    }
    else if (name.endsWith('.pptx')) {
      endpoint = 'pptx';
      intensity = 5.5; 
    }
    else if (name.endsWith('.pdf')) {
      endpoint = 'pdf';
      // Without opening the PDF on the frontend to count pages, we rely on size as a secondary heuristic
      const mb = file.size / (1024 * 1024);
      intensity = Math.min(5 + (mb * 0.15), 7.5);
    }
    else {
      setError(`Unsupported file type: ${file.name}. Legacy .ppt files are not supported. Please convert to .pptx or .pdf.`);
      return;
    }
    
    startPipeline((onEvent) => analysisApi.analyzeFile(endpoint, file, onEvent), intensity);
  };

  const handleAnalyzeBatch = () => {
    if (fileInput.length === 0) return;
    const fileCount = fileInput.length;
    let intensity = Math.min(6 + fileCount * 0.5, 9.5); // Max intensity 9.5 for large batches
    startPipeline((onEvent) => analysisApi.analyzeBatch(fileInput, onEvent), intensity);
  };

  // We must not unmount the <input type="file"> during an active upload, otherwise 
  // Chromium will abort the fetch request with "Failed to fetch".
  // Instead of early returning, we render both and use CSS/classes to hide the workspace.

  return (
    <>
      {isProcessing && (
        <div className="flex flex-col h-full w-full justify-center relative z-10">
          <AnalysisPipeline isProcessing={isProcessing} currentStage={currentStage} error={error} onCancel={handleCancelPipeline} />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isProcessing ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className={cn("flex flex-col h-full max-w-7xl mx-auto z-10 relative", isProcessing && "hidden")}
      >
      {/* Top Section: Hero narrative */}
      <div className="flex flex-col lg:flex-row items-center gap-12 mb-12 flex-1 pt-8">
        
        <div className="flex-1 lg:pr-12 relative z-10">
          {/* Subtle System Status rather than flashy neon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center gap-6 mb-8 text-xs font-mono text-prism-text-muted tracking-widest uppercase"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500/70" /> System Secure
            </div>
            <div className="flex items-center gap-2">
              <Network size={14} className="text-blue-500/70" /> Neural Link Active
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl lg:text-6xl tracking-tight text-prism-text-primary mb-6 leading-tight relative group"
          >
            {/* Refracted Light Leak Sweep: Runs twice on refresh/mount then stops */}
            <motion.div 
              initial={{ x: '120%', opacity: 0 }}
              animate={{ x: ['120%', '-120%'], opacity: [0, 0.85, 0] }}
              transition={{ duration: 3.2, repeat: 1, repeatDelay: 1.2, ease: "easeInOut" }}
              className={cn(
                "absolute -inset-4 blur-xl pointer-events-none",
                theme === 'light'
                  ? "bg-gradient-to-r from-transparent via-emerald-600/45 via-teal-600/40 via-amber-600/35 to-transparent mix-blend-multiply"
                  : "bg-gradient-to-r from-transparent via-rose-500/60 via-amber-300/50 via-rose-400/40 to-transparent mix-blend-screen"
              )}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {theme === 'dark' ? (
                  <>
                    <span className="font-serif italic font-light text-prism-text-primary block mb-2 relative">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-amber-300 to-rose-200">Darkness</span> hides information.
                    </span>
                    <span className="font-sans font-medium tracking-wide text-prism-text-primary">
                      Prism reveals <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">truth.</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-serif italic font-light text-prism-text-primary block mb-2 relative">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 font-semibold">Clarity</span> begins with evidence.
                    </span>
                    <span className="font-sans font-medium tracking-wide text-prism-text-primary">
                      Prism reveals <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 font-semibold">truth.</span>
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-prism-text-secondary max-w-2xl font-light leading-relaxed font-sans"
          >
            Upload classified documents, political speeches, or social media URLs. Our multi-modal AI architecture will extract claims, analyze bias, and reconstruct credibility.
          </motion.p>
        </div>

        {/* The 3D Prism is globally rendered behind this space */}
        <div className="flex-1 w-full h-[300px] lg:h-[400px] relative pointer-events-none" />
      </div>

      {/* Intelligence Laboratory Layout */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20"
      >
        {/* Main Upload Zone */}
        <div className="lg:col-span-8">
          {/* Using physical glass properties for the card */}
          <div className="relative rounded-2xl glass-panel-strong overflow-hidden shadow-2xl">
            {/* Specular Highlight */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-prism-accent/30 to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col p-8">
              <div className="flex justify-between items-end border-b border-prism-border/40 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <Activity size={20} className="text-prism-accent" />
                  <h3 className="text-xl font-light tracking-wide text-prism-text-primary">Initiate Analysis</h3>
                </div>
                {/* Micro-interaction data point */}
                <div className="text-xs font-mono text-prism-text-muted flex gap-4">
                  <span>CAPACITY: 98%</span>
                  <span>LATENCY: 12ms</span>
                </div>
              </div>

              {/* Seamless Tabs */}
              <div className="flex gap-2 mb-8 border-b border-prism-border/40 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setFileInput([]); }}
                    className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all relative ${
                      activeTab === tab.id 
                        ? "text-prism-text-primary font-semibold" 
                        : "text-prism-text-muted hover:text-prism-text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2 relative z-10">
                      <tab.icon size={16} /> {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-prism-accent shadow-prism-glow" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Content Area */}
              <div className="min-h-[240px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'file' && (
                    <motion.div key="file" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-6">
                      <Dropzone maxFiles={1} acceptedTypes="application/pdf,.docx,.pptx,audio/*,image/*" onFilesSelected={setFileInput} />
                      {fileInput.length > 0 && <Button size="lg" variant="primary" className="w-full h-14 font-medium tracking-wide" onClick={handleAnalyzeFile}>Commence Single Analysis</Button>}
                    </motion.div>
                  )}
                  {activeTab === 'batch' && (
                    <motion.div key="batch" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-6">
                      <Dropzone maxFiles={10} acceptedTypes="application/pdf,.docx,.pptx,audio/*,image/*" onFilesSelected={setFileInput} />
                      {fileInput.length > 0 && <Button size="lg" variant="primary" className="w-full h-14 font-medium tracking-wide" onClick={handleAnalyzeBatch}>Commence Batch Synthesis ({fileInput.length})</Button>}
                    </motion.div>
                  )}
                  {activeTab === 'url' && (
                    <motion.div key="url" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-6">
                      <Input placeholder="Enter web address to scrape and analyze..." icon={Link2} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="h-16 text-lg" />
                      <Button size="lg" variant="primary" className="w-full h-14 font-medium tracking-wide" onClick={handleAnalyzeUrl} disabled={!urlInput.trim()}>Scan Web Link</Button>
                    </motion.div>
                  )}
                  {activeTab === 'text' && (
                    <motion.div key="text" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-6">
                      <textarea placeholder="Paste intercepted text or raw data..." value={textInput} onChange={(e) => setTextInput(e.target.value)} className="w-full h-40 p-5 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:border-prism-accent resize-none font-mono text-sm leading-relaxed" />
                      <Button size="lg" variant="primary" className="w-full h-14 font-medium tracking-wide" onClick={handleAnalyzeText} disabled={!textInput.trim()}>Process Raw Data</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Context & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-2xl glass-panel flex-1">
            <h4 className="text-xs font-mono uppercase tracking-widest text-prism-text-muted mb-6 flex items-center gap-2"><History size={14} /> Global Analysis Log</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded bg-prism-surface-hover flex flex-col items-center justify-center border border-prism-border group-hover:border-prism-accent/40 transition-colors">
                  <FileUp size={16} className="text-prism-accent" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-prism-text-primary mb-1">Project_Onyx_Brief.pdf</p>
                  <div className="flex justify-between items-center text-xs font-mono text-prism-text-muted">
                    <span>Threat Level: Low</span>
                    <span>2h ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded bg-prism-surface-hover flex flex-col items-center justify-center border border-prism-border group-hover:border-prism-accent/40 transition-colors">
                  <Link2 size={16} className="text-prism-accent" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-prism-text-primary mb-1">reuters.com/market-update</p>
                  <div className="flex justify-between items-center text-xs font-mono text-prism-text-muted">
                    <span>Credibility: 92%</span>
                    <span>Yesterday</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded bg-prism-surface-hover flex flex-col items-center justify-center border border-prism-border group-hover:border-prism-accent/40 transition-colors">
                  <Layers size={16} className="text-prism-accent" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-prism-text-primary mb-1">Q2_Earning_Reports (Batch)</p>
                  <div className="flex justify-between items-center text-xs font-mono text-prism-text-muted">
                    <span>14 Documents</span>
                    <span>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 border border-prism-border rounded-lg text-xs font-mono uppercase tracking-widest text-prism-text-muted hover:bg-prism-surface-hover hover:text-prism-text-primary transition-colors">
              Access Full Archive
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group">
            {/* Subtle light leak */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-prism-accent/10 blur-3xl rounded-full" />
            
            {/* Subtle decorative grid background for workspace */}
            <div className="absolute inset-0 bg-prism-grid opacity-[0.03] pointer-events-none -z-10 mix-blend-overlay" />
            
            <h4 className="text-xs font-mono uppercase tracking-widest text-prism-text-primary mb-3 relative z-10 flex items-center gap-2">
              <Cpu size={14} className="text-prism-accent" /> Architecture Update
            </h4>
            <p className="text-sm text-prism-text-secondary leading-relaxed relative z-10">
              Prism 2.0 now cross-references audio claims against visual presentation decks automatically. Multi-modal synthesis active.
            </p>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </>
  );
};
