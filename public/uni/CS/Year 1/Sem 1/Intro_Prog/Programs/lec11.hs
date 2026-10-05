zw :: (a -> b -> c) -> [a] -> [b] -> [c]
zw f xs ys = map (uncurry f) $ zip xs ys

z :: [a] -> [b] -> [(a,b)]
z = zipWith (,) 

len :: [a] -> Integer 
len = foldr (\_ n -> n+1) 0


myHead :: [a] -> a 
myHead = foldr1 const 