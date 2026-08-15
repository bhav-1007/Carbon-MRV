import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const isWindows = process.platform === "win32";
const rootDir = process.cwd();
const npmCmd = "npm";
const venvPython = isWindows
  ? join("ml-service", ".venv", "Scripts", "python.exe")
  : join("ml-service", ".venv", "bin", "python");
const hasVenvPython = existsSync(venvPython);
const pythonCmd = process.env.PYTHON || (hasVenvPython ? resolve(rootDir, venvPython) : "");

const children = [];

function start(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: isWindows,
    cwd: resolve(rootDir, options.cwd || "."),
    env: {
      ...process.env,
      ...options.env
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  children.push(child);
}

start("backend", npmCmd, ["--prefix", "backend", "run", "dev"]);
start("frontend", npmCmd, ["--prefix", "frontend", "run", "dev"], {
  env: { VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1" }
});

if (process.env.SKIP_ML === "1") {
  console.log("[ml-service] skipped because SKIP_ML=1");
} else if (!pythonCmd) {
  console.log("[ml-service] skipped because ml-service/.venv was not found. Run: cd ml-service; python -m venv .venv; .\\.venv\\Scripts\\activate; pip install -r requirements.txt");
} else {
  start("ml-service", pythonCmd, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], {
    cwd: "ml-service"
  });
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
