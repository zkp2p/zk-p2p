export type AbiEntry = {
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
  inputs?: Array<{
    name?: string;
    type: string;
    indexed?: boolean;
    internalType?: string;
  }>;
  outputs?: Array<{
    name?: string;
    type: string;
    internalType?: string;
  }>;
  name?: string;
  type: string;
  stateMutability?: "nonpayable" | "payable" | "view" | "pure";
  events?: Record<string, AbiEntry>;
};

export type Abi = AbiEntry[];
