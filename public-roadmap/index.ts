import { nodes } from "membrane";

// custom statuses return their id from the Height API
const HEIGHT_BLOCKED_STATUS = "b7217600-255f-4ed6-b8ca-e8d2b7f6edc1";

function formatStatus(heightStatus?: string) {
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

export const endpoint: resolvers.Root["endpoint"] = async (req) => {
  const fields = "{ id name description status }";
  const tasks = await nodes.tasks.items.$query(fields);

  const publicRoadmapTasks = tasks
    .filter((task) => task.status !== "done")
    .map((task) => {
      const { id, name, description: heightDesc, status: heightStatus } = task;
      const status = formatStatus(heightStatus);
      const description = formatDescription(heightDesc);

      return { id, name, description, status };
    });

  switch (`${req.method} ${req.path}`) {
    case "GET /":
      const body = JSON.stringify(publicRoadmapTasks);
      return JSON.stringify({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body,
      });
    default:
      return JSON.stringify({ status: 404 });
  }
};
