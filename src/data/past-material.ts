/**
 * Credits and notes for /academics/past. The files themselves live in
 * public/uni/Past Material, laid out `Sem N / Course / <year> <season> - <who> (<source>)`,
 * and the page lists whatever is there. Edit this file to change the words around them.
 */

/** Who collected what. The key is the text in brackets at the end of a folder name. */
export const SOURCES: Record<string, { name: string; people: string; href: string; covers: string }> = {
  'Arjun Agarwal': {
    name: 'Arjun Agarwal',
    people: 'Arjun Maneesh Agarwal',
    href: 'https://thearjunagarwal.github.io/courses.html',
    covers: 'the 2024 Fall offerings of the first-semester courses',
  },
  fourthground: {
    name: 'fourthground',
    people: 'Tejas Sah and Soham Saha',
    href: 'https://fourthground.codeberg.page/prev_material/index.html',
    covers: '2025 Fall, 2026 Spring and the 2026 Fall semester in progress',
  },
}

/**
 * Notes on single offerings, keyed `Course/<year> <season>`.
 * The 2024 ones are paraphrased from Arjun's page.
 */
export const NOTES: Record<string, string> = {
  'Algebra 1/2024 Fall':
    "No prescribed textbook; Treil's *Linear Algebra Done Wrong* was recommended. Hard problems, lenient grade cutoffs. The homeworks were quiz prep and weren't submitted.",
  'Analysis 1/2024 Fall':
    "Baby Rudin was the textbook; Arjun used Abbott's *Understanding Analysis* instead (solutions included). The exams ran very long, so carry snacks. The other homeworks were Rudin exercises and aren't here.",
  'Intro to Programming (Haskell)/2024 Fall':
    "Taught from Prof. Suresh's slides, with Hutton as a backup. The course was overhauled from 2025 around a new textbook by Hota, Sharma and Agarwal.",
  'Classical Mechanics 1/2024 Fall':
    "Morin, plus Morin's relativity book for the relativity part and [Kevin Zhou's handouts](https://knzhou.github.io/) for harder problems.",
  'Empowerment with English/2024 Fall':
    "The literature changes every year. The linguistics and speaking parts aren't in the materials.",
  'Calculus 1/2026 Spring': 'The "Problem Sheet" link on the source page was dead, so it is missing.',
}
