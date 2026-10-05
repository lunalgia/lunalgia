import Mathlib
set_option linter.flexible false

open List

inductive pal {α : Type} : List α → Prop
  | nil : pal []
  | sing : ∀ (x : α), pal [x]
  | sandwich : ∀ (x : α) (l : List α), pal l →
              pal (x :: (l ++ [x]))

theorem pal_lplusrevl {α : Type} : ∀ (l : List α),
  pal (l ++ reverse l) := by
  intro l
  induction l with
  | nil => constructor
  | cons x xs ih =>
    simp[← append_assoc]; constructor; assumption

theorem pal_revl {α : Type} : ∀ (l : List α),
      pal l → pal (reverse l) := by
  intro l hpal
  induction hpal
  all_goals (try simp; try constructor; try assumption)

theorem pal_is_selfrev {α : Type} : ∀ (l : List α),
  pal l → l = reverse l := by
  intro l hpal
  induction hpal
  all_goals (try simp; try assumption)

theorem list_cases {α : Type} : ∀ (l : List α),
  l = [] ∨ (∃x, l = [x]) ∨ (∃ x y m, l = x :: (m ++ [y])) := by
  intro l
  induction l
  · simp
  · rename_i h t ih
    rcases ih with (g | ⟨x',g⟩ | ⟨x',y',m',g⟩)
    · right; left; exists h; simp [g]
    · right; right; exists h, x', []; simp [g]
    · right; right; exists h, y', x'::m'; simp [g]

theorem len_wf {α : Type} : WellFounded
  (fun (xs ys : List α) ↦ length xs < length ys) := by
  constructor; intro a; constructor
  induction a
  · intro y h; cases h
  · rename_i h t ih; intro z j
    suffices g : z.length < t.length ∨ z.length = t.length
    · rcases g with (g | g)   -- proof using g
      · apply ih; assumption
      · rw [← g] at ih
        constructor; exact ih
    · simp at j; grind        -- deferred proof of g

theorem selfrev_is_pal {α : Type} : ∀ (l : List α), l = reverse l → pal l := by
  intro l
  apply WellFounded.induction (len_wf)
    (C:= fun ys ↦ ys = reverse ys → pal ys)
  intro xs ih g
  rcases list_cases xs with (h | ⟨x, h⟩ | ⟨x, y, m, h⟩)
  · simp [h]; constructor
  · simp [h]; constructor
  · simp [h] at g; rcases g with ⟨g1, g2, g3⟩
    simp [g3] at h; simp [h]
    constructor; apply ih
    · grind
    · assumption

theorem pal_proof {α : Type} : ∀ (l : List α), l = l.reverse -> pal l := by
  intro l
  rcases l with _ | ⟨h, t⟩
  · simp; constructor
  · simp; rcases g : t.reverse with _ | ⟨x, xs⟩
      <;> (simp; intros; simp [*] at *; constructor)
    apply pal_proof xs (by simp[g])
  termination_by l => l.length
  -- decreasing_by grind

def revInto {α : Type} (acc l : List α) : List α :=
  match l with
  | [] => acc
  | x::xs => revInto (x::acc) xs

def fastRev {α : Type} (l : List α) : List α := revInto [] l

lemma rev_revInto {α : Type} : ∀ (acc l : List α),
  revInto acc l = reverse l ++ acc := by
  intro acc l
  rcases l with _ | ⟨h,t⟩ <;> simp [revInto]
  simp [rev_revInto]

theorem fastRev_correct {α : Type} : ∀ (l : List α),
  reverse l = fastRev l := by
  simp [fastRev, rev_revInto]
