/** Position labels are stored in display order, shared by desktop and mobile. */
export const courtPositions = [1, 2, 3, 4, 5, 6] as const;

export const courtPositionLabel = (position: number) => `Posição ${position}`;
