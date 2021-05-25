const { BN } = require('@openzeppelin/test-helpers');

// helper functions for uniswap v3 math

function x96rootToSquareNum(num) {
    return ( // unfortunately, we cannot multiply out by 1e18, we can only do 1e15 otherwise we overflow
      num.mul(num).mul(new BN(1000000000000000))
    ).iushrn(96*2);
}

async function getSQRTPriceX96(fn) {
    return new BN(
      (await fn.slot0()).sqrtPriceX96
    );
}

async function getTick(fn) {
    return new BN(
      (await fn.slot0()).tick
    );
}

function x96ToDecimal(number) {
    return number.div(new bn(2).pow(96)).toString();
}

// // math courtsey of uniswap v3 sdk, ty
// function getTick(priceSqrt) {
//     return new BN(Math.log(Math.pow(priceSqrt, 2)).toString())
//       .div(new BN(Math.log(1.0001).toString()))
//       .integerValue(0)
//       .toString()
// }

module.exports = {
    x96ToDecimal: x96ToDecimal,
    getSQRTPriceX96: getSQRTPriceX96,
    x96rootToSquareNum: x96rootToSquareNum,
    getTick: getTick,
}
