import { ethers } from 'ethers';
import { TokenBalance } from '@/types/treasury';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export async function getWalletBalances(
  walletAddress: string,
  tokens: { address: string }[],
  rpcUrl: string
): Promise<TokenBalance[]> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const balances: TokenBalance[] = [];

  // Get ETH balance
  const ethBalance = await provider.getBalance(walletAddress);
  balances.push({
    token: 'ETH',
    address: 'native',
    balance: ethBalance.toString(),
    decimals: 18,
    normalized: Number(ethers.formatEther(ethBalance))
  });


  for (const token of tokens) {
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ]);

    balances.push({
      token: symbol,
      address: token.address,
      balance: balance.toString(),
      decimals,
      normalized: Number(ethers.formatUnits(balance, decimals))
    });
  }

  return balances;
}