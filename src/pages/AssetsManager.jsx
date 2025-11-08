import React, { useState, useRef } from 'react';
import { Upload, Folder, Image as ImageIcon, FileText, Trash2, Download, Eye, Search } from 'lucide-react';

function AssetsManager() {
  const [assets, setAssets] = useState([
    // Example assets - will be loaded from backend
    { id: 1, name: 'nurd-drip-hero.svg', type: 'logo', size: '45KB', folder: 'logos', url: '/assets/logos/nurd-drip-hero.svg' },
    { id: 2, name: 'made-in-plr.svg', type: 'logo', size: '32KB', folder: 'logos', url: '/assets/logos/made-in-plr.svg' },
  ]);
  
  const [currentFolder, setCurrentFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const folders = [
    { id: 'all', name: 'All Assets', icon: '📁', count: assets.length },
    { id: 'logos', name: 'Logos', icon: '🏷️', count: assets.filter(a => a.folder === 'logos').length },
    { id: 'characters', name: 'Characters', icon: '🤖', count: assets.filter(a => a.folder === 'characters').length },
    { id: 'branding', name: 'Branding', icon: '🎨', count: assets.filter(a => a.folder === 'branding').length },
    { id: 'icons', name: 'Icons', icon: '✨', count: assets.filter(a => a.folder === 'icons').length },
    { id: 'illustrations', name: 'Illustrations', icon: '🖼️', count: assets.filter(a => a.folder === 'illustrations').length },
    { id: 'plugs', name: 'Plugs', icon: '🔌', count: assets.filter(a => a.folder === 'plugs').length },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files) {
      await handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // In production, upload to backend/Cloudflare R2
      // For now, create local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAsset = {
          id: Date.now() + i,
          name: file.name,
          type: file.type.split('/')[0],
          size: `${(file.size / 1024).toFixed(0)}KB`,
          folder: currentFolder === 'all' ? 'branding' : currentFolder,
          url: e.target.result
        };
        
        setAssets(prev => [...prev, newAsset]);
      };
      reader.readAsDataURL(file);

      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(asset => asset.id !== id));
    }
  };

  const handleDownload = (asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    link.click();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesFolder = currentFolder === 'all' || asset.folder === currentFolder;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Assets Manager</h1>
          <p className="text-gray-400">Upload and manage your images, logos, and brand assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folders */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#E68961]" />
                Folders
              </h2>
              <div className="space-y-2">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentFolder(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                      currentFolder === folder.id
                        ? 'bg-[#E68961]/10 text-[#E68961]'
                        : 'text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{folder.icon}</span>
                      <span className="text-sm">{folder.name}</span>
                    </span>
                    <span className="text-xs">{folder.count}</span>
                  </button>
                ))}
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-6 px-4 py-3 bg-[#E68961] text-black font-bold rounded-lg hover:bg-[#D4A05F] transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Assets
              </button>
            </div>
          </div>

          {/* Main Content - Assets Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#E68961]"
                />
              </div>
            </div>

            {/* Upload Drop Zone */}
            <div
              className={`mb-6 border-2 border-dashed rounded-lg p-8 transition-all ${
                dragActive
                  ? 'border-[#E68961] bg-[#E68961]/10'
                  : 'border-[#2a2a2a] bg-[#1a1a1a]/50 hover:border-[#E68961]/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="image/*,.svg,.png,.jpg,.jpeg,.gif,.webp"
                multiple
              />

              {isUploading ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-[#E68961] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-white">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-[#E68961] mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-400 text-sm">
                    Support for PNG, JPG, SVG, GIF, WebP • Max 10MB per file
                  </p>
                </div>
              )}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#E68961]/50 transition-all group"
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-[#0F0F0F] flex items-center justify-center p-4 relative">
                    {asset.type === 'image' || asset.url.includes('.svg') || asset.url.includes('.png') ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-600" />
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.open(asset.url, '_blank')}
                        className="p-2 bg-[#E68961] text-black rounded-lg hover:bg-[#D4A05F] transition-all"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(asset)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate mb-1">{asset.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{asset.folder}</span>
                      <span>{asset.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAssets.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No assets found</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {searchQuery ? 'Try a different search term' : 'Upload your first asset to get started'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Assets
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetsManager;
