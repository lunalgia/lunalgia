-- Question 1
getMiddle :: [a] -> Maybe a
getMiddle l
    | even (length l) = Nothing
    | otherwise = Just (l !! (length l `div` 2))

-- Question 2
isPal :: String -> Bool
isPal s = s == reverse s

-- Question 3
runs :: (a -> a -> Bool) -> [a] -> [[a]]
runs p [] = []
runs p (x:xs) = l1 : runs p (drop (length(l1)) (x:xs)) where
        l1 = takeFrom x xs where
        takeFrom x [] = [x]
        takeFrom x (y:ys)
                | p x y = x : takeFrom y ys
                | otherwise = [x]

-- Question 4
sortWords :: [String] -> [String]
sortWords [] = []
sortWords (x:xs) = insertWord x (sortWords xs) where
        insertWord x [] = [x]
        insertWord x (y:ys)
                | x < y = x : y : ys
                | otherwise = y : insertWord x ys

-- Question 5a
isMatrix :: [[Int]] -> Bool
isMatrix l = foldr (&&) True (map (== length (head l)) (map length l))

-- Question 5b
myTranspose :: [[Int]] -> [[Int]]
myTranspose [] = []
myTranspose l = transposeInto l [] (col - 1) where
                col = length (head (l))
                transposeInto l acc n
                        | l == [] = []
                        | n == -1 = acc
                        | otherwise = transposeInto l ((rowFrom n l) : acc) (n-1) where
                                rowFrom i [] = []
                                rowFrom i (x:xs) = (x!!i) : rowFrom i xs

--- col i is easy to build. So. row i [] = []. x !! i : col i xs. So. to build transpose. uhm. We need to go through length.
