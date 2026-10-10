{-# OPTIONS_GHC -Wno-missing-methods #-}

-- No imports should be required.
-- You can find the laws that a typeclass is required to follow
-- by searching the name of the typeclass on Hoogle.

------------------------------------------------------------------------
-- Problem 1: 2x2 integer matrices as a Num instance
------------------------------------------------------------------------
-- A 2x2 matrix is represented here as `Mat a b c d`, meaning
--
--     | a b |
--     | c d |
--
-- Make this type an instance of Num, using ordinary matrix arithmetic:
--
--   (+) as matrix addition
--   (*) as matrix multiplication
--
-- Do NOT define abs or signum (they have no sensible meaning here)

data Matrix = Mat Integer Integer Integer Integer

instance Num Matrix where
  (+)         = undefined
  (*)         = undefined
  negate      = undefined

  -- Integer n maps to (nI), where I is the identity matrix
  fromInteger = undefined


------------------------------------------------------------------------
-- Problem 2: Complex numbers as Num and Fractional
------------------------------------------------------------------------
-- A complex number a + ib is stored as 'Complex a b'.

data Complex = Complex Double Double
  deriving (Eq, Show)

-- Num: 
--   (+), (*)       standard complex arithmetic
--   abs z          |z|

-- Do NOT define signum for the Num instance below

instance Num Complex where
  (+)         = undefined
  (*)         = undefined
  negate      = undefined
  abs         = undefined
  fromInteger = undefined

-- Dividing by zero may produce NaN/Infinity parts (as Double does);
-- no special handling is required.

instance Fractional Complex where
    recip = undefined


------------------------------------------------------------------------
-- Problem 3: Reduced row echelon form
------------------------------------------------------------------------
-- Given a matrix as a list of rows, return its reduced row echelon form.
--
-- Assume every row has the same length. The empty matrix and matrices
-- with empty rows should be returned unchanged. Use only Eq and
-- Fractional, so it works for Rational (exact) as well as Double.

rref :: (Eq a, Fractional a) => [[a]] -> [[a]]
rref = undefined
