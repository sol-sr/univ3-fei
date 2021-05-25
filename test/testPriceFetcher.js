const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const utils = require("./../helpers/mathutils");

const PriceFetcher = artifacts.require('PriceFetcher');
const UniswapV3PoolState = artifacts.require('IUniswapV3PoolState');

const WETH_FEI_PAIR = '0xDc7B403e2e967EaF6c97d79316D285B8A112fDa7';
const USDC_FEI_PAIR = '0x138080a0036e8c2c4c79d21e2a2c535fe0887d68';
const WETH_USDC_PAIR = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';

contract('Price Fetcher', function (accounts) {
  let priceFetcher;
  let uniswapV3PoolUSDC;
  let uniswapV3PoolWETH;
  let uniswapV3PoolWETHUSDC;

  before(async function () {
    priceFetcher = await PriceFetcher.new();
    uniswapV3PoolUSDC = await UniswapV3PoolState.at(USDC_FEI_PAIR);
    uniswapV3PoolWETH = await UniswapV3PoolState.at(WETH_FEI_PAIR);
    uniswapV3PoolWETHUSDC = await UniswapV3PoolState.at(WETH_USDC_PAIR);
  });

  it("FEI/USDC price from uniswap and our contract is the same", async() => {
    let sqrtPrice = await utils.getSQRTPriceX96(uniswapV3PoolUSDC);

    expect(
      utils.x96rootToSquareNum(sqrtPrice).toString()
    ).to.be.equal(
      Math.floor(
        Number(await priceFetcher.getPrice(USDC_FEI_PAIR)) / 1000
      ).toString()
    );
  });

  it("is able to get the current price of FEI denominated in ETH on uniswap V3", async() => {
    let sqrtPrice = await utils.getSQRTPriceX96(uniswapV3PoolWETH);

    expect(
      utils.x96rootToSquareNum(sqrtPrice).toString()
    ).to.be.equal(
      Math.floor(
        Number(await priceFetcher.getPrice(WETH_FEI_PAIR)) / 1000
      ).toString()
    );
  });

  it("is able to get the current price of USDC denominated in ETH on uniswap V3", async() => {
    let sqrtPrice = await utils.getSQRTPriceX96(uniswapV3PoolWETHUSDC);
    let priceFromUni = (utils.x96rootToSquareNum(sqrtPrice)).toString();

    let priceFromPriceFetcher = (await priceFetcher.getPrice(WETH_USDC_PAIR)).toString();
    // compare string values to avoid ambiguity around rounding and numbers in javascript
    expect(
      priceFromUni.substring(0, priceFromUni.length - 5)
    ).to.be.equal(
      priceFromPriceFetcher.substring(0, priceFromPriceFetcher.length - 8)
    );
  });

  // it("is able to get the sqrt of from FEI/ETH pool on uniswap V3", async() => {
  //   // divide this price by 18 and it tells you how much eth you will pay for fei at current prices.
  //   let sqrtPrice = await utils.getSQRTPriceX96(uniswapV3PoolWETH);
  //   console.log("sqrt price: ",
  //     utils.x96rootToSquareNum(sqrtPrice).toString()
  //   );
  // });

  // it("is able to get the sqrt of price from FEI/USDC pool on uniswap V3", async() => {
  //   // divide this price by 18 and it tells you how much eth you will pay for fei at current prices.
  //   let sqrtPrice = await utils.getSQRTPriceX96(uniswapV3PoolUSDC);
  //   console.log("sqrt price: ",
  //     utils.x96rootToSquareNum(sqrtPrice).toString()
  //   );
  // });

  // it("is able to get the sqrt of price from FEI/USDC pool on uniswap V3", async() => {
  //   // divide this price by 18 and it tells you how much eth you will pay for fei at current prices.
  //   let tick = await utils.getTick(uniswapV3PoolWETHUSDC);
  //   console.log("tick eth fei: ",
  //     tick.toString()
  //   );
  // });
});