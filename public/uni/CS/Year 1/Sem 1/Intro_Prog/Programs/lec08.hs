import Data.Char ( ord, chr )

myList :: [Integer]
myList = [1,2,3]

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

eft :: Int -> Int -> [Int]
eft l u | l > u     = [] 
eft l u             = l : eft (l+1) u 

sqrEvens :: [Int]
sqrEvens = [x^2 | x <- [0..97], even x]

triples :: [(Int, Int, Int)]
triples = [(x,y,z) | x <- [1..100], y <- [(x+1)..100], z <- [1..100], x^2 + y^2 == z^2]


upCase :: Char -> Char
upCase c    = if 'a' <= c && c <= 'z' then chr (ord c + offset) else c where 
    offset  = ord 'A' - ord 'a' 

occurs :: Char -> String -> Bool
occurs _ ""     = False 
occurs c (d:ds) = c == d || occurs c ds 

upCases :: String -> String 
upCases ""      = "" 
upCases (c:cs)  = upCase c : upCases cs 

-- position c s will give the first position of c in s, or length s if c is not in s.
position :: Char -> String -> Int 
position _ ""       = 0
position c (d:ds)   = if c == d then 0 else 1 + position c ds 

pos :: Char -> String -> Maybe Int 
pos _ ""        = Nothing 
pos c (d:ds)    = if c == d 
                then Just 0 
                else case pos c ds of 
                Nothing -> Nothing 
                Just x  -> Just (x+1)
                    
f :: Char -> String
f c = case pos c "Pradyumn" of 
            Nothing -> "The character is not in Pradyumn"
            Just x -> "It occurs in position " ++ show x 
