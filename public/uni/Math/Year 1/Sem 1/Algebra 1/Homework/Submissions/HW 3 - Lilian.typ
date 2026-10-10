#import "@preview/nova-pset:0.1.0": *
#import "@preview/adaptive-dots:0.1.0": adaptive-dots, ldots, cdots
#show math.equation: set text(font: "Libertinus Math")
#show: adaptive-dots
#let class = "Algebra 1"
#let assignment = "Homework 3"
#let author = "Lilian"
// To use a logo, add an image to this folder and replace none:
// #let logo = image("your-logo.png", height: 25pt)
#let logo = none
#let instructor = "Prof. Upendra"
#let semester = "Fall 2026"
#let due-time = "Monday, 31/08/2026"
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

_Submit: 2(a), 9(b), 10(a). Optional: 1, 2(b), 4(b), 6, 7. If you are not fully confident about any of these, write a full solution._

#q(title: "Problem 2")[
  (a) Let A = the coefficient matrix in Tutorial 2 problem 2(a). Find with justification a basis for the following spaces: $"Null"(A), "Row"(A), "Col"(A)$.
  
  (b) (Optional) Having solved Problem 1 and part (a), you should be able to do part (a) for any matrix A. Explain and justify your procedure for each subspace. Can you find multiple bases for each subspace?]

#b()
Remember the RREF of A,
$ 
A_"RREF" = mat(1, 2, 0, 0, 3; 0, 0, 1, 0, -1; 0, 0, 0, 1, 0)
$

Then, as we showed in 2(a), the magic vectors
$
x_2 vec(-2, 1, 0, 0, 0) + x_5 vec(-3, 0, 1, 0, 1), quad x_2, x_5 in RR
$
span the null space of $A$. It is also clear that they're linearly independent, so they form a basis.

For the row space, note that the non-zero rows (so all of them, here) of $A_"RREF"$ form a basis. 

It is clear that they're independent. We show that span of the rows do not change if you perform elementary row operations. But note that all elementary row operations form linear combinations of the rows, in particular if the rows of the matrix are $(vb(r)_i^"T")$. Then, it is obvious that swapping does not change the span. Neither does scaling, because for
$
vb(u) in "span"{vb(r)_i^"T"} "such that" vb(u) = sum_i c_i vb(r)_i^"T"
$
we still have,
$
vb(u) in "span"{vb(r_1)^"T", dots, lambda vb(r)_k^"T", dots} 
$
as 
$
vb(u) = sum_(i eq.not k) c_i vb(r)_i^"T" + (c_k\/lambda) vb(r)_k^"T" 
$
Similarly, adding a scaled row to another does not change the span, because for $vb(r)_k^"T" |-> vb(r)_k^"T" + lambda vb(r)_ell^"T"$,

$
vb(u) = sum_(i eq.not ell) c_i vb(r)_i^"T" + (c_ell - lambda c_k) vb(r)_ell^"T"
$
So, these rows do indeed form a basis.

Finally, for the column space, we claim that the columns of $A$ which have pivots in $A_"RREF"$--$(1, 2, 1)^"T"$, $(1, 0, 2)^"T"$ and $(3, 4, 5)^"T"$---form a basis. If we show that these are (maximally) independent, then we would be done, because this would be the maximally independent set of a spanning set.

Anyway, this is obvious because elementary row operations do not change the dependency relations. Swapping rows swaps the entries of the columns, scaling scales a specific entry of each column, both of which do not change the dependency relation. Adding a scaled row is a little more non-trivial. Let the columns be $vb(c)_i$. In particular, $vb(c)_i = a_(j i)vb(e)_j$ for $A = (a_(i j))$. The row operation, $vb(r)_k |-> vb(r)_k + lambda vb(r)_ell$, results in the new columns, $vb(c)'_i = vb(c)_i$ for $i eq.not k$, and $vb(c)'_k = vb(c)_k + lambda vb(c)_ell$. Therefore we get that:
$
vb(c)'_i = vb(c)_i + lambda vb(c)_ell vb(e)_k
$
So the linear combination becomes,
$
sum_i a_i vb(c)'_i = sum a_i vb(c)_i + lambda (sum_i a_i vb(c)_i) vb(e)_k
$
Now if $vb(c)'_i$ are independent, and that $vb(c)_i$ are not. Then there exists a non-trivial linear combination of them that equates to $vb(0)$. Therefore,
$
sum_i a_i vb(c)'_i = lambda (sum_i a_i vb(c)_i) vb(e)_k
$
for some $a_i$, not all zero. Note that the sum on the right hand side must too be $0$, as it is the $k"th"$ entry in the linear combination of $vb(c)_i$. This forces a non-trivial linear combination of $vb(c)'_i$ to be $vb(0)$! Which cannot be. Hence, we are done.

