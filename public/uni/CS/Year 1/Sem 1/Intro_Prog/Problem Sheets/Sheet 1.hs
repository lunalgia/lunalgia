-- No imports should be required

------------------------------------------------------------------------
-- Section 1
------------------------------------------------------------------------

-- 1. Identity function on Integers.
id' :: Integer -> Integer
id' = undefined

-- 2. Project first element of a pair of Integers.
fst' :: (Integer, Integer) -> Integer
fst' = undefined

-- 3. Project second element of a pair of Integers.
snd' :: (Integer, Integer) -> Integer
snd' = undefined

-- 4. Integer 1-digit adder.
-- Add two single-digit integers (0-9). 
-- (Assume both inputs are in the range (0-9).)
-- The first component should have the unit digit of the answer,
-- and the second component should be the carry-over amount
addDigit :: Integer -> Integer -> ( Integer , Integer )
addDigit = undefined


------------------------------------------------------------------------
-- Section 2
------------------------------------------------------------------------

-- 6. Maximum of two Integers.
max' :: Integer -> Integer -> Integer
max' = undefined

-- 7. Minimum of two Integers.
min' :: Integer -> Integer -> Integer
min' = undefined

-- 8. Vector addition: add two 2D vectors component-wise.
-- Vector represented as (x, y).
vecAdd :: (Integer, Integer) -> (Integer, Integer) -> (Integer, Integer)
vecAdd = undefined

-- 9. Scalar multiplication: multiply a 2D vector by a scalar.
scalarMul :: Integer -> (Integer, Integer) -> (Integer, Integer)
scalarMul = undefined


------------------------------------------------------------------------
-- Section 3
------------------------------------------------------------------------

-- 10. Matrix addition (2×2 matrices represented as two rows).
matAdd :: ((Integer, Integer), (Integer, Integer))
       -> ((Integer, Integer), (Integer, Integer))
       -> ((Integer, Integer), (Integer, Integer))
matAdd = undefined

-- 11. Matrix transpose (swap rows and columns).
transpose :: ((Integer, Integer), (Integer, Integer))
          -> ((Integer, Integer), (Integer, Integer))
transpose = undefined


------------------------------------------------------------------------
-- Section 4
------------------------------------------------------------------------

-- 12. Matrix multiplication (2×2).
matMul :: ((Integer, Integer), (Integer, Integer))
       -> ((Integer, Integer), (Integer, Integer))
       -> ((Integer, Integer), (Integer, Integer))
matMul = undefined


------------------------------------------------------------------------
-- Section 5
------------------------------------------------------------------------

-- 13. Pair combinator (was called "fork").
-- Given two functions f :: Integer -> Integer and g :: Integer -> Integer,
-- produce a function that takes an Integer x and returns (f x, g x).
pair :: (Integer -> Integer) -> (Integer -> Integer) 
    -> ( Integer -> (Integer, Integer) )
pair = undefined


------------------------------------------------------------------------
-- Section 6
------------------------------------------------------------------------

-- 5. Recall the bijection between A^(B x C) and (A^B)^C
-- Given the following function,
myFunc :: (Integer, Integer) -> Integer --  A^(B x C) where A = B = C = Integer
myFunc (x,y) = x*x*y + y*(x*x+1) - 120*(y - x*y)
-- there must be a corresponding function
corrFunc :: Integer -> ( Integer -> Integer ) --  (A^B)^C where A = B = C = Integer
corrFunc = undefined

-- 14. Bijection between Integer and (Integer, Integer)
-- Define a bijection (one-to-one and onto) between integers and pairs of integers.
-- That is, give functions toPair :: Integer -> (Integer, Integer)
-- and fromPair :: (Integer, Integer) -> Integer such that they are inverses.

toPair :: Integer -> (Integer, Integer)
toPair = undefined

fromPair :: (Integer, Integer) -> Integer
fromPair = undefined

test =
  and
    [ -- id'
      id' 0 == 0
    , id' 1 == 1
    , id' (-10) == (-10)
    , id' 42 == 42

      -- fst'
    , fst' (1, 2) == 1
    , fst' (-5, 10) == (-5)

      -- snd'
    , snd' (1, 2) == 2
    , snd' (-5, 10) == 10

      -- addDigit
    , addDigit 0 0 == (0, 0)
    , addDigit 3 4 == (7, 0)
    , addDigit 9 9 == (8, 1)
    , addDigit 5 7 == (2, 1)

      -- max'
    , max' 3 5 == 5
    , max' 10 2 == 10
    , max' (-3) (-7) == (-3)
    , max' 4 4 == 4

      -- min'
    , min' 3 5 == 3
    , min' 10 2 == 2
    , min' (-3) (-7) == (-7)
    , min' 4 4 == 4

      -- vecAdd
    , vecAdd (1, 2) (3, 4) == (4, 6)
    , vecAdd (-1, 5) (2, -3) == (1, 2)
    , vecAdd (0, 0) (7, -2) == (7, -2)

      -- scalarMul
    , scalarMul 2 (3, 4) == (6, 8)
    , scalarMul (-3) (2, -5) == (-6, 15)
    , scalarMul 0 (100, 200) == (0, 0)

      -- matAdd
    , matAdd ((1,2),(3,4)) ((5,6),(7,8))
        == ((6,8),(10,12))
    , matAdd ((0,0),(0,0)) ((1,2),(3,4))
        == ((1,2),(3,4))

      -- transpose
    , transpose ((1,2),(3,4)) == ((1,3),(2,4))
    , transpose ((5,6),(7,8)) == ((5,7),(6,8))

      -- matMul
    , matMul ((1,2),(3,4)) ((5,6),(7,8))
        == ((19,22),(43,50))
    , matMul ((1,0),(0,1)) ((3,4),(5,6))
        == ((3,4),(5,6))
    , matMul ((0,0),(0,0)) ((1,2),(3,4))
        == ((0,0),(0,0))

      -- pair
    , pair (+1) (*2) 5 == (6,10)
    , pair (\x -> x*x) (\x -> x+10) 3 == (9,13)

      -- corrFunc
    , corrFunc 2 3 == myFunc (2,3)
    , corrFunc 0 5 == myFunc (0,5)
    , corrFunc (-2) 4 == myFunc (-2,4)

      -- toPair / fromPair: inverse-property tests
    , fromPair (toPair 0) == 0
    , fromPair (toPair 1) == 1
    , fromPair (toPair (-1)) == (-1)
    , fromPair (toPair 10) == 10
    , fromPair (toPair (-10)) == (-10)
    , toPair (fromPair (3,4)) == (3,4)
    , toPair (fromPair (-2,5)) == (-2,5)
    ]