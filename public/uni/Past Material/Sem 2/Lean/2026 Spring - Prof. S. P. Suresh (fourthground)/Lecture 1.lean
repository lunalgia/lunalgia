def m : Nat := 1
def n : Nat := 0
def b1 := true
def b2 := false

#check b1
#eval b1
#check m + n
#check b1 || b2

#eval 5*2

#check (-1)

#check true
#check Bool
#check (-5)
#check Int
#check Type
#check Type 0
#check Nat
#check Float
#check Prop
#check 0+0 = 1
def nonsense := 0+0 = 1
#check nonsense
def sense := 0+1 = 1
#check sense

theorem nonsensical_proof : nonsense := by sorry

theorem sensible_proof : sense := by simp [sense]

#check Nat
#check Nat → Nat
#check Nat × Nat
#check Prod Nat Bool
#check Prod
#check @Prod
#check List
#check @List

#check nonsensical_proof

#check (5,9)
#eval (5,9).fst
#eval (5,9).1

#check Nat → Nat
#check Nat → (Nat → Nat)
#check (Nat → Nat) → Nat

def double (x : Nat) := x + x
#eval double 5
#eval double (double (3+8))

def add := λ x y : Nat ↦ x + y
#check add
#check @add 3

section ListExample
variable {α : Type}

def append (xs ys : List α) :=
  match xs with
  | [] => ys
  | x::xs => x:: append xs ys

def append' : List α → List α → List α
  | [],     ys => ys
  | x::xs,  ys => x::append' xs ys

def reverse : List α → List α
  | []      => []
  | x::xs   => append (reverse xs) [x]

def revInto : List α → List α → List α
  | [],     acc => acc
  | x::xs,  acc => revInto xs (x::acc)

def fastRev (xs : List α) := revInto xs []

#eval fastRev [1,2,3]
#eval revInto [1,2,3] (List.range' 11 20)

theorem append_append : ∀ (xs ys zs: List α),
  append (append xs ys) zs = append xs (append ys zs) := by
  intro xs ys zs
  induction xs with
  | nil => simp [append]
  | cons x xs ih => simp [append, ih]

theorem revInto_rev : ∀ (xs acc : List α),
  revInto xs acc = append (reverse xs) acc:= by
  intros xs acc
  induction xs generalizing acc with
  | nil => simp [reverse, revInto, append]
  | cons x xs ih => simp [revInto, reverse, append_append, append, ih]

theorem append_nil : ∀ xs : List α, append xs [] = xs := by
  intro xs
  induction xs with
  | nil => simp [append]
  | cons x xs ih => simp [append, ih]

theorem fastRev_correct : ∀ xs : List α,
  reverse xs = fastRev xs := by
  intro xs
  simp [fastRev, revInto_rev, append_nil]



end ListExample
