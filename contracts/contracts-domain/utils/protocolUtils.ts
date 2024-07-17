import { ethers } from "ethers";
import { ClaimInfo, EventRaw, GroupRaw, Proof, SignedClaim, TicketRaw } from "./types";
import { ADDRESS_ZERO, ZERO_BYTES32 } from "./constants";

export const generateProofsFromTickets = (
  eventInfo: EventRaw,
  tickets: TicketRaw[]
): Proof[] => {
  const proofs: Proof[] = [];
  for (const ticket of tickets) {
    const claimInfo: ClaimInfo = {
      provider: "http",
      parameters: "",
      context: "",
    };
    const signedClaim: SignedClaim = {
      claim: {
        identifier: ZERO_BYTES32,
        owner: ADDRESS_ZERO,
        timestampS: ethers.constants.Zero,
        epoch: ethers.constants.Zero,
      },
      signatures: [
        ethers.utils.hexlify(Buffer.from(ticket.rawId)),
        ethers.utils.hexlify(Buffer.from(ticket.isTransferrable)),
        ethers.utils.hexlify(Buffer.from(eventInfo.eventName)),
        ethers.utils.hexlify(Buffer.from(ticket.row)),
        ethers.utils.hexlify(Buffer.from(ticket.seat)),
        ethers.utils.hexlify(Buffer.from(ticket.section)),
        ethers.utils.hexlify(Buffer.from(eventInfo.eventUrl)),
        ethers.utils.hexlify(Buffer.from(eventInfo.startTime)),
        ethers.utils.hexlify(Buffer.from(eventInfo.venue))
      ],
    };
    proofs.push({claimInfo, signedClaim} as Proof);
  }

  return proofs;
}

export const generateProofsForTransfer = (
  eventUrl: string,
  group: GroupRaw
): Proof => {
  const hashedEmail = ethers.utils.solidityKeccak256(["string"], [group.email]);
  const claimInfo: ClaimInfo = {
    provider: "http",
    parameters: "",
    context: "",
  };
  const signedClaim: SignedClaim = {
    claim: {
      identifier: ZERO_BYTES32,
      owner: ADDRESS_ZERO,
      timestampS: ethers.constants.Zero,
      epoch: ethers.constants.Zero,
    },
    signatures: [
      ethers.utils.hexlify(Buffer.from(hashedEmail)),
      ethers.utils.hexlify(Buffer.from(group.role)),
      ethers.utils.hexlify(Buffer.from(eventUrl)),
      ethers.utils.hexlify(Buffer.from(group.status)),
      ethers.utils.hexlify(Buffer.from(group.tickets.replace(/"/g, '\\\"'))),
    ],
  };

  return {claimInfo, signedClaim} as Proof
}

export const calculateTicketId = (rawTicketId: string): string => {
  return ethers.utils.solidityKeccak256(["string"], [rawTicketId]);
}
