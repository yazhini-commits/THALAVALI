export async function streamText({
  text,
  onUpdate,
  speed = 12, // smaller = faster typing
}) {
  let current = "";

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // smarter typing (words not letters)
  const tokens = text.split(/(\s+)/); // keeps spaces

  for (let i = 0; i < tokens.length; i++) {
    current += tokens[i];

    onUpdate(current);

    // natural typing rhythm
    let delay = speed;

    if (tokens[i].includes(".")) delay = 120;
    else if (tokens[i].includes(",")) delay = 70;
    else if (tokens[i].length > 6) delay = 25;

    await sleep(delay);
  }

  onUpdate(text); // final correction
}
