import Mathlib

def foo := let a := ℕ; fun x : a ↦ x + 2

section temp
open List

#check cons
#check @cons
#check cons ℕ
#check @cons ℕ

end temp

set_option linter.unusedVariables false

theorem t1 {p q : Prop} : p → q → q := fun hp hq => hq

theorem t2 {p q : Prop} : p → q → p := fun hp hq ↦ hp
theorem t2' (p q : Prop) : p → q → p := fun hp hq ↦ hp
theorem t2'' : ∀ p q : Prop, p → q → p := fun _ _ hp hq ↦ hp


axiom hp {p} : p

theorem t3 {p q : Prop} : q → p := t2 hp
theorem t3' {p q : Prop} : q → p := t2' p q hp
theorem t3'' {p q : Prop} : q → p := t2'' _ _ hp

#print t3
#print t3''

theorem t4 : ∀ p q : Prop, q → p := by
  -- intro p q
  -- exact t2'' p q hp
intro p q hq; exact hp

axiom unsound : False

theorem nonsense : 0 = 1 :=
  False.elim unsound

theorem nonsense' : 1 = 0 := by
  exfalso
  exact unsound

variable {p q r : Prop}
example : p → q → p ∧ q :=
  fun hp hq ↦ ⟨hp, hq⟩

example : p ∧ q → p :=
  -- fun hpq ↦ hpq.left
  fun hpq ↦ And.left hpq

example : p ∧ q → q ∧ p :=
  fun hpq ↦ ⟨hpq.right,hpq.left⟩

/-
Given f :: p -> r and g : q -> r, here is a function of type
Either p q -> r in Haskell

h z = case z of
  Left x -> f x
  Right y -> g y
-/

example : p → p ∨ q :=
  fun hp ↦ Or.inl hp
-- This is like saying Left x, which produces a value of type Either p q, from x which is of type p.

example : q → p ∨ q :=
  fun hq ↦ Or.inr hq

example : p ∨ q → q ∨ p := fun h ↦
  -- Or.elim h (fun hp ↦ Or.inr hp) (fun hq ↦ Or.inl hq)
  Or.elim h Or.inr Or.inl

example : (p → q) → ¬q → ¬p := fun hpq hnq hp ↦ hnq (hpq hp)

example : p → ¬p → q := fun hp hnp ↦ (hnp hp).elim

#check Classical.em p

example {α : Prop} : ¬¬(α ∨ ¬α) :=
fun h ↦ h (Or.inr (fun g ↦ h (Or.inl g)))

example {α : Prop} : ¬¬(α ∨ ¬α) := by
  intro h; apply h; right; intro g; apply h; left; exact g
