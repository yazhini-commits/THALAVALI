export async function analyzeContent(text) {
  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}
