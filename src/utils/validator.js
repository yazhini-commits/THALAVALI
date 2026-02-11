export function validateContent(type, text = "") {
  const issues = [];

  if (!text || text.trim().length < 40) {
    issues.push("Content feels too short. Consider regenerating with more detail.");
  }

  // LinkedIn: hashtags are recommended, not mandatory
  if (type === "LinkedIn Post") {
    if (!/#\w+/.test(text)) {
      issues.push("Tip: Adding hashtags can improve LinkedIn reach.");
    }
  }

  // Email: subject line recommended but not forced
  if (type === "Email Draft") {
    if (!/^subject\s*:/i.test(text)) {
      issues.push("Tip: Emails usually perform better with a clear subject line.");
    }
  }

  // Ad copy: CTA recommended
  if (type === "Ad Copy") {
    if (!/(buy|join|sign up|learn more|get started|try|discover)/i.test(text)) {
      issues.push("Tip: A call-to-action can improve ad performance.");
    }
  }

  // Tweet: hard limit
  if (type === "Tweet" && text.length > 280) {
    issues.push("Tweet exceeds 280 characters.");
  }

  return issues;
}
