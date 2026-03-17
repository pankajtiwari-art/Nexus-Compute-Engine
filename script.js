/**
 * NEXUS COMPUTE ENGINE
 * Modular Architecture:
 * 1. AudioEngine      - Web Audio API for UI sounds
 * 2. ThemeManager     - CSS variable toggling
 * 3. MemorySystem     - Local variable storage
 * 4. GraphEngine      - Canvas 2D plotting
 * 5. MathParser       - Tokenizer & Shunting-yard AST builder
 * 6. HistoryManager   - Timeline & Steps DOM management
 * 7. UIController     - Event binding and application state
 */

// --- 1. Audio Engine ---
const AudioEngine = (() => {
    let ctx = null;
    let enabled = true;

    const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); };
    
    const playTone = (freq, type = 'sine', duration = 0.05) => {
        if (!enabled) return;
        init();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    return {
        toggle: () => { enabled = !enabled; return enabled; },
        click: () => playTone(600, 'sine', 0.05),
        calc: () => playTone(800, 'triangle', 0.1),
        error: () => playTone(150, 'square', 0.2)
    };
})();

// --- 2. Theme Manager ---
const ThemeManager = (() => {
    const themes = ['theme-dark', 'theme-neon', 'theme-minimal'];
    const btns = {
        dark: document.getElementById('btn-theme-dark'),
        neon: document.getElementById('btn-theme-neon'),
        minimal: document.getElementById('btn-theme-minimal')
    };

    const setTheme = (themeName) => {
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
        Object.values(btns).forEach(btn => btn.classList.remove('active'));
        if(themeName === 'theme-dark') btns.dark.classList.add('active');
        if(themeName === 'theme-neon') btns.neon.classList.add('active');
        if(themeName === 'theme-minimal') btns.minimal.classList.add('active');
    };

    btns.dark.addEventListener('click', () => setTheme('theme-dark'));
    btns.neon.addEventListener('click', () => setTheme('theme-neon'));
    btns.minimal.addEventListener('click', () => setTheme('theme-minimal'));
})();

// --- 3. Memory System ---
const MemorySystem = (() => {
    let variables = { PI: Math.PI, E: Math.E };
    const listEl = document.getElementById('memory-list');

    const render = () => {
        listEl.innerHTML = '';
        Object.entries(variables).forEach(([k, v]) => {
            if (k === 'PI' || k === 'E') return; // Constants ko hide rakhein
            
            const li = document.createElement('li');
            li.className = 'mem-item';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            // Variable ka naam aur value (Is par click karne se wo calculator me aayega)
            const textSpan = document.createElement('span');
            textSpan.innerHTML = `<span>${k}</span>: <strong>${v}</strong>`;
            textSpan.style.flex = "1";
            textSpan.onclick = () => UIController.insertText(k);

            // Delete Button (X)
            const delBtn = document.createElement('button');
            delBtn.innerText = 'X';
            delBtn.style.background = 'var(--danger)';
            delBtn.style.color = 'white';
            delBtn.style.border = 'none';
            delBtn.style.padding = '4px 8px';
            delBtn.style.borderRadius = '4px';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontWeight = 'bold';
            
            // Delete button par click hone par variable delete ho jaye
            delBtn.onclick = (e) => {
                e.stopPropagation(); // Isse calculator screen par text insert nahi hoga
                delete variables[k]; // Variable delete kiya
                render(); // List ko refresh kiya
            };

            li.appendChild(textSpan);
            li.appendChild(delBtn);
            listEl.appendChild(li);
        });
    };

    document.getElementById('btn-save-mem').addEventListener('click', () => {
        const name = document.getElementById('mem-name').value.trim();
        const val = parseFloat(document.getElementById('mem-val').value);
        if (name && !isNaN(val) && /^[a-zA-Z_]+$/.test(name)) {
            variables[name] = val; // Save ya Edit
            document.getElementById('mem-name').value = '';
            document.getElementById('mem-val').value = '';
            render();
        }
    });

    return { 
        get: (name) => variables[name],
        has: (name) => name in variables
    };
})();

// --- 4. Graph Engine ---
const GraphEngine = (() => {
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    
    const draw = (funcStr) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
        ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let first = true;
        for (let px = 0; px < canvas.width; px++) {
            // Map pixel x to math x (-10 to 10)
            let mathX = ((px / canvas.width) * 20) - 10;
            
            // Temporary variable replacement for graph
            const expr = funcStr.replace(/x/g, `(${mathX})`);
            let mathY;
            try {
                mathY = MathParser.evaluate(expr, true); // Silent eval
            } catch(e) { continue; }

            // Map math y to pixel y
            let py = canvas.height/2 - (mathY * (canvas.height/20));
            
            if (first) { ctx.moveTo(px, py); first = false; } 
            else { ctx.lineTo(px, py); }
        }
        ctx.stroke();
    };

    document.getElementById('btn-graph').addEventListener('click', () => {
        draw(document.getElementById('graph-input').value);
    });

    return { draw };
})();

