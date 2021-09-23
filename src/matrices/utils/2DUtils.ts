export const translate2DProvider =
  (
    translateX: number,
    translateY: number
  ): ((input: [number, number][]) => [number, number][]) =>
  (input: [number, number][]): [number, number][] =>
    input.map(([cx, cy]) => [cx + translateX, cy + translateY]);

export const scale2DAroundCenterProvider =
  (factor: number) =>
  (input: [number, number][]): [number, number][] => {
    let [totalX, totalY] = input.reduceRight((prev, cur) => [
      prev[0] + cur[0],
      prev[1] + cur[1],
    ]);
    let centerX = totalX / input.length;
    let centerY = totalY / input.length;

    return input.map(([cx, cy]) => [
      centerX + (cx - centerX) * factor,
      centerY + (cy - centerY) * factor,
    ]);
  };
