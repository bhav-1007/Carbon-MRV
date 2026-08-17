import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import http from "node:http";
import net from "node:net";
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
const frontendPort = process.env.FRONTEND_PORT || "5173";
const backendPort = process.env.PORT || "5000";
const frontendOrigin = process.env.FRONTEND_ORIGIN || `http://localhost:${frontendPort}`;
const apiBaseUrl = process.env.VITE_API_BASE_URL || `http://localhost:${backendPort}/api/v1`;

function canConnect(port) {
  return new Promise((resolveCheck) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: Number(port), timeout: 500 });
    socket.on("connect", () => {
      socket.destroy();
      resolveCheck(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolveCheck(false);
    });
    socket.on("error", () => resolveCheck(false));
  });
}

function healthOk() {
  return new Promise((resolveCheck) => {
    const req = http.get(`http://127.0.0.1:${backendPort}/health`, (res) => {
      res.resume();
      resolveCheck(res.statusCode === 200);
    });
    req.setTimeout(800, () => {
      req.destroy();
      resolveCheck(false);
    });
    req.on("error", () => resolveCheck(false));
  });
}

async function preflightPorts() {
  const [frontendBusy, backendBusy, backendHealthy] = await Promise.all([
    canConnect(frontendPort),
    canConnect(backendPort),
    healthOk()
  ]);

  if (frontendBusy && backendHealthy) {
    console.log(`[dev] app is already running at http://localhost:${frontendPort}/`);
    console.log(`[dev] backend is healthy at http://localhost:${backendPort}/health`);
    process.exit(0);
  }

  if (frontendBusy || backendBusy) {
    console.error("[dev] cannot start because one of the fixed ports is already in use.");
    console.error(`[dev] frontend port ${frontendPort}: ${frontendBusy ? "busy" : "free"}`);
    console.error(`[dev] backend port ${backendPort}: ${backendBusy ? "busy" : "free"}${backendHealthy ? " and healthy" : ""}`);
    console.error("[dev] close the old terminal/dev server first, then run npm run dev again.");
    process.exit(1);
  }
}

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

await preflightPorts();

start("backend", npmCmd, ["--prefix", "backend", "run", "dev"], {
  env: {
    PORT: backendPort,
    FRONTEND_ORIGIN: frontendOrigin,
    FRONTEND_ORIGINS: process.env.FRONTEND_ORIGINS || `${frontendOrigin},http://127.0.0.1:${frontendPort}`
  }
});
start("frontend", npmCmd, ["--prefix", "frontend", "run", "dev"], {
  env: {
    VITE_API_BASE_URL: apiBaseUrl
  }
});

if (process.env.RUN_ML !== "1") {
  console.log("[ml-service] skipped. Set RUN_ML=1 after installing ml-service requirements.");
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
