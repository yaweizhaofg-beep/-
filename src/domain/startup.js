/** First paint only waits for the initial read; periodic enrichment is independent. */
export async function startApplication({ read, render, update, onUpdateError }) {
  render(await read());
  return { background: Promise.resolve().then(update).then(read).then(render).catch(onUpdateError) };
}
