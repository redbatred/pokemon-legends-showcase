export type VaultStage = { stageY: number; stageWidth: number; stageFlatten: number };

/** Fit the complete rear architecture to the viewport while preserving the battle plane. */
export function psychicVaultGeometry(width: number, height: number, stage: VaultStage) {
  const span = stage.stageWidth;
  const wide = width / height > 1.2;
  const horizon = stage.stageY - span * .115;
  const room = Math.min(width * .82, span * (wide ? .83 : 1.10));
  const doorWidth = room * (wide ? .55 : .67);
  const doorTop = Math.max(35, horizon - Math.min(height * .57, room * .76));
  return {
    centerX: width / 2, horizon, room, doorWidth, doorTop,
    doorBottom: horizon + span * .035,
    roomTop: Math.max(10, doorTop - room * .13),
    pylonOffset: Math.min(width * .405, span * .47),
    crystalSize: Math.min(span * .105, width * .145),
    deckRadiusX: span * .48,
    deckRadiusY: span * .19 * stage.stageFlatten,
    deckY: stage.stageY,
  };
}
