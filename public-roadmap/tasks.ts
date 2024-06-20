import { nodes, state } from "membrane";

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

export async function fetchTasks() {
  const fields = "{ id name description status }";
  const tasks = await nodes.publicRoadmapTasks.items.$query(fields);

  const publicRoadmapTasks = tasks
    .filter((task) => task.status !== "done")
    .map((task) => {
      const { id, name, description: heightDesc, status: heightStatus } = task;
      const status = formatStatus(heightStatus);
      const description = formatDescription(heightDesc);
      return { id, name, description, status };
    });

  return publicRoadmapTasks;
}

export function fetchUpvotes({
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
