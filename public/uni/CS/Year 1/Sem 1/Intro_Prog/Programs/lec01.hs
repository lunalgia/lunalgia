sort :: [Int] -> [Int]
sort []     = [] 
sort (x:xs) =   sort [y | y <- xs, y <= x] ++ 
                            [x] ++ 
                sort [y | y <- xs, y > x]

isSorted :: [Int] -> Bool 
isSorted [] = True 
isSorted [x] = True 
isSorted (x:y:ys) = x <= y && isSorted (y:ys) 

factorial :: Integer -> Integer 
factorial 0 = 1
factorial n = n * factorial (n-1)

ping :: Integer -> Integer
ping = fst . go where 
    go :: Integer -> (Integer, Integer)
    go 0 = (0,1)
    go n = (b, a+b) where
        (a,b) = go (n-1)

primes :: [Integer]
primes = go [2..] where 
    go (p:xs) = p:go [x | x <- xs, x `mod` p /= 0]