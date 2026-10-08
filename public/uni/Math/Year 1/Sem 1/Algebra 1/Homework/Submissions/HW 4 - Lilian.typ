#import "@preview/nova-pset:0.1.0": *
#import "@preview/adaptive-dots:0.1.0": adaptive-dots, ldots, cdots
#show math.equation: set text(font: "Libertinus Math")
#show: adaptive-dots
#let class = "Algebra 1"
#let assignment = "Homework 4"
#let author = "Lilian"
// To use a logo, add an image to this folder and replace none:
// #let logo = image("your-logo.png", height: 25pt)
#let logo = none
#let instructor = "Prof. Upendra"
#let semester = "Fall 2026"
#let due-time = "Monday, 14/09/2026"
#let vb(x) = $upright(bold(#x))$
#show: homework.with(
  class: class,
  assignment: assignment,
  author: author,
  logo: logo,
  instructor: instructor,
  semester: semester,
  due-time: due-time,
  paper-size: "us-letter",
  accent-color: rgb("#1c2b39"),
)

#set enum(numbering: "a)")

== Homework

_Submit: 2 (one of the four proofs, in your own words), 5 (only the computation), 6(c), 7(a), 11(a) and (c). Most are computational: justify all computations. A computer may verify row reduction; setting up and interpreting must be your own._

#q(title: "Problem 2: Towards invariance of dimension")[
  Show that if $S$ is a finite spanning set in a vector space $V$, then for any linearly independent set $I$, the cardinality of $I$ is at most the cardinality of $S$. Give four proofs, the first two by contradiction. (For the HW, submit one.)

  (a) Assume $|I| > |S|$. Express the vectors in $I$ as linear combinations of vectors in $S$. Express these equations using a wide matrix $A$ by defining a new notion of multiplying a matrix of numbers by a row of abstract vectors. Show appropriate associativity for this new operation and use the fact that $A vb(x) = vb(0)$ has a nontrivial solution for a wide matrix $A$.

  (b) Assume $|I| > |S|$ and again express the vectors in $I$ as linear combinations of vectors in $S$. This is a tall system of equations. Imitate row operations on this tall system to get the last equation as $0 =$ some linear combination of vectors in $I$. Why must the RHS of this equation be a nontrivial combination?

  (c) Proof by reduction to $RR^n$. One way is to use the notion of isomorphism, the fact that having a finite basis for $V$ gives an isomorphism of $V$ with $RR^n$.

  (d) Look up the statement of the Steinitz exchange lemma. Try to prove it on your own. Uncover the proof one line at a time and repeat.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 5 (computation)")[
  Let $A = mat(1, 2, 3; 0, 1, 4; 5, 6, 0)$. Show that $A$ is invertible, write $A$ as a product of elementary matrices and find the inverse of $A$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 6(c)")[
  Let $A = mat(2, 3, 1; 1, 2, 3)$. Show that $A$ has infinitely many right inverses. Find them all. Now give a matrix $B$ having infinitely many right inverses and find them all.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 7(a)")[
  Let $vb(v)_1 = (1, 2, 1)^T$, $vb(v)_2 = (0, 1, 2)^T$, $vb(v)_3 = (2, 0, 1)^T$. Show that $B = {vb(v)_1, vb(v)_2, vb(v)_3}$ is a basis of $RR^3$. What is the change of basis matrix $P$ when the old basis is the standard basis and the new basis is $B$? Find $vb(w)$ such that $[vb(w)]_B = (4, 5, 5)^T$. Find $[vb(v)]_B$ for $vb(v) = (4, 5, 5)^T$.

  (Recall: the $i$-th column of $P$ is the coordinate vector of the $i$-th new basis vector in terms of the old basis, $B' = B P$, and $[vb(v)]_B = P [vb(v)]_(B')$.)
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 11(a)")[
  Write a formula, with justification, for the linear function $f: RR^2 -> RR^2$ that takes $(1, 2)^T$ to $(3, 4)^T$ and $(2, 5)^T$ to $(10, 13)^T$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 11(c)")[
  Write a formula, with justification, for reflection in the line $y = k x$ for a real number $k$. Do this in two ways: first, directly working with the standard basis. Second, start with a more convenient basis and then change it to the standard basis. Maybe it helps to name an angle?
]

#b() 
#Q()

#pagebreak()

== Rest of Tutorial 4

_Not part of the homework._

#q(title: "Problem 1: Basic language")[
  Recall the definition of an abstract vector space. Many terms seen in $RR^n$ carry over: subspace, linear combination, span, linear (in)dependence, basis, dimension. Prove the basic observations made in class about span, linear dependence/independence and equivalent ways to think of a basis. Let $S$ be a multiset (repetitions allowed) of vectors in $V$.

  (a) If $vb(v) in S$ and $vb(v)$ is a linear combination of the other vectors in $S$, then $"span"(S) = "span"(S - {vb(v)})$. Converse?

  (b) If $S$ is independent and $vb(v) in.not "span"(S)$, then $S union {vb(v)}$ is independent. Converse?

  Let $f$ be a linear map from $V$ to $W$. State if (c) and (d) are true or false. If false, is there a condition on $f$ under which the statement becomes true?

  (c) "If $S$ is linearly independent, then $f(S)$ is linearly independent." Converse?

  (d) "If $S$ spans $V$ then $f(S)$ spans $W$." Converse?

  (e) Show that the following are equivalent for a subset $B$ of $V$: (1) $B$ is a linearly independent spanning set, i.e. a basis; (2) $B$ is a maximal linearly independent set; (3) $B$ is a minimal spanning set; (4) each vector in $V$ is a unique linear combination of elements of $B$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 3: Payoff")[
  Deduce several consequences of problem 2 for a finite dimensional vector space.

  (a) Invariance of dimension. (We proved that any finite basis of $RR^n$ has exactly $n$ elements. What if there is an infinite basis? Can you answer this objection?)

  (b) Growing strategy to get a basis: any linearly independent set can be enlarged to a basis. Note a variation stated in Artin: "If $I$ is linearly independent in $V$ and $S$ spans $V$, then one can add vectors from $S$ to $I$ to build a basis of $V$." Compare the two proofs. Does one give a stronger statement than the other?

  (c) The dimension of a proper subspace $W$ of $V$ is always less than the dimension of $V$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 4: Algebra of linear maps and matrix operations")[
  Imagine you do not know any operations involving matrices, not even matrix-vector multiplication. But you have defined abstract vector spaces and proved the existence of a basis. Fixing a basis gives a dictionary between $V$ of dimension $n$ and $RR^n$ via the coordinate map. Recall also our commutative square where a linear map $f: V -> W$ is "translated into a matrix" using a basis for $V$ and one for $W$.

  (a) Show that function application $f(vb(v))$ translates into matrix-vector multiplication, so you can define matrix-vector multiplication this way.

  (b) Show how composition of two linear maps translates into multiplication of matrices, so you can define matrix multiplication this way. Deduce associativity of matrix multiplication.

  (c) Given vector spaces $V$ and $W$, let $L(V, W)$ be the set of all linear maps from $V$ to $W$. Show how to make $L(V, W)$ a vector space and show that it is isomorphic to the vector space of matrices of a certain size. (Hint: choose bases.) Under your isomorphism, which linear map corresponds to the matrix unit $E_(i j)$?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 5 (theory)")[
  Let $A$ be any square matrix. Show that the following are equivalent:

  (a) $A$ is invertible, i.e. there exists $A'$ with $A A' = A' A = I$. (b) $f(vb(x)) = A vb(x)$ is a bijection. (c) $A$ has a left inverse $L$, i.e. $L A = I$. (d) $A$ has a right inverse $R$, i.e. $A R = I$. (e) $"RREF"(A) = I$. (f) $A$ is a product of elementary matrices.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 6(a), (b), (d): Faux generality?")[
  Let $A$ be an $r times c$ matrix; $I$ denotes the identity matrix of whatever size makes the equation make sense. The problems may become more transparent if you think in terms of the associated linear map.

  (a) Call $A$ "invertible" if it has a left inverse $L$ and a right inverse $R$. Show that then $L = R$, and this common inverse is unique.

  (b) Suppose $A$ has a two-sided inverse $A'$ ($A A' = I$ and $A' A = I$), necessarily $c times r$. Show that then $r = c$.

  (d) Characterize non-square matrices that have a left inverse. Show that such a matrix must have infinitely many left inverses. Give an explicit numerical example illustrating both statements. Do the same for right inverses. (Also look at Artin's problem M.8 in chapter 1.)
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 7(b)–(d): Change of coordinates")[
  (b) Consider $p(t) = 1 + 2t + t^2$ on $t in [0, 1]$. Find its coordinate vector $[p]_B$ with respect to the Bernstein basis $B = {b_0, b_1, b_2}$, where $b_0(t) = (1 - t)^2$, $b_1(t) = 2t(1 - t)$, $b_2(t) = t^2$. (Search "Bernstein polynomials" or "Bézier curves".)

  (c) In the general situation (old basis $B$, new basis $B'$, change of basis matrix $P$), justify why $P$ must be invertible.

  (d) Two alternative ways to prove the change of basis formulas without hypervector notation: (i) read off a formula from the equations expressing $B'$ in terms of $B$; (ii) operationalize the commutative square for the identity map from $V$ to $V$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 8: Universal property of a basis")[
  (a) Suppose $B subset V$. Show that if $B$ is a basis of $V$, then for any vector space $W$, any function from the set $B$ to $W$ extends uniquely to a linear map $L: V -> W$. (Show that the forced formula actually defines a linear function.)

  (b) (Optional) Show that the property in (a) characterizes those subsets of $V$ that are bases. Do you find the verbiage in the formulation worthwhile?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 9: A \"vector space\" without a basis? (not part of the course)")[
  Suppose only integers $ZZ$ are allowed as scalars in the definition of a vector space.

  (a) Let $V = QQ$ under ordinary operations. See that all axioms hold. Show that $V$ cannot have a basis for a rather easy reason. What fails?

  (b) What happens if $V = RR$? $V = ZZ^2$?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 10: Other perspectives on rank-nullity")[
  (a) Our proof of abstract rank-nullity: "extend a basis of the kernel of $f$". Find a proof that directly uses a given basis of the image of $f$.

  (b) We proved rank-nullity earlier for $f(vb(x)) = A vb(x)$ from $RR^c$ to $RR^r$ by counting pivots and free variables in $"REF"(A)$. Prove the general abstract theorem by reducing to that case via the commutative square.

  (c) Using the bases from our proof in class, write a simple matrix for $f$. Recall Tutorial 3 problem 9 (row and column operations, reduced form), row/column operations as matrix multiplication, and the change of basis formula $Q^(-1) A P$. Meld these into a unified understanding.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 11(b), (d)")[
  (b) Counterclockwise rotation by angle $theta$.

  (d) Composition of two maps from parts (b) and (c). There are three possibilities to work out. Afterwards, see problem B2 from the 2025 CMI entrance exam and its posted solution. Which solution do you prefer?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 12: Determinants")[
  (a) Prove (and fix in your mind) the usual formula for the inverse of a $2 times 2$ matrix $A$ when $det(A)$ is an invertible scalar. (Artin does the $n times n$ version in section 1.6; his cofactor matrix is our $"adj"(A)$. Not in syllabus.)

  (b) Artin section 1.4: do 1, 2, 4 in your head (1(d) should be instantaneous). The matrix in 3 is the Cartan matrix of type A.

  (c) Artin chapter 1, Miscellaneous problem 7.
]

#b() 
#Q()
