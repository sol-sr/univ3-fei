# Todo List

How to find lower tick to place range order:
1. calculate how much eth it will cost to buy 1 FEI.
2. multiply by 1e18
3. get sqrt of this number using uniswap's math library
4. bit shift left by 96 bits
5. get tick from SQRT using uniswap's math library