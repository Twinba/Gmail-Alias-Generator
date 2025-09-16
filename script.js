// DOM Elements
const emailInput = document.querySelector('#email-input');
const resultsList = document.querySelector('#results-list');
const resultLength = document.querySelector('#result-length');
const exportSection = document.querySelector('#export-section');
const saveFileBtn = document.querySelector('#save-file-btn');
const copyAllBtn = document.querySelector('#copy-all-btn');

// List of words for plus tricks
const plusWords = [
  'abbonamenti', 'amici', 'app', 'backup', 'banche', 'bancomat', 'bollette', 'business', 'carta',
  'compiti', 'concorsi', 'contatti', 'corsi', 'cv', 'documenti', 'donazioni', 'eventi', 'extra',
  'famiglia', 'fatture', 'fornitori', 'giochi', 'hr', 'info', 'iscrizioni', 'lavoro', 'marketing',
  'medico', 'newsletter', 'online', 'ordini', 'palestra', 'pagamenti', 'partner', 'pec', 'progetti',
  'promemoria', 'promo', 'ricevute', 'salute', 'sanità', 'scadenze', 'scuola', 'servizi', 'shopping',
  'social', 'spam', 'spedizioni', 'streaming', 'supporto', 'tasse', 'team', 'test', 'tributi',
  'ufficiale', 'ufficiali', 'università', 'viaggi', 'web'
];

// Global variables
let allGeneratedEmails = [];
let customPlusWords = [...plusWords]; // Copy of original plusWords for editing
let isAccordionInitialized = false;

