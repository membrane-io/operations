// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persists across program updates. Store data here.
import { nodes, root, state } from "membrane";

export async function endpoint(req) {
  state.hits = (state.hits ?? 0) + 1;
  root.statusChanged.$emit();

  const { method, path, query, body } = req;
  const headers = JSON.parse(req.headers);

  // INSTRUCTIONS: Handle webhook here and modify response

  return JSON.stringify({
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method, headers, body }, null, 2),
  });
}
