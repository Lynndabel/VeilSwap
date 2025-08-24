// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {PrivateAMM} from "../src/PrivateAMM.sol";
import {ERC20Mock} from "../src/mocks/ERC20Mock.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        vm.startBroadcast(pk);

        // Deploy demo tokens
        ERC20Mock pAVAX = new ERC20Mock("Private AVAX", "pAVAX", 18);
        ERC20Mock pUSDC = new ERC20Mock("Private USDC", "pUSDC", 6);

        // Mint to deployer for testing
        pAVAX.mint(deployer, 1_000_000 ether);
        pUSDC.mint(deployer, 1_000_000 * 1e6);

        // Deploy AMM
        PrivateAMM amm = new PrivateAMM();

        // Approve AMM to pull liquidity from deployer
        pAVAX.approve(address(amm), type(uint256).max);
        pUSDC.approve(address(amm), type(uint256).max);

        // Add initial liquidity: 10,000 pAVAX and 300,000 pUSDC (implies ~30 pUSDC per pAVAX)
        bytes memory encA = abi.encode(uint256(10_000 ether));
        bytes memory encB = abi.encode(uint256(300_000 * 1e6));
        amm.addLiquidity(address(pAVAX), address(pUSDC), encA, encB, deployer);

        vm.stopBroadcast();

        console2.log("Deployer:", deployer);
        console2.log("pAVAX:", address(pAVAX));
        console2.log("pUSDC:", address(pUSDC));
        console2.log("PrivateAMM:", address(amm));
    }
}