(b). Note that we did the row, and column parts in full generality. For the null space, it is a little trickier. We convert $A$ to its RREF, and do the magic vector procedure.
#Q()

#pagebreak()

#q(title: "Problem 9(b)")[
  We write $A tilde B$ if one can go from $A$ to $B$ by a combination of row and column operations. Find nice representatives for the equivalence classes, similar to RREF for row equivalence. The answer is very simple!
]

#b()

I claim that a representative for each class is a matrix of the form:

$
A tilde mat(
  delim: "(",
  I_r, 0;
  0, 0;
)
= mat(
  delim: "(",
  augment: #(hline: 4, vline: 4),
  1, 0, dots.c, 0, 0, dots.c, 0;
  0, 1, dots.c, 0, 0, dots.c, 0;
  dots.v, dots.v, dots.down, dots.v, dots.v, dots.v, dots.v;
  0, 0, dots.c, 1, 0, dots.c, 0;
  0, 0, dots.c, 0, 0, dots.c, 0;
  dots.v, dots.v, dots.v, dots.v, dots.v, dots.down, dots.v;
  0, 0, dots.c, 0, 0, dots.c, 0;
)

$

i.e, top right identity matrix, with zero at every other place. $r$ is the _rank_ of the matrix, i.e the number of rows (or columns) with pivots in the RREF. 

First, we can do row operations to achieve $A ~ A_"RREF"$. The, if a row has a pivot we can use that to scale and kill of all other entries in the row. Otherwise, it is just a zero row. Finally, we can do swaps to move the zero columns further, achieve a top right identity matrix.

#Q()

#pagebreak()

#q(title: "Problem 10(a)")[
  Prove, using only the vector space axioms, that the zero vector of a vector space $V$ is unique.
]

#b() 

Suppose $vb(0)$ and $vb(0)'$ are both additive identities of $V$. Then, $ vb(0) = vb(0) + vb(0)' = vb(0)' $
where the first equality is because $vb(0)'$ is an additive identity, and the second is because $vb(0)$ is an additive identity. Thus we conclude that the additive identity, the zero vector is unique.
#Q()

#pagebreak()

=== Optional

#q(title: "Problem 1")[
  Suppose a matrix $R$ is in REF.

  (a) Show that its nonzero rows are independent, and therefore form a basis for the row space of $R$.

  (b) Show that pivot columns of $R$ are independent. Show that they also span the column space of $R$ (and hence form its basis). It may be easier to see what happens if $R$ is in RREF.

  A way to make (a) and (b) parallel is to say pivot rows and pivot columns. (Note that nonzero columns are NOT independent, unless every column is a pivot column.)
]

#b()
Already done in Problem 2.
#Q()

#pagebreak()

#q(title: "Problem 4(b)")[
  If you used the transpose of $A$ to find a basis for $"Col"(A)$ in problem 2, now find another method that uses only row operations on $A$ itself.
]

#b() 
We'll work with the transpose here instead. Note that the row space of the transpose is the column space of $A$, and thus, we can use the non-zero rows of the RREF of the transpose of $A$ to find a basis.
#Q()

#pagebreak()

#q(title: "Problem 6")[
  Recall our $2 times 5$ table of equivalences associated to a matrix $A$ from Tutorial 2. When $A$ is square, it gets nicer! Justify why all 10 statements in the table become equivalent when $A$ is square. It is important to fix this in your mind and to have it on tap to recall and use at will.
]

#b() 



#Q()

#pagebreak()

#q(title: "Problem 7")[
  Let $A$ be an $r times c$ matrix with the associated function $f(vb(x)) = A vb(x)$. Show that any two of the following three statements imply the third. (Do you see an analogy with a function between two finite sets?)

  (i) $A$ is a square matrix, i.e. $r = c$.

  (ii) $A vb(x) = vb(0)$ has only the trivial solution, i.e. $f$ is injective.

  (iii) $A vb(x) = vb(b)$ has a solution for every vector $vb(b)$, i.e. $f$ is surjective.
]

#b() 
#Q()

#pagebreak()

== Rest of Tutorial 3

_Not part of the homework._

_For the quiz you will need to know and be able to use all the words used in these problems._

#q(title: "Problem 3")[
  Let $A$ be an $r times c$ matrix.

  (a) (Tutorial 2, problem 6.) Show that doing an elementary row operation on $A$ results in a matrix $E A$, where $E$ is a suitable _elementary matrix_. Describe all three types of elementary matrices. Show that $E$ itself can be obtained using an elementary row operation on a very simple matrix.

  The answer: "The result of an elementary row operation on a matrix $A$ is $E A$, where $E$ is the matrix obtained by doing the same elementary row operation to the $r times r$ identity matrix." Prove the answer.

  (b) Let $B$ be a matrix obtained from $A$ by doing some row operations. Show that if the columns of $A$ are linearly (in)dependent, then so are the columns of $B$. In fact "the set of dependence relations is the same". Interpret and prove the statement in quotes.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 4(a)")[
  Do the last part of Tutorial 2 problem 5: characterize injectivity/surjectivity of $f(vb(x)) = A vb(x)$ in terms of the row vectors of $A$. Can you do this without using the transpose of $A$?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 5")[
  Let $A$ be a matrix. Show that there are bases $B_R$, $B_C$ and $B_N$, respectively of $"Row"(A)$, $"Col"(A)$ and $"Nul"(A)$, such that the following hold.

  (a) $B_R$ and $B_C$ have the same cardinality.

  (b) The cardinalities of $B_N$ and $B_C$ add up to the number of columns of $A$.

  (Worded in terms of bases because we have not yet proved invariance of dimension. In terms of dimensions, (a) says row rank = column rank, and (b) says the dimensions of the kernel and image of a linear map add up to the dimension of the domain: a basic counting result capturing uniformity of fibers of a linear map.)
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 8")[
  Discover matrix multiplication as follows.

  (a) Suppose we do not know matrix-vector multiplication, but we do define a linear map $f: RR^a -> RR^b$ and agree that it is a worthwhile notion to explore. Show that this definition forces the definition of matrix-vector multiplication when trying to find a formula for a given linear map. (You have already done part of this in problem 4 of Tutorial sheet 2. Revisit the reasoning.)

  (b) Now suppose $f: RR^a -> RR^b$ and $g: RR^b -> RR^c$ are linear maps, given by $f(vb(x)) = P vb(x)$ and $g(vb(y)) = Q vb(y)$. We saw that the composition $g f$ is also linear (quickly revise why), so $g f(vb(x)) = M vb(x)$ for some matrix $M$. Build $M$ in terms of $P$ and $Q$ from first principles. We define the product $Q P$ to be $M$.

  (c) Show that $(Q P)^T = P^T Q^T$.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 9(a), (c), (d)")[
  (a) Take all statements on row operations and transpose them to formulate a parallel theory of elementary column operations.

  (c) and (d) are NOT part of the course; stay away unless you cannot resist the lure. They are doable but with effort.

  (c) Variation 1: do part (b) for matrices with integer entries, where we allow only reversible row and column operations (so scaling is allowed only by $1$ and $-1$).

  (d) Variation 2: do part (b) for matrices with real entries, but now the only operations allowed correspond to left or right multiplication by upper triangular matrices. (It is perfectly good to restrict to square invertible matrices. Try $2 times 2$ first?)
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 10(b)–(e)")[
  Prove the following in any given vector space $V$ using only the vector space axioms. (Have fun with these logical exercises, but don't get too enamored. This is not math, just some games.)

  (b) The additive inverse of any given vector is unique.

  (c) $0 dot vb(v) = vb(0)$.

  (d) $a dot vb(0) = vb(0)$.

  (e) $(-1) dot vb(v)$ is the additive inverse of $vb(v)$, denoted $-vb(v)$.
]

#b() 

(b). Suppose $vb(b)$ and $vb(c)$ are additive inverses of $vb(a)$. Then,

$
vb(b) = vb(b) + vb(0) = vb(b) + (vb(a) + vb(c)) = (vb(b) + vb(a)) + vb(c) = vb(0) + vb(c) = vb(c)
$
Thus, $vb(b) = vb(c)$. 

(c). Note that 
$
0 dot vb(v) = (0 + 0) dot vb(v) = 0 dot vb(v) + 0 dot vb(v) 
$
Adding the additive inverse of $0 dot vb(b)$ from both sides, we are done.

(d). Pretty much the same as (c). 
$
a dot vb(0) = a dot (vb(0) + vb(0)) = a dot vb(0) + a dot vb(0)
$ 
and adding the additive inverse of $a dot vb(0)$ to both sides gives us what we want.

(e). Note that:
$
(-1) dot vb(v) + vb(v) = (-1) dot vb(v) + 1 dot vb(v) = (-1 + 1) dot vb(v) = 0 dot vb(v) = 0
$
by (d). Using the uniqueness of additive inverse (b), we are done.

#Q()
