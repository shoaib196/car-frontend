# Developer Supply-Chain Security & Malware Prevention Guide

A practical security reference and automated inspection guide designed to prevent developer-targeted supply-chain attacks, malicious npm packages, and silent data exfiltration.

---

## 1. The Incident Autopsy (What Happened)

### Threat Profile: "Contagious Interview" / BeaverTail Campaign
* **Malware Classification:** Obfuscated Node.js C2 Backdoor & Infostealer.
* **Target:** Software developers (especially React Native, Full-Stack, and Web3 engineers).
* **Observed C2 Server:** `193.247.144.38:443` (`baremetal.zare.com`).
* **Attribution:** Well-documented campaign tracked by Checkmarx, StepSecurity, Unit 42, and the FBI.

### Evasion & Persistence Techniques Discovered
1. **Horizontal Line Padding Trick:**
   The malicious code was appended to the very end of legitimate files (`routes/authRoutes.js` and `routes/userRoutes.js`) directly on the same line as `export default router;` followed by **over 1,000 blank spaces**. In standard code editors without word wrap, the file appears normal.
2. **Blockchain Dead-Drop Resolving:**
   The malware queried public Ethereum RPC nodes (`eth.blockscout.com`, `1rpc.io`) to read a transaction recipient address and dynamically decode the C2 IP (`193.247.144.38`), bypassing static domain/IP reputation filters.
3. **Detached Process Spawning:**
   On server start (`nodemon app.js`), the module triggered a detached child process:
   ```javascript
   spawn("node", ["-e", payload], { detached: true, stdio: "ignore", windowsHide: true }).unref();
   ```
4. **Data Exfiltration & Anti-Forensics:**
   The detached process dumped saved credentials (`/usr/bin/security -i`), streamed project files to the C2, and wiped directories (`~/Documents/Nexterdive`, `~/Desktop`, `~/Downloads`, and `~/.zshrc`) to hinder analysis.
5. **Weaponized IDE Workspaces (`.vscode/tasks.json` & `.vscode/settings.json`):**
   Attackers configure `.vscode/tasks.json` with an automatic task (`"runOptions": { "runOn": "folderOpen" }`) to trigger Remote Code Execution (RCE) the moment a developer opens the folder—without ever running `npm install`, `npm start`, or `npm test`. To bypass editor confirmation dialogues and blind the developer, they inject:
   ```json
   "task.allowAutomaticTasks": true,
   "terminal.integrated.hideOnStartup": "always",
   "debug.openDebug": "neverOpen"
   ```
   and configure the task with `"presentation": { "reveal": "never", "echo": false, "close": true, "hide": true }`.
6. **Steganographic Asset-Masquerading Payloads:**
   To evade static code scanners that only inspect `.js` and `.ts` files, attackers disguise executable JavaScript inside non-executable asset extensions like web fonts (e.g., `public/fonts/fa-solid-500.woff2`). Standard FontAwesome uses weights 400 and 900; weight 500 is abnormal. The attacker task executes it via `node ./public/fonts/fa-solid-500.woff2`. (Note: In cross-platform commands like `... || where node >nul`, the Windows `>nul` redirection inadvertently creates a physical file named `nul` on macOS/Linux—a high-confidence forensic indicator).

---

## 2. The Master AI Security Audit Prompt

Copy and paste this prompt into an AI assistant (Antigravity, Claude, ChatGPT) **before** running `npm install` or executing any cloned repository:

```markdown
I need you to perform a strict Supply-Chain Security & Malware Audit on this repository before I run any install or build commands. 

Do NOT run `npm install`, `yarn`, `pnpm`, or execute any project code.

Please inspect the codebase for the following threat indicators and provide a detailed report:

1. Package & Dependency Legitimacy:
   - Review `package.json` and `package-lock.json`.
   - Check if any `preinstall`, `install`, or `postinstall` hooks exist in `scripts`.
   - Identify any typosquatted, unpinned, or suspicious package names.
   - Verify that all `resolved` URLs in `package-lock.json` point strictly to official registries (e.g., `https://registry.npmjs.org/`).

2. IDE Configuration & Automatic Tasks (.vscode / .idea):
   - Inspect `.vscode/tasks.json` for tasks configured with `"runOn": "folderOpen"`.
   - Check `.vscode/settings.json` for `"task.allowAutomaticTasks": true` or hidden terminal options (`reveal: "never"`, `hideOnStartup: "always"`).
   - Inspect `.vscode/launch.json` for unauthorized `preLaunchTask` hooks or rogue executable binaries.

3. Obfuscation & Evasion Techniques:
   - Scan all source files for extreme horizontal line padding (lines exceeding 500 characters) designed to hide code off-screen.
   - Detect obfuscation patterns: repeated `charCodeAt`, `fromCharCode`, hex-escaped strings (`\x..`, `\u..`), base64 decoding, or repeating-key XOR routines.
   - Check for `eval()`, `new Function()`, `vm.runInContext()`, or dynamic code execution.

4. Asset Masquerading & Non-Source Code Backdoors:
   - Check static asset directories (`public/`, `assets/`, `fonts/`, `images/`) for JavaScript code disguised under non-code extensions (`.woff2`, `.svg`, `.png`, `.dict`).
   - Check for non-standard file weights or decoy documentation left behind by attackers.

5. Process Spawning & System Execution:
   - Check for unauthorized use of `child_process`, `exec`, `execSync`, `spawn`, or `fork`.
   - Check for detached background processes or silent execution (`stdio: "ignore"`, `windowsHide: true`, `.unref()`).

