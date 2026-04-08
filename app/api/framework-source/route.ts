import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  if (!file) {
    return Response.json({ error: "file param required" }, { status: 400 });
  }

  const safeName = file.replace(/[^a-zA-Z0-9._-]/g, "");
  const validFiles = ["index.ts", "planner.ts", "router.ts", "worker.ts", "context.ts", "recovery.ts"];

  if (!validFiles.includes(safeName)) {
    return Response.json({ error: "invalid file" }, { status: 400 });
  }

  try {
    const content = readFileSync(
      join(process.cwd(), "lib", "framework", safeName),
      "utf-8"
    );
    return Response.json({ content });
  } catch {
    return Response.json({ error: "file not found" }, { status: 404 });
  }
}
