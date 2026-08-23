sqr :: Int -> Int 
sqr x = x * x 

xorp :: (Bool,Bool) -> Bool 
xorp (b1,b2) = b1 && not b2 || b2 && not b1 

xorm :: Bool -> Bool -> Bool
xorm b1 b2 = b1 && not b2 || b2 && not b1  

isOrdered :: Int -> Int -> Int -> Bool 
isOrdered x y z = x <= y && y <= z

