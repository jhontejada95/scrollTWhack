import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

export const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io';
export const SCROLL_SEPOLIA_CHAIN_ID = 534351;

export interface BlockchainRecord {
  hash: string;
  timestamp: number;
  txHash?: string;
}

export async function connectToScrollSepolia(): Promise<ethers.JsonRpcProvider | null> {
  try {
    const provider = new ethers.JsonRpcProvider(SCROLL_SEPOLIA_RPC);
    await provider.getNetwork();
    return provider;
  } catch (error) {
    console.error('Failed to connect to Scroll Sepolia:', error);
    return null;
  }
}

export async function registerCheckInOnChain(
  hash: string,
  score: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return {
        success: false,
        error: "Contract not deployed. Please deploy the contract and update CONTRACT_ADDRESS in src/lib/contract.ts"
      };
    }

    const provider = await getWalletConnection();
    if (!provider) {
      return { success: false, error: "Failed to connect wallet" };
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(hash));
    const tx = await contract.registerCheckIn(hashBytes32, score);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt?.hash
    };
  } catch (error: any) {
    console.error('Failed to register check-in on chain:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

export async function verifyCheckInOnChain(
  hash: string
): Promise<{ exists: boolean; timestamp?: number; score?: number; error?: string }> {
  try {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return {
        exists: false,
        error: "Contract not deployed"
      };
    }

    const provider = new ethers.JsonRpcProvider(SCROLL_SEPOLIA_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(hash));
    const [exists, timestamp, score] = await contract.verifyCheckIn(hashBytes32);

    return {
      exists,
      timestamp: Number(timestamp),
      score: Number(score)
    };
  } catch (error: any) {
    console.error('Failed to verify check-in on chain:', error);
    return {
      exists: false,
      error: error.message || 'Unknown error'
    };
  }
}

export function verifyHash(originalData: string, storedHash: string): boolean {
  try {
    const computedHash = ethers.keccak256(ethers.toUtf8Bytes(originalData));
    return computedHash === storedHash;
  } catch (error) {
    console.error('Hash verification failed:', error);
    return false;
  }
}

export async function getWalletConnection(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const network = await provider.getNetwork();
    if (Number(network.chainId) !== SCROLL_SEPOLIA_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SCROLL_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SCROLL_SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Scroll Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [SCROLL_SEPOLIA_RPC],
                blockExplorerUrls: ['https://sepolia.scrollscan.com/'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return provider;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
