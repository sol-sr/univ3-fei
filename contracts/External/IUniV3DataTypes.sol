pragma solidity 0.8.0;


// separate out data structures and interfaces so that you don't have to implement
// interface, but still get the data structure
interface IUniV3DataTypes {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }
}
