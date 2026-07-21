import Docker from 'dockerode';
import * as tar from 'tar-stream';

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
      })
    })
  })
}