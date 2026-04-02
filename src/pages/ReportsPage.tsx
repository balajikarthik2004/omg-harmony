import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Upload, X, Check, AlertCircle } from 'lucide-react';

const DocumentPage: React.FC = () => {
  const [selected, setSelected] = useState('temples');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [dragActive, setDragActive] = useState(false);

  // PDF URLs for all documents
  const pdfUrls = {
    temples: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf",
    donations: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf", // Replace with actual URL
    devotees: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf", // Replace with actual URL
    bookings: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf", // Replace with actual URL
    inventory: "https://prakashan.vrmvk.org/media/wysiwyg/ipaper_pdf/Temples%20In%20India-1.pdf", // Replace with actual URL
  };

  const reportTypes = [
    { 
      id: 'temples', 
      title: 'Temples In India', 
      description: 'Vivekananda Kendra Patrika - Comprehensive volume on Indian temples',
      url: pdfUrls.temples,
      pages: '~150',
      sections: 4,
      articles: '45+',
      publisher: 'VKV'
    },
    { 
      id: 'donations', 
      title: 'Donation Report', 
      description: 'Detailed donation history, trends, and analytics with financial summaries',
      url: pdfUrls.donations,
      pages: '24',
      sections: 3,
      articles: '12',
      publisher: 'Finance Dept'
    },
    { 
      id: 'devotees', 
      title: 'Devotee Directory', 
      description: 'Complete devotee registration database with engagement metrics',
      url: pdfUrls.devotees,
      pages: '156',
      sections: 5,
      articles: '28',
      publisher: 'Membership Dept'
    },
    { 
      id: 'bookings', 
      title: 'Service Bookings Report', 
      description: 'Service booking trends, revenue analysis, and occupancy rates',
      url: pdfUrls.bookings,
      pages: '42',
      sections: 4,
      articles: '16',
      publisher: 'Operations'
    },
    { 
      id: 'inventory', 
      title: 'Inventory Management Report', 
      description: 'Stock usage patterns, reorder alerts, and supplier performance',
      url: pdfUrls.inventory,
      pages: '38',
      sections: 4,
      articles: '14',
      publisher: 'Warehouse'
    },
  ];

  const handleOpenPDF = (url: string | null, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling if needed
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = (report: typeof reportTypes[0]) => {
    setSelected(report.id);
    // If the document has a URL, open it immediately
    if (report.url) {
      handleOpenPDF(report.url);
    }
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
    // Filter for PDF files only
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    // Simulate upload progress for each file
    pdfFiles.forEach(file => {
      setUploadedFiles(prev => [...prev, file]);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
        }
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

  const selectedReport = reportTypes.find(r => r.id === selected);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-foreground">Document Center</h1>
        <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Report Type Cards - Clicking any card opens PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportTypes.map(r => (
          <div
            key={r.id}
            onClick={() => handleCardClick(r)}
            className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
              selected === r.id 
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selected === r.id ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{r.title}</h3>
                    <ExternalLink className="h-3 w-3 text-primary/60 shrink-0" />
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              
            
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg border shadow-xl max-w-2xl w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-display font-semibold">Upload Documents</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadedFiles([]);
                  setUploadProgress({});
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drag & drop PDF files here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported format: PDF only
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Uploaded Files</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border"
                      >
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {/* Progress Bar */}
                          {uploadProgress[file.name] !== undefined && (
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {uploadProgress[file.name] === 100 ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(file.name)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Info */}
              <div className="bg-muted/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Upload Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Maximum file size: 50MB per document</li>
                    <li>Accepted format: PDF only</li>
                    <li>Documents will be visible in the document list after approval</li>
                    <li>Large files may take longer to upload</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadedFiles([]);
                  setUploadProgress({});
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={uploadedFiles.length === 0}
                onClick={() => {
                  // Handle final upload
                  alert(`${uploadedFiles.length} files uploaded successfully!`);
                  setUploadModalOpen(false);
                  setUploadedFiles([]);
                  setUploadProgress({});
                }}
              >
                Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPage;