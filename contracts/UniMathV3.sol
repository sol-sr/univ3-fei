pragma solidity 0.8.0;

import "./PriceFetcher.sol";
import "./External/Univ3Libs/Babylonian.sol";
import "./External/Univ3Libs/TickMath.sol";

contract UniV3Math is PriceFetcher {
    address wethUSDCPoolAddress;
    using Babylonian for uint256;

    constructor(address _wethusdc) {
        wethUSDCPoolAddress = _wethusdc;
    }

    function getEthPrice() public view returns (uint256) {
        return getPrice(wethUSDCPoolAddress);
    }

    // this function is to get the price percentage we would need in order to find the price we should
    // be setting the bottom of the range order at. 
    function getXPercent(uint256 num, uint256 percentageDiscount) public pure returns (uint256) {
        // say percentage is 20, this means we should return 80% of the original number
        // we don't need to add a require statement here as it will automatically revert on an underflow
        uint256 actualPercent = 100 - percentageDiscount;
        num *= actualPercent;
        num /= 100;
        return num;
    }

    // this function should return the tick that represents 80 cents in the FEI/ETH pair
    function getBottomOfRangeOrderTick() public view returns(int24) {
        uint256 currentEthPrice = getEthPrice() * 1e12;
        uint256 actualBuyPrice = getXPercent(currentEthPrice, 20);
        uint256 sqrtPrice = actualBuyPrice.sqrt();
        uint256 sqrtPriceX96 = sqrtPrice << 96;

        return TickMath.getTickAtSqrtRatio(uint160(sqrtPriceX96));
    }
}