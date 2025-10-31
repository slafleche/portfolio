import { markdownRef } from './markdownRefs';

export const enData = {
  label: 'English',
  'abbreviated-label': 'EN',
  redirecting: 'Redirecting...',
  title: 'Front-End Developer | Stéphane L. Portfolio',
  description:
    'Stéphane L. builds reusable components, responsive experiences, and brand-faithful interfaces — elevating projects beyond the handoff between design and development.',

  'menu-skip_nav': 'Skip to content',
  'menu-left_label': 'About Me',
  'menu-right_label': 'My Work',
  localeChange: 'Select language',

  'scroll-cue': 'Scroll to content',

  'hero-title': 'Blue–magenta gradient rotation background',
  'hero-alt':
    'Slowly rotating diagonal gradient blending cool blue and soft magenta tones with subtle light bands',
  'hero-title_a': 'Bringing technical focus',
  'hero-title_b': 'to design systems',
  'hero-console_description': 'Decorative code backdrop',
  'hero-cta': "Let\'s connect!",

  'console-curiosity-title': '🔎 Curious?',
  'console-curiosity-test': '[test] 👀 Observer detected.',
  'console-curiosity-result': '[result] Access granted.',
  'console-curiosity-hint':
    '[hint] The code shows what I built; curiosity() shows how I think.',

  'error-video': 'Sorry, your browser cannot play this video',

  approach: 'Approach',
  'approach-href': 'approach',
  'approach-content':
    "Good design systems don't happen by accident.\n\nThey work best when design and development stay in sync, when someone pays attention to how ideas translate from one side to the other.\n\nThat's the space I like to work in: turning design intent into components, theming systems, and patterns that hold together in code. I think about the flow of decisions: how color tokens, motion, and layout all connect so the final product feels consistent and intentional.\n\nFor me, it's about building structure without friction—systems that make it easier for everyone to create something that looks right, feels right, and works right.",

  about: 'About Me',
  'about-href': 'about',
  'about-content':
    "Before I ever wrote a line of code, I studied **Animation Art and Design** before moving into 3D modeling, where I built objects that had to match both artistic vision and strict technical specs. That mix of creative and technical work taught me to observe how things fit together, to notice the systems and patterns beneath the surface.\n\nWhen I moved into front-end development, that same curiosity led me toward user experience, theming, and reusability. I began thinking less about single components and more about how entire interfaces connect—how design decisions scale and how systems stay flexible over time.\n\nI've played a key role in developing a theming system that served multiple products.\n\nIt was built to keep the design language consistent while still allowing each app to express its own identity.\n\nProjects like that shaped how I think about collaboration between design and development: not as a handoff, but as a shared process that keeps ideas coherent from concept to deployment. I think about **developer experience** the same way designers think about user experience: the clearer and more consistent the system, the easier it is for good ideas to carry through.\n\nI try to build environments where teams can focus on the work itself instead of fighting the tools—where design, development, and intent stay aligned from the first sketch to the final release.",

  case_study: 'Case Study',
  'case_study-href': 'case_study',
  'case_study-list': [
    {
      title: 'Theming within the system',
      subTitle: 'seeing the limits',
      content:
        "I began as a **themer**, building client themes inside Vanilla's existing framework. That work exposed me to how the system actually behaved: where it flexed, where it resisted, and how design intent carried through to code. I often had to balance two conflicting pressures: clients who wanted full creative freedom, and my lead, who emphasized restraint to keep refactors safe. I naturally found myself bridging those needs, finding solutions that respected both the visual goals and the system's structural limits.",
    },
    {
      title: 'Streamlining theming',
      subTitle: 'making the system easier to work with',
      content:
        "While theming, I began noticing repeating friction points, duplicated styles, inconsistent spacing, unclear naming. Even though no one else used my work, I started creating small helpers and reusable snippets to make my own process cleaner. Those self-built tools taught me that organization and predictability don't just speed up development, they make the system itself easier to trust.",
    },
    {
      title: 'Joining Research and Development',
      subTitle: 'contributing from inside the system',
      content:
        'I transitioned into **Research and Development (R&D)** as an **Application Web Integrator**, moving from styling on top of the system to shaping how it worked underneath. I contributed directly to the **core product**, adding new functionality, fixing bugs, and refining front-end behavior, while also building the new **Vanilla.com** site independently and collaborating on smaller projects like a Hootsuite integration. As my work began influencing shared code, I started thinking about the developers who would maintain it, including the new themer stepping into my old role. That shift deepened my focus on clarity, maintainability, and developer experience.',
    },
    {
      title: 'Preparing legacy systems',
      subTitle: 'setting the stage for change',
      content:
        "As part of the **Knowledge Base** team, I worked on the front-end foundation that would later support the next generation of Vanilla's products. I helped shape how components were styled, structured, and themed, focusing on consistency, CSS-in-JS practices, and scalable patterns. At the same time, I helped adapt the legacy Forums codebase so it could connect to new theming concepts without breaking. This phase was about building compatibility and resilience, preparing old systems to coexist with what came next.",
    },
    {
      title: 'New Theming System',
      subTitle: 'bridging legacy and modern platforms',
      content:
        "I helped develop a new theming architecture that translated each client's style into a set of **design tokens**, shared values interpreted by every product to its own needs. A concise set of global defaults kept everything consistent, while components could adapt granularly to those tokens. This **token-based decoupling** allowed products to evolve safely: teams could update components without breaking client themes. Even when components were replaced entirely, the design language persisted, proving the system's resilience over time.",
    },
    {
      title: 'Lessons learned',
      subTitle: 'keeping design and development aligned',
      content:
        'Through all of this, I realized that building scalable systems means aligning everyone who touches them, not just the code. The work had to serve **three audiences** at once: the internal team evolving the platform, product developers building on it, and clients defining their brand themes. Keeping intent consistent across those groups became the true measure of success. For me, that alignment—between design, development, and intent—is what turns good systems into lasting ones.',
    },
  ] as const,

  projects: 'Projects',
  'projects-href': 'projects',
  'projects-list': {
    cocacola: {
      title: 'Brigade du Bonheur (Coca-Cola)',
      content:
        "Worked on both the front-end and back-end of Coca-Cola's Brigade du Bonheur campaign site, part of a promotional initiative linked with their Facebook page.",
    },
    ea: {
      title: 'Electronic Arts (EA)',
      content:
        "Worked on a theme for EA's community forums that was adopted across several properties, including many of their sports titles. The theme reduced the need for separate custom builds and simplified long-term maintenance for both teams.",
    },
    banq: {
      title: 'BAnQ (via InMedia)',
      content:
        "Worked on InMedia's library management system, used by BAnQ and other institutions in Canada and France. Focused on bringing structure and consistency to a front-end that had grown complex over time.",
    },
    hootsuite: {
      title: 'Hootsuite (internal collaboration)',
      content:
        'Collaborated with the Chief Product Officer and Founder on an early test using React. Built HTML/CSS prototypes to support his research and explore how the framework could fit into future product development.',
    },
    kingGames: {
      title: 'King Games',
      content:
        'One of the first real tests of the new theming system. Collaborated with the themer assigned to their project, offering guidance and observing early pain points to refine how the system performed in real client work.',
    },
  },
  contact: 'Contact',
  'contact-href': 'contact',
  'contact-content':
    "Think we'd work well together? Contact me on [LinkedIn!](https://www.linkedin.com/in/slafleche)",
  'contact-github':
    'Site sources available on [GitHub](https://github.com/slafleche/portfolio)!',

  'systems-title': 'Ship of Theseus: Structure that endures',
  'systems-title_a': 'Ship of Theseus: ',
  'systems-title_b': 'structure that endures',
  'systems-process': 'Process',
  'systems-process-href': 'systems-process',
  'systems-describe': 'Describe',
  'systems-describe-href': 'systems-describe',
  'systems-express': 'Express',
  'systems-express-href': 'systems-express',
  'systems-integrate': 'Integrate',
  'systems-integrate-href': 'systems-integrate',
  ...markdownRef('systems-content'),
  'systems-link-label': 'Systems',
} as const;

export type EnData = typeof enData;