// Plus Words Management functionality
const PlusWordsManager = {
    // Initialize the plus words management system
    init() {
        this.setupEventListeners();
        this.loadSavedPlusWords();
        this.updateWordCount();
        this.initializeTooltips();
        this.populateTextarea();
        isAccordionInitialized = true;
    },

    // Setup all event listeners for plus words management
    setupEventListeners() {
        const textarea = document.getElementById('plusWordsTextarea');
        const saveBtn = document.getElementById('savePlusWords');
        const resetBtn = document.getElementById('resetPlusWords');
        const accordionButton = document.querySelector('.accordion-button');

        // Real-time validation and counting
        textarea.addEventListener('input', () => {
            this.validateAndCount();
        });

        // Save button
        saveBtn.addEventListener('click', () => this.savePlusWords());

        // Reset button
        resetBtn.addEventListener('click', () => this.resetToDefault());

        // Accordion state management
        accordionButton.addEventListener('click', () => {
            setTimeout(() => this.updateAccordionState(), 100);
        });

        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.savePlusWords();
            }
        });
    },

    // Load saved plus words from localStorage
    loadSavedPlusWords() {
        const saved = localStorage.getItem('customPlusWords');
        if (saved) {
            try {
                customPlusWords = JSON.parse(saved);
                this.updateWordCount();
            } catch (e) {
                console.error('Error loading saved plus words:', e);
            }
        }
    },

    // Populate textarea with current plus words
    populateTextarea() {
        const textarea = document.getElementById('plusWordsTextarea');
        textarea.value = customPlusWords.join(', ');
        this.validateAndCount();
    },

    // Validate format and update counters
    validateAndCount() {
        const textarea = document.getElementById('plusWordsTextarea');
        const text = textarea.value.trim();
        const wordCounter = document.getElementById('wordCounter');
        const charCounter = document.getElementById('charCounter');
        const feedback = document.getElementById('validationFeedback');

        // Count characters
        const charCount = text.length;
        charCounter.textContent = `${charCount} caratteri`;

        if (!text) {
            wordCounter.textContent = '0 parole';
            this.setValidationState(feedback, 'warning', 'Campo vuoto', 'fas fa-exclamation-triangle');
            return;
        }

        // Split and clean words
        const words = text.split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);

        wordCounter.textContent = `${words.length} parole`;

        // Validation logic
        const errors = [];
        const warnings = [];

        words.forEach((word, index) => {
            if (word.length < 2) {
                errors.push(`Parola ${index + 1} troppo corta`);
            }
            if (word.length > 20) {
                warnings.push(`Parola ${index + 1} molto lunga`);
            }
            if (!/^[a-zA-ZÀ-ÿ0-9]+$/.test(word)) {
                errors.push(`Parola ${index + 1} contiene caratteri non validi`);
            }
        });

        // Check for duplicates
        const uniqueWords = [...new Set(words)];
        if (uniqueWords.length !== words.length) {
            warnings.push('Alcune parole sono duplicate');
        }

        // Set validation state
        if (errors.length > 0) {
            this.setValidationState(feedback, 'danger', `${errors.length} errori trovati`, 'fas fa-times-circle');
        } else if (warnings.length > 0) {
            this.setValidationState(feedback, 'warning', `${warnings.length} avvertimenti`, 'fas fa-exclamation-triangle');
        } else {
            this.setValidationState(feedback, 'success', 'Formato valido', 'fas fa-check-circle');
        }

        // Update word count badge
        this.updateWordCount(words.length);
    },

    // Set validation feedback state
    setValidationState(element, type, message, icon) {
        element.className = `text-${type}`;
        element.innerHTML = `<i class="${icon}"></i> ${message}`;
    },

    // Update word count badge
    updateWordCount(count = null) {
        const badge = document.getElementById('plusWordsCount');
        const actualCount = count !== null ? count : customPlusWords.length;
        badge.textContent = actualCount;
        badge.className = actualCount > 0 ? 'badge bg-success ms-2' : 'badge bg-secondary ms-2';
    },

    // Save plus words
    savePlusWords() {
        const textarea = document.getElementById('plusWordsTextarea');
        const text = textarea.value.trim();

        if (!text) {
            this.showAlert('error', 'Errore', 'Il campo non può essere vuoto');
            return;
        }

        // Parse and validate words
        const words = text.split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);

        // Basic validation
        const invalidWords = words.filter(word =>
            word.length < 2 || !/^[a-zA-ZÀ-ÿ0-9]+$/.test(word)
        );

        if (invalidWords.length > 0) {
            this.showAlert('error', 'Errore di validazione',
                `Parole non valide: ${invalidWords.join(', ')}`);
            return;
        }

        // Save to memory and localStorage
        customPlusWords = [...words];
        localStorage.setItem('customPlusWords', JSON.stringify(customPlusWords));

        // Update UI
        this.updateWordCount();
        this.showAlert('success', 'Salvato!',
            `${words.length} parole salvate con successo`);

        // Update any existing results if email input has content
        const emailInput = document.getElementById('email-input');
        if (emailInput.value.trim()) {
            // Trigger input event to regenerate results with new words
            emailInput.dispatchEvent(new Event('input'));
        }
    },

    // Reset to default plus words
    resetToDefault() {
        Swal.fire({
            title: 'Conferma ripristino',
            text: 'Vuoi davvero ripristinare le parole di default? Le modifiche andranno perse.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sì, ripristina',
            cancelButtonText: 'Annulla',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                customPlusWords = [...plusWords];
                localStorage.removeItem('customPlusWords');
                this.populateTextarea();
                this.updateWordCount();
                this.showAlert('info', 'Ripristinato', 'Parole di default ripristinate');

                // Update any existing results
                const emailInput = document.getElementById('email-input');
                if (emailInput.value.trim()) {
                    emailInput.dispatchEvent(new Event('input'));
                }
            }
        });
    },


    // Update accordion state
    updateAccordionState() {
        const accordionButton = document.querySelector('.accordion-button');
        const isExpanded = !accordionButton.classList.contains('collapsed');
        
        if (isExpanded && !isAccordionInitialized) {
            this.init();
        }
    },

    // Initialize tooltips
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },

    // Show alert using SweetAlert2
    showAlert(type, title, text) {
        const icons = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        Swal.fire({
            title: title,
            text: text,
            icon: icons[type] || 'info',
            timer: type === 'success' ? 3000 : 5000,
            showConfirmButton: type === 'error',
            toast: true,
            position: 'top-end'
        });
    }
};

