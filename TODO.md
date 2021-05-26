# Todo List

How to find lower tick to place range order:
1. calculate how much eth it will cost to buy 1 FEI at 80 cents with current eth price.
2. Normalize for decimal difference as eth is 18 and USDC is 6. Multiply by 1e12.
3. get sqrt of this number using uniswap's math library
4. bit shift left by 96 bits
5. get tick from SQRT using uniswap's math library