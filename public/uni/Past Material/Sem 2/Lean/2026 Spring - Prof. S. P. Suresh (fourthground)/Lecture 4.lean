example {α : Prop} : ¬¬(α ∨ ¬α) :=
  fun h ↦ h (Or.inr (fun g ↦ h (Or.inl g)))

example {α : Prop} : ¬¬(α ∨ ¬α) := by
  intro h
  apply h
  right
  intro g
  apply h
  left
  exact g

example {α : Prop} : ¬(α ↔ ¬α) := by
  rintro ⟨h1, h2⟩
  have h3 : ¬α := by
    intro g
    apply h1 g g
  apply h3 (h2 h3)

example {α : Prop} : ¬(α ↔ ¬α) := fun ⟨h1, h2⟩ ↦
  let h3 := fun g ↦ h1 g g;
  h3 (h2 h3)

example {α β : Prop} : (α → β) → (¬α ∨ β) := by
  intro f
  false_or_by_contra
  rename_i g
  have h : α := by
    false_or_by_contra
    rename_i k
    apply g; left; exact k
  apply g; right; apply f h


example {T : Type} : ∀ (p q : T → Prop),
  (∀ x : T, p x ∧ q x) → ∀ x : T, p x := by
  intro p q allpandq x
  apply And.left
  apply allpandq

example {T : Type} : ∀ (p q : T → Prop),
  (∀ x : T, p x ∧ q x) → ∀ x : T, p x := by
  intro p q allpandq x
  have g : p x ∧ q x := allpandq x
  apply And.left g

example {T : Type} : ∀ (p q : T → Prop),
  (∀ x : T, p x ∧ q x) → ∀ x : T, p x :=
    fun _ _ h x ↦ And.left (h x)

example {T : Type} : ∀ (p q : T → Prop),
  (∃ x : T, p x) ∨ (∃ x: T, q x) → ∃ x : T, p x ∨ q x := by
  intro p q expxorqx
  rcases expxorqx with (⟨x, px⟩  | ⟨x, qx⟩)
  · exact ⟨x, Or.inl px⟩
  · exists x; right; apply qx

example {T : Type} {a : T} : ∀ p : T → Prop,
  ∃ x, p x → ∀ y, p y := by
  intro p
  by_cases h : ∃ x, ¬ p x
  · rcases h with ⟨x, g⟩
    exists x; intro f; exfalso; apply (g f)
  · exists a; intro f; clear f; intro y
    false_or_by_contra; rename_i f
    apply h; exists y

namespace List

inductive myList (α : Type) where
  | nil : myList α
  | cons : α → myList α → myList α
deriving Repr

#eval myList.cons 3 (myList.cons 5 myList.nil)

def myMap {α β : Type} (f : α → β) : myList α → myList β
  | .nil => .nil
  | .cons x xs => .cons (f x) (myMap f xs)

#eval myMap (fun x ↦ x+1) (myList.cons 3 (myList.cons 5 myList.nil))

def myAppend {α : Type} : myList α → myList α → myList α
  | .nil, ys => ys
  | .cons x xs, ys => .cons x (myAppend xs ys)

theorem app_map {α β : Type} : ∀ xs ys : myList α, ∀ f : α → β,
  myMap f (myAppend xs ys) = myAppend (myMap f xs) (myMap f ys) := by
  intro xs ys f
  induction xs with
  | nil => simp [myMap, myAppend]
  | cons x xs ih => simp [myMap, myAppend, ih]
end List
