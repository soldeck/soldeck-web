import BigNumber from "bignumber.js";

export function sumStrNumbers(a: string | null, b: string | null): string {
  return new BigNumber(a ?? 0).plus(new BigNumber(b ?? 0)).toString();
}

export function multiStrNumbers(a: string | null, b: string | null): string {
  return new BigNumber(a ?? 0).multipliedBy(new BigNumber(b ?? 0)).toString();
}

export function strNumberComparator(a: string | null, b: string | null) {
  console.log(a, b);
  return new BigNumber(a ?? 0).comparedTo(new BigNumber(b ?? 0));
}
