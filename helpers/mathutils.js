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

function x96ToDecimal(number) {
    return number.div(new bn(2).pow(96)).toString();
}

module.exports = {
    x96ToDecimal: x96ToDecimal,
    getSQRTPriceX96: getSQRTPriceX96,
    x96rootToSquareNum: x96rootToSquareNum,
}
