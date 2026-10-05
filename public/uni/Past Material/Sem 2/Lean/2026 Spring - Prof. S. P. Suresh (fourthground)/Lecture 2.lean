import Mathlib

section ListExample
variable {α : Type}

def append : List α → List α → List α
  | [],     ys => ys
  | x::xs,  ys => x::append xs ys

def reverse : List α → List α
  | []      => []
  | x::xs   => append (reverse xs) [x]

def revInto : List α → List α → List α
  | [],     acc => acc
  | x::xs,  acc => revInto xs (x::acc)

def fastRev (xs : List α) := revInto xs []

theorem append_assoc : forall xs ys zs : List α,
  append (append xs ys) zs = append xs (append ys zs) := by
  intro xs ys zs
  induction xs with
  | nil  => simp [append]
  | cons x xs ih => simp [append, ih]

lemma revInto_rev : forall xs acc : List α,
  revInto xs acc = append (reverse xs) acc := by
  intro xs acc
  induction xs generalizing acc with
  | nil => simp [revInto, reverse, append]
  | cons x xs ih => simp [revInto, reverse]
                    simp [append_assoc, append, ih]

lemma append_nil : ∀ xs : List α, append xs [] = xs := by
  intro xs
  induction xs with
  | nil => simp [append]
  | cons x xs ih => simp [append, ih]

theorem fastRev_correct :
∀ xs : List α, reverse xs = fastRev xs := by
  intro xs
  simp [fastRev, revInto_rev, append_nil]

end ListExample

inductive AExp : Type where
  | num : ℤ → AExp
  | var : String → AExp
  | add : AExp → AExp → AExp
  | sub : AExp → AExp → AExp
  | mul : AExp → AExp → AExp
  | div : AExp → AExp → AExp

def eval (env : String → ℤ) : AExp → ℤ
| .num i => i
| .var s => env s
| .add e1 e2 => eval env e1 + eval env e2
| .sub e1 e2 => eval env e1 - eval env e2
| .mul e1 e2 => eval env e1 * eval env e2
| .div e1 e2 => eval env e1 / eval env e2

-- Logical reasoning, backward proofs

example {p : Prop} : p ∧ p → p := by
  intro h
  rcases h with ⟨h1, h2⟩
  assumption

example {α β : Prop} : α ∧ β → β ∧ α := by
  intro hab
  apply And.intro
  · exact hab.right
  · exact hab.left

example {α β : Prop} : α ∧ β → β ∧ α := by
  intro hab
  constructor
  · exact hab.right
  · exact hab.left
