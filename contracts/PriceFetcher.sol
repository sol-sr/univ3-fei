pragma solidity 0.8.0;

import "./External/Interfaces/IUniswapV3PoolState.sol";

contract PriceFetcher {
   function _convertX96toUINT256(uint160 sqrtPriceX96) internal pure returns (uint256) {
        return (
            (uint256(sqrtPriceX96) * uint256(sqrtPriceX96*1e18)) >> (96*2)
        );
    }

    function getPrice(address _pool) external view returns (uint256) {
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3PoolState(_pool).slot0();
        uint256 price = _convertX96toUINT256(sqrtPriceX96);
        return price;
    }
}
