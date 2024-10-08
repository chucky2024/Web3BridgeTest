import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const ETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; 

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountOutETH = ethers.parseUnits("1", 18); 
    const amountInMaxUSDC = ethers.parseUnits("4000", 6); 

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Approve the router to spend USDC
    await USDC_Contract.approve(ROUTER_ADDRESS, amountInMaxUSDC);

    const USDcBalB4 = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const ETHBalB4 = await ethers.provider.getBalance(impersonatedSigner.address); 

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minutes from now

    console.log("USDC balance before swap:", ethers.formatUnits(USDcBalB4, 6));
    console.log("ETH balance before swap:", ethers.formatUnits(ETHBalB4, 18));

    // Swap USDC for exact amount of ETH
    await ROUTER.swapTokensForExactETH(
        amountOutETH,          // Exact amount of ETH i want
        amountInMaxUSDC,       // Max amount of USDC i'm are willing to spend
        [USDC, ETH], //eth address
        impersonatedSigner.address, 
        deadline              
    );

    const USDcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const ETHBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=========================================================");

    console.log("USDC balance after swap:", ethers.formatUnits(USDcBalAfter, 6));
    console.log("ETH balance after swap:", ethers.formatUnits(ETHBalAfter, 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});