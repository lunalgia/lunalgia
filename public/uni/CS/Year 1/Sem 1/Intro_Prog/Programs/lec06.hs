import Data.Bits (Bits(xor))
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

at :: [a] -> Int -> a
at [] _ = error "Empty list!"
at (x:xs) 0 = x
at (x:xs) n = xs `at` (n-1)
