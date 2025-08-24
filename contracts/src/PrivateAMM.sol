// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract PrivateAMM {
    struct Reserves { uint256 reserveA; uint256 reserveB; }

    // tokenA => tokenB => Reserves (ordered by address to keep canonical mapping)
    mapping(address => mapping(address => Reserves)) private _reserves;

    event SwapPrivate(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        bytes encryptedAmountA,
        uint256 amountB,
        uint256 timestamp
    );

    event LiquidityAdded(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        bytes encryptedAmountA,
        bytes encryptedAmountB,
        uint256 liquidity
    );

    error InvalidPair();
    error InsufficientOutputAmount();

    // MVP: decode an amount from the first 32 bytes of encrypted payload
    function _decodeAmount(bytes calldata encrypted) internal pure returns (uint256) {
        require(encrypted.length >= 32, "Invalid encrypted payload");
        // For MVP we just read the first 32 bytes as uint256
        return abi.decode(encrypted[:32], (uint256));
    }

    function _sort(address a, address b) internal pure returns (address, address) {
        if (a == b) revert InvalidPair();
        return (a < b) ? (a, b) : (b, a);
    }

    function _getReserves(address tokenA, address tokenB) internal view returns (Reserves storage r, bool flipped) {
        (address t0, address t1) = _sort(tokenA, tokenB);
        r = _reserves[t0][t1];
        flipped = (tokenA != t0);
    }

    function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB) {
        (Reserves storage r, bool flipped) = _getReserves(tokenA, tokenB);
        if (flipped) {
            return (r.reserveB, r.reserveA);
        } else {
            return (r.reserveA, r.reserveB);
        }
    }

    // x * y = k; amountOut = (amountIn * reserveOut) / (reserveIn + amountIn) with 0 fee for MVP
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        return (amountIn * reserveOut) / (reserveIn + amountIn);
    }

    function swapPrivate(
        address tokenA,
        address tokenB,
        bytes calldata encryptedAmountA,
        uint256 minAmountB,
        address to
    ) external returns (uint256 amountB) {
        (Reserves storage r, bool flipped) = _getReserves(tokenA, tokenB);
        uint256 amountIn = _decodeAmount(encryptedAmountA);

        uint256 reserveIn = flipped ? r.reserveB : r.reserveA;
        uint256 reserveOut = flipped ? r.reserveA : r.reserveB;

        amountB = _getAmountOut(amountIn, reserveIn, reserveOut);
        if (amountB < minAmountB) revert InsufficientOutputAmount();

        // Pull tokenA from user
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn), "transferFrom failed");
        // Send tokenB to recipient
        require(IERC20(tokenB).transfer(to, amountB), "transfer failed");

        // Update reserves
        if (flipped) {
            r.reserveB += amountIn; // tokenA is B side when flipped
            r.reserveA -= amountB;
        } else {
            r.reserveA += amountIn;
            r.reserveB -= amountB;
        }

        emit SwapPrivate(msg.sender, tokenA, tokenB, encryptedAmountA, amountB, block.timestamp);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        bytes calldata encryptedAmountA,
        bytes calldata encryptedAmountB,
        address to
    ) external returns (uint256 liquidity) {
        (Reserves storage r, bool flipped) = _getReserves(tokenA, tokenB);
        uint256 amtA = _decodeAmount(encryptedAmountA);
        uint256 amtB = _decodeAmount(encryptedAmountB);

        // Pull tokens
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amtA), "transferFrom A failed");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amtB), "transferFrom B failed");

        // Update reserves in canonical order
        if (flipped) {
            r.reserveB += amtA;
            r.reserveA += amtB;
        } else {
            r.reserveA += amtA;
            r.reserveB += amtB;
        }

        // MVP: define liquidity token amount as min proportional (not minting LP tokens here)
        liquidity = amtA + amtB;
        emit LiquidityAdded(to, tokenA, tokenB, encryptedAmountA, encryptedAmountB, liquidity);
    }
}
