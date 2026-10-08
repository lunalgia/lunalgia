#import "@preview/nova-pset:0.1.0": *
#import "@preview/adaptive-dots:0.1.0": adaptive-dots, ldots, cdots
#show math.equation: set text(font: "Libertinus Math")
#show: adaptive-dots
#let class = "Algebra 1"
#let assignment = "Homework 1"
#let author = "Lilian"
// To use a logo, add an image to this folder and replace none:
// #let logo = image("your-logo.png", height: 25pt)
#let logo = none
#let instructor = "Prof. Upendra"
#let semester = "Fall 2026"
#let due-time = "Thursday, 13/08/2026"
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

_Submit: problems 0 (optional), 4, 6. Lemmas 1 and 2 are mine, used in the solutions._

=== Preliminary Results

I'll use the following two results for the problems:

#q(title: "Lemma 1")[
  A given system is inconsistent if and only if any REF of $(A | vb(b))$ has a pivot in the last column.
]

#b() $<==$ is easy by converting the augmented matrix back to a system of equations. For $==>$, note the following. The contrapositive of the statement is that if no pivot is there in the last column of $(A | upright(bold(b)))$, then the system is consistent. Sort of informally one notes that, if there is no pivot in the last column, then each variable is expressible in terms of subsequent variables (by converting the augmented matrix to the system of equations.) 

Formally, let us work from the last row. Suppose the augmented matrix represents a set of $r$ linear equations in $c$ variables. Then, the matrix will be $r times c + 1$. Since the last column has zero pivots, let the pivot for the last row occur in the $i$-th column (if no pivot exists, then we skip the row and go the row above it. If no row has a pivot, then clearly the system if not inconsistent since we have all of $RR^c$ as solutions.) Then by assigning arbitrary values to the variables $x_(i+1), ldots, x_(c)$, we get a value for $x_(i)$. (Note that if $i = c$, we get a value of $x_(c)$ in terms of $b_r$.) Then, look at the row above, the pivot must occur at $j < i$ column. Therefore, we can write down $x_j$ in terms of $x_(j+1), ldots, x_(i), ldots, x_(c)$. Now, since we know $x_i, ldots, x_c$, and assigning arbitrary values to the rest of the “free variables”, we get a value of $x_j$. Inductively, going to the $1$-st row, we have a solution#footnote[Unlike in class, I don't come up with the _unique_ solution, but only _a_ solution, which I found easier.] $(x_1, ldots, x_c)$, that satisfies the equations, so that the system must be consistent

#line(length: 16.5cm, stroke: 0.01cm)

#q(title: "Lemma 2")[
  A given system has a _unique_ solution iff there exits a pivot in all columns except the last one of the RREF of $(A | vb(b))$
]

#b() If is easy, by converting the augmented matrix back to the system of equations, since the rows up until $c$ where $c$ is the number of the columns give us $x_i = b_i$ and the rows after this must be the zero rows, which don't contribute anything.

Note that the number of the columns minus one must be greater than or equal to the number of rows (since each pivot corresponds to a row). Now let us prove the only if part.

Suppose some column except the last one does not have a pivot, let the right-most such be the $i$-th column. If the $i$-th column is all zero converting back to the system of equations, we get that the variable $x_i$ never appears, so that any choice of $x_i$ will result in a solution, and hence we have multiple solutions.

Note that if some row's pivot lies in a column after $i$, that row must have a zero entry in column $i$ (since the pivot is by definition the row's leftmost nonzero entry, everything before it in that row is zero). So if column $i$ is not all zero, whatever nonzero entry it has must sit in some row whose own pivot column $j$ satisfies $j < i$ (it can't equal $i$, since $i$ has no pivot).

Take such a row, with pivot at column $j < i$ and entry $a != 0$ at column $i$. Converting back to the system of equations, this row reads
$ x_j + dots + a x_i + dots = b_k $
where the other terms come from any further non-pivot columns between $j$ and $i$. Since column $i$ has no pivot, $x_i$ is a free variable: we may assign it any value we like, and the equation above then forces
$ x_j = b_k - a x_i - dots $
Two different choices of $x_i$ (e.g. $x_i = 0$ and $x_i = 1$) therefore force two different values of $x_j$, giving two distinct solutions to the system. So the system does not have a unique solution.

#pagebreak()



#q(title: "Problem 4")[Let $A$ be a square matrix. Show that if the system $A vb(x) = vb(b)$ has a unique solution for some
particular column vector $vb(b)$, then it has a unique solution for all $vb(b)$.]

