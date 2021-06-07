pragma solidity 0.8.0;

import "./External/Interfaces/INonfungiblePositionManager.sol";
import "./External/IUniV3DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./PriceFetcher.sol";

contract UniAddLiquidity is IUniV3DataTypes, PriceFetcher {
    using SafeERC20 for IERC20;

    INonfungiblePositionManager public router;
    uint256 public currentPositionID;

    event createNewRangeOrder(
        int24 lowerTick,
        int24 upperTick,
        address token0,
        address token1
    );

    // all tx's will go through the router to begin with.
    // later if we want to optimize, we can just interact
    // directly with the pool
    constructor(address uniV3router) {
        router = INonfungiblePositionManager(uniV3router);
    }

    // helper function to round a number up by up to one half of a percentage point
    function roundUpE16(uint256 num) public pure returns (uint256) {
        if (num % 1e18 >= 5e16) {
            num += 1e16 - (num % 1e16);
        }
        return num;
    }

    function validateTickDiff(int24 lowerTick, int24 upperTick) public pure returns (bool) {
        uint256 lowerPrice = getActualPriceFromTick(lowerTick);
        uint256 upperPrice = getActualPriceFromTick(upperTick);
        // if the lower price is not greater than the upper price, return
        if (lowerPrice < upperPrice) return false;

        uint256 averagePrice = (lowerPrice + upperPrice) / 2;
        uint256 priceDiff = (lowerPrice - upperPrice);
        // if there is no difference in price between lower and upper tick, return
        if (priceDiff == 0) return false;

        // multiply price diff by 1e18 to add some numbers so division doesn't bring us to 0
        // then, after math is complete, round up to the nearest 1e16 so we can tell if price
        // is close enough for us to validate it
        uint256 pricePercentDiff = roundUpE16((priceDiff * 1e18) / averagePrice);

        // return whether or not the upper and lower ticks are within a 10-11% range
        return pricePercentDiff >= 1e17 && pricePercentDiff <= 11e16;
    }

    function validateTickDiffUint(int24 lowerTick, int24 upperTick) public pure returns (uint256) {
        uint256 lowerPrice = getActualPriceFromTick(lowerTick);
        uint256 upperPrice = getActualPriceFromTick(upperTick);

        uint256 averagePrice = (lowerPrice + upperPrice) / 2;
        uint256 priceDiff = (lowerPrice - upperPrice);

        uint256 pricePercentDiff = roundUpE16((priceDiff * 1e18) / averagePrice);

        // return whether or not the tick is above 10% over current price
        return pricePercentDiff;
    }

    function createInitialPosition(MintParams calldata params) external {
        // both tokens must be valid addresses
        require(
            params.token0 != address(0) && params.token1 != address(0),
            "INVALID POOL"
        );

        // you must add both tokens on initial position creation
        require(
            params.amount0Min != 0 && params.amount1Min != 0,
            "INVALID AMT"
        );

        IERC20(params.token0).safeTransferFrom(msg.sender, address(this), params.amount0Desired);
        IERC20(params.token1).safeTransferFrom(msg.sender, address(this), params.amount1Desired);

        // approve the router to spend caller's tokens
        IERC20(params.token0).approve(address(router), params.amount0Desired);
        IERC20(params.token1).approve(address(router), params.amount1Desired);

        // assign current position id to this NFT that we just minted
        (currentPositionID, , , ) = router.mint(
            MintParams({
                deadline: params.deadline,
                token0: params.token0,
                token1: params.token1,
                fee: params.fee,
                recipient: address(this),
                tickLower: params.tickLower,
                tickUpper: params.tickUpper,
                amount0Desired: params.amount0Desired,
                amount1Desired: params.amount1Desired,
                amount0Min: params.amount0Min,
                amount1Min: params.amount1Min
            })
        );        

        // refund any excess tokens not used by the pool if there are any
        uint256 balance0 = IERC20(params.token0).balanceOf(address(this));
        if (balance0 > 0) IERC20(params.token1).safeTransfer(msg.sender, balance0);

        uint256 balance1 = IERC20(params.token1).balanceOf(address(this));
        if (balance1 > 0) IERC20(params.token1).safeTransfer(msg.sender, balance1);

        emit createNewRangeOrder(
            params.tickLower,
            params.tickUpper,
            params.token0,
            params.token1
        );
    }
}
