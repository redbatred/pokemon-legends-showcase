import { describe, expect, it } from 'vitest';
import { showdownLayout } from './showdownModel';
import { psychicVaultGeometry } from './psychicVaultGeometry';

describe('psychic vault composition', () => {
  for (const [width, height] of [[1440,900],[1200,800],[1024,600],[390,844],[375,667],[320,568]]) {
    it(`keeps the sealed doorway and both fighters on the floor at ${width}×${height}`, () => {
      const battle=showdownLayout(width,height);
      const stage={stageWidth:battle.deck.width*battle.scale,stageY:battle.y+battle.deck.y*battle.scale,stageFlatten:battle.deck.flatten};
      const vault=psychicVaultGeometry(width,height,stage);
      expect(vault.doorTop).toBeGreaterThan(0);
      expect(vault.doorBottom).toBeGreaterThan(vault.doorTop+vault.doorWidth*.3);
      expect(vault.centerX-vault.doorWidth*.5-vault.room*.08).toBeGreaterThan(0);
      expect(vault.centerX+vault.doorWidth*.5+vault.room*.08).toBeLessThan(width);
      for (const fighter of [battle.player,battle.boss]) {
        const x=battle.x+fighter.x*battle.scale,y=battle.y+fighter.y*battle.scale;
        expect(Math.abs(x-vault.centerX)).toBeLessThan(vault.deckRadiusX*.73);
        expect(y).toBeGreaterThan(vault.deckY-vault.deckRadiusY*.72);
        expect(y).toBeLessThan(vault.deckY+vault.deckRadiusY*.84);
        expect(y).toBeGreaterThan(vault.doorBottom);
      }
      expect(vault.centerX-vault.pylonOffset-vault.crystalSize*.42).toBeGreaterThan(0);
      expect(vault.centerX+vault.pylonOffset+vault.crystalSize*.42).toBeLessThan(width);
    });
  }
});
