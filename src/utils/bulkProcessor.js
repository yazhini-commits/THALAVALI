// Detect what the user wants
export function detectContentType(text) {
  const t = text.toLowerCase();

  if (t.includes("linkedin")) return "LinkedIn Post";
  if (t.includes("email") || t.includes("mail")) return "Email Draft";
  if (t.includes("ad") || t.includes("promote")) return "Ad Copy";
  if (t.includes("blog")) return "Blog Intro";
  if (t.includes("tweet") || t.includes("twitter")) return "Tweet";

  return "LinkedIn Post"; // safe default
}


// Split lines into tasks
export function parseBulkInput(input) {
  return input
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: index + 1,
      topic: line,
      detectedType: detectContentType(line)
    }));
}


// QUEUE (rate-limit safe)
export async function processBulk(tasks, generator, onItemDone) {

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    try {
      const result = await generator(task);

      onItemDone({
        success: true,
        topic: task.topic,
        type: task.detectedType,
        content: result
      });

      // 🔥 RATE LIMIT PROTECTION
      await new Promise(r => setTimeout(r, 1600));

    } catch (err) {
      onItemDone({
        success: false,
        topic: task.topic,
        type: task.detectedType,
        content: "Generation failed"
      });
    }
  }
}
