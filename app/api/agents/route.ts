import { NextRequest } from "next/server";
import { startOrchestration, isRunning } from "@/lib/orchestrator";
import { subscribe, getState } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isRunning()) {
    startOrchestration(prompt);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const state = getState();
      for (const msg of state.messages) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
        );
      }

      const unsubscribe = subscribe((msg) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
          );
        } catch {
          unsubscribe();
        }
      });

      const interval = setInterval(() => {
        const s = getState();
        if (s.status === "completed" || s.status === "error") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", status: s.status })}\n\n`
            )
          );
          clearInterval(interval);
          unsubscribe();
          controller.close();
        }
      }, 2000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
