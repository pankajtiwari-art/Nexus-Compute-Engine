# 🧮 Nexus Compute Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-success?style=for-the-badge&logo=vercel)](https://pankajtiwari-art.github.io/Nexus-Compute-Engine/)

**Nexus Compute Engine** is a futuristic, next-generation web calculator built entirely from scratch using **HTML, CSS, and Vanilla JavaScript**. It strictly avoids the use of `eval()` by implementing a custom math parser (Tokenizer + Shunting-yard algorithm) and features a built-in canvas graphing engine, variable memory system, and real-time audio feedback.

👉 **[Try the Live Demo Here!](https://pankajtiwari-art.github.io/Nexus-Compute-Engine/)**

---

## 🚀 Core Features & Interface Guide

The application is divided into intelligent panels, each serving a specific advanced mathematical purpose.

### 1. 🖥️ Main Calculator & Smart Display
The central hub for all calculations. It features a glassmorphism UI and a live-evaluating display.
* **Custom Engine:** Evaluates expressions using an AST (Abstract Syntax Tree) logic instead of `eval()`.
* **Live Preview:** Shows the result as you type.
* **Smart Suggestions:** Recommends auto-completions (e.g., typing `12 *` suggests `12 * 10`).
* **Scientific Mode:** Toggle the `🧪 Sci Mode` button to reveal advanced functions like `sin`, `cos`, `log`, `ln`, `!`, and `^`.

### 2. 📈 Function Grapher
A visual tool that plots algebraic and trigonometric equations natively on an HTML5 Canvas.

**How to test it:**
Enter the following equations in the Grapher input box and click **Plot**:
* **Parabola (U-Shape):** `x^2`
* **Linear Line:** `2*x + 5`
* **Trigonometric Wave:** `sin(x) * 5`
* **Cubic Curve (S-Shape):** `x^3 / 10`
* **Complex Wave:** `sin(x) * x`

### 3. 🧠 Memory Bank
A smart variable storage system. Instead of remembering numbers, assign them a name and use them directly in your mathematical expressions.

**How to test it:**
1. In the Memory Bank, enter Var Name: `Salary` and Value: `50000` -> Click **Save**.
2. Enter Var Name: `Rent` and Value: `12000` -> Click **Save**.
3. Enter Var Name: `Bills` and Value: `4500` -> Click **Save**.
4. Now, go to the main calculator keypad/keyboard and type: `Salary - Rent - Bills`.
5. Press `=` to instantly get `33500`.
> *Note: Click the red 'X' next to any saved variable to delete it.*

### 4. 📜 Calculation Timeline & Breakdown
* **Timeline:** Every calculation is saved in the history tab. Click any past result to instantly reuse it.
* **Breakdown (Steps):** Shows the step-by-step arithmetic breakdown of how the engine arrived at the answer.
* **Replay Button:** Animates the steps one by one, visually proving the order of operations (BODMAS/PEMDAS).

### 5. 🎨 Multi-Theme & 🔊 Audio Engine
* **Themes:** Switch between **Dark**, **Neon**, and **Minimal** modes. The UI instantly adapts its CSS variables and glow effects.
* **Audio Feedback:** Uses the native Web Audio API to generate synthetic frequencies for button clicks, calculations (success chimes), and errors (buzzers).

---

## 🛠️ Technical Architecture
* **Zero Dependencies:** No React, no Math.js, no external APIs. 100% Vanilla JS.
* **DOM Optimization:** Event delegation for keyboard and keypad inputs.
* **Responsive Design:** CSS Flexbox/Grid layout optimized for Desktop, Tablet, and Mobile screens.

## 📥 Local Installation

Since the project uses vanilla web technologies, no build tools are required.

1. Clone the repository:
   ```bash
   git clone [https://github.com/PankajTiwari-art/Nexus-Compute-Engine.git](https://github.com/PankajTiwari-art/Nexus-Compute-Engine.git)
