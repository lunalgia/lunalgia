#import "@preview/nova-pset:0.1.0": *
#import "@preview/adaptive-dots:0.1.0": adaptive-dots, ldots, cdots
#show math.equation: set text(font: "Libertinus Math")
#show: adaptive-dots
#let class = "Algebra 1"
#let assignment = "Homework 2"
#let author = "Lilian"
// To use a logo, add an image to this folder and replace none:
// #let logo = image("your-logo.png", height: 25pt)
#let logo = none
#let instructor = "Prof. Upendra"
#let semester = "Fall 2026"
#let due-time = "Thursday, 20/08/2026"
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

_Submit: problems 2(a), 3, 4._

#q(title: "Problem 2(a)")[
  We have seen that $"RREF"(A)$ allows you to write the solution space of $A vb(x) = vb(0)$ as the span of a "magic" set of vectors. Do this for the following system.
  $ mat(1, 2, 1, 3, 2; 2, 4, 0, 4, 6; 1, 2, 2, 5, 1) vec(x_1, x_2, x_3, x_4, x_5) = vec(0, 0, 0) $
]

#b() Call the coefficient matrix $A$. Row operations do not change the solution set of $A vb(x) = vb(0)$, so we row reduce $A$ (the zero column on the right never changes, so I dropped it).
$
  mat(1, 2, 1, 3, 2; 2, 4, 0, 4, 6; 1, 2, 2, 5, 1)
  stretch(->)^(R_2 - 2R_1, R_3 - R_1)
  mat(1, 2, 1, 3, 2; 0, 0, -2, -2, 2; 0, 0, 1, 2, -1)
  stretch(->)^(-1/2 R_2)
  mat(1, 2, 1, 3, 2; 0, 0, 1, 1, -1; 0, 0, 1, 2, -1)
$
$
  stretch(->)^(R_3 - R_2)
  mat(1, 2, 1, 3, 2; 0, 0, 1, 1, -1; 0, 0, 0, 1, 0)
  stretch(->)^(R_2 - R_3, R_1 - 3R_3)
  mat(1, 2, 1, 0, 2; 0, 0, 1, 0, -1; 0, 0, 0, 1, 0)
  stretch(->)^(R_1 - R_2)
  mat(1, 2, 0, 0, 3; 0, 0, 1, 0, -1; 0, 0, 0, 1, 0)
$
The last matrix is in RREF, with pivots in columns $1, 3, 4$. So $x_2$ and $x_5$ are free, and the system is equivalent to
$ x_1 = -2x_2 - 3x_5, quad x_3 = x_5, quad x_4 = 0. $
Hence every solution has the form
$
  vec(x_1, x_2, x_3, x_4, x_5) = vec(-2x_2 - 3x_5, x_2, x_5, 0, x_5)
  = x_2 underbrace(vec(-2, 1, 0, 0, 0), vb(u)) + x_5 underbrace(vec(-3, 0, 1, 0, 1), vb(w)), quad x_2, x_5 in RR.
$
Conversely, for any choice of $x_2, x_5$ the vector above satisfies the three RREF equations, hence is a solution. So
$ {vb(x) in RR^5 | A vb(x) = vb(0)} = "span"{vb(u), vb(w)}. $


The magic vectors are exactly the ones you get by setting one free variable to $1$ and the others to $0$. In particular $vb(u)$ and $vb(w)$ are independent: $vb(u)$ has a $1$ in the $x_2$ slot where $vb(w)$ has $0$, and vice versa for $x_5$.
#Q()

#pagebreak()

#q(title: "Problem 3")[
  Recall that "the general solution of a consistent system is a translate of a subspace", i.e. of the form $W + vb(u)$ where $W$ is a subspace (of what?) and $vb(u)$ a vector. Demonstrate this explicitly for the following system.
  $ mat(1, -1, 2, 3; 2, -2, 5, 4; -1, 1, -1, -5) vec(x_1, x_2, x_3, x_4) = vec(5, 11, -4) $
]

