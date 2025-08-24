// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PrivateAMM} from "./PrivateAMM.sol";

contract PriceOracle {
    PrivateAMM public immutable amm;

    constructor(address _amm) {
        amm = PrivateAMM(_amm);
    }

    function getPrice(address tokenA, address tokenB) external view returns (uint256 priceAinB) {
        (uint256 reserveA, uint256 reserveB) = amm.getReserves(tokenA, tokenB);
        require(reserveA > 0 && reserveB > 0, "No liquidity");
        // price of 1 unit of A in terms of B with 1e18 scaling
        priceAinB = (reserveB * 1e18) / reserveA;
    }
}
