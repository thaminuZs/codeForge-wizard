import Docker from 'dockerode';
import * as tar from 'tar-stream';

//Linux : no need to set socketPath
const docker = new Docker({ socketPath: "//./pipe/docker_engine" });

interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

const executeInContainer = async (container: Docker.Container, cmd: string[], timeoutMs: number): Promise<ExecuteResult> {
  const exec = await container.exec({
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  });

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    exec.start({hijack: true, stdin: false}, (err, stream) => {
      if (err) return reject(err);

      if (!stream) return reject(new Error("no stream returned"));

      const stdoutSink = {
        write: (chunk: Buffer) => {
          stdout += chunk.toString();
        },
      };
      const stderrSink = {
        write: (chunk: Buffer) => {
          stderr += chunk.toString();
        },
      };

      docker.modem.demuxStream(stream, stdoutSink as any, stderrSink as any);

      const timer = setTimeout(async () => {
        if (settled) return;
        settled = true;

        stream.destroy();
        resolve({stdout, stderr, exitCode: -1, timedOut: true});
      }, timeoutMs);

      stream.on('end', async () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        try {
          const inspectData = await exec.inspect();
          resolve({
            stdout,
            stderr,
            exitCode: inspectData.ExitCode ?? -1,
            timedOut: false,
          });
        } catch (inspectErr) {
          reject(inspectErr);
        }
      });

      stream.on('error', (streamErr) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(streamErr);
      });
    });
  });
}

export const runJavaCode = async (
  containerName: string,
  filename: string,
  code: string,
  opts: {compileTimeoutMs?: number; runTimeoutMs?: number} = {},
) => {
  const compileTimeoutMs = opts.compileTimeoutMs ?? 10000;
  const runTimeoutMs = opts.runTimeoutMs ?? 5000;

  const container = docker.getContainer(containerName);
  const workdir = "/tmp/run";
  const className = filename.replace(/\.java$/, "");

  const pack = tar.pack();
  pack.entry({ name: `run/${filename}`}, code);
  pack.finalize();

  await container.putArchive(pack, { path: '/tmp'});

  const compileResult = await executeInContainer(
    container,
    ['javac', `${workdir}/${filename}`],
    compileTimeoutMs
  );

  if (compileResult.timedOut) return { stage: 'compile', success: false, timedOut: true, ...compileResult };
  if (compileResult.exitCode !== 0) return { stage: 'compile', success: false, timedOut: false, ...compileResult };

  const runResult = await executeInContainer(
    container,
    ['java', '-cp', workdir, className],
    runTimeoutMs
  );

  if (runResult.timedOut) return { stage: 'run', success: 'false', timedOut: true, ...runResult };
  if (runResult.exitCode !== 0) return { stage: 'run', success: 'false', timedOut: false, ...runResult };

  return { stage: 'run', success: 'true', timedOut: false, ...runResult };
}