6. Network & Exfiltration Capabilities:
   - Identify hardcoded IP addresses, raw HTTP requests, or dead-drop resolvers (e.g., blockchain RPC queries, Pastebin, Telegram bots, Discord webhooks).
   - Check for access to sensitive system paths: `~/.ssh`, `~/.aws`, `.env`, browser profile directories, or macOS Keychain (`/usr/bin/security`).

7. Hidden Files & Patches:
   - Inspect `.git/hooks/` and any `patches/` folder (`patch-package` files) for injected code.
   - Check for suspicious artifact files like `nul` created by shell redirection mistakes.

Deliver a verdict: Is this repository SAFE to install and run? If any anomalies are found, highlight the exact file and line number.
```

---

## 3. Fast Local Terminal Scan Script

Run this command inside any project directory before opening it in your IDE, installing, or running scripts. It scans source files, IDE configs, and static assets for hidden backdoors, weaponized VS Code tasks, and masqueraded payloads:

```bash
python3 -c '
import os

print("=== Enhanced Developer Supply-Chain & IDE Backdoor Scanner ===")
threats = 0

KEYWORDS = [
    b"Sec-V", b"ETH_RPC_URL", b"blockscout", b"baremetal", b"ThZG+",
    b"global._H", b"global._V", b"193.247.144.38", b"ethereum",
    b"spawn(", b"child_process", b"allowAutomaticTasks", b"folderOpen"
]

for root, dirs, files in os.walk("."):
    # Skip git internal objects and installed dependencies
    parts = root.split(os.sep)
    if ".git" in parts and not root.startswith("./.git/hooks"):
        continue
    if "node_modules" in parts:
        continue

    for f in files:
        if f in ["package-lock.json", "SUPPLY_CHAIN_SECURITY_GUIDE.md"]:
            continue
        p = os.path.join(root, f)
        try:
            with open(p, "rb") as fp:
                content = fp.read()
            
            # 1. Check for known backdoor signatures & auto-run tasks
            for kw in KEYWORDS:
                if kw in content:
                    kw_str = kw.decode('ascii', errors='ignore')
                    print(f"[!] THREAT SIGNATURE ({kw_str}): {p}")
                    threats += 1
            
            # 2. Check for masqueraded JavaScript inside non-code files
            is_code_file = f.endswith((".js", ".cjs", ".mjs", ".ts", ".jsx", ".tsx", ".json", ".html"))
            if not is_code_file:
                if any(sig in content for sig in [b"createRequire", b"import{", b"global.", b"eval("]):
                    print(f"[!] MASQUERADED CODE PAYLOAD in non-code file: {p}")
                    threats += 1

            # 3. Check for extreme horizontal line padding
            try:
                text = content.decode("utf-8")
                for i, line in enumerate(text.splitlines()):
                    if len(line) > 500 and not p.endswith((".svg", ".min.js", ".map")):
                        print(f"[!] SUSPICIOUS LONG PADDED LINE ({len(line)} chars): {p}:{i+1}")
                        threats += 1
            except UnicodeDecodeError:
                pass
        except Exception:
            pass

if threats == 0:
    print("[✓] Clean: No hidden backdoors, weaponized IDE tasks, or masqueraded payloads found.")
else:
    print(f"\n[!] WARNING: Found {threats} potential threat indicator(s). Review before running.")
'
```

---

## 4. Pre-Install Vetting Checklist for npm Packages

Before adding or updating dependencies in `package.json`:

1. **Verify on [npmjs.com](https://www.npmjs.com):**
   - **Download Count:** Legitimate libraries have hundreds of thousands or millions of weekly downloads. Packages with <500 downloads require manual code review.
   - **Publish Date:** Be cautious of packages published or updated within the last few days/weeks by unfamiliar maintainers.
   - **Repository Link:** Ensure the npm page links to an active GitHub repository with multiple contributors and open issues.
2. **Watch for Typosquatting:**
   - Examples: `cross-env` vs `crossenv`, `react-native-safe-area-context` vs `react-native-safearea-context`.
3. **Scan with Socket.dev:**
   Run the Socket security scanner directly from your terminal:
   ```bash
   npx socket-security
   ```

---

## 5. Permanent System-Level Hardening

### A. Disable Automatic Tasks in IDEs Globally
Prevent malicious workspace configurations from automatically executing background commands when a folder is opened:
* In VS Code / Cursor / Antigravity IDE global settings (`Cmd + Shift + P` > **Open User Settings (JSON)**), add:
  ```json
  "task.allowAutomaticTasks": "off"
  ```
  This prevents any workspace `.vscode/settings.json` from silently authorizing tasks on folder open.

### B. Disable npm Automated Lifecycle Scripts Globally
Prevent packages from automatically executing arbitrary code during installation:
```bash
npm config set ignore-scripts true
```
*(If a trusted library requires native compilation, run `npm rebuild <package>` explicitly).*

### C. Install an Outbound Application Firewall
macOS only filters incoming traffic by default. An outbound firewall intercepts any background process trying to contact external servers:
* **[LuLu by Objective-See](https://objective-see.org/products/lulu.html):** Free, open-source firewall for macOS. It alerts you whenever a process (like `node` or `curl`) attempts an outbound connection to an unknown IP and lets you block it with one click.

### D. Isolate Untrusted Code
For client interview assignments, freelance test repositories, or external candidate code:
* **Never run untrusted code directly on your host Mac.**
* Use **Docker Dev Containers** (VS Code) or cloud environments (**GitHub Codespaces**, **Gitpod**).
* If a container is compromised, the malware cannot access your Mac's `~/Documents`, `~/.ssh`, browser passwords, or macOS Keychain.

### E. Enable Time Machine & APFS Local Snapshots
Enable Time Machine in **System Settings > General > Time Machine**. 
* On APFS volumes, macOS creates hourly local snapshots on your internal drive.
* If any script deletes files, you can instantly restore the previous snapshot.

