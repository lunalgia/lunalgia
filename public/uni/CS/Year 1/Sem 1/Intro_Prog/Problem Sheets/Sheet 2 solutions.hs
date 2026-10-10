-- Recursion Practice Problem Set
-- All functions must be implemented using recursion (no built‑in iteration).
-- Use only Integer (no Int), no lists, only tuples where necessary.
-- No imports

------------------------------------------------------------------------
-- 1. Factorial of a non‑negative integer.
--    Compute n! = 1 × 2 × … × n.
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n-1)

-- 2. Power: raise x to the n‑th power (n ≥ 0).
--    Compute xⁿ using only multiplication and recursion.
power :: Integer -> Integer -> Integer
power x 0 = 1
power x n = x * power x (n-1)

-- 3. Sum of digits of a non‑negative integer.
--    e.g., sumDigits 123 = 6.
sumDigits :: Integer -> Integer
sumDigits 0 = 0
sumDigits n = let (m,d) = n `divMod` 10
    in d + sumDigits m

-- 4. Product of digits (non‑negative integer).
--    e.g., productDigits 234 = 24.
productDigits :: Integer -> Integer
productDigits 0 = 1
productDigits n = let (m,d) = n `divMod` 10
    in d * productDigits m

-- 5. Sum of integers from a to b (inclusive), assuming a ≤ b.
sumRange :: Integer -> Integer -> Integer
sumRange a b
    | a == b = a
    | a <  b = b + sumRange a (b-1)

-- 6. Count the number of digits in a non‑negative integer.
--    e.g., countDigits 0 = 1, countDigits 123 = 3.
countDigits :: Integer -> Integer
countDigits n | n < 10 = 1
countDigits n = let m = n `div` 10
    in 1 + countDigits m

-- 7. Check if a non‑negative integer is even.
--    Use only recursion (no `mod`, `even`, or division).
isEven :: Integer -> Bool
isEven 0 = True
isEven 1 = False
isEven n = isEven (n-2)

-- 8. Compute the nth triangular number: T(n) = 1 + 2 + … + n.
triangular :: Integer -> Integer
triangular 0 = 0
triangular n = n + triangular (n-1)

-- 9. Fibonacci number (naïve double recursion).
--    Define fib(0) = 0, fib(1) = 1, and for n>1 use the sum of the two previous.
fib :: Integer -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n-1) + fib (n-2)

-- 10. Binomial coefficient C(n,k) using Pascal's rule.
--     C(n,k) counts the number of ways to choose k items from n.
binom :: Integer -> Integer -> Integer
binom n 0 = 1
binom 0 r = 0
binom n r = binom (n-1) (r-1) + binom (n-1) r

-- 11. Convert a number from one base to another.
--     Given n (written in base b1) and target base b2 (2 ≤ b1,b2 ≤ 10),
--     return the representation of the same value in base b2 as an Integer
--     whose decimal digits are the digits of the new representation.
--     e.g., baseConvert 123 4 8 = 33   (because 123₄ = 27₁₀ = 33₈)
baseConvert :: Integer -> Integer -> Integer -> Integer
baseConvert 0 _ _  = 0
baseConvert n b 10 = let (m,d) = n `divMod` 10 
    in ( baseConvert m b 10 ) * b + d
baseConvert n 10 b = let (m,d) = n `divMod` b 
    in ( baseConvert m 10 b ) * 10 + d
baseConvert n b1 b2 = baseConvert (baseConvert n b1 10) 10 b2

-- 13. Power tower of height n with base n.
--     Compute n^(n^(…^n)) where the tower has n occurrences of n.
--     This function grows extremely fast using only multiplication and recursion.
powTow :: Integer -> Integer
powTow n = baseCount n n where
    baseCount x 0 = 1
    baseCount x n = power x (baseCount x (n-1))

-- 14. Sum of two integers using only increment and decrement operations.
--     (No use of +, only successor and predecessor.)
addRec :: Integer -> Integer -> Integer
addRec 0 m = m
addRec n m = succ $ addRec (pred n) m

-- 15. Multiply two integers using only addition and recursion.
--     Assume non‑negative inputs.
mulRec :: Integer -> Integer -> Integer
mulRec 0 m = 0
mulRec n m = addRec m $ mulRec (pred n) m

-- 16. Apply a function n times to an initial value.
--     e.g., iterate' 3 succ 0 = 3.
iterate' :: Integer -> (Integer -> Integer) -> Integer -> Integer
iterate' 0 f = id
iterate' n f = f . iterate' (n-1) f

-- 17. Repeatedly apply a function until a condition holds.
--     Given f and p, keep applying f while p is false,
--     return the first value satisfying p. (Assume termination.)
until' :: (Integer -> Bool) -> (Integer -> Integer) -> Integer -> Integer
until' stop f n = if stop n then n else until' stop f (f n)

tests :: Bool
tests = all snd
  [ -- 1. factorial
    ("factorial 0",  factorial 0  == 1)
  , ("factorial 1",  factorial 1  == 1)
  , ("factorial 5",  factorial 5  == 120)
  , ("factorial 10", factorial 10 == 3628800)
  , ("factorial 20", factorial 20 == 2432902008176640000)

    -- 2. power
  , ("power 2 0",  power 2 0  == 1)
  , ("power 0 0",  power 0 0  == 1)
  , ("power 0 5",  power 0 5  == 0)
  , ("power 5 1",  power 5 1  == 5)
  , ("power 3 4",  power 3 4  == 81)
  , ("power 2 10", power 2 10 == 1024)

    -- 3. sumDigits
  , ("sumDigits 0",    sumDigits 0    == 0)
  , ("sumDigits 7",    sumDigits 7    == 7)
  , ("sumDigits 123",  sumDigits 123  == 6)
  , ("sumDigits 1000", sumDigits 1000 == 1)
  , ("sumDigits 9999", sumDigits 9999 == 36)

    -- 4. productDigits
  , ("productDigits 5",   productDigits 5   == 5)
  , ("productDigits 234", productDigits 234 == 24)
  , ("productDigits 101", productDigits 101 == 0)
  , ("productDigits 999", productDigits 999 == 729)
  -- , ("productDigits 0", productDigits 0 == 0)  -- only if you change the base case

    -- 5. sumRange
  , ("sumRange 5 5",      sumRange 5 5      == 5)
  , ("sumRange 1 10",     sumRange 1 10     == 55)
  , ("sumRange 3 6",      sumRange 3 6      == 18)
  , ("sumRange 0 4",      sumRange 0 4      == 10)
  , ("sumRange (-2) 2",   sumRange (-2) 2   == 0)

    -- 6. countDigits
  , ("countDigits 0",       countDigits 0       == 1)
  , ("countDigits 9",       countDigits 9       == 1)
  , ("countDigits 10",      countDigits 10      == 2)
  , ("countDigits 123",     countDigits 123     == 3)
  , ("countDigits 1000000", countDigits 1000000 == 7)

    -- 7. isEven
  , ("isEven 0",   isEven 0   == True)
  , ("isEven 1",   isEven 1   == False)
  , ("isEven 2",   isEven 2   == True)
  , ("isEven 7",   isEven 7   == False)
  , ("isEven 100", isEven 100 == True)

    -- 8. triangular
  , ("triangular 0",   triangular 0   == 0)
  , ("triangular 1",   triangular 1   == 1)
  , ("triangular 4",   triangular 4   == 10)
  , ("triangular 10",  triangular 10  == 55)
  , ("triangular 100", triangular 100 == 5050)

    -- 9. fib
  , ("fib 0",  fib 0  == 0)
  , ("fib 1",  fib 1  == 1)
  , ("fib 2",  fib 2  == 1)
  , ("fib 10", fib 10 == 55)
  , ("fib 20", fib 20 == 6765)

    -- 10. binom
  , ("binom 5 0",  binom 5 0  == 1)
  , ("binom 5 5",  binom 5 5  == 1)
  , ("binom 0 0",  binom 0 0  == 1)
  , ("binom 5 2",  binom 5 2  == 10)
  , ("binom 6 3",  binom 6 3  == 20)
  , ("binom 10 4", binom 10 4 == 210)
  , ("binom 3 5",  binom 3 5  == 0)

    -- 11. baseConvert
  , ("baseConvert 123 4 8",  baseConvert 123 4 8  == 33)
  , ("baseConvert 0 4 8",    baseConvert 0 4 8    == 0)
  , ("baseConvert 5 10 2",   baseConvert 5 10 2   == 101)
  , ("baseConvert 101 2 10", baseConvert 101 2 10 == 5)
  , ("baseConvert 33 8 4",   baseConvert 33 8 4   == 123)
  , ("baseConvert 255 10 8", baseConvert 255 10 8 == 377)
  , ("baseConvert 1010 2 8", baseConvert 1010 2 8 == 12)
  , ("baseConvert 123 4 4",  baseConvert 123 4 4  == 123)
  , ("baseConvert 12 3 2",   baseConvert 12 3 2   == 101)

    -- 13. powTow  (don't test 4: astronomically large)
  , ("powTow 0", powTow 0 == 1)
  , ("powTow 1", powTow 1 == 1)
  , ("powTow 2", powTow 2 == 4)
  , ("powTow 3", powTow 3 == 7625597484987)

    -- 14. addRec
  , ("addRec 0 5",   addRec 0 5   == 5)
  , ("addRec 5 0",   addRec 5 0   == 5)
  , ("addRec 3 4",   addRec 3 4   == 7)
  , ("addRec 10 10", addRec 10 10 == 20)

    -- 15. mulRec
  , ("mulRec 0 5",   mulRec 0 5   == 0)
  , ("mulRec 5 0",   mulRec 5 0   == 0)
  , ("mulRec 7 1",   mulRec 7 1   == 7)
  , ("mulRec 3 4",   mulRec 3 4   == 12)
  , ("mulRec 12 12", mulRec 12 12 == 144)

    -- 16. iterate'
  , ("iterate' 0 succ 5",        iterate' 0 succ 5          == 5)
  , ("iterate' 3 succ 0",        iterate' 3 succ 0          == 3)
  , ("iterate' 4 (*2) 1",        iterate' 4 (*2) 1          == 16)
  , ("iterate' 5 (+10) 0",       iterate' 5 (+10) 0         == 50)
  , ("iterate' 3 square 2",      iterate' 3 (\x -> x*x) 2   == 256)

    -- 17. until'
  , ("until' (>100) (*2) 1",  until' (>100) (*2) 1  == 128)
  , ("until' (>=10) succ 0",  until' (>=10) succ 0  == 10)
  , ("until' even (+1) 3",    until' even (+1) 3    == 4)
  , ("until' even (+1) 8",    until' even (+1) 8    == 8)
  , ("until' collatz 27",     until' (==1) (\x -> if even x then x `div` 2 else 3*x+1) 27 == 1)
  ]