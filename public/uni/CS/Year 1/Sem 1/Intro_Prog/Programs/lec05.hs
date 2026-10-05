factorial :: Integer -> Integer 
factorial n 
    | n == 0    = 1 
    | n > 0     = n * factorial (n-1)
    | otherwise = n * factorial (n+1) 

myGcd :: Int -> Int -> Int 
myGcd a b 
    | a < 0 || b < 0    = myGcd (abs a) (abs b) 
    | a == 0 && b == 0  = error "One of the numbers has to be non-zero" 
    | b == 0            = a 
    | otherwise         = myGcd b (a `mod` b)

isPowerOfEleven :: Integer -> Bool 
isPowerOfEleven n 
    | n <= 0        = False 
    | n == 1        = True 
    | otherwise     = n `mod` 11 == 0 && isPowerOfEleven (n `div` 11)

-- smallestDiv n is the smallest divisor of n which is >= 2.
smallestDiv :: Integer -> Integer           
smallestDiv n = divSearch 2 where 
    -- divSearch d is the smallest divisor of n which is >= d.
    divSearch :: Integer -> Integer 
    divSearch d = if n `mod` d == 0 then d else divSearch (d+1)

smallestDiv' :: Integer -> Integer           
smallestDiv' n = let divSearch d = if n `mod` d == 0 then d else divSearch (d+1) 
            in divSearch 2

intLength :: Integer -> Integer 
intLength n 
    | n < 0     = error "Does not work for negative inputs!"
    | n < 10    = 1
    | otherwise = 1 + intLength (n `div` 10)

intReverse :: Integer -> Integer 
intReverse n 
    | n < 0     = error "Does not work for negative inputs!"
    | n < 10    = n 
    | otherwise = intReverse q + r * 10^(intLength q) where 
    q           = n `div` 10
    r           = n `mod` 10 

intRev :: Integer -> Integer 
intRev n 
    | n < 0     = error "Does not work for negative inputs!"
    | otherwise = go 0 n where 
    go acc x    = if x == 0 then acc else go (10*acc + x `mod` 10) (x `div` 10)
