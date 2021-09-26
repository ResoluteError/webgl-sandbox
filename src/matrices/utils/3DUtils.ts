export const get3DCenter = (
  input: [number, number, number][]
): [number, number, number] => {
  let [totalX, totalY, totalZ] = input.reduceRight((prev, cur) => [
    prev[0] + cur[0],
    prev[1] + cur[1],
    prev[2] + cur[2],
  ]);
  return [totalX / input.length, totalY / input.length, totalZ / input.length];
};

export const translate3DProvider =
  (
    translateX: number,
    translateY: number,
    translateZ: number
  ): ((input: [number, number, number][]) => [number, number, number][]) =>
  (input: [number, number, number][]): [number, number, number][] =>
    input.map(([cx, cy, cz]) => [
      cx + translateX,
      cy + translateY,
      cz + translateZ,
    ]);

export const scale3DAroundCenterProvider =
  (factor: number) =>
  (input: [number, number, number][]): [number, number, number][] => {
    return scale3DAroundKnownCenterProvider(factor, get3DCenter(input))(input);
  };

export const scale3DAroundKnownCenterProvider =
  (factor: number, [centerX, centerY, centerZ]: [number, number, number]) =>
  (input: [number, number, number][]): [number, number, number][] => {
    return input.map(([cx, cy, cz]) => [
      centerX + (cx - centerX) * factor,
      centerY + (cy - centerY) * factor,
      centerZ + (cz - centerZ) * factor,
    ]);
  };
