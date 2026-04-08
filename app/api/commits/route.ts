import { getState } from "@/lib/store";

export async function GET() {
  const state = getState();
  return Response.json({ commits: state.commits });
}
