export function rotateScoreRotation(ids: string[]) {
  return ids.length > 1 ? [ids.at(-1)!, ...ids.slice(0, -1)] : ids;
}
