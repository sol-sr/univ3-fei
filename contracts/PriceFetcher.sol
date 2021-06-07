pragma solidity 0.8.0;

import "./External/Interfaces/IUniswapV3PoolState.sol";
import "./External/Univ3Libs/TickMath.sol";

contract PriceFetcher {

    // hex: FFFFFFFFFFFFFFFFFFFFFFFF
    // binary: 111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
    uint256 constant first96bits = 79228162514264337593543950335;

    // hex: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000
    // binary 1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    uint256 constant afterFirst96bits = 115792089237316195423570985008687907853269984665640544696644470173846334341120;

    function _convertX96toUINT256(uint256 sqrtPriceX96) internal pure returns (uint256) {
        // if there is a fraction, don't completely remove it
        if (sqrtPriceX96 & first96bits > 0) {
            // if there was a decimal value, keep the first 18 bits of precision
            // this is to ensure the later shift doesn't
            // push off all of the decimal bits if they exist
            uint256 decimalsToSave = 48;
            sqrtPriceX96 >>= 96 - decimalsToSave;
            return (sqrtPriceX96 * sqrtPriceX96 * 1e18) >> (decimalsToSave * 2);
        } else {
            // push off the first 96 decimals, we don't need them
            sqrtPriceX96 >>= 96;
            return (sqrtPriceX96 * sqrtPriceX96 * 1e18);
        }
    }

    function getPrice(address _pool) public view returns (uint256) {
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3PoolState(_pool).slot0();
        uint256 price = _convertX96toUINT256(uint256(sqrtPriceX96));
        return price;
    }

    function getTickFromPool(address _pool) public view returns (int24) {
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = IUniswapV3PoolState(_pool).slot0();
        return tick;
    }

    function tickFromSqrtRatio(uint160 sqrtPriceX96) public pure returns (int24 tick) {
        return TickMath.getTickAtSqrtRatio(sqrtPriceX96);
    }

    function getX96PriceFromTick(int24 tick) public pure returns(uint256) {
        return uint256(TickMath.getSqrtRatioAtTick(tick));
    }

    function getActualPriceFromTick(int24 tick) public pure returns(uint256) {
        return _convertX96toUINT256(
            getX96PriceFromTick(tick)
        );
    }    
}
