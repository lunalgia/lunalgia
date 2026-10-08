#import "@preview/nova-pset:0.1.0": *
#import "@preview/adaptive-dots:0.1.0": adaptive-dots, ldots, cdots
#show math.equation: set text(font: "Libertinus Math")
#show: adaptive-dots
#let class = "Algebra 1"
#let assignment = "Tutorial sheet 5"
#let author = "Lilian"
// To use a logo, add an image to this folder and replace none:
// #let logo = image("your-logo.png", height: 25pt)
#let logo = none
#let instructor = "Prof. Upendra"
#let semester = "Fall 2026"
#let due-time = "Friday, 02/10/2026"
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

_Moodle names no separate HW subset for this sheet. It says: if you have not done the HW 4 computations, finish them and submit, especially 11(a) and (c). Those are in HW 4 - Lilian.typ._

#pagebreak()

== Rest of Tutorial 5

_Transcribed from the Moodle assignment page; no PDF was posted. Board images are in Board work/2026-09-17.pdf._

#q(title: "Problem 1: Magic basis")[
  Check the example given in class in the Sep 17-3 board image: appreciate how the given linear function $f(vb(x)) = A vb(x)$ has a simple diagonal matrix with respect to a magic basis. How to find such a magic basis will be a major goal for us in the next few lectures.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 2: Projections")[
  An operator $T$ on a vector space $V$ is called a _projection_ if its square is itself: $T^2 = T$. Show that if $T$ is a projection, then $V$ is the internal direct sum of $"image"(T)$ and $ker(T)$. Is this statement true if $V$ is not finite dimensional?

  Note: earlier the problem also asked you to prove the converse, but the converse is false (as pointed out by Pradyun). Counterexample? Can you think of an extra condition that would give an if and only if statement? It may help to figure out the reason behind the name _projection_.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 3: Direct sums")[
  Artin chapter 3, problems 5.1, 5.2, 5.3.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 4 (SMMC 2023)")[
  Let $n$ be a positive integer. Let $A$, $B$ and $C$ be three $n$-dimensional subspaces of $RR^(2n)$ with the property that $A inter B = B inter C = C inter A = {vb(0)}$. Prove that there exists a basis ${vb(a)_1, ldots, vb(a)_n}$ of $A$, a basis ${vb(b)_1, ldots, vb(b)_n}$ of $B$ and a basis ${vb(c)_1, ldots, vb(c)_n}$ of $C$ such that for each $i in {1, ldots, n}$, the vectors $vb(a)_i$, $vb(b)_i$ and $vb(c)_i$ are linearly dependent.
]

#b() 
#Q()

#pagebreak()

#q(title: "Problem 5: Fields")[
  Verify that the examples in the Sep 17-5 board image are fields. Then review for yourself that ALL concepts we have seen so far go through when $RR$ is replaced by any field.
]

#b() 
#Q()
