import { readFileSync } from "fs";
import { join } from "path";
import archiver from "archiver";
import { PassThrough } from "stream";

const FRAMEWORK_FILES = [
  "index.ts",
  "planner.ts",
  "router.ts",
  "worker.ts",
  "context.ts",
  "recovery.ts",
];

export async function GET() {
  const frameworkDir = join(process.cwd(), "lib", "framework");
  const chunks: Buffer[] = [];

  return new Promise<Response>((resolve) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const passthrough = new PassThrough();

    passthrough.on("data", (chunk: Buffer) => chunks.push(chunk));
    passthrough.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(
        new Response(buffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=zyraos-framework.zip",
          },
        })
      );
    });

    archive.pipe(passthrough);

    for (const file of FRAMEWORK_FILES) {
      try {
        const content = readFileSync(join(frameworkDir, file), "utf-8");
        archive.append(content, { name: `zyraos/${file}` });
      } catch {
        // Skip missing files
      }
    }

    archive.finalize();
  });
}
