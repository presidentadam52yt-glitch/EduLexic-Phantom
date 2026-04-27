// PHANTOM OMNI-EYES v3.0 // MATH | SCIENCE | READER | IXL | I-READY
console.log("[SYSTEM] Omni-Platform Logic Injected.");

function extractOmniData() {
    let extractedText = "";

    // 1. Target known question zones for i-Ready, IXL, and Sparx
    const selectors = [
        '.question-container', '.question-stem', // Sparx
        '.item-container', '.question-content',   // i-Ready
        '.ixl-question-component', '.practice-area', // IXL
        'main', 'article' // General Fallback
    ];

    selectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) extractedText += el.innerText + " ";
    });

    // 2. SCIENCE/MATH UPGRADE: Capture hidden LaTeX and Chemical Formulas
    const ariaElements = document.querySelectorAll('[aria-label], .katex-html');
    ariaElements.forEach(el => {
        const label = el.getAttribute('aria-label');
        if (label && label.length > 2) {
            extractedText += " [" + label + "] ";
        }
    });

    // 3. READER/LITERACY: Capture Passage vs Question
    const passage = document.querySelector('.reader-content, .story-text');
    if (passage) extractedText = "PASSAGE: " + passage.innerText + " " + extractedText;

    // 4. CLEANUP: Strip extra whitespace for AI efficiency
    return extractedText.trim().substring(0, 3000); 
}

// Listener for the "Logic Bridge" signal
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SCAN_QUESTION") {
        const data = extractOmniData();
        sendResponse({ question: data });
    }
});