// --- 5. Math Parser (Custom Engine) ---
const MathParser = (() => {
    // Advanced math parser avoiding eval()
    const tokenize = (expr) => {
        const regex = /\s*([A-Za-z_]+|[\d\.]+|!=|==|>=|<=|&&|\|\||[+\-*/^!()%])\s*/g;
        let tokens = [];
        let match;
        while ((match = regex.exec(expr)) !== null) {
            if (match[1]) tokens.push(match[1]);
        }
        return tokens;
    };

    const precedence = { '+':1, '-':1, '*':2, '/':2, '%':2, '^':3 };
    const isOperator = (c) => ['+','-','*','/','%','^'].includes(c);
    const isFunc = (c) => ['sin','cos','tan','log','ln','sqrt'].includes(c);

    const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

        const evaluateTokens = (rawTokens) => {
        let output = [];
        let operators = [];
        let steps = [];

        // FIX: Normalize Unary Minuses (e.g. converting ["-", "5"] to ["-5"])
        let tokens = [];
        for (let i = 0; i < rawTokens.length; i++) {
            if (rawTokens[i] === '-' && (i === 0 || ['(','+','-','*','/','%','^'].includes(rawTokens[i - 1]))) {
                tokens.push('-' + rawTokens[i + 1]);
                i++; // Skip the next number since it's merged
            } else {
                tokens.push(rawTokens[i]);
            }
        }

        // Shunting Yard Algorithm (rest of the logic remains the same)
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            
            if (!isNaN(parseFloat(token))) {
                output.push(parseFloat(token));
            } else if (MemorySystem.has(token)) {
                output.push(MemorySystem.get(token));
            } else if (isFunc(token)) {
                operators.push(token);
            } else if (token === '!') {
                let a = output.pop();
                let res = factorial(a);
                output.push(res);
                steps.push(`${a}! = ${res}`);
            } else if (isOperator(token)) {
                while (operators.length && precedence[operators[operators.length-1]] >= precedence[token]) {
                    processOperator(operators.pop(), output, steps);
                }
                operators.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length && operators[operators.length-1] !== '(') {
                    processOperator(operators.pop(), output, steps);
                }
                operators.pop(); 
                if (operators.length && isFunc(operators[operators.length-1])) {
                    processOperator(operators.pop(), output, steps);
                }
            }
        }

        while (operators.length) {
            processOperator(operators.pop(), output, steps);
        }

        // Parentheses mismatch validation
        if (output.length !== 1 || isNaN(output[0])) throw new Error("Syntax Error");
        return { result: output[0], steps };
    };
    
    const processOperator = (op, output, steps) => {
        if (isFunc(op)) {
            let a = output.pop();
            let res;
            switch(op) {
                case 'sin': res = Math.sin(a); break;
                case 'cos': res = Math.cos(a); break;
                case 'tan': res = Math.tan(a); break;
                case 'log': res = Math.log10(a); break;
                case 'ln': res = Math.log(a); break;
                case 'sqrt': res = Math.sqrt(a); break;
            }
            output.push(res);
            steps.push(`${op}(${a}) = ${res.toFixed(4)}`);
            return;
        }

        let b = output.pop();
        let a = output.pop();
        let res;
        switch(op) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/': 
                if (b === 0) throw new Error("Div by Zero");
                res = a / b; break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
        }
        output.push(res);
        steps.push(`${a} ${op} ${b} = ${Number.isInteger(res) ? res : res.toFixed(4)}`);
    };

    return {
        evaluate: (expr, silent = false) => {
            const tokens = tokenize(expr);
            const data = evaluateTokens(tokens);
            if (!silent) HistoryManager.setSteps(data.steps);
            return data.result;
        }
    };
})();

