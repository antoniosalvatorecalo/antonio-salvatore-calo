/* ───────────────────────────────────────────────────────────
   translations.ts — EN/IT translation dictionary
   ─────────────────────────────────────────────────────────── */

export type Locale = 'EN' | 'IT';

type TranslationMap = Record<string, { EN: string; IT: string }>;

const translations: TranslationMap = {
  // ── Navigation ──────────────────────────────────────────────
  'nav.work': { EN: 'Work', IT: 'Lavori' },
  'nav.about': { EN: 'About', IT: 'Info' },
  'nav.contact': { EN: 'Contact', IT: 'Contatti' },
  'nav.home': { EN: 'Home', IT: 'Home' },
  'nav.project': { EN: 'Project', IT: 'Progetto' },

  // ── Accessibility ────────────────────────────────────────
  'skip.content': { EN: 'Skip to content', IT: 'Salta al contenuto' },
  'aria.back-home': { EN: 'Back to home', IT: 'Torna alla home' },
  'aria.back-top': { EN: 'Back to top', IT: 'Torna su' },

  // ── Section Titles ──────────────────────────────────────────
  'section.context': { EN: 'Context', IT: 'Contesto' },
  'section.brief': { EN: 'Brief', IT: 'Brief' },
  'section.problem': { EN: 'The Problem', IT: 'Il Problema' },
  'section.solutions': { EN: 'Core Solutions', IT: 'Soluzioni' },
  'section.case-study': { EN: 'Full Case Study', IT: 'Caso Studio' },
  'section.live-website': { EN: 'Live Website', IT: 'Sito Live' },
  'section.visual-design': { EN: 'Visual Design', IT: 'Design Visivo' },
  'section.prototype': { EN: 'Prototype', IT: 'Prototipo' },

  // ── Metadata Labels ─────────────────────────────────────────
  'meta.year': { EN: 'Year', IT: 'Anno' },
  'meta.industry': { EN: 'Industry', IT: 'Settore' },
  'meta.location': { EN: 'Location', IT: 'Sede' },
  'meta.deliverables': { EN: 'Deliverables', IT: 'Deliverable' },
  'meta.recognition': { EN: 'Recognition', IT: 'Riconoscimenti' },
  'meta.credits': { EN: 'Credits', IT: 'Crediti' },

  'media.alt': { EN: 'Project Media', IT: 'Media del Progetto' },

  // ── Credit Labels ───────────────────────────────────────────
  'credit.institute': { EN: 'Institute', IT: 'Istituto' },
  'credit.project': { EN: 'Project', IT: 'Progetto' },
  'credit.team': { EN: 'Team', IT: 'Team' },
  'credit.tech-stack': { EN: 'Tech Stack', IT: 'Stack Tecnico' },
  'credit.mentorship': { EN: 'Mentorship', IT: 'Mentorship' },
  'credit.recognition': { EN: 'Recognition', IT: 'Riconoscimenti' },
  'credit.role': { EN: 'Role', IT: 'Ruolo' },
  'credit.collaborations': { EN: 'Collaborations', IT: 'Collaborazioni' },

  // ── CTA / Button Labels ─────────────────────────────────────
  'cta.view-project': { EN: 'View Project', IT: 'Vedi Progetto' },
  'cta.view-prototype': { EN: 'View Prototype', IT: 'Vedi Prototipo' },
  'cta.discover-process': { EN: 'Discover the Process', IT: 'Scopri il Processo' },
  'cta.open-live': { EN: 'Open Live Website', IT: 'Apri Sito Live' },
  'cta.send-message': { EN: 'Send this message', IT: 'Invia messaggio' },
  'cta.send-another': { EN: 'Send another message', IT: 'Invia un altro messaggio' },
  'cta.start-over': { EN: 'Start over', IT: 'Ricomincia' },
  'cta.process': { EN: 'Process', IT: 'Processo' },
  'cta.live': { EN: 'Live', IT: 'Live' },
  'cta.prototype': { EN: 'Prototype', IT: 'Prototipo' },

  // ── View Switcher ───────────────────────────────────────────
  'view.featured': { EN: 'Featured', IT: 'In Primo Piano' },
  'view.list': { EN: 'List', IT: 'Lista' },
  'view.grid': { EN: 'Grid', IT: 'Griglia' },
  'view.switcher-label': { EN: 'Work view switcher', IT: 'Cambia vista lavori' },

  // ── Project Hero Lines ──────────────────────────────────────
  'hero.bugonia': { EN: 'Bugonia', IT: 'Bugonia' },
  'hero.ticket-first': { EN: 'Ticket First', IT: 'Ticket First' },
  'hero.website-concept': { EN: 'Website Concept', IT: 'Concept Sito Web' },
  'hero.newsquest': { EN: 'Newsquest', IT: 'Newsquest' },
  'hero.mobile-news': { EN: 'Mobile News', IT: 'Notizie Mobile' },
  'hero.aggregator': { EN: 'Aggregator', IT: 'Aggregatore' },
  'hero.bugonia-full': {
    EN: 'Bugonia Ticket First Website Concept',
    IT: 'Bugonia Ticket First Concept Sito Web',
  },
  'hero.newsquest-full': {
    EN: 'Newsquest Mobile News Aggregator',
    IT: 'Newsquest Aggregatore Notizie Mobile',
  },

  // ── Project Descriptions (Bugonia) ──────────────────────────
  'bugonia.desc-col1': {
    EN: "Ticket-first website concept for the independent film Bugonia. Built to convert, not just present. A persistent Quick-Buy layer keeps ticket access immediate across all scroll states, while expressive typography and a dark editorial atmosphere reflect the film's distinct visual identity. Developed as a Master bonus track at Talent Garden Rome under the mentorship of Paper Tiger Studio.",
    IT: "Concept di sito web ticket-first per il film indipendente Bugonia. Progettato per convertire, non solo per presentare. Un layer Quick-Buy persistente mantiene l'accesso ai biglietti immediato in ogni stato di scroll, mentre la tipografia espressiva e l'atmosfera editoriale scura riflettono l'identità visiva del film. Sviluppato come bonus track del Master in UI Design a Talent Garden Roma sotto la mentorship di Paper Tiger Studio.",
  },
  'bugonia.desc-col2': {
    EN: 'The website combines expressive typography, dynamic animations, and a seamless ticket booking flow that feels as engaging as the film itself.',
    IT: 'Il sito combina tipografia espressiva, animazioni dinamiche e un flusso di acquisto biglietti fluido coinvolgente quanto il film stesso.',
  },
  'bugonia.section.context': {
    EN: "Bonus track project developed under Mirko Santangelo, Creative Director of Paper Tiger Studio. Part of the Master's program in User Interface Design at Talent Garden in Rome.",
    IT: 'Progetto bonus track sviluppato sotto la mentorship di Mirko Santangelo, Creative Director di Paper Tiger Studio. Parte del Master in User Interface Design presso Talent Garden a Roma.',
  },
  'bugonia.section.brief': {
    EN: "Expressive website for desktop and mobile. It presents the film with depth, converts visitors into ticket buyers for the LA premiere, and reflects Bugonia's distinct visual identity.",
    IT: "Sito web espressivo per desktop e mobile. Presenta il film con profondità, converte i visitatori in acquirenti di biglietti per la premiere a Los Angeles e riflette l'identità visiva distintiva di Bugonia.",
  },
  'bugonia.section.problem': {
    EN: 'Film sites optimize for browsing, not converting. Ticket CTAs hide mid-scroll or disappear entirely. Competing content delays the main action. Mobile flows remain unclear and broken.',
    IT: "I siti dei film ottimizzano per la navigazione, non per la conversione. I CTA per i biglietti si nascondono durante lo scroll o scompaiono del tutto. I contenuti concorrenti ritardano l'azione principale. I flussi mobile rimangono poco chiari e frammentati.",
  },
  'bugonia.section.solutions': {
    EN: 'Sticky Quick-Buy Layer makes the ticket CTA persistent across all scroll states. Search, profile, and merch stay accessible in the nav without distracting from the primary conversion path.',
    IT: 'Il layer Quick-Buy sticky rende il CTA per i biglietti persistente in ogni stato di scroll. Ricerca, profilo e merchandising restano accessibili nella navigazione senza distrarre dal percorso di conversione principale.',
  },
  'bugonia.section.case-study': {
    EN: 'Explore the complete design process, from research and competitive analysis to interaction decisions, detailed documentation, and high-fidelity visuals. All published on Behance.',
    IT: "Esplora l'intero processo di design, dalla ricerca e analisi competitiva alle decisioni di interazione, documentazione dettagliata e visual ad alta fedeltà. Tutto pubblicato su Behance.",
  },
  'bugonia.section.live': {
    EN: 'Step into the Bugonia universe. The dark aesthetic, the Conversion Navigation, and the sticky quick-buy layer come together in a fully deployed and interactive production build.',
    IT: "Entra nell'universo Bugonia. L'estetica scura, la Conversion Navigation e il layer quick-buy sticky si uniscono in un build di produzione completamente deployato e interattivo.",
  },

  // ── Project Descriptions (Newsquest) ────────────────────────
  'newsquest.desc-col1': {
    EN: 'A mobile news aggregator built to rebuild trust in journalism. Newsquest surfaces verified sources with AI-powered glossaries and live context, one story at a time. Dark editorial interface, neon-green credibility signals, and swipe-based discovery designed for young adults who demand both depth and speed. Capstone project at Talent Garden Rome, spanning field research, user interviews, journey mapping, and full high-fidelity prototyping.',
    IT: 'Un aggregatore di notizie mobile progettato per ricostruire la fiducia nel giornalismo. Newsquest mostra fonti verificate con glossari AI e contesto live, una storia alla volta. Interfaccia editoriale scura, segnali di credibilità verde neon e scoperta basata su swipe progettata per giovani adulti che richiedono profondità e velocità. Progetto finale a Talent Garden Roma, comprendente ricerca sul campo, interviste utente, mappatura dei percorsi e prototipazione ad alta fedeltà.',
  },
  'newsquest.desc-col2': {
    EN: 'The app features an intuitive swipe-based interface for content discovery, integrated fact-checking indicators, and customizable news feeds that adapt to user preferences.',
    IT: "L'app offre un'interfaccia intuitiva basata su swipe per la scoperta di contenuti, indicatori di fact-checking integrati e feed di notizie personalizzabili che si adattano alle preferenze dell'utente.",
  },
  'newsquest.section.context': {
    EN: "Capstone project from the Master's in UI Design at Talent Garden Rome. It spans field research, user interviews, journey mapping, affinity mapping, and full high-fidelity prototyping.",
    IT: 'Progetto finale del Master in UI Design presso Talent Garden Roma. Comprende ricerca sul campo, interviste utente, mappatura dei percorsi, mappatura delle affinità e prototipazione ad alta fedeltà.',
  },
  'newsquest.section.brief': {
    EN: 'A mobile news aggregator built to restore trust in journalism. Curates verified sources into interactive formats that help young adults consume news critically and stay genuinely engaged.',
    IT: 'Un aggregatore di notizie mobile progettato per ripristinare la fiducia nel giornalismo. Cura fonti verificate in formati interattivi che aiutano i giovani adulti a consumare notizie in modo critico e a rimanere coinvolti.',
  },
  'newsquest.section.problem': {
    EN: "Young users face overload from fragmented, unverified content. Lack of context weakens critical thinking. Social media fills the gap without journalism's rigour. Disengagement follows.",
    IT: 'I giovani utenti affrontano un sovraccarico di contenuti frammentati e non verificati. La mancanza di contesto indebolisce il pensiero critico. I social media colmano il divario senza il rigore del giornalismo. Segue il disimpegno.',
  },
  'newsquest.section.solutions': {
    EN: 'Trust Layer surfaces verified sources with AI glossaries and live context. Immersive Formats serve one story at a time through modular text, video explainers, and interactive timelines.',
    IT: 'Il Trust Layer mostra fonti verificate con glossari AI e contesto live. I formati immersivi presentano una storia alla volta attraverso testo modulare, video esplicativi e timeline interattive.',
  },
  'newsquest.section.visual': {
    EN: 'Dark interface reduces eye strain and foregrounds multimedia. Neon green signals verified content and guides primary actions. Editorial structure keeps full reader control at every step.',
    IT: "L'interfaccia scura riduce l'affaticamento visivo e mette in primo piano i contenuti multimediali. Il verde neon segnala i contenuti verificati e guida le azioni primarie. La struttura editoriale mantiene il pieno controllo del lettore in ogni fase.",
  },
  'newsquest.section.prototype': {
    EN: 'Navigate the full Newsquest experience in Figma. Explore trust layers, swipe-based storytelling, verified source indicators, and the immersive dark editorial interface in high fidelity.',
    IT: "Naviga l'esperienza completa di Newsquest in Figma. Esplora i trust layer, lo storytelling basato su swipe, gli indicatori di fonti verificate e l'interfaccia editoriale scura immersiva in alta fedeltà.",
  },

  // ── About ────────────────────────────────────────────────────
  'about.label': { EN: 'About', IT: 'Info' },
  'about.bio': {
    EN: 'I am a designer driven to challenge conventions. I blend visual clarity and strategic thinking to turn complex problems into bold digital experiences, shaping brands and products in unexpected ways.',
    IT: 'Sono un designer guidato dalla voglia di sfidare le convenzioni. Combino chiarezza visiva e pensiero strategico per trasformare problemi complessi in esperienze digitali audaci, plasmando brand e prodotti in modi inaspettati.',
  },

  // ── Header (labels hard-coded in SiteHeader) ────────────────
  'header.menu-cta.contact': { EN: 'Start a project', IT: 'Inizia un progetto' },
  'header.email-me': { EN: 'Email Me', IT: 'Email Me' },
  'header.email-copied': { EN: 'Copied!', IT: 'Copiato!' },
  'header.copy-email': { EN: 'Copy email address', IT: 'Copia indirizzo email' },
  'header.contact': { EN: 'Contact:', IT: 'Contatti:' },
  'header.back': { EN: '< Back', IT: '< Indietro' },
  'header.select-work': { EN: 'Select Work', IT: 'Lavori selezionati' },
  'header.services': { EN: 'Services', IT: 'Servizi' },
  'header.recognition': { EN: 'Recognition', IT: 'Riconoscimenti' },
  'header.language': { EN: 'Language', IT: 'Lingua' },

  // ── Visual Index (home grid + project detail) ──────────────
  'visualIndex.filterLabel': { EN: 'Filter projects', IT: 'Filtra progetti' },
  'visualIndex.filterAll': { EN: 'All', IT: 'Tutti' },
  'visualIndex.filterIdentity': { EN: 'Identity', IT: 'Identity' },
  'visualIndex.filterMotion': { EN: 'Motion', IT: 'Motion' },
  'visualIndex.filterResearch': { EN: 'Research', IT: 'Research' },
  'visualIndex.filterWeb': { EN: 'Web', IT: 'Web' },
  'visualIndex.openAria': { EN: 'Open project', IT: 'Apri progetto' },
  'visualIndex.empty': {
    EN: 'No projects match the current filter.',
    IT: 'Nessun progetto corrisponde al filtro.',
  },
  'visualIndex.backToGrid': { EN: 'Back to grid', IT: 'Torna alla griglia' },
  'visualIndex.aboutProject': { EN: 'About Project', IT: 'Info Progetto' },
  'visualIndex.liveSite': { EN: 'Live Site', IT: 'Sito Live' },
  'visualIndex.back': { EN: 'Back', IT: 'Indietro' },
  'visualIndex.prev': { EN: 'Prev', IT: 'Prec' },
  'visualIndex.next': { EN: 'Next', IT: 'Succ' },
  'media.image-unavailable': { EN: 'Image unavailable.', IT: 'Immagine non disponibile.' },
  'media.close': { EN: '[close x]', IT: '[chiudi x]' },
  'media.previous': { EN: 'Previous image', IT: 'Immagine precedente' },
  'media.next': { EN: 'Next image', IT: 'Immagine successiva' },
  'media.video': { EN: 'video', IT: 'video' },

  // ── Awards ─────────────────────────────────────────────────
  'awards.faber-meeting-desc': {
    EN: 'Selected — Independent Design Track.',
    IT: 'Selezionato — Independent Design Track.',
  },

  // ── Artwork ────────────────────────────────────────────────
  'artwork.grid-title': { EN: 'Artwork', IT: 'Artwork' },
  'artwork.view-grid': { EN: 'Grid', IT: 'Griglia' },
  'artwork.view-carousel': { EN: 'Carousel', IT: 'Carosello' },

  // ── Principles ───────────────────────────────────────────────
  'principles.label': { EN: 'Principles', IT: 'Principi' },
  'principles.vc-title': { EN: 'Visual Clarity', IT: 'Chiarezza Visiva' },
  'principles.vc-desc': {
    EN: 'Every pixel carries intention. I strip away the superfluous until only what matters remains — crafting interfaces where hierarchy is instant, typography breathes, and the user never has to ask "what do I do next?" because the design already answered.',
    IT: 'Ogni pixel ha un\'intenzione. Elimino il superfluo fino a lasciare solo ciò che conta — creando interfacce dove la gerarchia è istantanea, la tipografia respira, e l\'utente non deve mai chiedersi "cosa faccio?" perché il design ha già risposto.',
  },
  'principles.st-title': { EN: 'Strategic Thinking', IT: 'Pensiero Strategico' },
  'principles.st-desc': {
    EN: "Design without strategy is decoration. I start with the business problem, map the user's mental model, then architect solutions that serve both — balancing desirability, viability, and feasibility into products that don't just look good but actually perform.",
    IT: "Il design senza strategia è decorazione. Parto dal problema di business, mappo il modello mentale dell'utente, poi architetto soluzioni che servano entrambi — bilanciando desiderabilità, fattibilità e sostenibilità in prodotti che non solo sono belli ma funzionano davvero.",
  },
  'principles.uc-title': { EN: 'User-Centric', IT: "Centrato sull'Utente" },
  'principles.uc-desc': {
    EN: 'Empathy is my compass. Every component, flow, and micro-interaction is tested against real behaviour — not assumptions. I design for the edges, the hesitations, the split-second decisions people make, turning friction into flow and confusion into clarity.',
    IT: "L'empatia è la mia bussola. Ogni componente, flusso e micro-interazione è testato contro comportamenti reali — non supposizioni. Progetto per i margini, le esitazioni, le decisioni in frazioni di secondo che le persone prendono, trasformando l'attrito in flusso e la confusione in chiarezza.",
  },

  // ── Principles (condensed — page-level section) ──────
  'principles.vc-desc-short': {
    EN: 'Turning complex problems into bold, intuitive digital experiences.',
    IT: 'Trasformare problemi complessi in esperienze digitali audaci e intuitive.',
  },
  'principles.st-desc-short': {
    EN: 'Combining strategy with a flair for disruptive ideas.',
    IT: 'Combinare strategia con un tocco di idee dirompenti.',
  },
  'principles.uc-desc-short': {
    EN: 'Shaping brands, products, and experiences in unexpected ways.',
    IT: 'Plasmare brand, prodotti ed esperienze in modi inaspettati.',
  },

  // ── Services ─────────────────────────────────────────────────
  'services.label': { EN: 'Services', IT: 'Servizi' },
  'services.ui-design': { EN: 'UI Design', IT: 'UI Design' },
  'services.ui-desc': {
    EN: 'Sharp visual systems for interfaces that need to feel deliberate, legible, and alive without wasting a single pixel.',
    IT: 'Sistemi visivi precisi per interfacce che devono sentirsi deliberate, leggibili e vive senza sprecare un singolo pixel.',
  },
  'services.ux-design': { EN: 'UX Design', IT: 'UX Design' },
  'services.ux-desc': {
    EN: 'Clear flows, fast decisions, and product logic shaped so people understand what to do before they need instructions.',
    IT: 'Flussi chiari, decisioni rapide e logica di prodotto modellata in modo che le persone capiscano cosa fare prima di aver bisogno di istruzioni.',
  },
  'services.web-design': { EN: 'Web Design', IT: 'Web Design' },
  'services.web-desc': {
    EN: 'Responsive pages that move from concept to polished live experience, keeping brand, motion, and usability in sync.',
    IT: "Pagine responsive che passano dal concept a un'esperienza live rifinita, mantenendo brand, motion e usabilità in sincronia.",
  },
  'services.systems': { EN: 'Systems', IT: 'Sistemi' },
  'services.systems-desc': {
    EN: 'Reusable tokens, components, and rules that keep visual decisions consistent while leaving room for strong custom moments.',
    IT: 'Token, componenti e regole riutilizzabili che mantengono coerenti le decisioni visive lasciando spazio a momenti personalizzati di impatto.',
  },
  'services.prototypes': { EN: 'Prototypes', IT: 'Prototipi' },
  'services.prototypes-desc': {
    EN: 'Clickable proofs for testing structure, timing, and interaction before heavy build work locks the wrong thing in place.',
    IT: 'Proof cliccabili per testare struttura, tempi e interazione prima che un lavoro di sviluppo pesante blocchi la cosa sbagliata.',
  },
  'services.motion': { EN: 'Motion', IT: 'Motion' },
  'services.motion-desc': {
    EN: 'Purposeful transitions and micro-interactions that clarify state, guide attention, and make digital surfaces feel more tactile.',
    IT: "Transizioni mirate e micro-interazioni che chiariscono lo stato, guidano l'attenzione e rendono le superfici digitali più tattili.",
  },

  // ── Contact ──────────────────────────────────────────────────
  'contact.role': { EN: 'Web & UI Designer', IT: 'Web & UI Designer' },
  'contact.location': { EN: 'Based in Benevento, Italy', IT: 'Sede: Benevento, Italia' },
  'contact.email': {
    EN: 'antonio.salvatore.calo@gmail.com',
    IT: 'antonio.salvatore.calo@gmail.com',
  },
  'contact.couldnt-send': {
    EN: "Couldn't send directly.",
    IT: 'Impossibile inviare direttamente.',
  },
  'contact.something-wrong': { EN: 'Something went wrong.', IT: 'Qualcosa è andato storto.' },
  'contact.form.name.label': { EN: 'YOUR NAME', IT: 'IL TUO NOME' },
  'contact.form.name.connector': { EN: 'Hi Antonio, my name is ', IT: 'Ciao Antonio, mi chiamo ' },
  'contact.form.name.placeholder': { EN: 'your name', IT: 'il tuo nome' },
  'contact.form.type.label': { EN: 'PROJECT TYPE', IT: 'TIPO DI PROGETTO' },
  'contact.form.type.connector': { EN: '. I need a ', IT: '. Mi serve un ' },
  'contact.form.type.placeholder': { EN: 'project type', IT: 'tipo di progetto' },
  'contact.form.type.prompt': { EN: 'project type', IT: 'tipo di progetto' },
  'contact.form.type.option.website': { EN: 'website', IT: 'sito web' },
  'contact.form.type.option.brand-identity': { EN: 'brand identity', IT: 'brand identity' },
  'contact.form.type.option.product-design': { EN: 'product design', IT: 'product design' },
  'contact.form.type.option.campaign': { EN: 'campaign', IT: 'campagna' },
  'contact.form.compact.type.option.web': { EN: 'web', IT: 'web' },
  'contact.form.compact.type.option.brand': { EN: 'brand', IT: 'brand' },
  'contact.form.compact.type.option.product': { EN: 'product', IT: 'prodotto' },
  'contact.form.client.label': { EN: 'CLIENT', IT: 'CLIENTE' },
  'contact.form.client.connector': { EN: ' for a ', IT: ' per ' },
  'contact.form.client.placeholder': { EN: 'client type', IT: 'tipo di cliente' },
  'contact.form.client.prompt': { EN: 'client type', IT: 'tipo di cliente' },
  'contact.form.client.option.startup': { EN: 'startup', IT: 'startup' },
  'contact.form.client.option.studio': { EN: 'studio', IT: 'studio' },
  'contact.form.client.option.company': { EN: 'company', IT: 'azienda' },
  'contact.form.client.option.personal-project': {
    EN: 'personal project',
    IT: 'progetto personale',
  },
  'contact.form.focus.label': { EN: 'MAIN FOCUS', IT: 'FOCUS PRINCIPALE' },
  'contact.form.focus.connector': { EN: ', focused on ', IT: ', con focus su ' },
  'contact.form.focus.placeholder': { EN: 'main focus', IT: 'focus principale' },
  'contact.form.focus.prompt': { EN: 'main focus', IT: 'focus principale' },
  'contact.form.focus.option.ui-design': { EN: 'UI design', IT: 'UI design' },
  'contact.form.focus.option.ux-strategy': { EN: 'UX strategy', IT: 'strategia UX' },
  'contact.form.focus.option.brand-identity': { EN: 'brand identity', IT: 'brand identity' },
  'contact.form.focus.option.performance': { EN: 'performance', IT: 'performance' },
  'contact.form.compact.focus.option.ui': { EN: 'UI', IT: 'UI' },
  'contact.form.compact.focus.option.ux': { EN: 'UX', IT: 'UX' },
  'contact.form.compact.focus.option.brand': { EN: 'brand', IT: 'brand' },
  'contact.form.budget.label': { EN: 'BUDGET', IT: 'BUDGET' },
  'contact.form.budget.connector': { EN: '. Budget ', IT: '. Budget ' },
  'contact.form.budget.placeholder': { EN: 'budget', IT: 'budget' },
  'contact.form.budget.prompt': { EN: 'budget range', IT: 'fascia di budget' },
  'contact.form.budget.option.under-3k': { EN: 'under 3k', IT: 'meno di 3k' },
  'contact.form.budget.option.3-8k': { EN: '3–8k', IT: '3–8k' },
  'contact.form.budget.option.8-20k': { EN: '8–20k', IT: '8–20k' },
  'contact.form.compact.budget.option.under-3k': { EN: '<3k', IT: '<3k' },
  'contact.form.compact.budget.option.3-8k': { EN: '3–8k', IT: '3–8k' },
  'contact.form.compact.budget.option.8-20k': { EN: '8–20k', IT: '8–20k' },
  'contact.form.budget.option.20k-plus': { EN: '20k+', IT: '20k+' },
  'contact.form.timeline.label': { EN: 'TIMELINE', IT: 'TEMPISTICHE' },
  'contact.form.timeline.connector': { EN: ', in ', IT: ', entro ' },
  'contact.form.timeline.placeholder': { EN: 'timeline', IT: 'tempistiche' },
  'contact.form.timeline.prompt': { EN: 'timeline', IT: 'tempistiche' },
  'contact.form.timeline.option.1-2-weeks': { EN: '1–2 weeks', IT: '1–2 settimane' },
  'contact.form.timeline.option.1-2-months': { EN: '1–2 months', IT: '1–2 mesi' },
  'contact.form.timeline.option.3-6-months': { EN: '3–6 months', IT: '3–6 mesi' },
  'contact.form.timeline.option.flexible': { EN: 'flexible', IT: 'flessibile' },
  'contact.form.compact.timeline.option.1-2w': { EN: '1–2w', IT: '1–2 sett.' },
  'contact.form.compact.timeline.option.1-2m': { EN: '1–2m', IT: '1–2 mesi' },
  'contact.form.compact.timeline.option.flexible': { EN: 'flexible', IT: 'flessibile' },
  'contact.form.email.label': { EN: 'YOUR EMAIL', IT: 'LA TUA EMAIL' },
  'contact.form.email.connector': { EN: 'Reach me at ', IT: 'Puoi contattarmi a ' },
  'contact.form.email.placeholder': { EN: 'your@email.com', IT: 'tua@email.com' },
  'contact.form.step': { EN: 'Step', IT: 'Passaggio' },
  'contact.form.of': { EN: 'of', IT: 'di' },
  'contact.form.continue': { EN: 'Continue to next step', IT: 'Continua al passaggio successivo' },
  'contact.form.success.title': {
    EN: 'Message sent. Thank you! ✌️',
    IT: 'Messaggio inviato. Grazie! ✌️',
  },
  'contact.form.success.detail': {
    EN: "I'll get back to you soon at",
    IT: 'Ti risponderò presto a',
  },
  'contact.form.loading.title': { EN: 'Sending message...', IT: 'Invio del messaggio...' },
  'contact.form.loading.detail': {
    EN: 'Hold tight — this takes a second.',
    IT: 'Un attimo — ci vuole solo un secondo.',
  },
  'contact.form.error.detail': {
    EN: 'Failed to send message. Please try again.',
    IT: 'Invio del messaggio non riuscito. Riprova.',
  },

  // ── Work Page ────────────────────────────────────────────────
  'work.label-bugonia': { EN: 'BUGONIA', IT: 'BUGONIA' },
  'work.label-newsquest': { EN: 'NEWSQUEST', IT: 'NEWSQUEST' },
};

export function t(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
  }
  return entry[locale];
}
