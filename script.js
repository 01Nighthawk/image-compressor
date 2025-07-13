document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements (why i put together because i don't to element when i going to update it)
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const fileInfo = document.getElementById('fileInfo');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const formatOptions = document.querySelectorAll('.format-option');
    const compressBtn = document.getElementById('compressBtn');
    const errorMsg = document.getElementById('errorMsg');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalStats = document.getElementById('originalStats');
    const compressedStats = document.getElementById('compressedStats');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const sizeSavings = document.getElementById('sizeSavings');
    const originalDimensions = document.getElementById('originalDimensions');
    const compressedDimensions = document.getElementById('compressedDimensions');
    const dimensionsSavings = document.getElementById('dimensionsSavings');
    const compressedQuality = document.getElementById('compressedQuality');
    const qualityInfo = document.getElementById('qualityInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Variables
    let selectedFile = null;
    let originalImageData = null;
    let compressedImageData = null;
    let outputFormat = 'original';
    
    // Event Listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
    
    qualitySlider.addEventListener('input', updateQualityValue);
    
    formatOptions.forEach(option => {
        option.addEventListener('click', () => {
            formatOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            outputFormat = option.dataset.format;
        });
    });
    
    compressBtn.addEventListener('click', compressImage);
    
    downloadBtn.addEventListener('click', downloadCompressedImage);
    
    // Functions
    function handleFileSelect(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showError('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        selectedFile = file;
        fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
        compressBtn.disabled = false;
        errorMsg.textContent = '';
        
        // Preview original image
        const reader = new FileReader();
        reader.onload = function(e) {
            originalPreview.src = e.target.result;
            originalImageData = e.target.result;
            
            // Get image dimensions
            const img = new Image();
            img.onload = function() {
                originalDimensions.textContent = `${img.width} × ${img.height} px`;
                originalStats.textContent = `${img.width}×${img.height}px • ${formatFileSize(file.size)}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function updateQualityValue() {
        const quality = qualitySlider.value;
        qualityValue.textContent = `${quality}%`;
        compressedQuality.textContent = `${quality}%`;
        
        // Update quality info text
        if (quality < 30) {
            qualityInfo.textContent = 'High compression 🚀';
        } else if (quality < 70) {
            qualityInfo.textContent = 'Balanced ⚖️';
        } else {
            qualityInfo.textContent = 'High quality ✨';
        }
    }
    
    function compressImage() {
        if (!selectedFile) {
            showError('Please select an image first');
            return;
        }
        
        loading.style.display = 'block';
        results.style.display = 'none';
        
        // Simulate compression delay (in a real app, this would be actual compression)
        setTimeout(() => {
            const quality = parseInt(qualitySlider.value) / 100;
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Maintain original dimensions for this demo
                    // In a real app, you might resize here
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Determine output format
                    let mimeType = selectedFile.type;
                    if (outputFormat !== 'original') {
                        mimeType = `image/${outputFormat}`;
                    }
                    
                    // Convert to compressed format
                    canvas.toBlob(function(blob) {
                        const compressedUrl = URL.createObjectURL(blob);
                        
                        // Update UI with compressed image
                        compressedPreview.src = compressedUrl;
                        compressedImageData = compressedUrl;
                        
                        // Calculate stats
                        const originalSizeBytes = selectedFile.size;
                        const compressedSizeBytes = blob.size;
                        const savings = 1 - (compressedSizeBytes / originalSizeBytes);
                        
                        // Update results table
                        originalSize.textContent = formatFileSize(originalSizeBytes);
                        compressedSize.textContent = formatFileSize(compressedSizeBytes);
                        sizeSavings.textContent = `${(savings * 100).toFixed(1)}% smaller`;
                        
                        compressedDimensions.textContent = `${img.width} × ${img.height} px`;
                        dimensionsSavings.textContent = 'Same dimensions';
                        
                        compressedStats.textContent = `${img.width}×${img.height}px • ${formatFileSize(compressedSizeBytes)}`;
                        
                        // Show results
                        loading.style.display = 'none';
                        results.style.display = 'block';
                        
                        // Scroll to results
                        results.scrollIntoView({ behavior: 'smooth' });
                        
                    }, mimeType, quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(selectedFile);
        }, 1000);
    }
    
    function downloadCompressedImage() {
        if (!compressedImageData) return;
        
        const a = document.createElement('a');
        a.href = compressedImageData;
        a.download = `compressed_${selectedFile.name.split('.')[0]}.${outputFormat === 'original' ? selectedFile.name.split('.').pop():outputFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    function showError(message) {
        errorMsg.textContent = message;
        compressBtn.disabled = true;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
    }
    
    // Initialize
    updateQualityValue();
});