import { ethers } from 'ethers';

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

export async function storeHashOnChain(
  hash: string,
  provider: ethers.JsonRpcProvider,
  signer: ethers.Signer
): Promise<string | null> {
  try {
    const tx = await signer.sendTransaction({
      to: signer.getAddress(),
      value: 0,
      data: ethers.hexlify(ethers.toUtf8Bytes(hash)),
    });

    const receipt = await tx.wait();
    return receipt?.hash || null;
  } catch (error) {
    console.error('Failed to store hash on chain:', error);
    return null;
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
