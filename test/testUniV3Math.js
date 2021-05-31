const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const utils = require("./../helpers/mathutils");

const UniV3Math = artifacts.require('UniV3Math');
const UniswapV3PoolState = artifacts.require('IUniswapV3PoolState');

const WETH_USDC_PAIR = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';
const WETH_FEI_PAIR = '0xDc7B403e2e967EaF6c97d79316D285B8A112fDa7';

contract('Price Fetcher', function (accounts) {
  let uniMath;
  let uniswapV3PoolWETHUSDC;

  before(async function () {
    uniMath = await UniV3Math.new(WETH_USDC_PAIR);
    uniswapV3PoolWETHUSDC = await UniswapV3PoolState.at(WETH_USDC_PAIR);
    uniswapV3PoolWETH = await UniswapV3PoolState.at(WETH_FEI_PAIR);
  });

  it("Should get percentage correctly", async() => {
    const expectedValue = 80;
    const value = await uniMath.getXPercent(100, 20);

    expect(value.toString()).to.be.equal(expectedValue.toString());
  });

  it("Should iterate and get all percentages correctly from 1 to 99", async() => {
    for (let i = 1; i < 100; i++) {
      const expectedValue = 100 - i;
      const value = await uniMath.getXPercent(100, i);
      expect(value.toString()).to.be.equal(expectedValue.toString());
    }
  });

  it("Should be able to get eth price", async() => {
    console.log("eth price from univ3math: ", (await uniMath.getEthPrice()).toString());
  });

  it("Should be able to get tick of fei/weth and usdc/weth", async() => {
    console.log("current eth/fei tick: ",
      (await uniswapV3PoolWETH.slot0()).tick.toString()
    );

    console.log("current eth/usdc tick: ",
      (await uniswapV3PoolWETHUSDC.slot0()).tick.toString()
    );
  });

   /* 
  it("Should be able to get bottom of range order tick", async() => {
    console.log("current usdc/weth price: ", 
      (await uniMath.getEthPrice()).toString()
    );

    console.log("current fei/weth price: ", 
      (await uniMath.getPrice(WETH_FEI_PAIR)).toString()
    );

    // console.log("current fei/weth sqrt: ", 
    //   (await uniMath.getSqrtFromPrice(
    //     (
    //       await uniMath.getEthPrice()).toString()
    //     )
    //   ).toString()
    // );

    console.log("tick for fei at 80 cents univ3math: ",
      (await uniMath.getBottomOfRangeOrderTick()).toString()
    );

    console.log("tick for fei at 80 cents univ3math converted to price: ",
      (await uniMath.getActualPriceFromTick(
        (await uniMath.getBottomOfRangeOrderTick()).toString() 
      )).toString()
    );

    console.log("price for fei at current tick: ",
      (await uniMath.getActualPriceFromTick(
        -81142
      )).toString()
    );

    // for (let i = 100; i > 0; i--) {
    //   try {
    //     console.log(`current fei price index ${i}: `,
    //       (await uniMath.getBottomOfRangeOrderTickPercentDiff(i)).toString()
    //     );
    //   } catch (error) {}
    // }
    // console.log(`current fei price index `,
    //   (await uniMath.getBottomOfRangeOrderTick()).toString()
    // );
  });
  */
});
