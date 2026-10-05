import Data.Char ( toUpper )

daksh :: [Either Int Char] -> [Either Char Int]
-- daksh []                = [] 
-- daksh (Left x:rest)     = Right (9-x): daksh rest 
-- daksh (Right c:rest)    = Left (toUpper c) : daksh rest 
daksh = map f where 
    f (Left x) = Right (9-x)
    f (Right c) = Left (toUpper c)

juan :: [Either Int Char] -> [Either Int Char]
-- juan [] = []
-- juan (Left x:rest)      = Left x: juan rest 
-- juan (Right _ : rest)   = juan rest
juan = filter p where 
    p :: Either Int Char -> Bool 
    p (Left _)  = True 
    p (Right _) = False 


chandan :: [Int] -> [Int]
chandan [] = [] 
chandan (x:xs) = if x >= 0 then x: chandan xs else chandan xs 

tw, dw :: (a -> Bool) -> [a] -> [a]
tw p []     = [] 
tw p (x:xs) = if p x then x:tw p xs else []

dw p []     = [] 
dw p (x:xs) = if p x then dw p xs else x:xs 

isSorted :: [Int] -> Bool
isSorted [] = True 
isSorted (x:xs) = and $ zipWith (<) (x:xs) xs

combine :: (Int -> Int -> Int) -> Int -> [Int] -> Int 
combine f v []      = v
combine f v (x:xs)  = f x (combine f v xs)

allEvens :: [Int] -> Bool 
allEvens = foldr (\x b -> even x && b) True