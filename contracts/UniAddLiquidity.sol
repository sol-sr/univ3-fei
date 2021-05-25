pragma solidity 0.8.0;

import "./External/Interfaces/INonfungiblePositionManager.sol";
import "./External/IUniV3DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniAddLiquidity is IUniV3DataTypes {
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
    // optimizing this, we can just interact directly with the pool
    constructor(address uniV3router) {
        router = INonfungiblePositionManager(uniV3router);
    }

    function createInitialPosition(MintParams calldata params) external {
        // both tokens must be valid addresses
        require(
            params.token0 != address(0) && params.token1 == address(0),
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
