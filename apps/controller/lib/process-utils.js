import { spawn } from "child_process";

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      stdio: options.capture === false ? "inherit" : ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...(options.env || {}) }
    });

    let stdout = "";
    let stderr = "";

    if (options.capture !== false) {
      child.stdout.on("data", (chunk) => {
        const text = chunk.toString();
        stdout += text;
        if (options.echo) process.stdout.write(text);
      });

      child.stderr.on("data", (chunk) => {
        const text = chunk.toString();
        stderr += text;
        if (options.echo) process.stderr.write(text);
      });
    }

    child.on("error", reject);

    child.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr,
        ok: code === 0
      });
    });
  });
}
