const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const utils = require("./../helpers/mathutils");

const UniV3Math = artifacts.require('UniV3Math');
const UniswapV3PoolState = artifacts.require('IUniswapV3PoolState');

// const WETH_FEI_PAIR = '0xDc7B403e2e967EaF6c97d79316D285B8A112fDa7';
const WETH_USDC_PAIR = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';

contract('Price Fetcher', function (accounts) {
  let uniMath;
  let uniswapV3PoolWETH;
  let uniswapV3PoolWETHUSDC;

  before(async function () {
    uniMath = await UniV3Math.new(WETH_USDC_PAIR);
    // uniswapV3PoolWETH = await UniswapV3PoolState.at(WETH_FEI_PAIR);
    uniswapV3PoolWETHUSDC = await UniswapV3PoolState.at(WETH_USDC_PAIR);
  });

  it("Should get percentage correctly", async() => {
      const expectedValue = 80;
      const value = await uniMath.getXPercent(100, 20);

      expect(value.toString()).to.be.equal(expectedValue.toString());
  });

  it("Should be able to get eth price", async() => {
    console.log("eth price from univ3math: ", (await uniMath.getEthPrice()).toString());
  });
    
  it("Should be able to get bottom of range order tick", async() => {
        
    console.log("eth price from univ3math: ",
        (await uniMath.getBottomOfRangeOrderTick()).toString()
    );
  });
});
