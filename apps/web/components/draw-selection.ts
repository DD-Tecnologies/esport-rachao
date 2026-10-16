/** Pure selection helpers used by the draw flow and unit tests. */
export function addToSelection(selected: string[], playerId: string) {
  return selected.includes(playerId) ? selected : [...selected, playerId];
}

export function isRosterReady(selectedCount: number, teamCount: number, playersPerTeam: number) {
  return selectedCount >= teamCount * playersPerTeam;
}
