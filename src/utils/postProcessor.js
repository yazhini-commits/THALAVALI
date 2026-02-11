export function postProcess(type, text = "") {
  if (!text) return "";

  let output = text
    // Remove ONLY truly problematic symbols
    .replace(/[`^~]/g, "")
    // Normalize spacing
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Tweet must be single line (platform rule)
  if (type === "Tweet") {
    output = output.replace(/\n+/g, " ");
  }

  return output;
}
