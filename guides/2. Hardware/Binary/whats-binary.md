# What's Binary
[Binary](binary) is a **number system** that uses only **two digits**: 0 and 1. Each digit in binary is called a bit.

Denary (also called decimal) is the [number system](number) you are more familiar with. It is *base 10**.

Binary is **base 2**.

Each digit in binary represents a **power of 2**

**Subscript** can be used **to indicate** the **base** of a **number**. For example, 101<sub>10</sub> is **denary** and has a **denary value** 101. 101<sub>2</sub> is **binary** and has a **denary value** of 5.

## Convert from binary to denary
To convert for example, the number 00101010<sub>2</sub> to denary, you can do it like this:

Write the **powers of 2** above each digit like this:

| 2<sup>7</sup> | 2<sup>6</sup> | 2<sup>5</sup> | 2<sup>4</sup> | 2<sup>3</sup> | 2<sup>2</sup> | 2<sup>1</sup> | 2<sup>0</sup> |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 1 | 0 | 1 | 0 | 1 | 0 |

Evaluate the powers of 2:

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 1 | 0 | 1 | 0 | 1 | 0 |

Now add the values of the numbers in the top row that have a 1 below them:

32 + 8 + 2 = **42**

## Convert from denary to binary
To convert for example, the number 67<sub>10</sub> to binary, you can do it like this:

Write out the **powers of 2** which are less than or equal to **67**:

64, 32, 16, 8, 4, 2, 1

Now, starting summing the powers of 2 from **largest to smallest**, until you reach **67**, skipping a number if it would make the sum go over 67:

64 + 2 + 1 = **67**

Now, write out the powers of 2 in a table like before, and write a 1 under the powers of 2 that you used, and a 0 under the powers of 2 that you didn't use:

| 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 0 | 0 | 1 | 1 |

That's your result: 67<sub>10</sub> = 1000011<sub>2</sub>

## Adding two binary numbers
To add two binary numbers like 1011<sub>2</sub> + 1101<sub>2</sub>, you do column addition with the following rules:
- 1 + 1 = 10 (write down the 0 and carry the 1 to the next column)
- 0 + 1 = 1
- 1 + 0 = 1
- 0 + 0 = 0

Pretty easy to remember, right?

```
  1011
+ 1101
______
  0110
______
```

Not too difficult. But wait, we carried a one at the end but there wasn't space for it, because we only had 4 bits. This is called an **overflow** error.

This error can happen in the other direction too, in that case it's called an **underflow** error.
