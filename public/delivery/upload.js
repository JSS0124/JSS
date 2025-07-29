const BASE_URL = "https://jss-pied.vercel.app";

// Drag and drop functionality
const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const progressSection = document.getElementById('progressSection');
const resultsSection = document.getElementById('resultsSection');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  uploadSection.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  uploadSection.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  uploadSection.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
uploadSection.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  uploadSection.classList.add('dragover');
}

function unhighlight() {
  uploadSection.classList.remove('dragover');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// File input change handler
fileInput.addEventListener('change', function(e) {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    displayFileInfo(file);
  }
}

function displayFileInfo(file) {
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  fileInfo.style.display = 'block';
  
  // Store file for upload
  window.selectedFile = file;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile() {
  if (!window.selectedFile) {
    alert('Please select a file first');
    return;
  }
  
  const formData = new FormData();
  formData.append('excel', window.selectedFile);
  
  // Show progress
  showProgress();
  
  try {
    const response = await fetch(`${BASE_URL}/upload/deliveries`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    hideProgress();
    showResults(result, response.ok);
    
  } catch (error) {
    console.error('Upload error:', error);
    hideProgress();
    showResults({
      success: false,
      message: 'Upload failed. Please try again.',
      errors: [error.message]
    }, false);
  }
}

function showProgress() {
  progressSection.style.display = 'block';
  resultsSection.style.display = 'none';
  
  // Simulate progress (since we can't track real progress with fetch)
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Processing... ${Math.round(progress)}%`;
    
    if (progress >= 90) {
      clearInterval(interval);
    }
  }, 200);
  
  window.progressInterval = interval;
}

function hideProgress() {
  if (window.progressInterval) {
    clearInterval(window.progressInterval);
  }
  
  // Complete the progress bar
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressText').textContent = 'Complete!';
  
  setTimeout(() => {
    progressSection.style.display = 'none';
  }, 1000);
}

function showResults(result, success) {
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsContent = document.getElementById('resultsContent');
  const errorList = document.getElementById('errorList');
  
  resultsSection.className = 'results-section ' + (success ? 'results-success' : 'results-error');
  resultsSection.style.display = 'block';
  
  if (success) {
    resultsTitle.textContent = '✅ Upload Successful!';
    resultsContent.innerHTML = `
      <p><strong>Records processed:</strong> ${result.processed || 0}</p>
      <p><strong>Records imported:</strong> ${result.imported || 0}</p>
      ${result.skipped ? `<p><strong>Records skipped:</strong> ${result.skipped}</p>` : ''}
      <p>${result.message}</p>
    `;
  } else {
    resultsTitle.textContent = '❌ Upload Failed';
    resultsContent.innerHTML = `<p>${result.message}</p>`;
    
    if (result.errors && result.errors.length > 0) {
      errorList.innerHTML = '<h4>Errors:</h4><ul>' + 
        result.errors.map(error => `<li>${error}</li>`).join('') + 
        '</ul>';
      errorList.style.display = 'block';
    }
  }
  
  // Reset file selection
  fileInput.value = '';
  fileInfo.style.display = 'none';
  window.selectedFile = null;
}

function downloadTemplate() {
  // Create a sample Excel template
  const templateData = [
    ['date', 'slip_number', 'customer_name', 'vehicle_number', 'product_name', 'vendor_name', 'foot', 'az', 'size', 'rate', 'price_level', 'remarks'],
    ['2024-01-15', 'SL001', 'Walk-in (Cash) Customer', 'ABC-123', 'Half Khaalis Crush', 'Retail (Cash) Purchase', '10', '12', '1', '50', 'price', 'Sample delivery'],
    ['2024-01-16', 'SL002', 'CYN Developers Gujar Khan', 'XYZ-456', 'Half Down Crush', 'Baba Stone Hassan Abdal', '15', '10', '1', '45', 'price1', 'Another sample']
  ];
  
  // Convert to CSV format for download
  const csvContent = templateData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'delivery_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