#b() Let us convert $(A | vb(b))$ to a RREF matrix, $(A_("RREF") | vb(b)_("RREF"))$. 

Note that since this has a unique solution, this must have a pivot in all columns except the last one, as we showed in Lemma 2.

Now our claim is that for any other column vector, $vb(b)'$, we can also do this for $(A | vb(r)')$. Suppose we used a sequence of operations, $R_1R_2 cdots R_ell$ to convert $(A | vb(b))$ to a RREF matrix. Then, I claim that this sequence of operations also works for $(A | vb(b)')$. Note that each of the elementary row operations will result in $(A | vb(b)') in.rev a_(i j) -> c_1a_(1 j) + c_2a_(2 j) + ... + c_n a_(n j)$ (which follows trivially from what the elementary row operations are), which remains the same regardless of the choices of $a_(m space n+1)$, so that the matrix achieved after the operations $R_1R_2 cdots R_n$ on $(A | vb(b)')$ will have the same entries for entries for the submatrix formed by columns $1$ till $n$, and thus this will be the RREF of $(A | vb(b)')$ 

This will be a RREF because all the pivots move to the right, since the pivots all lied in the first $n$ columns [since the number of columns is $n+1$ and rows $n$, and no pivot was in the last column] of the RREF of $(A | vb(b))$, and the entries in first $n$ columns remain the same, so the pivots move to the right, and all the entries above the pivots are also zero. In particular no pivots occur in the last column---precisely because the pivots are defined as the _first_ non-zero entry.

Since each row will have a pivot here, and the pivot will not occur in the last column, this too will have a unique solution. 

Poorly written, sorry :(
#Q()

#pagebreak()

#q(title: "Problem 6")[
  Prove that for a subset $S$ of $RR^3$, the following are equivalent.

(a) There are scalars $a$, $b$, $c$, not all zero, such that $S = {(x,y,z) |  a x + b y + c z = 0}$.

(b) There are two non-proportional vectors $v$ and $w$ such $S = {p v + q w |  p, q in RR}$

What is a lower dimensional version of this?  Maybe it will help to formulate and prove that first. Can you formulate a higher dimensional version?
]

#b() Note that $S$, as written in (a) is the solution space to:
$ mat(a, b, c) vec(x, y, z) = 0 $

We'll deal with two cases: (i) $a eq.not 0$ and (ii) $a = 0$.

(i) $a eq.not 0$

Multiplying $1\/a$ to both sides of (a) and then some algebra gives you:
$
x = -b/a y - c/a z
$
Notably, then for all $vec(x, y, z)$, we can write:
$ vec(x, y, z) = y vec(-b\/a, 1, 0) + z vec(- c\/a, 0, 1) $
where $y, z in RR$. Thus, 
$
S = {y vec(-b\/a, 1, 0) + z vec(- c\/a, 0, 1) | y, z in RR}
$
where the two vectors are clearly non-proportional. One can more formally argue that these are "essentially" the same set by the equivalence between the tuple $(x, y, z)$, and the vector $vec(x, y, z)$. After that, every member of the set formed by the two vectors is a solution, of course, but then is every solution representable in this way? Suppose not, that indeed there is a solution $(x_0, y_0, z_0)$ that is not a member of the span of the vectors. Then $x_0 eq.not -b\/a y_0 - c\/a z_0$, voiding our assumption that $(x_0, y_0, z_0)$ was a solution of (a).

(ii) $a = 0$

