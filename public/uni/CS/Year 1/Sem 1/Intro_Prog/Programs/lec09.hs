import Data.Char ( ord, chr, isSpace, toUpper )

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


wc1, wc :: String -> Int 
wc1 "" = 0 
wc1 (c:cs) = if isSpace c then 1 + wc1 cs else wc1 cs

wc str = go $ ' ':str where 
    go [c]      = 0
    go (c:d:ds) = if isSpace c && not (isSpace d) then 1 + go (d:ds) else go (d:ds)

type Complex = (Double, Double)
re, im :: Complex -> Double 
re = fst 
im = snd 

modulus :: Complex -> Double
modulus (r,i) = sqrt (r*r + i*i) 

conjugate :: Complex -> Complex 
conjugate (r,i) = (r, -i)

recipC :: Complex -> Complex 
recipC (0,0) = error "Zero does not have an inverse"
recipC (r,i) = (r'/m, i'/m) where 
    m       = r*r + i*i 
    (r',i') = conjugate (r,i)

addC, mulC, subC, divC:: Complex -> Complex -> Complex
addC (r1,i1) (r2,i2) = (r1+r2, i1+i2)
subC (r1,i1) (r2,i2) = (r1-r2, i1-i2)
mulC (r1,i1) (r2,i2) = (r1 * r2 - i1 * i2, r1 * i2 + i1 * r2)
-- divC (r1,i1) (r2,i2) = mulC (r1,i1) (recipC (r2,i2))
divC (r1,i1) = mulC (r1,i1) . recipC 

swap :: Either a b -> Either b a 
swap (Left x) = Right x 
swap (Right y) = Left y

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


