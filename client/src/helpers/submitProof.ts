export const reformatProofForChain = (proof: string) => {
  if (!proof) return "";
  const parsedProof = JSON.parse(proof);

  const pi_a = parsedProof["pi_a"].slice(0, 2);
  const pi_b = parsedProof["pi_b"].slice(0, 2).map((g2point: any[]) => g2point.reverse());
  const pi_c = parsedProof["pi_c"].slice(0, 2);

  // console.log("pi_a", pi_a);
  // console.log("pi_b", pi_b);
  // console.log("pi_c", pi_c);

  return [
    pi_a,
    pi_b,
    pi_c,
  ];
};

export const reformatMultiProofAndSignalsForChain = (
  proof: string,
  signals: string,
  bodyHashProof: string,
  bodyHashPublicSignals: string,
) => {
  if (!(proof && bodyHashProof)) return [{ a: [], b: [], c: [], signals: []}, { a: [], b: [], c: [], signals: []}];

  const parsedProof = JSON.parse(proof);
  const parsedBodyHashProof = JSON.parse(bodyHashProof);

  const proofAndSignals = {
    a: parsedProof["pi_a"].slice(0, 2),
    b: parsedProof["pi_b"].slice(0, 2).map((g2point: any[]) => g2point.reverse()),
    c: parsedProof["pi_c"].slice(0, 2),
    signals: JSON.parse(signals),
  }
  const bodyHashProofAndSignals = {
    a: parsedBodyHashProof["pi_a"].slice(0, 2),
    b: parsedBodyHashProof["pi_b"].slice(0, 2).map((g2point: any[]) => g2point.reverse()),
    c: parsedBodyHashProof["pi_c"].slice(0, 2),
    signals: JSON.parse(bodyHashPublicSignals),
  }
  return [proofAndSignals, bodyHashProofAndSignals];
}