window.addEventListener('load', () => {
  emailInput.focus();
  // Set current year in footer
  const yearSpan = document.querySelector('#getyear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// Generate plus variations (username+word@gmail.com) using custom words
const generatePlusVariants = (username) => {
  const variants = [];
  const wordsToUse = customPlusWords && customPlusWords.length > 0 ? customPlusWords : plusWords;
  wordsToUse.forEach(word => {
    variants.push(`${username}+${word}@gmail.com`);
  });
  return variants;
}

// Generate dot variations
const generateDotVariants = (username) => {
  const n = username.length;
  const variants = [];
  const originalEmail = username + '@gmail.com';

  for (let i = 0; i < Math.pow(2, n - 1); i++) {
    const variant = [];
    let k = 0;

    for (let j = 0; j < n; j++) {
      variant.push(username.charAt(j));
      if (j < n - 1 && i & (1 << k)) {
        variant.push('.');
      }
      k++;
    }

    const generatedEmail = variant.join('') + '@gmail.com';
    
    // Skip the original username (without dots) to avoid duplication
    if (generatedEmail !== originalEmail) {
      variants.push(generatedEmail);
    }
  }

  return variants;
}

// Copy email to clipboard with visual feedback
const copyToClipboard = async (text, element) => {
  try {
    await navigator.clipboard.writeText(text);
    // Visual feedback
    const originalIcon = element.className;
    element.className = 'fas fa-check copy-icon';
    element.style.color = '#4caf50';
    
    setTimeout(() => {
      element.className = originalIcon;
      element.style.color = '';
    }, 1000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

emailInput.addEventListener('input', (event) => {
  const email = event.target.value.trim();
  
  resultsList.innerHTML = '';
  allGeneratedEmails = [];

  if (email.length > 0) {
    const plusVariants = generatePlusVariants(email);
    const dotVariants = generateDotVariants(email);
    
    allGeneratedEmails = [...plusVariants, ...dotVariants];
    
    resultLength.parentElement.classList.remove('hidden');
    resultLength.innerText = allGeneratedEmails.length;
    
    // Show export section
    exportSection.style.display = 'block';
    
    // Plus variants section
    if (plusVariants.length > 0) {
      const plusHeader = document.createElement('div');
      plusHeader.className = 'list-group-item section-header';
      plusHeader.innerHTML = `📧 Plus Tricks (${plusVariants.length})`;
      resultsList.appendChild(plusHeader);
      
      plusVariants.forEach((variant) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
          <span style="margin-right: 3rem;">${variant}</span>
          <i class="fas fa-clipboard copy-icon" data-email="${variant}" aria-hidden="true"></i>
        `;
        resultsList.appendChild(listItem);
      });
    }
    
    // Dot variants section
    if (dotVariants.length > 0) {
      const dotHeader = document.createElement('div');
      dotHeader.className = 'list-group-item section-header';
      dotHeader.innerHTML = `🔸 Dot Tricks (${dotVariants.length})`;
      resultsList.appendChild(dotHeader);
      
      dotVariants.forEach((variant) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
          <span style="margin-right: 3rem;">${variant}</span>
          <i class="fas fa-clipboard copy-icon" data-email="${variant}" aria-hidden="true"></i>
        `;
        resultsList.appendChild(listItem);
      });
    }
    
    // Add click listeners to copy icons
    const copyIcons = resultsList.querySelectorAll('.copy-icon');
    copyIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        const emailToCopy = e.target.getAttribute('data-email');
        copyToClipboard(emailToCopy, e.target);
      });
    });
    
  } else {
    resultLength.parentElement.classList.add('hidden');
    exportSection.style.display = 'none';
  }
});

// Update save button text based on selected format
const updateSaveButtonText = () => {
  const saveAsSelect = document.querySelector('#save-as');
  const selectedOption = saveAsSelect.options[saveAsSelect.selectedIndex];
  const formatMap = {
    'text/plain': 'Text',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/pdf': 'PDF'
  };
  const format = formatMap[saveAsSelect.value] || 'Text';
  saveFileBtn.textContent = `Save As ${format} File`;
};

// Listen for changes in the save format dropdown
document.querySelector('#save-as').addEventListener('change', updateSaveButtonText);

// Generate export content based on selected format
const generateExportContent = (emails, format) => {
  const plusTricks = emails.filter(email => email.includes('+'));
  const dotTricks = emails.filter(email => !email.includes('+'));
  
  switch (format) {
    case 'text/plain':
      return emails.join('\n');
    
    case 'application/msword':
      // Generate RTF format for Word compatibility
      const rtfHeader = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
      const rtfTitle = '\\f0\\fs28\\b Gmail Alias Generator - Export\\b0\\par\\par';
      const rtfStats = `\\fs20 Data generazione: ${new Date().toLocaleString('it-IT')}\\par`;
      const rtfStats2 = `Totale indirizzi: ${emails.length}\\par`;
      const rtfStats3 = `Plus Tricks: ${plusTricks.length} | Dot Tricks: ${dotTricks.length}\\par\\par`;
      
      let rtfContent = rtfHeader + rtfTitle + rtfStats + rtfStats2 + rtfStats3;
      
      if (plusTricks.length > 0) {
        rtfContent += '\\fs22\\b 📧 Plus Tricks (' + plusTricks.length + ')\\b0\\par';
        plusTricks.forEach(email => {
          rtfContent += '\\fs20 ' + email + '\\par';
        });
        rtfContent += '\\par';
      }
      
      if (dotTricks.length > 0) {
        rtfContent += '\\fs22\\b 🔸 Dot Tricks (' + dotTricks.length + ')\\b0\\par';
        dotTricks.forEach(email => {
          rtfContent += '\\fs20 ' + email + '\\par';
        });
      }
      
      rtfContent += '}';
      return rtfContent;
    
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      // Generate CSV format that Excel can import
      let csvContent = 'Email Address,Type,Category\n';
      emails.forEach(email => {
        const type = email.includes('+') ? 'Plus Trick' : 'Dot Trick';
        const category = email.includes('+') ? 'Plus' : 'Dot';
        csvContent += `"${email}","${type}","${category}"\n`;
      });
      return csvContent;
    
    case 'application/pdf':
      // Generate HTML that can be converted to PDF by the browser
      return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Gmail Alias List - PDF Export</title>
    <style>
        @media print {
            body { margin: 0; font-family: Arial, sans-serif; }
            .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #dee2e6; }
        .section { margin: 25px 0; }
        .section-title { color: #495057; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #dee2e6; padding-bottom: 5px; }
        .email-list { list-style: none; padding: 0; }
        .email-item { padding: 8px; margin: 3px 0; background: #f8f9fa; border-radius: 3px; font-family: monospace; font-size: 14px; }
        .print-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 20px 0; }
        .print-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Gmail Alias Generator - Export</h1>
        <button class="print-btn no-print" onclick="window.print()">Stampa/Salva come PDF</button>
    </div>
    
    <div class="stats">
        <p><strong>Data generazione:</strong> ${new Date().toLocaleString('it-IT')}</p>
        <p><strong>Totale indirizzi:</strong> ${emails.length}</p>
        <p><strong>Plus Tricks:</strong> ${plusTricks.length} | <strong>Dot Tricks:</strong> ${dotTricks.length}</p>
    </div>
    
    ${plusTricks.length > 0 ? `
    <div class="section">
        <div class="section-title">📧 Plus Tricks (${plusTricks.length})</div>
        <ul class="email-list">
            ${plusTricks.map(email => `<li class="email-item">${email}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${dotTricks.length > 0 ? `
    <div class="section">
        <div class="section-title">🔸 Dot Tricks (${dotTricks.length})</div>
        <ul class="email-list">
            ${dotTricks.map(email => `<li class="email-item">${email}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    <script>
        // Auto-print for PDF export
        if (window.location.search.includes('autoprint=true')) {
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        }
    </script>
</body>
</html>`;
    
    default:
      return emails.join('\n');
  }
};

// Get file extension and name based on format
const getFileInfo = (format) => {
  const extensions = {
    'text/plain': { ext: 'txt', name: 'gmail-variants.txt', mimeType: 'text/plain' },
    'application/msword': { ext: 'rtf', name: 'gmail-variants.rtf', mimeType: 'application/rtf' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'csv', name: 'gmail-variants.csv', mimeType: 'text/csv' },
    'application/pdf': { ext: 'html', name: 'gmail-variants-pdf.html', mimeType: 'text/html' }
  };
  return extensions[format] || extensions['text/plain'];
};

// Export functionality
saveFileBtn.addEventListener('click', () => {
  if (allGeneratedEmails.length === 0) return;
  
  const saveAsSelect = document.querySelector('#save-as');
  const selectedFormat = saveAsSelect.value;
  const content = generateExportContent(allGeneratedEmails, selectedFormat);
  const fileInfo = getFileInfo(selectedFormat);
  
  // Handle PDF export differently - open in new window for print/save
  if (selectedFormat === 'application/pdf') {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(content);
    newWindow.document.close();
    
    // Show instructions for PDF save
    Swal.fire({
      title: 'PDF Export',
      text: 'Una nuova finestra si è aperta. Usa Ctrl+P (Cmd+P su Mac) per stampare o salvare come PDF.',
      icon: 'info',
      timer: 5000,
      showConfirmButton: true
    });
    return;
  }
  
  // Handle other formats with blob download
  const blob = new Blob([content], { type: fileInfo.mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileInfo.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success message
  Swal.fire({
    title: 'Success!',
    text: `File ${fileInfo.name} scaricato con successo!`,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
});

copyAllBtn.addEventListener('click', async () => {
  if (allGeneratedEmails.length === 0) return;
  
  const content = allGeneratedEmails.join('\n');
  try {
    await navigator.clipboard.writeText(content);
    Swal.fire({
      title: 'Copied!',
      text: 'All emails copied to clipboard!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
});

// Theme Switcher with Bootstrap Integration
document.addEventListener('DOMContentLoaded', function () {
    const themeButtons = document.querySelectorAll('[data-bs-theme-value]');
    const themeIcon = document.querySelector('.theme-icon');
    const body = document.body;
    
    // Get saved theme or default to 'light'
    const savedTheme = localStorage.getItem('bs-theme') || 'light';
    
    // Set initial theme
    setTheme(savedTheme);
    updateActiveButton(savedTheme);
    updateThemeIcon(savedTheme);
    
    // Add click listeners to theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.getAttribute('data-bs-theme-value');
            
            // Add rotation animation to icon
            if (themeIcon) {
                themeIcon.classList.add('rotating');
                setTimeout(() => {
                    themeIcon.classList.remove('rotating');
                }, 500);
            }
            
            setTheme(selectedTheme);
            updateActiveButton(selectedTheme);
            updateThemeIcon(selectedTheme);
            localStorage.setItem('bs-theme', selectedTheme);
        });
    });
    
    function setTheme(theme) {
        if (theme === 'auto') {
            // Use system preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            body.setAttribute('data-bs-theme', systemTheme);
        } else {
            body.setAttribute('data-bs-theme', theme);
        }
    }
    
    function updateActiveButton(activeTheme) {
        themeButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-bs-theme-value') === activeTheme) {
                button.classList.add('active');
            }
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        
        const currentTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
            
        if (currentTheme === 'dark') {
            themeIcon.innerHTML = `
                <path d="M21 14a9 9 0 1 1-9-11 7 7 0 0 0 9 11z"></path>
            `;
        } else {
            themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
            `;
        }
    }
    
    // Listen for system theme changes when 'auto' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentSelection = localStorage.getItem('bs-theme');
        if (currentSelection === 'auto') {
            const systemTheme = e.matches ? 'dark' : 'light';
            body.setAttribute('data-bs-theme', systemTheme);
            updateThemeIcon('auto');
        }
    });

    // Initialize Plus Words Manager after DOM is fully loaded
    PlusWordsManager.init();
});
