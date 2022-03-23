import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";


export interface TokenBalance {
    balance: number;
    decimals: BN;
    mint: PublicKey;
}