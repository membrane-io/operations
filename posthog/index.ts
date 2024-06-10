// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persists across program updates. Store data here.
import { nodes, root, state } from "membrane";

export const Root: resolvers.Root = {
  async endpoint({ body }) {
    if (body?.startsWith("Program faulted:")) {
      await nodes.userEvents.sendMessage({
        content: body,
      });
    }

    return JSON.stringify({ status: 200 });
  },
};
