sqr :: Int -> Int 
sqr x = x * x 

xor1 :: Bool -> Bool -> Bool
xor1 b1 b2 = b1 && not b2 || not b1 && b2 

xor2 :: Bool -> Bool -> Bool
xor2 b1 b2 = if b1 == b2 then False else True 

xor3 :: Bool -> Bool -> Bool
xor3 b1 b2 = if b1 /= b2 then True else False

xor4 :: Bool -> Bool -> Bool
xor4 b1 b2 = b1 /= b2 

xor5 :: Bool -> Bool -> Bool 
xor5 b1 b2 = (/=) b1 b2 

xor6 :: Bool -> Bool -> Bool
xor6 = (/=)

xor7 :: Bool -> Bool -> Bool 
xor7 False False = False 
xor7 False True = True 
xor7 True False = True 
xor7 True True = False 

xor8 :: Bool -> Bool -> Bool 
xor8 False True     = True 
xor8 True False     = True 
xor8 b1 b2          = False 

xor9 :: Bool -> Bool -> Bool
xor9 False b    = b 
xor9 b False    = b
xor9 b1 b2      = False 

xor10 :: Bool -> Bool -> Bool 
xor10 False b = b
xor10 True b = not b 

xor11 :: Bool -> Bool -> Bool
xor11 False True    = True 
xor11 True False    = True 
xor11 _ _           = False 

tern :: Int -> Int 
tern x 
    | x < 0     = -1 
    | x == 0    = 0 
    | x > 0     = 1
{-
>>> xor8 False True 
True
-}

xor12 :: Bool -> Bool -> Bool 
xor12 b1 b2 
    | b1 == b2 = False 
    | b1 /= b2 = True 

xor13 :: Bool -> Bool -> Bool
xor13 False b = b
xor13 True b 
    | b     = False
    | not b = True 

xor14 :: Bool -> Bool -> Bool 
xor14 b1 b2 
    | b1        = not b2 
    | not b2    = b1

xor15 :: Bool -> Bool -> Bool 
xor15 b1 b2 
    | b1        = not b2 
    | otherwise = b2 

xor16 :: Bool -> Bool -> Bool 
xor16 b1 b2 = case b1 of {False -> b2; True -> not b2} 

xor17 :: Bool -> Bool -> Bool 
xor17 b1 b2 = case b1 of 
    False -> case b2 of {False -> False; True -> True}
    True -> not b2 

myEven :: Int -> Bool 
myEven x = case (x `mod` 2) of 
    0 -> True 
    1 -> False 

-- True -> not b2 
-- f (x,y) =   {   False       if x == y
--             {   True        otherwise  

higherOrder :: (Int -> Int) -> Int 
higherOrder f = f 0 

fac :: Integer -> Integer
fac 0 = 1
fac n = if n >= 0 
    then n * fac (n-1) 
    else error "Works only for non-negative values"