Here, we get that $S$ is the set such that $b x + c y = 0$, which is a line passing through origin. But this is equivalent to the set $S = {a v + 0 | a in RR}$, which is also a straight line passing through the origin#(footnote[one has to be a little careful here, in particular note that both of $b$ and $c$ must be zero, because otherwise we'd have wlog $c z = 0$ for non-zero $b$, for which the vectors must be $0$ and $0$, which are in fact proportional]). Formally, we use $b eq.not 0$ and do what we did in (i).

#line(length: 16.5cm, stroke: 0.01cm)

A generalisation of this (based on what we discussed in class, regarding how the subspaces generated by the span and the solution to $A vb(x) = vb(0)$ are really the same thing) is that:
$
{(x_1, ldots, x_n) | a_1x_1 + cdots + a_n x_n = 0}
$
is at max $n-1$ dimensional, or has a basis comprising of at max $n-1$ vectors. More precisely, it has the dimension of the number of $i$ such that $a_i eq.not 0$ minus one.

#line(length: 16.5cm, stroke: 0.01cm)

A more "physicist"-y way to think about the problem would be to imagine (a) as the set of vectors such that their dot (inner) product with specific vector is $0$, and thus one easily gets the idea of what its "dimension" could be.

#pagebreak()

#q(title: "Problem 0 (optional)")[
  Artin chapter 1, problems 2.2 and 2.3. This is the baseline. It is important to be able to work this out honestly.
]

#b() 
#Q()

#pagebreak()

== Rest of Tutorial 1

_Not part of the homework._

_Nos. 2–4 and 8 are important and will be discussed in class._

#q(title: "Problem 1")[
  Matrices $M$ and $N$ are said to be _row equivalent_ if there is a sequence of elementary row operations that converts $M$ to $N$. See quickly that row equivalence is indeed an equivalence relation. We sketched in class that every matrix is row equivalent to a matrix in row echelon form (REF for short). Write a clean full proof.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 2")[
  Suppose a matrix $M$ is in row echelon form, so pivots in successive rows move to the right as we go down. In particular each entry below a pivot is $0$. If in addition every entry above every pivot entry is also $0$, then $M$ is said to be in _reduced row echelon form_ (RREF). Is every matrix row equivalent to a matrix in RREF? Prove/give a counterexample.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 3")[
  Proving and characterizing the 0/1/infinite trichotomy. Also keep in mind the contrapositive of the statements you prove. Let $M = (A | vb(b))$ be the augmented matrix for a system of linear equations.

  (a) Show that the given system is inconsistent if and only if any REF of $M$ has a pivot in the last column.

  (b) Formulate an "if and only if" statement in similar spirit characterizing when the given system has a unique solution. Same for infinitely many solutions. Now solve Artin problem 2.9.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 5")[
  (a) Formulate and check basic properties of the following matrix operations: addition/subtraction of matrices of the same size, scaling any matrix by a scalar. Later we will say that the set of matrices of a fixed size forms a vector space under these operations.

  (b) This is an exercise in bookkeeping. Carefully write down the general definition of matrix multiplication. Prove that whenever the involved expressions make sense, the following properties hold: $(A B)C = A(B C)$, $A(B + C) = A B + A C$, $(B + C)D = B D + C D$, $A I = A$, $I A = A$ where $I$ is an identity matrix. $A B$ need not equal $B A$ even when $A$ and $B$ are both square matrices of the same size. (Later we will understand all this more conceptually.)

  (c) Look carefully at our procedure to solve a system of linear equations by doing row operations. Does the validity of this procedure depend on any properties of matrix operations?
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 7")[
  Prove that algebraic addition of vectors in $RR^2$ and $RR^3$ agrees with the parallelogram law.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 8")[
  Suppose an $r times c$ matrix $A$ is given. Consider the function from $RR^c$ to $RR^r$ defined by $f(vb(x)) = A vb(x)$. Using row reduction, find a crisp criterion for the function $f$ to be (a) injective, i.e. one-to-one; (b) surjective, i.e. onto.
]

#b() 
#Q()
