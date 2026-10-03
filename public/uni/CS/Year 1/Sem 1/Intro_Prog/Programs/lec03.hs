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
