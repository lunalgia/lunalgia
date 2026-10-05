myList :: [Integer]
myList = [1,2,3]

addOne, addTwo :: [Int] -> [Int]
addOne l = if null l then [] 
            else head l + 1 : addOne (tail l)

addTwo l = if null l then [] else 
            let x:xs = l in x+2 : addTwo xs 
    
myLength :: [a] -> Int 
myLength l = if null l then 0 else let _:xs = l in 1 + myLength xs 

len :: [a] -> Int 
len []      = 0 
len (_:xs)  = 1 + len xs 

addAtEnd :: a -> [a] -> [a]
addAtEnd y []       = [y]
addAtEnd y (x:xs)   = x: addAtEnd y xs 

attach :: [a] -> [a] -> [a]
attach []       xs = xs 
attach (y:ys)   xs = attach ys (addAtEnd y xs)

attach' :: [a] -> [a] -> [a]
attach' []      ys = ys 
attach' (x:xs)  ys = x: attach' xs ys 

at :: [a] -> Int -> a 
at _ n | n < 0 
        = error "Nagative index!"
at [] _ = error "Index too large!"
at (x:xs) 0 = x
at (x:xs) n = xs `at` (n-1)
            
rev1 :: [a] -> [a] 
rev1 [] = [] 
rev1 (x:xs) = rev1 xs ++ [x]

fastRev :: [a] -> [a]
fastRev = revInto [] where 
    revInto acc [] = acc 
    revInto acc (x:xs) = revInto (x:acc) xs 

{- 
rev :: [a] -> [a]
rev [] = [] 
rev (x:xs) = rev xs ++ [x]
revInto :: [a] -> [a] -> [a]
revInto acc xs = rev xs ++ acc 

1. revInto acc [] = rev [] ++ acc = acc 
2.    revInto acc (x:xs) 
    = rev (x:xs) ++ acc 
    = (rev xs ++ [x]) ++ acc 
    = rev xs ++ ([x] ++ acc)
    = rev xs ++ x:acc 
    = revInto (x:acc) xs

rev xs = rev xs ++ [] = revInto [] xs 

-} 

myTake :: Int -> [a] -> [a] 
myTake _ []     = []
myTake n _ | n <= 0 
                = [] 
myTake n (x:xs) = x: myTake (n-1) xs

myDrop :: Int -> [a] -> [a] 
myDrop _ []     = []
myDrop n l | n <= 0 
                = l 
myDrop n (x:xs) = myDrop (n-1) xs

primes :: [Integer]
primes = go [2..] where 
    go (p:xs) = p: go [y | y <- xs, y `mod` p /= 0]

splat :: Int -> [a] -> ([a],[a])
splat _ []          = ([], [])
splat n l | n <= 0  = ([], l)
splat n (x:xs)      = let (f,b) = splat (n-1) xs in (x:f, b)
-- splat n (x:xs)      = (x: fst (splat (n-1) xs), snd (splat (n-1) xs)