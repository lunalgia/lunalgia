// Bookmarks. Edit freely: everything on /bookmarks is generated from this file.
//
// Articles carry subject tags; on the page the tags become filters (pick one or
// several, or search). Add a tag by using it; it shows up as a filter by itself.
// Videos are grouped by topic; their titles and thumbnails come from YouTube at
// build time, so a bare link is enough.
export interface Quote { text: string; by?: string }
export interface Article { title: string; href: string; tags: string[]; note?: string }
export interface VideoGroup { topic: string; videos: string[] }

export const quotes: Quote[] = [
  {
    "text": "The price of metaphor is eternal vigilance.",
    "by": "Norbert Wiener"
  },
  {
    "text": "Whenever I am around people I feel crazy. I feel like some madman the moment I open my mouth, I don't adhere to what most people like. [...] I don't even know alot about what I like, despite being well liked, I feel so out of place."
  },
  {
    "text": "You all have a little bit of “I want to save the world” in you. I want you to know that it’s okay if you only save one person, and it’s okay if that person is you.",
    "by": "Evan Chen"
  },
  {
    "text": "I think it’s really important to not have an opinion on things you don’t know much about.",
    "by": "Yi Sun"
  },
  {
    "text": "Never underestimate results that count something.",
    "by": "Fraleigh"
  },
  {
    "text": "Stop fooling yourself, scrambling to barely qualify an exam isn’t ambition, it’s avoidance of real effort. You’re not just competing to pass; you’re competing with people who own their knowledge. Rushing makes you fragile, and when the real challenges come, you’ll break. Mediocrity doesn’t impress anyone."
  },
  {
    "text": "He who sees how far he can lean out of a window without falling is a moron."
  }
]

export const articles: Article[] = [
  { title: "Mathematical Formalisation of Dimensional Analysis", href: "https://terrytao.wordpress.com/2012/12/29/a-mathematical-formalisation-of-dimensional-analysis/", tags: ["math", "physics"] },
  { title: "Didaktikogenic Physics Misconceptions", href: "https://dsimanek.vialattea.net/scenario/miscon.htm", tags: ["physics", "learning"] },
  { title: "Great Mathematicians on Math Competitions and “Genius”", href: "https://www.lesswrong.com/posts/EdFDwjsLNpgtTMJAp/great-mathematicians-on-math-competitions-and-genius", tags: ["math", "learning", "rationality"] },
  { title: "Danger of Analogies", href: "https://dsimanek.vialattea.net/scenario/analogy.htm", tags: ["physics", "learning"] },
  { title: "So You Want to Be a Physicist: A 22 Part Guide", href: "https://www.physicsforums.com/threads/so-you-want-to-be-a-physicist-a-22-part-guide.240792/", tags: ["physics", "learning"] },
  { title: "Infinitely Many Stages of Grief", href: "https://blog.evanchen.cc/2024/04/05/grief/", tags: ["learning", "life"] },
  { title: "A Story of A Town", href: "https://blog.evanchen.cc/2023/10/23/a-story-of-a-town/", tags: ["learning", "life"] },
  { title: "On Choosing Exercises", href: "https://blog.evanchen.cc/2020/06/14/on-choosing-exercises/", tags: ["math", "learning"] },
  { title: "Terence Tao's Career Advice", href: "https://terrytao.wordpress.com/career-advice/", tags: ["math", "learning"] },
  { title: "Bartosz Ciechanowski's articles", href: "https://ciechanow.ski/archives/", tags: ["science", "visual"], note: "Really wonderful, definitely worth having a look at." },
  { title: "Coffin Problems", href: "https://www.tanyakhovanova.com/Coffins/coffinsmain.html", tags: ["math", "history"], note: "Especially interesting for the history behind them." },
  { title: "What Football Will Look Like in the Future", href: "https://www.sbnation.com/a/17776-football/chapter-1", tags: ["fiction"] },
  { title: "The Pudding", href: "https://pudding.cool/", tags: ["visual", "culture"] },
  { title: "The Age of the Essay", href: "https://paulgraham.com/essay.html", tags: ["writing"] },
  { title: "What You Can't Say", href: "https://paulgraham.com/say.html", tags: ["rationality", "writing"] },
  { title: "The GNU Manifesto", href: "https://www.gnu.org/gnu/manifesto.en.html", tags: ["computing"] },
  { title: "The Hitler - Mannerheim Conversation", href: "https://www.youtube.com/watch?v=ClR9tcpKZec", tags: ["history"], note: "Very interesting historically." },
  { title: "Project MK-ULTRA", href: "https://www.cia.gov/readingroom/docs/project%20mk-ultra%5B15545700%5D.pdf", tags: ["history"] },
  { title: "History of the Net", href: "/files/god.txt", tags: ["computing", "history"] },
  { title: "HOUNDING TEENAGE HACKERS DON'T PLUG THOSE LEAKY COMPUTERS", href: "/files/hunt.txt", tags: ["computing", "history"], note: "A funny txt file written in 1984." },
  { title: "CIA Memo on Communist Brainwashing.", href: "/files/ciabranwashing.txt", tags: ["history"] },
  { title: "Etymology of “Foo”", href: "https://datatracker.ietf.org/doc/html/rfc3092", tags: ["computing"] },
  { title: "Are there any important biographies of nobodies?", href: "https://history.stackexchange.com/questions/52991/are-there-any-important-biographies-of-nobodies", tags: ["history"] },
]

