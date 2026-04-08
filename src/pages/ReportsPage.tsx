import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Upload, X, Check, AlertCircle, Search, FileDown } from 'lucide-react';

const DocumentPage: React.FC = () => {
  const [selected, setSelected] = useState('temples');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState('');

  // PDF URLs for all documents
  const pdfUrls = {
    temples: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
    donations: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
    devotees: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
    bookings: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
    inventory: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
  };

  const reportTypes = [
    { 
      id: 'temples', 
      title: 'Temples In India', 
      description: 'Vivekananda Kendra Patrika - Comprehensive volume on Indian temples.',
      url: pdfUrls.temples,
      color: 'primary'
    },
    { 
      id: 'donations', 
      title: 'Donation Report', 
      description: 'Detailed donation history, trends, and analytics with financial summaries.',
      url: pdfUrls.donations,
      color: 'success'
    },
    { 
      id: 'devotees', 
      title: 'Devotee Directory', 
      description: 'Complete devotee registration database with engagement metrics.',
      url: pdfUrls.devotees,
      color: 'accent'
    },
    { 
      id: 'bookings', 
      title: 'Service Bookings', 
      description: 'Service booking trends, revenue analysis, and occupancy rates.',
      url: pdfUrls.bookings,
      color: 'warning'
    },
    { 
      id: 'inventory', 
      title: 'Inventory Report', 
      description: 'Stock usage patterns, reorder alerts, and supplier performance.',
      url: pdfUrls.inventory,
      color: 'primary'
    },
  ];

  const handleOpenPDF = (url: string | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = (report: typeof reportTypes[0]) => {
    setSelected(report.id);
    if (report.url) handleOpenPDF(report.url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    pdfFiles.forEach(file => {
      setUploadedFiles(prev => [...prev, file]);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        if (progress >= 100) clearInterval(interval);
      }, 200);
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const filteredReports = reportTypes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  const colorMap = {
    primary: {
      border: 'border-primary/40', hoverBorder: 'hover:border-primary/60', ring: 'ring-primary/40',
      bg: 'bg-primary', hoverBg: 'group-hover:bg-primary/10', text: 'text-primary',
      lightBg: 'bg-primary/10', activeBgText: 'bg-primary/20 text-primary border-primary/20',
      overlay: 'bg-primary/5'
    },
    success: {
      border: 'border-success/40', hoverBorder: 'hover:border-success/60', ring: 'ring-success/40',
      bg: 'bg-success', hoverBg: 'group-hover:bg-success/10', text: 'text-success',
      lightBg: 'bg-success/10', activeBgText: 'bg-success/20 text-success border-success/20',
      overlay: 'bg-success/5'
    },
    accent: {
      border: 'border-accent/40', hoverBorder: 'hover:border-accent/60', ring: 'ring-accent/40',
      bg: 'bg-accent', hoverBg: 'group-hover:bg-accent/10', text: 'text-accent',
      lightBg: 'bg-accent/10', activeBgText: 'bg-accent/20 text-accent border-accent/20',
      overlay: 'bg-accent/5'
    },
    warning: {
      border: 'border-warning/40', hoverBorder: 'hover:border-warning/60', ring: 'ring-warning/40',
      bg: 'bg-warning', hoverBg: 'group-hover:bg-warning/10', text: 'text-warning',
      lightBg: 'bg-warning/10', activeBgText: 'bg-warning/20 text-warning border-warning/20',
      overlay: 'bg-warning/5'
    }
  } as const;

  return (
    <div className="docs-premium space-y-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="page-header-banner docs-header bg-gradient-to-r from-primary/10 via-background to-primary/5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2"><FileDown className="w-5 h-5 text-primary" /> Document & Reports Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Securely access, manage, and upload official temple documents.</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} className="docs-cta shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
      </div>

      <div className="section-panel docs-main-panel shadow-sm">
        <div className="section-panel-header docs-main-header gap-3 flex-wrap bg-gradient-to-r from-slate-50 to-background border-b border-border/60">
           <h2 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Curated Repository</h2>
           <div className="relative w-full max-w-sm ml-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <input
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Search by title or description..."
               className="docs-search-input w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background/80 shadow-sm text-sm transition-all focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
             />
           </div>
        </div>

        <div className="docs-grid-wrap p-6 bg-muted/10">
          <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-5 animate-stagger">
            {filteredReports.map(r => {
              const colors = colorMap[r.color as keyof typeof colorMap];
              return (
              <div
                key={r.id}
                onClick={() => handleCardClick(r)}
                className={`docs-card group rounded-2xl border p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 relative overflow-hidden bg-background ${
                  selected === r.id 
                    ? `${colors.border} shadow-md scale-[1.02] ring-1 ${colors.ring}` 
                    : `border-border/60 ${colors.hoverBorder} hover:shadow-md hover:-translate-y-1`
                }`}
              >
                {selected === r.id && <div className={`absolute inset-0 ${colors.overlay} pointer-events-none`} />}
                <div className="relative z-10">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                         selected === r.id ? `${colors.bg} text-white` : `${colors.lightBg} ${colors.text} ${colors.hoverBg} border border-border/40`
                       }`}>
                         <FileText className="h-6 w-6" />
                       </div>
                       {selected === r.id && (
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.activeBgText} px-2.5 py-1 rounded-full border`}>Active</span>
                       )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg line-clamp-1">{r.title}</h3>
                      <p className="text-sm text-foreground/60 mt-1 line-clamp-2 leading-relaxed font-medium">{r.description}</p>
                    </div>
                  </div>
                </div>
                <div className={`mt-6 pt-4 border-t border-border/60 flex items-center justify-between transition-opacity relative z-10 ${selected === r.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                   <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">PDF Standard</span>
                   <div className={`flex items-center gap-1.5 text-xs font-bold ${selected === r.id ? colors.text : 'text-primary'}`}>
                     Access Media <ExternalLink className="h-3.5 w-3.5" />
                   </div>
                </div>
              </div>
            )})}

            {filteredReports.length === 0 && (
              <div className="docs-empty-state col-span-full py-16 text-center bg-card rounded-2xl border-2 border-border border-dashed shadow-sm">
                <FileDown className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground text-lg font-bold">No documents found</p>
                <p className="text-muted-foreground text-sm font-medium mt-1">Try adjusting your search filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploadModalOpen && (
        <div className="modal-overlay" onClick={() => { setUploadModalOpen(false); setUploadedFiles([]); setUploadProgress({}); }}>
          <div className="docs-upload-modal bg-gradient-to-b from-card to-muted/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-slide-up border border-border/50 flex flex-col max-h-[90vh] relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[100%] pointer-events-none" />
            
            <div className="docs-upload-head flex items-center justify-between p-6 border-b border-border/60 shrink-0 relative z-10 bg-background/50 backdrop-blur-sm">
              <div>
                 <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Upload Documents</h2>
                 <p className="text-[11px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Secure Media Pipeline</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { setUploadModalOpen(false); setUploadedFiles([]); setUploadProgress({}); }}
                className="rounded-full hover:bg-muted/80 hover:rotate-90 transition-all duration-300 bg-background border border-border/40 shadow-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="docs-upload-body p-6 space-y-6 overflow-y-auto relative z-10">
              <div
                className={`docs-dropzone border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-primary bg-primary/5 scale-[1.02] shadow-inner' 
                    : 'border-border/80 bg-background hover:border-primary/40 hover:bg-muted/20 shadow-sm'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 border border-primary/20 shadow-sm">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-bold mb-1 text-foreground">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground mb-6 font-medium">Strictly PDF documents supported (Max 50MB per chunk)</p>
                <input
                  type="file" multiple accept=".pdf,application/pdf"
                  onChange={handleFileInput} className="hidden" id="file-upload"
                />
                <Button variant="outline" className="docs-browse-btn shadow-sm hover:shadow-md font-bold px-8 h-12" onClick={() => document.getElementById('file-upload')?.click()}>
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="docs-stage space-y-4 animate-fade-in bg-background p-4 rounded-xl border border-border/60 shadow-sm">
                  <div className="flex justify-between items-center px-1 border-b border-border/60 pb-2">
                     <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Staging Area ({uploadedFiles.length})</h3>
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="docs-stage-item flex items-center gap-4 p-3.5 bg-muted/20 border border-border/40 rounded-xl hover:border-border transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20 shadow-sm">
                          <FileText className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-sm font-bold truncate text-foreground pr-2">{file.name}</p>
                             <p className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden border border-border/40 shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)] ${uploadProgress[file.name] === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 ml-2">
                          {uploadProgress[file.name] === 100 ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm">
                              <Check className="h-4 w-4 text-emerald-700" />
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-100 hover:text-rose-700 bg-background border border-border/50 text-muted-foreground shadow-sm" onClick={() => removeFile(file.name)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-panel docs-guidelines bg-amber-500/10 border-amber-500/20">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/20"><AlertCircle className="h-4 w-4 text-amber-600" /></div>
                <div className="text-xs text-foreground/80 leading-relaxed space-y-1">
                  <p className="font-semibold text-amber-600">Deployment Guidelines</p>
                  <p>• Only PDF format is currently accepted by the processor.</p>
                  <p>• Ensure payloads do not exceed 50MB limits to prevent timeouts.</p>
                  <p>• Verified artifacts automatically sync to the global CDN.</p>
                </div>
              </div>
            </div>

            <div className="docs-upload-foot flex items-center justify-end gap-3 border-t border-border/60 p-5 bg-background shrink-0 rounded-b-2xl relative z-10">
              <Button variant="outline" className="h-11 px-6 font-bold" onClick={() => { setUploadModalOpen(false); setUploadedFiles([]); setUploadProgress({}); }}>Discard</Button>
              <Button 
                className="docs-sync-btn h-11 px-6 font-bold shadow-md"
                disabled={uploadedFiles.length === 0 || Object.values(uploadProgress).some(p => p < 100)} 
                onClick={() => { alert(`${uploadedFiles.length} files successfully securely uploaded!`); setUploadModalOpen(false); setUploadedFiles([]); setUploadProgress({}); }}
              >
                Perform Sync
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPage;