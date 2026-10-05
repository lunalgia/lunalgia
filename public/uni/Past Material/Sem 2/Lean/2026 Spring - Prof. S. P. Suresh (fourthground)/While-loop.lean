import Mathlib
import Lean
-- import Lean.Elab.Tactic

set_option linter.flexible false
set_option linter.style.commandStart false
set_option linter.style.multiGoal false

namespace Hoare

def State : Type := String → ℕ

def State.update (name : String) (val : ℕ) (s : State) : State :=
  fun name' ↦ if name' = name then val else s name'

@[simp] theorem update_apply : ∀ n v s, (State.update n v s) n = v := by
  intros; simp [State.update]

@[simp] theorem update_apply_neq : ∀ n n' v s, n ≠ n' →
                                    (State.update n v s) n' = s n' := by
  intros; simp [State.update]; grind

@[simp] theorem update_override : ∀ n v1 v2 s,
  State.update n v1 (State.update n v2 s) = State.update n v1 s := by
    intro n v1 v2 s; funext; rename_i x
    unfold State.update
    rcases em (x = n) with h | h <;> grind

theorem update_swap : ∀ n1 n2 v1 v2 s, n1 ≠ n2 →
  State.update n2 v2 (State.update n1 v1 s) =
  State.update n1 v1 (State.update n2 v2 s) := by
    intro n1 n2 v1 v2 s hneq; funext; rename_i x
    unfold State.update
    rcases em (x = n1) with h | h <;> try grind

@[simp] theorem update_id : ∀ n s, State.update n (s n) s = s := by
    intro n s; funext; rename_i x; unfold State.update
    rcases em (x = n) with h | h <;> grind

@[simp] theorem update_same_const : ∀ n v, State.update n v (fun _ ↦ v) = (fun _ ↦ v) := by
    intros; funext; simp [State.update]

inductive Stmt : Type where
| skip : Stmt
| assign : String → (State → ℕ) → Stmt
| seq : Stmt → Stmt → Stmt
| ifThenElse : (State → Prop) → Stmt → Stmt → Stmt
| whileDo : (State → Prop) → Stmt → Stmt

local infixr:90 ";; " => Stmt.seq

open Stmt

def sillyLoop : Stmt :=
  whileDo (fun s ↦ s "x" > s "y") (seq skip (assign "x" (fun s ↦ s "x" - 1)))

inductive BigStep : Stmt → State → State → Prop where
  | skip : ∀ s, BigStep skip s s
  | assign : ∀ x a s, BigStep (assign x a) s (State.update x (a s) s)
  | seq : ∀ S T s t u, BigStep S s t → BigStep T t u →
                        BigStep (seq S T)  s u
  | if_true : ∀ B S T s t, B s → BigStep S s t →
                        BigStep (ifThenElse B S T) s t
  | if_false : ∀ B S T s t, ¬ B s → BigStep T s t →
                        BigStep (ifThenElse B S T) s t
  | while_true : ∀ B S s t u, B s → BigStep S s t →
                        BigStep (whileDo B S) t u →
                        BigStep (whileDo B S) s u
  | while_false : ∀ B S s, ¬ B s → BigStep (whileDo B S) s s

-- macro s:term "-["S:term"]->" t:term : term =>
--   `(BigStep $S $s $t)

theorem while_deterministic : ∀ S s l r,
  BigStep S s l → BigStep S s r → l = r := by
  intro S s l r stepl stepr
  induction stepl generalizing r
  · cases stepr; grind
  · cases stepr; grind
  · rename_i S T s t l stepst steptl ihst ihtl
    cases stepr; rename_i w stepsw stepwr; apply ihtl
    have h : t = w := by apply ihst w stepsw
    subst h; assumption
  · cases stepr <;> grind
  · cases stepr <;> grind
  · cases stepr <;> grind
  · cases stepr <;> grind

def PartialHoare (P : State → Prop) (S : Stmt) (Q : State → Prop) : Prop :=
  ∀ s t, P s → BigStep S s t → Q t

macro "{*" P:term " *} " "(" S:term ")" " {* " Q:term " *}" : term =>
  `(PartialHoare $P $S $Q)

theorem skip_intro {P} : {* P *} (skip) {* P *} := by
  unfold PartialHoare; intro s t ps stepst
  cases stepst; assumption

theorem assign_intro {P x a} :
  {* fun s ↦ P (State.update x (a s) s) *} (assign x a) {* P *} := by
  unfold PartialHoare; intro s t pxas stepst
  cases stepst; assumption

theorem seq_intro {P Q R S T} : {* P *} (S) {* Q *} →
                                {* Q *} (T) {* R *} →  {* P *} (seq S T) {* R *} := by
  unfold PartialHoare; intro ih1 ih2 s t ps stepst
  cases stepst
  · rename_i u stepsu steput; apply ih2 u t <;> grind

theorem if_intro {P Q B S T} :  {* fun s ↦ P s ∧ B s *} (S) {* Q *} →
                                {* fun s ↦ P s ∧ ¬ B s *} (T) {* Q *} →
                                {* P *} (ifThenElse B S T) {* Q *} := by
  unfold PartialHoare; intro iht ihe s t ps stepst
  cases stepst <;> grind

theorem while_intro {P B S} : {* fun s ↦ P s ∧ B s *} (S) {* P *} →
                              {* P *} (whileDo B S) {* fun s ↦ P s ∧ ¬ B s *} := by
  unfold PartialHoare; intro ih s t ps stepst
  generalize ws_eq : whileDo B S = T
  rw [ws_eq] at stepst
  induction stepst <;> try (cases ws_eq) <;> try grind

theorem consequence {P P' Q Q' S} : (∀ s, P' s → P s) → (∀ s, Q s → Q' s) →
                                    {* P *} (S) {* Q *} → {* P' *} (S) {* Q' *} := by
  unfold PartialHoare; intro pcon qcon pqhoare s t ps' stepst
  apply qcon
  apply pqhoare s t <;> grind

theorem consequence_left {P' P Q S} : (∀ s, P' s → P s) →
                                        {* P *} (S) {* Q *} → {* P' *} (S) {* Q *} := by
  intro pcon pqhoare
  have h : ∀ s, Q s → Q s := by grind
  apply consequence pcon h pqhoare

theorem consequence_right {P Q Q' S} : (∀ s, Q s → Q' s) →
                                        {* P *} (S) {* Q *} → {* P *} (S) {* Q' *} := by
  intro qcon pqhoare
  have h : ∀ s, P s → P s := by grind
  apply consequence h qcon pqhoare

theorem skip_intro' {P Q} : (∀ s, P s → Q s) → {* P *} (skip) {* Q *} := by
  intro pqcon; apply consequence_right pqcon skip_intro

theorem assign_intro' {P Q x a} : (∀ s, P s → Q (State.update x (a s) s)) →
                                  {* P *} (assign x a) {* Q *} := by
  intro con; apply consequence_left con assign_intro

theorem seq_intro' {P Q R S T} :  {* Q *} (T) {* R *} →
                                  {* P *} (S) {* Q *} →
                                  {* P *} (seq S T) {* R *} := by
  intro hoare1 hoare2; apply seq_intro hoare2 hoare1

theorem while_intro' {P Q I B S} :  (∀ s, P s → I s) →
                                    (∀ s, ¬ B s → I s → Q s) →
                                    {* fun s ↦ I s ∧ B s *} (S) {* I *} →
                                    {* P *} (whileDo B S) {* Q *} := by
  intro con1 con2 hoare
  have con2 : ∀ s, I s ∧ ¬ B s → Q s := by grind
  apply consequence_left; exact con1
  apply consequence_right; exact con2
  apply while_intro; exact hoare

theorem assign_intro_forward {P x a} :
  {* P *} (assign x a) {* fun s ↦ ∃ n,
                          P (State.update x n s) ∧ s x = a (State.update x n s) *} := by
  apply assign_intro'
  intro s h
  exists (s x); simp [h]

theorem assign_intro_backward {Q x a} :
  {* fun s ↦ ∃ n, Q (State.update x n s) ∧ n = a s *} (assign x a) {* Q *} := by
  apply assign_intro'; intro s ⟨n, pre1, pre2⟩; grind

def Stmt.invWhileDo (_ B : State → Prop) (S : Stmt) : Stmt := whileDo B S

theorem invWhile_intro {I B Q S} :  (∀ s, ¬ B s → I s → Q s) →
                                    {* fun s ↦ I s ∧ B s *} (S) {* I *} →
                                    {* I *} (invWhileDo I B S) {* Q *} := by
  unfold invWhileDo; apply while_intro'; grind

theorem invWhile_intro' {I B P Q S} :
                                    (∀ s, P s → I s) →
                                    (∀ s, ¬ B s → I s → Q s) →
                                    {* fun s ↦ I s ∧ B s *} (S) {* I *} →
                                    {* P *} (invWhileDo I B S) {* Q *} := by
  unfold invWhileDo; apply while_intro'

open Lean
open Lean.Parser
open Lean.Parser.Term
open Lean.Meta
open Lean.Elab.Tactic
open Lean.TSyntax

def applyConstant (name : Name) : TacticM Unit :=
  do
    let cst ← mkConstWithFreshMVarLevels name
    liftMetaTactic (fun goal ↦ MVarId.apply goal cst)

def andThenOnSubgoals (tac₁ tac₂ : TacticM Unit) :
  TacticM Unit :=
  do
    let origGoals ← getGoals
    let mainGoal ← getMainGoal
    setGoals [mainGoal]
    tac₁
    let subgoals₁ ← getUnsolvedGoals
    let mut newGoals := []
    for subgoal in subgoals₁ do
      let assigned ← MVarId.isAssigned subgoal
      if ! assigned then
        setGoals [subgoal]
        tac₂
        let subgoals₂ ← getUnsolvedGoals
        newGoals := newGoals ++ subgoals₂
    setGoals (newGoals ++ List.tail origGoals)

def matchPartialHoare : Expr → Option (Expr × Expr × Expr)
  | Expr.app (Expr.app (Expr.app (Expr.const ``PartialHoare _) P) S) Q => some (P, S, Q)
  | _ => none

partial def vcg : TacticM Unit :=
do
  let goals <- getUnsolvedGoals
  if goals.length != 0 then
    let target <- getMainTarget
    match matchPartialHoare target with
    | none => return
    | some (P,S,_) =>
      if Expr.isAppOfArity S ``Stmt.skip 0 then
        if Expr.isMVar P then
          applyConstant ``skip_intro
        else
          applyConstant ``skip_intro'
      else if Expr.isAppOfArity S ``Stmt.assign 2 then
        if Expr.isMVar P then
          applyConstant ``assign_intro
        else
          applyConstant ``assign_intro'
      else if Expr.isAppOfArity S ``Stmt.seq 2 then
        andThenOnSubgoals
          (applyConstant ``seq_intro') vcg
      else if Expr.isAppOfArity S ``Stmt.ifThenElse 3 then
        andThenOnSubgoals
          (applyConstant ``if_intro) vcg
      else if Expr.isAppOfArity S ``Stmt.invWhileDo 3 then
        if Expr.isMVar P then
          andThenOnSubgoals
            (applyConstant ``invWhile_intro) vcg
        else
          andThenOnSubgoals
            (applyConstant ``invWhile_intro') vcg
      else
        failure
elab "vcg" : tactic => vcg

-- def ADD : Stmt :=
--   whileDo (fun s ↦ s "n" ≠ 0)
--     (seq  (assign "n" (fun s ↦ s "n" - 1))
--           (assign "m" (fun s ↦ s "m" + 1))
--     )

-- def annotated_ADD (n0 m0 : ℕ): Stmt :=
--   invWhileDo (fun s ↦ s "n" + s "m" = n0 + m0) (fun s ↦ s "n" ≠ 0)
--     (seq  (assign "n" (fun s ↦ s "n" - 1))
--           (assign "m" (fun s ↦ s "m" + 1))
--     )

-- def ADD_pre (n0 m0 : ℕ) : State → Prop := fun s ↦ s "n" = n0 ∧ s "m" = m0
-- def ADD_post (n0 m0 : ℕ) : State → Prop := fun s ↦ s "n" = 0 ∧ s "m" = n0 + m0

-- theorem ADD_correct : ∀ (n0 m0 : ℕ), {* ADD_pre n0 m0 *} (ADD) {* ADD_post n0 m0*} := by
--   intro n0 m0
--   have h: {* ADD_pre n0 m0 *} (annotated_ADD n0 m0) {* ADD_post n0 m0 *} := by {
--     unfold annotated_ADD ADD_pre ADD_post; vcg <;> simp <;> try grind
--   }
--   apply h

def pvh : ℕ → ℕ
| 0 => 0
| 1 => 1
| n+2 => pvh n + pvh (n+1)

def PVH (n : ℕ) : Stmt :=
  assign "x" (fun _ ↦ 0);; assign "y" (fun _ ↦ 0);; assign "z" (fun _ ↦ 1);;
  invWhileDo
            (fun s ↦ pvh (s "x") = s "y" ∧ pvh (s "x" + 1) = s "z")
            (fun s ↦ s "x" ≠ n)
            (
              (assign "t" (fun s ↦ s "z"));;
              (assign "z" (fun s ↦ s "y" + s "z"));;
              (assign "y" (fun s ↦ s "t"));;
              (assign "x" (fun s ↦ s "x" + 1))
            )

theorem PVH_correct : ∀ (n : ℕ),
    {* fun _ ↦ True *} (PVH n) {* fun s ↦ s "y" = pvh n *} := by
    intro n
    unfold PVH; vcg <;> simp[pvh] <;> try grind

def fact : ℕ → ℕ
| 0 => 1
| n+1 => (n+1) * fact n

def FACT (n : ℕ) : Stmt :=
  assign "x" (fun _ ↦ n);; assign "y" (fun _ ↦ 1);;
  invWhileDo
            (fun s ↦ fact (s "x") * (s "y") = fact n)
            (fun s ↦ s "x" ≠ 0)
            (
              (assign "y" (fun s ↦ s "x" * s "y"));;
              (assign "x" (fun s ↦ s "x" - 1))
            )

theorem FACT_correct : ∀ (n : ℕ),
      {* fun _ ↦ True *} (FACT n) {* fun s ↦ s "y" = fact n *} := by
      intro n; unfold FACT; vcg <;> simp; try grind
      intro s h1; rw [h1]; simp[fact]
      intro s h1 h2; rcases h3 : s "x" <;> try grind
      rename_i m; rw [h3] at h1; rw [<-h1]; simp [fact]; grind

def psum : ℕ → ℕ
| 0 => 0
| n+1 => n+1 + psum n

def PSUM (n : ℕ) : Stmt :=
  assign "i" (fun _ ↦ 0);; assign "x" (fun _ ↦ 0);;
  invWhileDo
            (fun s ↦ (s "x") = psum (s "i"))
            (fun s ↦ s "i" ≠ n)
            (
              (assign "i" (fun s ↦ s "i" + 1));;
              (assign "x" (fun s ↦ s "x" + s "i"))
            )

theorem PSUM_correct : ∀ (n : ℕ),
        {* fun _ ↦ True *} (PSUM n) {* fun s ↦ s "x" = psum n *} := by
        intro n; unfold PSUM; vcg <;> simp[psum] <;> try grind

def parity : ℕ → ℕ
| 0 => 0
| 1 => 1
| n+2 => parity n

-- lemma parity_lt2 : ∀ n : ℕ, ¬ n ≥ 2 → parity n = n := by
--   intro n h; rcases g : n with _ | _ | k <;> simp[parity]
--   grind

-- lemma parity_ge2 : ∀ n : ℕ, n ≥ 2 → parity n = parity (n-2) := by
--   intro n h; rcases g : n with _ | _ | k <;> try grind
--   simp [parity]

def PARITY (n: ℕ) : Stmt :=
  invWhileDo
            (fun s ↦ parity (s "x") = parity n)
            (fun s ↦ s "x" ≥ 2)
              (assign "x" (fun s ↦ s "x" - 2))

theorem PARITY_correct : ∀ n : ℕ,
    {* fun s ↦ s "x" = n *} (PARITY n) {* fun s ↦ s "x" = parity n *} := by
    intro n; unfold PARITY; vcg <;> try grind
    · intro s h; rcases g : s "x" with _ | _ | k <;> simp[parity]
      rw [g] at h; grind
    · rintro s ⟨h1, h2⟩; rcases g : s "x" with _ | _ | n <;>
      try (rw [g] at h2; grind)
      rename_i k; rw [g] at h1; simp [parity] at *; grind








end Hoare
