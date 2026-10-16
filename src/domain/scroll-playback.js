/** Hold the first and last employees long enough to read before changing groups. */
export function scrollPlayback(elapsedMs, overflowPx, intervalMs) {
  const overflow=Math.max(0,overflowPx);
  const scrollMs=overflow/22*1000;
  return {
    offset:Math.min(overflow,Math.max(0,elapsedMs-2000)/1000*22),
    duration:Math.max(intervalMs,overflow>0?4000+scrollMs:0)
  };
}
