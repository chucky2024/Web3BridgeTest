import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const TOKEN_HOLDER = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(TOKEN_HOLDER);
  const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
  
  const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
  const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

  const amountIn = ethers.parseEther("0.5");
  const path = [WETH, USDC];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Get the estimated amounts out
  const amounts = await ROUTER.getAmountsOut(amountIn, path);
  // The getAmountsOut function returns an array of amounts for each step in the path. We're interested in the last element, which is the expected USDC output.
  const amountOutMin = amounts[amounts.length - 1];

  // Fetch initial balances
  const initialEthBal = await ethers.provider.getBalance(impersonatedSigner.address);
  const initialUsdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);

  console.log("Starting ETH balance:", ethers.formatEther(initialEthBal));
  console.log("Starting USDc balance:", ethers.formatUnits(initialUsdcBal, 6));

  // Perform the swap
  const tx = await ROUTER.swapExactETHForTokens(
    amountOutMin,
    path,
    impersonatedSigner.address,
    deadline,
    { value: amountIn }
  );
  await tx.wait();

  // Fetch final balances
  const lastEthBal = await ethers.provider.getBalance(impersonatedSigner.address);
  const lastUsdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);

  console.log("===========================================");
  console.log("Last ETH balance:", ethers.formatEther(lastEthBal));
  console.log("Last USDC balance:", ethers.formatUnits(lastUsdcBal, 6));
  console.log("===========================================");
  console.log("ETH spent:", ethers.formatEther(initialEthBal - lastEthBal));
  console.log("USDC received:", ethers.formatUnits(lastUsdcBal - initialUsdcBal, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});