#b() Call the coefficient matrix $A$ and the right hand side $vb(b)$. Row reducing $(A | vb(b))$:
$
  mat(1, -1, 2, 3, |, 5; 2, -2, 5, 4, |, 11; -1, 1, -1, -5, |, -4)
  stretch(->)^(R_2 - 2R_1, R_3 + R_1)
  mat(1, -1, 2, 3, |, 5; 0, 0, 1, -2, |, 1; 0, 0, 1, -2, |, 1)
  stretch(->)^(R_3 - R_2, R_1 - 2R_2)
  mat(1, -1, 0, 7, |, 3; 0, 0, 1, -2, |, 1; 0, 0, 0, 0, |, 0)
$
There is no pivot in the last column, so by Lemma 1 of HW 1 the system is consistent. Pivots are in columns $1, 3$, so $x_2, x_4$ are free and
$ x_1 = 3 + x_2 - 7x_4, quad x_3 = 1 + 2x_4. $
So every solution is
$
  vec(x_1, x_2, x_3, x_4) = underbrace(vec(3, 0, 1, 0), vb(u)) + x_2 vec(1, 1, 0, 0) + x_4 vec(-7, 0, 2, 1), quad x_2, x_4 in RR,
$
and every such vector is a solution. Setting $W = "span"{(1, 1, 0, 0)^T, (-7, 0, 2, 1)^T}$, the solution set is exactly $W + vb(u)$.


#Q()

#pagebreak()

#q(title: "Problem 4")[
  For an $r times c$ matrix $A$, recall/check that the map $f(vb(x)) = A vb(x)$ from $RR^c$ to $RR^r$ is linear, which means it preserves vector addition and scalar multiplication. Show that every linear map $L$ from $RR^c$ to $RR^r$ comes in this fashion, i.e. for a given linear map $L$, there is a unique matrix $A$ such that $L(vb(x)) = A vb(x)$.
]

#b() *$f$ is linear.* The $i$-th entry of $A vb(x)$ is $sum_j a_(i j) x_j$. For $vb(x), vb(y) in RR^c$ and $lambda in RR$,
$ (A(vb(x) + vb(y)))_i = sum_j a_(i j)(x_j + y_j) = sum_j a_(i j) x_j + sum_j a_(i j) y_j = (A vb(x))_i + (A vb(y))_i, $
$ (A(lambda vb(x)))_i = sum_j a_(i j)(lambda x_j) = lambda sum_j a_(i j) x_j = lambda (A vb(x))_i. $
Since this holds for every $i$, $f(vb(x) + vb(y)) = f(vb(x)) + f(vb(y))$ and $f(lambda vb(x)) = lambda f(vb(x))$.

*Existence.* Let $vb(e)_1, ldots, vb(e)_c$ be the standard basis of $RR^c$, and let $A$ be the $r times c$ matrix whose $j$-th column is $L(vb(e)_j)$. Any $vb(x) in RR^c$ is $vb(x) = x_1 vb(e)_1 + cdots + x_c vb(e)_c$, so by linearity of $L$
$ L(vb(x)) = x_1 L(vb(e)_1) + cdots + x_c L(vb(e)_c). $
On the other hand, $A vb(x)$ is exactly the linear combination of the columns of $A$ with coefficients $x_1, ldots, x_c$ (Tutorial 2, problem 1), which is the same vector. So $L(vb(x)) = A vb(x)$ for all $vb(x)$.

*Uniqueness.* Suppose $A vb(x) = B vb(x)$ for all $vb(x) in RR^c$. Plugging in $vb(x) = vb(e)_j$ gives $A vb(e)_j = B vb(e)_j$. But $A vb(e)_j$ is the $j$-th column of $A$, and likewise for $B$. So $A$ and $B$ have the same columns, i.e. $A = B$.


#Q()

#pagebreak()

== Rest of Tutorial 2

_Not part of the homework._

_All problems except problem 7 are of major conceptual importance. Recall the definitions of: linear combination, span, subspace, linear map._

#q(title: "Problem 1")[
  Let $A$ be an $r times c$ matrix and $vb(x)$ a vector in $RR^c$. Show that $A vb(x)$ is a linear combination of certain vectors obtained from entries of $A$.
]

#b() 

By laws of vector-matrix multiplication, $ A vb(x) = x_1 vec(a_11, dots.v, a_(1r)) + dots + x_c vec(a_(c 1), dots.v, a_(c r)) $

