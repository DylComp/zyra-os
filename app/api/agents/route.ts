import { NextRequest } from "next/server";
import { DEMO_MESSAGES, DEMO_FILES, DEMO_COMMITS } from "@/lib/demo-data";
import { addMessage, addFile, addCommit, getState, setState, subscribe } from "@/lib/store";
import type { AgentMessage } from "@/types";

let demoStarted = false;

async function runDemo() {
  if (demoStarted) return;
  demoStarted = true;
  setState({ status: "planning" });

  const baseTime = Date.now();
  let msgCounter = 0;

  for (let i = 0; i < DEMO_MESSAGES.length; i++) {
    const template = DEMO_MESSAGES[i];

    // Stagger messages: fast bursts with short pauses
    const delay = i < 3 ? 300 + Math.random() * 200
      : i < 10 ? 500 + Math.random() * 400
      : 700 + Math.random() * 500;

    await new Promise((r) => setTimeout(r, delay));

    const msg: AgentMessage = {
      id: `msg-${++msgCounter}`,
      agent: template.agent,
      turn: template.turn,
      timestamp: new Date(baseTime + i * 3000).toISOString(),
      content: template.content,
      codeBlock: template.codeBlock,
    };
    addMessage(msg);

    // Add files progressively
    if (i === 3) {
      // Types
      DEMO_FILES[0]?.children?.[0]?.children?.forEach((f) => addFile(f));
    } else if (i === 5 || i === 7) {
      // Crypto files
      DEMO_FILES[0]?.children?.[1]?.children?.forEach((f) => addFile(f));
    } else if (i === 9) {
      // Block
      DEMO_FILES[0]?.children?.[2]?.children?.forEach((f) => addFile(f));
    } else if (i === 11) {
      // Chain
      DEMO_FILES[0]?.children?.[3]?.children?.forEach((f) => addFile(f));
    } else if (i === 13) {
      // Consensus
      DEMO_FILES[0]?.children?.[4]?.children?.forEach((f) => addFile(f));
    } else if (i === 15) {
      // Transaction
      DEMO_FILES[0]?.children?.[5]?.children?.forEach((f) => addFile(f));
    } else if (i === 19) {
      // Network
      DEMO_FILES[0]?.children?.[6]?.children?.forEach((f) => addFile(f));
    } else if (i === 20) {
      // CLI
      DEMO_FILES[0]?.children?.[7]?.children?.forEach((f) => addFile(f));
    }

    // Add commits at key milestones
    if ([3, 5, 7, 9, 11, 13, 15, 19, 20, 22].includes(i)) {
      const commitIdx = [3, 5, 7, 9, 11, 13, 15, 19, 20, 22].indexOf(i);
      if (DEMO_COMMITS[commitIdx]) {
        addCommit({
          ...DEMO_COMMITS[commitIdx],
          timestamp: new Date(baseTime + i * 3000).toISOString(),
        });
      }
    }
  }

  // Add remaining files at end
  for (const topLevel of DEMO_FILES.slice(1)) {
    addFile(topLevel);
  }

  setState({ status: "completed" });
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Start the demo simulation
  runDemo();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send existing messages
      const state = getState();
      for (const msg of state.messages) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
      }

      // Subscribe to new messages
      const unsubscribe = subscribe((msg) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // Check for completion
      const interval = setInterval(() => {
        const s = getState();
        if (s.status === "completed" || s.status === "error") {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", status: s.status })}\n\n`)
          );
          clearInterval(interval);
          unsubscribe();
          controller.close();
        }
      }, 1000);
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
