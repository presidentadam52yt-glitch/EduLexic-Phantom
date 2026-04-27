// PHANTOM OMNI-EYES v3.1 // ADAPTIVE SELECTOR UPDATE
console.log("[SYSTEM] Omni-Platform Logic Injected. Mode: Adaptive.");

function extractOmniData() {
    let extractedText = "";

    // 1. ADAPTIVE TARGETING: Look for common naming patterns instead of exact matches
    // This bypasses many of Sparx/IXL's frequent class-name updates.
    const dynamicSelectors = [
        '[class*="question"]', '[id*="question"]', // Matches question-container, question_stem, etc.
        '[class*="item-container"]', '[class*="practice-area"]',
        '[data-testid*="question"]', // Modern sites use data-testids
        '.sparx-content', '.ixl-main-content', // Broad platform wrappers
        'section#question', 'div#task-container'
    ];

    dynamicSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            // Only grab text if it actually has content and is visible
            if (el.innerText && el.innerText.length > 5 && el.offsetParent !== null) {
                extractedText += el.innerText + " ";
            }
        });
    });

    // 2. MATH/SCIENCE: Enhanced LaTeX & MathML Capture
    // Captures LaTeX from KaTeX and MathJax which are used in Sparx/IXL
    const mathElements = document.querySelectorAll('.katex-html, .MathJax, [aria-label]');
    mathElements.forEach(el => {
        const mathText = el.getAttribute('aria-label') || el.innerText;
        if (mathText && mathText.length > 1) {
            extractedText += " {MATH: " + mathText + "} ";
        }
    });

    // 3. IMAGE/ALT-TEXT: Capture descriptions for Science diagrams
    const images = document.querySelectorAll('img[alt]');
    images.forEach(img => {
        if (img.alt.length > 3) extractedText += " [IMAGE_DESC: " + img.alt + "] ";
    });

    // 4. CLEANUP & DEDUPLICATION: Remove repeating text to save API tokens
    const uniqueWords = [...new Set(extractedText.split(/\s+/))];
    return uniqueWords.join(" ").trim().substring(0, 4000); 
}

// Listener for the "Logic Bridge" signal
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SCAN_QUESTION") {
        const data = extractOmniData();
        sendResponse({ question: data });
    }
});
