// 1. ACCESS CONFIG
const CONFIG = {
    GEMINI: {
        key: "INSERT", 
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    },
    DEEPSEEK: { key: "INSERT" },
    GROQ: { key: "INSERT", endpoint: "https://api.groq.com/openai/v1/chat/completions" },
    OPENROUTER: { key: "INSERT", endpoint: "https://openrouter.ai/api/v1/chat/completions" }
};

// 2. RESOURCE MANAGEMENT
const COOLDOWN_MS = 4000; 
let lastRequestTime = 0;
let requestCount = 0;

// 3. CORE LOGIC ENGINE (Universal Mastery)
async function getPhantomLogic(questionText) {
    const terminal = document.getElementById('terminal-output');
    const bridgeLight = document.getElementById('bridge-light');
    const mode = document.getElementById('core-selector').value;
    const now = Date.now();

    if (now - lastRequestTime < COOLDOWN_MS) {
        terminal.innerHTML += `<br>[SHIELD] Cooldown Active.`;
        terminal.scrollTop = terminal.scrollHeight;
        return;
    }

    lastRequestTime = now;
    const sequence = mode === "AUTO" ? ["GEMINI", "DEEPSEEK", "GROQ", "OPENROUTER"] : [mode];

    for (const core of sequence) {
        updateLED(core, "led-active");
        terminal.innerHTML += `<br>[API] Syncing with ${core}...`;
        bridgeLight.className = "indicator-on";

        try {
            let answer = await callSpecificCore(core, questionText);
            if (answer) {
                updateQuotaVisuals();
                terminal.innerHTML += `<br>[${core}] Match: <span style="color:#00f2ff">${answer}</span>`;
                bridgeLight.className = "indicator-off";
                terminal.scrollTop = terminal.scrollHeight;
                return answer;
            }
        } catch (error) {
            updateLED(core, "led-error");
            terminal.innerHTML += `<br>[CRITICAL] ${core} Failure. Bypassing...`;
        }
    }
}

// 4. THE OMNI-PROMPT ROUTER
async function callSpecificCore(core, text) {
    const config = CONFIG[core];
    const omniPrompt = `Provide ONLY the short final answer (Numerical, Chemical Formula, or Reading Term). No sentences, No explanations: ${text}`;

    if (core === "GEMINI") {
        const res = await fetch(`${config.endpoint}?key=${config.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: omniPrompt }] }] })
        });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text.trim();
    } else {
        const res = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` },
            body: JSON.stringify({
                model: core === "DEEPSEEK" ? "deepseek-chat" : (core === "GROQ" ? "llama3-8b-8192" : "openchat/openchat-7b:free"),
                messages: [{ role: "user", content: omniPrompt }]
            })
        });
        const data = await res.json();
        return data.choices[0].message.content.trim();
    }
}

// 5. INTERACTIVE BRIDGE CONTROLS
document.getElementById('solve-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, { action: "SCAN_QUESTION" }, async (response) => {
        if (response && response.question) {
            await getPhantomLogic(response.question);
        } else {
            document.getElementById('terminal-output').innerHTML += "<br>[ERROR] No data found on page.";
        }
    });
});

document.getElementById('bridge-btn').addEventListener('click', () => {
    document.getElementById('output').innerText = "[SYSTEM] Scanning DOM for HW Nodes...";
});

document.getElementById('stealth-btn').addEventListener('click', () => {
    document.getElementById('main-ui').classList.toggle('stealth-active');
});

document.getElementById('clear-terminal').addEventListener('click', () => {
    document.getElementById('terminal-output').innerHTML = "[SYSTEM] Buffer Purged.";
});

function updateLED(core, status) {
    const led = document.getElementById(`led-${core.toLowerCase()}`);
    if(led) led.className = `led-dot ${status}`;
}

function updateQuotaVisuals() {
    requestCount++;
    const remaining = Math.max(0, 100 - (requestCount * 2));
    document.getElementById('quota-fill').style.width = `${remaining}%`;
    document.getElementById('quota-percent').innerText = `${remaining}%`;
}
