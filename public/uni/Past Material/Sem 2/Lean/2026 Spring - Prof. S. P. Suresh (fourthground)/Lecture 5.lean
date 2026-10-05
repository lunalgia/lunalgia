import Mathlib
set_option linter.flexible false

namespace bst

inductive btree where
  | nil : btree
  | node : btree → ℕ → btree → btree

-- def insert (a : ℕ) : btree → btree
--   | .nil => .node .nil a .nil
--   | t@(.node tl x tr) => match a < x with
--     | true => .node (insert a tl) x tr
--     | false => match a > x with
--       | true => .node tl x (insert a tr)
--       | false => t

def insert (a : ℕ) : btree → btree
  | .nil => .node .nil a .nil
  | t@(.node tl x tr) =>
    if a < x then .node (insert a tl) x tr
    else if a > x then .node tl x (insert a tr)
    else t

#print insert.eq_1
#print insert.eq_2

theorem insert_cases : ∀ (a x : ℕ) (tl tr : btree),
  (a < x ∧ insert a (.node tl x tr) = .node (insert a tl) x tr) ∨
  (a > x ∧ insert a (.node tl x tr) = .node tl x (insert a tr)) ∨
  (a = x ∧ insert a (.node tl x tr) = .node tl x tr) := by
    intro a x tl tr
    have j : a < x ∨ a > x ∨ a = x := by grind
    rcases j with (j | j | j)
    · simp [j, insert]
    · right; left; simp[j, insert]; grind
    · right; right; simp [j, insert]

def intree (n : ℕ) : btree → Prop
  | .nil => False
  | .node tl x tr => intree n tl ∨ x = n ∨ intree n tr

theorem intree_insert : ∀ (t : btree) (n a : ℕ),
  intree n (insert a t) → intree n t ∨ n = a := by
  intro t n a h
  induction t
  · right; simp[insert, intree] at h; grind
  · rename_i tl x tr ihl ihr
    rcases insert_cases a x tl tr with (⟨g,j⟩ | ⟨g,j⟩ | ⟨g,j⟩)
    · simp[j] at h
      rcases h with (h | h | h)
      · apply ihl at h
        rcases h with (h | h)
        · left; left; assumption
        · right; assumption
      · left; right; left; assumption
      · left; right; right; assumption
    · simp [j] at h
      rcases h with (h | h | h)
      · left; left; assumption
      · left; right; left; assumption
      · apply ihr at h
        rcases h with (h | h)
        · left; right; right; assumption
        · right; assumption
    · simp [j] at h; left; assumption

inductive is_bst : btree → Prop
  | nilbst : is_bst .nil
  | nodebst : ∀ (tl tr : btree) (x : ℕ),
      is_bst tl → is_bst tr →
      (∀ n, intree n tl → n < x) →
      (∀ n, intree n tr → n > x) →
      is_bst (.node tl x tr)

theorem insert_bst_is_bst : ∀ (t : btree) (a : ℕ),
  is_bst t → is_bst (insert a t) := by
  intro t a ht
  induction ht
  · simp[insert]; constructor
    · constructor
    · constructor
    · simp[intree]
    · simp[intree]
  · rename_i tl tr x htl htr tlltx trgtx ihtl ihtr
    rcases insert_cases a x tl tr with (⟨g,j⟩ | ⟨g,j⟩ | ⟨g,j⟩) <;> simp [j]
    · constructor
      · assumption
      · assumption
      · intro n h; apply intree_insert at h
        rcases h with (h | h) <;> grind
      · grind
    · constructor
      · assumption
      · assumption
      · assumption
      · intro n h; apply intree_insert at h
        rcases h with (h | h) <;> grind
    · constructor <;> assumption

end bst
