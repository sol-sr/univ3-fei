const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const utils = require("./../helpers/mathutils");

const UniAddLiquidity = artifacts.require('UniAddLiquidity');
const MAINNET_UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

contract('Uni add liquidity', function (accounts) {
  let uniAddLiquidity;

  before(async function () {
    uniAddLiquidity = await UniAddLiquidity.new(MAINNET_UNISWAP_ROUTER);
  });

  async function debugTicks(upperTick, lowerTick) {
    console.log("lower tick actual price: ", (await uniAddLiquidity.getActualPriceFromTick(lowerTick)).toString());
    console.log("upper tick actual price: ", (await uniAddLiquidity.getActualPriceFromTick(upperTick)).toString());
  }
  
  
  describe("Should be able to validateTickDiff", () => {
      
    it("when ticks are within 10% of each other", async() => {
        // lower tick represents price with reserve0 at 110 and reserve1 at 1
        const lowerTick = 47008;
        // upper tick represents price with reserve0 at 100 and reserve1 at 1
        const upperTick = 46055;

        let value = await uniAddLiquidity.validateTickDiff(lowerTick, upperTick);
        expect(value).to.be.true;
    });

    it("when ticks are within 20% of each other", async() => {
        // lower tick represents price with reserve0 at 110 and reserve1 at 1
        const lowerTick = 47008;
        // upper tick represents price with reserve0 at 90 and reserve1 at 1
        const upperTick = 45001;

        let value = await uniAddLiquidity.validateTickDiff(lowerTick, upperTick);
        expect(value).to.be.false;
    });

    it("when ticks are within 15% of each other", async() => {
        // lower tick represents price with reserve0 at 110 and reserve1 at 1
        const lowerTick = 47008;
        // upper tick represents price with reserve0 at 95 and reserve1 at 1
        const upperTick = 45542;

        let value = await uniAddLiquidity.validateTickDiff(lowerTick, upperTick);
        expect(value).to.be.false;
    });
    
    it("when ticks are within 12% of each other", async() => {
        // lower tick represents price with reserve0 at 110 and reserve1 at 1
        const lowerTick = 47008;
        // upper tick represents price with reserve0 at 98 and reserve1 at 1
        const upperTick = 45852;

        let value = await uniAddLiquidity.validateTickDiff(lowerTick, upperTick);
        expect(value).to.be.false;
    });
  })
});
