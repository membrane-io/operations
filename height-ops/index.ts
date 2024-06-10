import { root, nodes } from "membrane";

export const email: resolvers.Root["email"] = async ({
  from,
  subject,
  text,
}) => {
  if (!from.endsWith("@membrane.io")) {
    console.log("Ignoring email from", from);
    return;
  }
  const issues = subject.match(/T-\d+/g) || [];
  if (issues.length === 0) return;

  // Don't include issue prefix in subject
  const lastIssue = issues.slice(-1)[0];
  subject = subject.slice(subject.indexOf(lastIssue) + lastIssue.length).trim();

  // Drop unsubscribe footer
  text = text
    .replace(
      "To unsubscribe from this group and stop receiving emails from it, send an email to height+unsubscribe@membrane.io.",
      ""
    )
    .trim();
  text = `From: ${from}\nSubject: ${subject}\n\n${text}`;

  for (const issue of issues) {
    await nodes.height.tasks
      .one({ id: issue.slice(2) })
      .postComment({ message: text });
  }
};
