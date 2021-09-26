export const get2DCenter = (input: [number, number][]): [number, number] => {
  let [totalX, totalY] = input.reduceRight((prev, cur) => [
    prev[0] + cur[0],
    prev[1] + cur[1],
  ]);
  return [totalX / input.length, totalY / input.length];
};

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
    return scale2DAroundKnownCenterProvider(factor, get2DCenter(input))(input);
  };

export const scale2DAroundKnownCenterProvider =
  (factor: number, [centerX, centerY]: [number, number]) =>
  (input: [number, number][]): [number, number][] => {
    return input.map(([cx, cy]) => [
      centerX + (cx - centerX) * factor,
      centerY + (cy - centerY) * factor,
    ]);
  };