#Q()

#pagebreak()

#q(title: "Problem 2(b)")[
  Recall/check that the following are subspaces of $RR^c$: (i) for a subset $S$ of $RR^c$, $"span"(S)$ = the set of all linear combinations of vectors from $S$; (ii) the set of solutions of $A vb(x) = vb(0)$ for an $r times c$ matrix $A$.

  (b) (Optional for now.) Show how to write a subspace of the first type as a subspace of the second type by finding a magic matrix. Setup: let $S = {vb(v)_1, ldots, vb(v)_k}$ be a subset of $RR^n$. Show how to explicitly find a matrix $A$ such that
  $ "span"(S) = {vb(x) in RR^n | A vb(x) = vb(0)}. $
]

#b() 

(b) We show how to find a $n times n$ matrix $A$, whose null space is $"span"(S)$. Let $vb(w)_1, dots, vb(w)_m$ be a basis of $"span"(S)$ where $m <= k$. We can extend it to form a basis of $RR^n$. Let this be $vb(w)_1, dots, vb(w)_m, vb(u)_1, dots, vb(u)_ell$, where $ell + m = n$. Then, we can determine $A$ by just its action on the basis. In particular, $A vb(w)_i = vb(0)$
and $A vb(u)_i = vb(e)_i$ where $vb(e)_i$ are the standard basis vectors. 

Note that $"span"(S) subset "null"(A)$ as any vector in the span is a linear combination of the basis, $vb(v) = c_1 vb(w_1) + dots + vb(w)_m$, and thus:
$ A vb(v) = A (c_1 vb(w_1) + dots + c_m vb(w)_m) = c_1 A_1 vb(w_1) + dots + c_m A vb(w)_m = vb(0)$, so $vb(v) in "null"(A)$.

Also, $"null"(A) subset "span"(S)$, as $(vb(w_1), dots, vb(w)_m)$ form a basis of $"null"(A)$. This is because, since $"null"(A) subset RR^n$, any $vb(v) in "null"(A)$ can be written down as a linear combination of our basis of $RR^n$. In particular, assume $vb(v) = sum_i a_i vb(w)_i + sum b_i vb(u)_i$. Then, since $A vb(v) = vb(0)$, 

$
vb(0) = sum_i b_i A vb(u)_i = sum_i b_i vb(e)_i
$
which cannot be $vb(0)$ unless all the $b_i$ are $0$. Thus $(vb(w_1), dots, vb(w)_m)$ does indeed form a basis. Therefore, we are done.

#Q()

#pagebreak()

#q(title: "Problem 5")[
  This exercise has many parts and it will take some time to do all of them. Do what you can at the moment!

  When is $f(vb(x)) = A vb(x)$ injective? Surjective? Give an "if and only if" criterion for each of the two conditions in terms of each of the following. (So the final answer will be a table with two columns and five rows, the two entries in the top row being injective and surjective.)

  (a) Solutions of a suitable linear system

  (b) $"REF"(A)$

  (c) Column vectors of $A$

  (d) Row vectors of $A$
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 6")[
  (a) Show that doing an elementary row operation on a matrix $A$ results in a matrix $E A$, where $E$ is a suitable matrix, called an _elementary matrix_. Describe all three types of elementary matrices.

  (b) Show that $E$ itself can be obtained using an elementary row operation on a very simple matrix.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 7")[
  Useful as problem-solving/proof-writing practice, but not conceptually central. Recall:

  (i) A matrix is in REF if leading nonzero entries in successive rows move strictly to the right and all zero rows are at the bottom. We can convert any matrix to REF by a forward/downward pass of row operations. We also scale the leading nonzero entries, called pivots, to $1$.

  (ii) A matrix is in RREF if it is in REF and moreover all entries above any pivot are $0$. We can convert any REF matrix to RREF by a backward/upward pass, killing entries above pivots column by column starting from the right.

  (a) Show that starting with an REF matrix, we can get to an RREF matrix by treating columns in any order.

  (b) Show that any matrix can be converted to a unique matrix in RREF by row operations.
]

#b() 
#Q()
