import { state, nodes } from "membrane";

export interface State {
  tasks: Record<string, Record<string, boolean>>;
}

function formatStatus(heightStatus?: string) {
  // custom statuses return their id from the Height API
  const HEIGHT_BLOCKED_STATUS = "b7217600-255f-4ed6-b8ca-e8d2b7f6edc1";

  let status = "";
  switch (heightStatus) {
    case "backLog":
    case HEIGHT_BLOCKED_STATUS:
      status = "todo";
      break;
    case "inProgress":
      status = "in-progress";
      break;
    default:
      status = heightStatus ?? "unknown";
  }

  return status;
}

function formatDescription(heightDesc?: string) {
  const regex = /===public\s+([\s\S]*?)\s*===/g;
  const match = regex.exec(heightDesc || "");
  const publicDescription = match ? match[1].trim() : "";

  return publicDescription;
}

function fetchUpvotes({
  ipAddress,
  taskId,
}: {
  ipAddress: string;
  taskId?: string;
}) {
  if (!taskId) return { numUpvotes: 0, hasUpvoted: false };

  if (!state.tasks[taskId]) {
    state.tasks[taskId] = {};
  }

  const numUpvotes = Object.keys(state.tasks[taskId]).length;
  const hasUpvoted = state.tasks[taskId][ipAddress] || false;

  return { numUpvotes, hasUpvoted };
}

async function fetchTasks(ipAddress: string) {
  const fields = "{ id name description status }";
  const tasks = await nodes.tasks.items.$query(fields);

  const publicRoadmapTasks = tasks
    .filter((task) => task.status !== "done")
    .map((task) => {
      const { id, name, description: heightDesc, status: heightStatus } = task;
      const status = formatStatus(heightStatus);
      const description = formatDescription(heightDesc);
      const { numUpvotes, hasUpvoted } = fetchUpvotes({
        ipAddress,
        taskId: id,
      });

      return { id, name, description, status, numUpvotes, hasUpvoted };
    });

  return publicRoadmapTasks;
}

export const endpoint: resolvers.Root["endpoint"] = async (req) => {
  switch (`${req.method} ${req.path}`) {
    case "GET /":
      const ip = JSON.parse(req.headers)["x-forwarded-for"];

      return JSON.stringify({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(await fetchTasks(ip)),
      });
    case "POST /upvote":
    case "POST /downvote":
      const { id } = JSON.parse(req.body as string);
      const ipAddress = JSON.parse(req.headers)["x-forwarded-for"];

      req.path.includes("upvote")
        ? (state.tasks[id][ipAddress] = true)
        : delete state.tasks[id][ipAddress];

      return JSON.stringify({ status: 201 });
    default:
      return JSON.stringify({ status: 404 });
  }
};
