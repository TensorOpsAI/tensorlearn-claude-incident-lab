// See contract.md. Pure deterministic detector; do not call a model.
export function detect(history, current, policy) {
  return {band:0,mean:0,stddev:0,z:0}; // TODO implement exact numeric contract.
}
