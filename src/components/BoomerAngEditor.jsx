import { useState, useRef } from 'react';
import { Upload, X, Save, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';

/**
 * BOOMER_ANG EDITOR
 * Create and edit AI Agents (Boomer_Angs)
 * Features: Name, description, image upload, category, effectiveness level, features, pricing
 */

export function BoomerAngEditor({ 
  boomerAng = null, // Existing Boomer_Ang to edit, or null for new
  onSave,
  onCancel,
  userTier = 'free' // free, pro, enterprise - determines limits
}) {
  const [formData, setFormData] = useState({
    name: boomerAng?.name || '',
    description: boomerAng?.description || '',
    image: boomerAng?.image || null,
    category: boomerAng?.category || 'General',
    effectivenessLevel: boomerAng?.effectivenessLevel || 'Basic',
    features: boomerAng?.features || [],
    tags: boomerAng?.tags || [],
    isPublic: boomerAng?.isPublic || false,
    price: boomerAng?.price || 0,
    rentPrice: boomerAng?.rentPrice || 0,
    config: boomerAng?.config || {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '',
    },
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState(boomerAng?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Tier limits
  const limits = {
    free: { maxBoomerAngs: 3, maxFeatures: 5, canSell: false, canRent: false },
    pro: { maxBoomerAngs: 20, maxFeatures: 15, canSell: true, canRent: true },
    enterprise: { maxBoomerAngs: Infinity, maxFeatures: Infinity, canSell: true, canRent: true },
  };

  const userLimits = limits[userTier];

  const categories = [
    'General', 'Coding Assistant', 'Data Analysis', 'Content Creation',
    'Customer Support', 'Research', 'Marketing', 'Sales', 'Education', 'Healthcare'
  ];

  const effectivenessLevels = ['Basic', 'Advanced', 'Premium', 'Enterprise'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, image: 'Image must be under 5MB' }));
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to R2 storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'boomer-ang-image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      handleInputChange('image', url);
      setErrors(prev => ({ ...prev, image: null }));
    } catch (error) {
      console.error('Image upload error:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    if (formData.features.length >= userLimits.maxFeatures) {
      setErrors(prev => ({ 
        ...prev, 
        features: `Your ${userTier} plan is limited to ${userLimits.maxFeatures} features. Upgrade to add more.` 
      }));
      return;
    }
    handleInputChange('features', [...formData.features, newFeature.trim()]);
    setNewFeature('');
    setErrors(prev => ({ ...prev, features: null }));
  };

  const handleRemoveFeature = (index) => {
    handleInputChange('features', formData.features.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (formData.tags.includes(newTag.trim())) return;
    handleInputChange('tags', [...formData.tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (index) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.features.length === 0) {
      newErrors.features = 'Add at least one feature';
    }

    if (formData.isPublic && !userLimits.canSell && formData.price > 0) {
      newErrors.price = `Your ${userTier} plan cannot sell Boomer_Angs. Upgrade to Pro.`;
    }

    if (formData.isPublic && !userLimits.canRent && formData.rentPrice > 0) {
      newErrors.rentPrice = `Your ${userTier} plan cannot rent Boomer_Angs. Upgrade to Pro.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.(formData);
  };

  return (
    <div className="boomer-ang-editor max-w-4xl mx-auto p-6 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border-2 border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {boomerAng ? 'Edit Boomer_Ang' : 'Create New Boomer_Ang'}
        </h2>
        <p className="text-gray-400">
          Design your AI agent with custom image, features, and configuration
        </p>
      </div>

      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Agent Image <span className="text-[#E68961]">*</span>
          </label>
          <div className="flex gap-4">
            <div
              className="w-48 h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#E68961] transition-all overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imagePreview && (
              <button
                onClick={() => {
                  setImagePreview(null);
                  handleInputChange('image', null);
                }}
                className="p-2 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isUploading && <p className="text-sm text-[#E68961] mt-2">Uploading...</p>}
          {errors.image && <p className="text-sm text-red-400 mt-2">{errors.image}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Name <span className="text-[#E68961]">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Code Review Expert"
            className="w-full px-4 py-3 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E68961] focus:outline-none transition-all"
          />
          {errors.name && <p className="text-sm text-red-400 mt-2">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Description <span className="text-[#E68961]">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what your Boomer_Ang does and how it helps users..."
            rows={4}
            className="w-full px-4 py-3 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E68961] focus:outline-none transition-all resize-none"
          />
          <div className="flex justify-between mt-2">
            {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
            <p className="text-sm text-gray-400 ml-auto">{formData.description.length} characters</p>
          </div>
        </div>

        {/* Category & Effectiveness */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Effectiveness Level</label>
            <select
              value={formData.effectivenessLevel}
              onChange={(e) => handleInputChange('effectivenessLevel', e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all"
            >
              {effectivenessLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Features <span className="text-[#E68961]">*</span>
            <span className="text-xs text-gray-400 ml-2">
              ({formData.features.length}/{userLimits.maxFeatures} used)
            </span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              placeholder="Add a feature..."
              className="flex-1 px-4 py-2 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E68961] focus:outline-none transition-all"
            />
            <button
              onClick={handleAddFeature}
              className="px-4 py-2 bg-[#E68961] hover:bg-[#D4A05F] text-black font-semibold rounded-lg transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#E68961]/20 text-[#E68961] border border-[#E68961]/30 rounded-full text-sm flex items-center gap-2"
              >
                {feature}
                <button onClick={() => handleRemoveFeature(idx)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.features && <p className="text-sm text-red-400 mt-2">{errors.features}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Tags (Optional)</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#E68961] focus:outline-none transition-all"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#2a2a2a] text-gray-300 rounded-full text-sm flex items-center gap-2"
              >
                #{tag}
                <button onClick={() => handleRemoveTag(idx)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Marketplace Settings */}
        <div className="p-4 bg-[#0F0F0F] rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Marketplace Settings</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Make this Boomer_Ang public in marketplace</span>
            </label>
          </div>

          {formData.isPublic && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Sale Price ($)
                  {!userLimits.canSell && <span className="text-xs text-gray-500 ml-2">(Pro only)</span>}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={!userLimits.canSell}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all disabled:opacity-50"
                />
                {errors.price && <p className="text-sm text-red-400 mt-2">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Rental Price ($/month)
                  {!userLimits.canRent && <span className="text-xs text-gray-500 ml-2">(Pro only)</span>}
                </label>
                <input
                  type="number"
                  value={formData.rentPrice}
                  onChange={(e) => handleInputChange('rentPrice', parseFloat(e.target.value) || 0)}
                  disabled={!userLimits.canRent}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-[#0F0F0F] border border-gray-600 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all disabled:opacity-50"
                />
                {errors.rentPrice && <p className="text-sm text-red-400 mt-2">{errors.rentPrice}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E68961] hover:bg-[#D4A05F] text-black font-bold rounded-lg transition-all"
          >
            <Save className="w-5 h-5" />
            {boomerAng ? 'Save Changes' : 'Create Boomer_Ang'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoomerAngEditor;