// --- 6. History & Steps Manager ---
const HistoryManager = (() => {
    const historyList = document.getElementById('history-list');
    const stepList = document.getElementById('step-breakdown');
    let historyData = [];
    let currentSteps = [];

    const addHistory = (expr, res) => {
        historyData.push({ expr, res, time: new Date().toLocaleTimeString() });
        renderHistory();
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        historyData.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `<div class="hist-expr">${item.expr}</div><div class="hist-res">= ${item.res}</div>`;
            li.onclick = () => UIController.insertText(item.res.toString());
            historyList.appendChild(li);
        });
    };

    const setSteps = (steps) => {
        currentSteps = steps;
        stepList.innerHTML = '';
        steps.forEach((step, idx) => {
            const li = document.createElement('li');
            li.className = 'step-item';
            li.innerText = `Step ${idx + 1}: ${step}`;
            stepList.appendChild(li);
        });
    };

    const replaySteps = () => {
        stepList.innerHTML = '';
        currentSteps.forEach((step, idx) => {
            setTimeout(() => {
                const li = document.createElement('li');
                li.className = 'step-item';
                li.innerText = `Step ${idx + 1}: ${step}`;
                stepList.appendChild(li);
            }, idx * 600); // Animate steps
        });
    };

    document.getElementById('btn-clear-hist').addEventListener('click', () => {
        historyData = []; renderHistory();
    });
    document.getElementById('btn-replay').addEventListener('click', replaySteps);

    return { addHistory, setSteps };
})();

// --- 7. UI Controller ---
const UIController = (() => {
    let expression = "";
    const displayExpr = document.getElementById('display-expr');
    const displayLive = document.getElementById('display-live');
    const suggestionsEl = document.getElementById('suggestions');

    const updateDisplay = () => {
        displayExpr.innerText = expression;
        
        // Smart Suggestions
        if (expression.endsWith('* ') || expression.endsWith('+ ')) {
            suggestionsEl.innerText = `Try: ${expression}10 or ${expression}100`;
        } else {
            suggestionsEl.innerText = "";
        }

        // Live Preview
        if (expression) {
            try {
                const res = MathParser.evaluate(expression, true);
                displayLive.innerText = isNaN(res) ? "..." : (Number.isInteger(res) ? res : res.toFixed(4));
            } catch (e) {
                displayLive.innerText = "...";
            }
        } else {
            displayLive.innerText = "0";
        }
    };

    const insertText = (char) => {
        AudioEngine.click();
        expression += char;
        updateDisplay();
    };

    const calculate = () => {
        if (!expression) return;
        try {
            const res = MathParser.evaluate(expression);
            const formattedRes = Number.isInteger(res) ? res : parseFloat(res.toFixed(6));
            displayLive.innerText = formattedRes;
            displayLive.style.color = 'var(--accent)';
            setTimeout(() => displayLive.style.color = '', 300); // Flash animation
            HistoryManager.addHistory(expression, formattedRes);
            AudioEngine.calc();
            expression = formattedRes.toString(); // Reset to result
            updateDisplay();
        } catch (e) {
            displayLive.innerText = "Error: " + e.message;
            AudioEngine.error();
        }
    };

        const handleAction = (val) => {
      if (val === 'clear') { expression = "";
        updateDisplay(); }
      else if (val === 'del') {
        // FIX: If the last character is a space, delete 3 characters (e.g. " + ")
        if (expression.endsWith(" ")) {
          expression = expression.slice(0, -3);
        } else {
          expression = expression.slice(0, -1);
        }
        updateDisplay();
      }
      else if (val === '=') calculate();
      else {
        if (['+', '-', '*', '/', '%', '^'].includes(val)) expression += ` ${val} `;
        else expression += val;
        updateDisplay();
      }
      AudioEngine.click();
    };
    
    // Bind Buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleAction(e.target.dataset.val));
    });

       // Keyboard Support
    window.addEventListener('keydown', (e) => {
        // FIX: Agar user kisi input box me hai, to calculator keyboard shortcuts ignore karega
        if (e.target.tagName === 'INPUT') return;

        const key = e.key;
        if (/[0-9\.\+\-\*\/\%\^\(\)\!]/.test(key)) { e.preventDefault(); handleAction(key); }
        if (key === 'Enter') { e.preventDefault(); handleAction('='); }
        if (key === 'Backspace') { e.preventDefault(); handleAction('del'); }
        if (key === 'Escape') { e.preventDefault(); handleAction('clear'); }
    });

    // Toggles
    const sciBtn = document.getElementById('btn-sci-mode');
    sciBtn.addEventListener('click', () => {
        document.getElementById('sci-keys').classList.toggle('hidden');
        sciBtn.classList.toggle('active');
        AudioEngine.click();
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
        const isOn = AudioEngine.toggle();
        soundBtn.innerText = isOn ? "🔊 Sound On" : "🔇 Sound Off";
        soundBtn.classList.toggle('active', isOn);
    });
    soundBtn.classList.add('active'); // default

    return { insertText };
})();
