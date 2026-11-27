// Pomoćna funkcija za E2E testove editora šablona: boje su u šablonu hex stringovi (npr. "#B4281E"), ali
// getComputedStyle (i inline style.color) ih čita nazad kao "rgb(r, g, b)" - ovo pretvara hex u isti oblik
// radi poređenja (npr. expect(await el.evaluate(e => getComputedStyle(e).color)).toBe(hexToRgb("#B4281E"))).
export function hexToRgb(hex: string): string {
  const broj = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(broj >> 16) & 255}, ${(broj >> 8) & 255}, ${broj & 255})`;
}