// Grouped by topic (my guesses from the titles; move freely). The comment is the title, for finding things.
export const videos: VideoGroup[] = [
  {
    topic: "Living, and how to",
    videos: [
      "https://www.youtube.com/watch?v=cGzBaSBdikA", // The Infinite Weight of Mediocrity
      "https://youtu.be/ZHvstGX1d4U?si=cpmQrn3naV2XNct2", // I only wanted to be normal...
      "https://www.youtube.com/watch?v=NESBtODxNVA", // Existential Crisis in Class
      "https://youtu.be/6QltxZ-vPMc?si=-Z5pZZzJDmSar6o1E", // Why we can't focus.
      "https://www.youtube.com/watch?v=lhb62S3-eAY", // Nihilism.mp4
      "https://www.youtube.com/watch?v=kcjK9HSFqMs", // people strive to be fantasies of themselves
      "https://www.youtube.com/watch?v=hi97EGoLmGE", // forming real human connections? sounds fake but ok
      "https://www.youtube.com/watch?v=jKV-cym4QfQ", // i could write my magnum opus or i could simply go to bed
      "https://www.youtube.com/watch?v=pg_5L4OgyLM", // what is love. baby you're hurting me ow ow ow
      "https://www.youtube.com/watch?v=mPXLP9mYRi4", // if i'm you and you're me then...who's that
      "https://youtu.be/PV7_JIylFH0?si=JYugBR4ddjSmcBN-", // "I'll never amount to anything"
      "https://www.youtube.com/watch?v=JCQs4JEg6kY", // You Can't Hate Yourself Into Loving Yourself
      "https://www.youtube.com/watch?v=pe2acVlqrJw", // Genetic grief
      "https://youtu.be/iNKqWaimAc0?si=REUT8KVuvdTvrZur", // Empathy for the Inanimate
    ],
  },
  {
    topic: "Art, writing and culture",
    videos: [
      "https://www.youtube.com/watch?v=AlF3fWHIu_I", // Why Writing Fiction is Worth It
      "https://www.youtube.com/watch?v=rZwlAcQVzDE", // Who Can Write Whose Story?
      "https://www.youtube.com/watch?v=iqW9sexNdZg", // The Charlie Rose Paradox
      "https://youtu.be/6Ft_sVB0rOM?si=LLx3uG6Brp_4OniX", // Sitcom Simulacrum
      "https://youtu.be/FseXEJ7myk4?si=x-kalbnXrada-8v7", // The Alt-Right in Tabletop Games
      "https://youtu.be/F3fdXYQCDZ8?si=3xlpX8Twk5_o7vah", // What Does "the" Even Mean?
      "https://www.youtube.com/watch?v=I65oL91O_aM", // Atypography - Art Movement Introduction
      "https://www.youtube.com/watch?v=huYpeHW7eGM", // I Typed a Dog
    ],
  },
  {
    topic: "Stories and short films",
    videos: [
      "https://www.youtube.com/watch?v=RrUqhfGgL3o", // There Are Mountains in the Clouds
      "https://www.youtube.com/watch?v=zgXgkpu7pkg", // Birds Do Not Sing in Caves
      "https://www.youtube.com/watch?v=mDjrTkssZmE", // O, Death!
      "https://www.youtube.com/watch?v=ZOkRF3Xp_4E", // Yes, You Are Living in a Simulation
      "https://www.youtube.com/watch?v=dzdMceG49Wc", // Elysium
      "https://www.youtube.com/watch?v=ZZOqk8W-a24", // The Diary of a Teenager
      "https://www.youtube.com/watch?v=FqkEQ6jRJUk", // half time.
      "https://www.youtube.com/watch?v=FfNZFspSmD4", // BRIEFCHASE
      "https://www.youtube.com/watch?v=8kUDvn_N_Ow", // no, the moon.
      "https://youtu.be/DcINv6NePZc?si=-sCz7JQJqn0Ei4rq", // Socialization Simulator
      "https://www.youtube.com/watch?v=_aAN1bPzpTU", // Switzerland
      "https://www.youtube.com/watch?v=BCpFTsuuQv0", // everything (and more)
    ],
  },
  {
    topic: "Music",
    videos: [
      "https://youtu.be/N8xpAZJp0fU?si=yY5jjBvjpltqoSyZ", // an astronomer meets a violinist
      "https://www.youtube.com/watch?v=Xe2Pr4omHMs", // glimpse of us if chopin composed it
      "https://www.youtube.com/watch?v=qGHXXBOyomE", // 안코하/杏こは  - I Do Adore
      "https://www.youtube.com/watch?v=plEw2WNkd9Y", // i feel this is the best harmony ive ever written
    ],
  },
  {
    topic: "Science and curiosities",
    videos: [
      "https://youtu.be/zHL9GP_B30E?si=6R_NsUMG_rtj-F8J", // Illusions of Time
      "https://www.youtube.com/watch?v=xHd4zsIbXJ0", // All The Ghosts You Will Be
      "https://youtu.be/vjqt8T3tJIE?si=JSUAxxBxtBsKWvJw", // Did People Used To Look Older?
      "https://www.youtube.com/watch?v=u6EuAUjq92k", // A First Look At Raytraced Audio
      "https://youtu.be/mOJlg8g8_yw?si=41Cy5Bxnyjlb_ESU", // The History of Tetris World Records
    ],
  },
  {
    topic: "Making things",
    videos: [
      "https://www.youtube.com/watch?v=b6rUk3YLsN0", // I Put a Mechanical Keyboard INSIDE My Laptop
      "https://www.youtube.com/watch?v=PJccc3qpPh0", // I built an Ultrawide DS ... a DIY Steam Deck thingy.
    ],
  },
]
