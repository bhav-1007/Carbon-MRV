export const scopeLabels = {
  1: "Direct fuel emissions",
  2: "Purchased electricity",
  3: "Indirect value-chain emissions"
};

export function scopeLabel(scope) {
  return scopeLabels[Number(scope)] || `Scope ${scope}`;
}
