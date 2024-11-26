import { utils } from 'ethers';
import canonicalize from 'canonicalize';

import { ClaimInfo, CompleteClaimData } from './types';
import { ethers } from 'hardhat';

/**
 * Creates the standard string to sign for a claim.
 * This data is what the witness will sign when it successfully
 * verifies a claim.
 */
export function createSignDataForClaim(data: CompleteClaimData) {
	const identifier = 'identifier' in data
		? data.identifier
		: getIdentifierFromClaimInfo(data)
	const lines = [
		identifier,
		// we lowercase the owner to ensure that the
		// ETH addresses always serialize the same way
		data.owner.toLowerCase(),
		data.timestampS.toString(),
		data.epoch.toString(),
	]

	return lines.join('\n')
}

/**
 * Generates a unique identifier for given claim info
 * @param info
 * @returns
 */
export function getIdentifierFromClaimInfo(info: ClaimInfo): string {
	//re-canonicalize context if it's not empty
	if (info.context?.length > 0) {
		try {
			const ctx = JSON.parse(info.context)
			info.context = canonicalize(ctx)!
		} catch (e) {
			throw new Error('unable to parse non-empty context. Must be JSON')
		}
	}

	const str = `${info.provider}\n${info.parameters}\n${info.context || ''}`

	return utils.keccak256(
		new TextEncoder().encode(str)
	).toLowerCase()
}
