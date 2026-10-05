import Mathlib
set_option linter.flexible false
set_option linter.style.commandStart false

open List

def sub2 : ℕ → ℕ
  | 0 => 0
  | 1 => 0
  | x+2 => x

def zipWith {α β γ : Type} (f : α → β → γ) : List α → List β → List γ
  | [], _ => []
  | _, [] => []
  | x::xs, y::ys => f x y :: zipWith f xs ys

def fib : ℕ → ℕ
  | 0 => 0
  | 1 => 1
  | n+2 => fib (n+1) + fib n

def fibFast (n : ℕ) : ℕ :=
  let rec loop : ℕ → ℕ × ℕ
    | 0 => (0,1)
    | n+1 => let (p,q) := loop n; (q, p+q)
  (loop n).1

lemma fib_is_fibFast : ∀ n : ℕ, fib n = fibFast n := by
  suffices fibLoop : ∀ n : ℕ, fibFast.loop n = (fib n, fib (n+1))
  · intro n; simp[fibFast, fibLoop]
  · intro n; induction n <;> try simp[fib, fibFast.loop]
    grind


variable (α : Sort u)
variable (r : α → α → Prop)

#check (Acc r)
#print Acc
#check (WellFounded r)
#print WellFounded

theorem div_lemma {x y : ℕ} : 0 < y ∧ y ≤ x → x-y < x := by grind
def div.F (x : ℕ) (f : (x1 : ℕ) → (x1 < x) → ℕ → ℕ) (y : ℕ) :=
  if h : 0 < y ∧ y ≤ x then
    f (x-y) (div_lemma h) y + 1
  else 0

#check WellFounded.fix

noncomputable def div := WellFounded.fix (measure id).wf div.F

def div' : ℕ → ℕ → ℕ := fun x y ↦
  if 0 < y ∧ y ≤ x
  then div' (x-y) y + 1
  else 0
  termination_by x _ => x
  decreasing_by grind

def mc (b n : ℕ) : ℕ :=
  match b with
  | 0 => if n ≤ 100 then 0 else n - 10
  | b+1 => if n ≤ 100 then mc b (mc b (n+11)) else n - 10

def mccarthy (n : ℕ) : ℕ := mc 101 n

#eval mccarthy 200
#eval mccarthy 100
#eval mccarthy 0

theorem mcminus10 : ∀ ( b n : ℕ), n > 100 → mc b n = n - 10 := by
  rintro (_ | b) <;> intro n h <;>
    unfold mc <;> rw [if_neg (by grind)]

theorem mc91 : ∀ ( b n : ℕ), 101 ≤ b + n → n ≤ 100 → mc b n = 91 := by
  intro b; induction b <;> intro n h g <;> unfold mc <;> try grind
  rename_i b ih
  by_cases f : n < 90
  · rw [if_pos (by apply g), ih (n+11) (by grind)]
    · simp [ih 91 (by grind)]
    · grind
  · rw [if_pos (by apply g), mcminus10 b (n+11) (by grind)]; simp
    by_cases d : n = 100
    · simp [d, mcminus10 b 101 (by grind)]
    · apply ih (n+1) <;> grind

theorem mccarthy91 : ∀ (n : ℕ),
  (n > 100 → mccarthy n = n-10) ∧ (n ≤ 100 → mccarthy n = 91) := by
  unfold mccarthy; intro n; constructor
  · apply mcminus10
  · apply mc91; grind

def mc' (n : ℕ) : Option ℕ :=
  if n > 100 then pure (n-10) else mc' (n+11) >>= mc'
  partial_fixpoint

theorem mc'minus10 : ∀ (n : ℕ), n > 100 → mc' n = some (n-10) := by
    intro n h; unfold mc'; rw [if_pos (by grind)]; simp

theorem mc'91 : ∀ (n : ℕ), n ≤ 100 → mc' n = some 91 := by
    intro n h; unfold mc'
    rw [if_neg (by grind)]
    by_cases f : n < 90
    · simp [mc'91 (n+11) (by grind)]
      apply mc'91 91; grind
    · unfold mc'; rw [if_pos (by grind)]; simp
      by_cases d : n = 100
      · simp [d]
        rw [mc'minus10 101 (by grind)]
      · apply mc'91 (n+1); grind
-- termination_by n => 100-n
-- It does not work if we try to combine the above two
-- statements into one (a conjunction of two implications).
-- Find out why and try to see how to properly combine.

theorem mc'_spec : ∀ (n : ℕ),
  mc' n = some (if n > 100 then n-10 else 91) := by
  intro n
  by_cases h : n > 100
  · rw [if_pos (by grind)]
    apply mc'minus10; grind
  · rw [if_neg (by grind)]
    apply mc'91; grind

theorem mc'_total : ∀ (n : ℕ), (mc' n).isSome := by
  intro n'; simp [mc'_spec]

def mccarthy' (n :ℕ) : ℕ := (mc' n).get (mc'_total n)

theorem mccarthy'_spec : ∀ (n : ℕ),
  mccarthy' n = if n > 100 then n-10 else 91 := by
  intro n; simp [mccarthy', mc'_spec]

def takewhile {α : Type} (p : α → Bool) (as :Array α) : Array α :=
    go 0 #[] where
    go (i : ℕ) (r : Array α) : Array α :=
        if h : i < as.size then
            let a := as[i]
            if p a then go (i+1) (r.push a) else r
        else r
-- termination_by as.size - i
-- decreasing_by grind

inductive Vect (α : Type u) : ℕ → Type u
| nil : Vect α 0
| cons : α → {n : ℕ} → Vect α n → Vect α (n+1)

#check Vect.casesOn
