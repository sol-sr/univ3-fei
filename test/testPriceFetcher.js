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
        // we have to divide by 1000 because our x96rootToSquareNum
        // function isn't able to chop off the last three 0's
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
      priceFromUni.substring(0, priceFromUni.length - 6)
    ).to.be.equal(
      priceFromPriceFetcher.substring(0, priceFromPriceFetcher.length - 9)
    );
  });

  it("is able to get the current tick of USDC/FEI/ETH on uniswap V3", async() => {
    // let priceFromPriceFetcher = (await priceFetcher.getTickFromPool(WETH_USDC_PAIR)).toString();
    // console.log("priceFromPriceFetcher tick usdc/weth: ", priceFromPriceFetcher);

    let priceFromPriceFetcher = await utils.getSQRTPriceX96(uniswapV3PoolWETH);
    console.log("fei/weth price X96: ", priceFromPriceFetcher.toString());

    priceFromPriceFetcher = (await priceFetcher.getTickFromPool(WETH_FEI_PAIR)).toString();
    console.log("tick from pool: ", priceFromPriceFetcher)
    priceFromPriceFetcher = await priceFetcher.getX96PriceFromTick(Number(priceFromPriceFetcher.toString()));
    console.log("priceFromPriceFetcher tick fei/weth: ", priceFromPriceFetcher);
  });

  it("is able to get the current price of USDC/FEI/ETH on uniswap V3", async() => {
    let priceFromPriceFetcher = (await priceFetcher.getPrice(WETH_USDC_PAIR)).toString();
    // console.log("priceFromPriceFetcher price usdc/weth: ", priceFromPriceFetcher);

    priceFromPriceFetcher = (await priceFetcher.getPrice(WETH_FEI_PAIR)).toString();
    // console.log("priceFromPriceFetcher price fei/weth: ", priceFromPriceFetcher);
  });

  it("is able to get the current x96 square root price of USDC/FEI/ETH on uniswap V3", async() => {
    let priceFromPriceFetcher = await utils.getSQRTPriceX96(uniswapV3PoolWETHUSDC);
    console.log("priceFromPriceFetcher price usdc/weth: ", priceFromPriceFetcher.toString());

    priceFromPriceFetcher = await utils.getSQRTPriceX96(uniswapV3PoolWETH);
    console.log("priceFromPriceFetcher price fei/weth: ", priceFromPriceFetcher.toString());
  });

  it("tick proof getSQRTPriceX96 to getX96PriceFromTick", async() => {
    let priceFromPriceFetcher = await utils.getSQRTPriceX96(uniswapV3PoolWETHUSDC);
    priceFromPriceFetcher = await priceFetcher.getX96PriceFromTick(priceFromPriceFetcher.toString);

    console.log("usdc/weth price X96: ", priceFromPriceFetcher.toString());
  });
});