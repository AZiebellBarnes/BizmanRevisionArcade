// Core (existing motivation & HRM foundations)
const coreMotivation = [
  {
    q: "Which option lists the FOUR core functions of HRM?",
    choices: [
      "Recruiting, developing, maintaining, termination",
      "Planning, directing, controlling, leading",
      "Sourcing, selling, shipping, servicing",
      "Onboarding, payroll, marketing, finance"
    ],
    answer: 0,
    topic: "HRM",
    explain: "HRM covers recruiting, developing, maintaining and termination."
  },
  {
    q: "Maslow argued needs progress in a hierarchy. Which is the HIGHEST level?",
    choices: ["Esteem", "Safety and security", "Self-actualisation", "Social (belonging)"],
    answer: 2,
    topic: "Maslow",
    explain: "Physiological then Safety, Social, Esteem and finally Self-actualisation."
  },
  {
    q: "According to Maslow, you generally cannot progress to higher needs before...",
    choices: [
      "receiving performance pay",
      "lower-level needs are satisfied",
      "achieving seniority",
      "completing annual appraisal"
    ],
    answer: 1,
    topic: "Maslow",
    explain: "Lower-level needs must be satisfied first."
  },
  {
    q: "Which set BEST matches Locke and Latham's five principles?",
    choices: [
      "Clarity, Challenge, Commitment, Feedback, Task complexity",
      "Clarity, Culture, Cash, Coaching, Tenacity",
      "Curiosity, Challenge, Coaching, Clarity, Targets",
      "Commitment, Culture, Cash, Control, Compliance"
    ],
    answer: 0,
    topic: "Locke",
    explain: "Clarity, Challenge, Commitment, Feedback, Task complexity."
  },
  {
    q: "Locke and Latham's theory links motivation most directly to...",
    choices: [
      "the difficulty and specificity of goals",
      "the size of the bonus paid",
      "the number of training hours",
      "the formality of appraisals"
    ],
    answer: 0,
    topic: "Locke",
    explain: "Challenging and clear goals supported by feedback."
  },
  {
    q: "Which is NOT one of Lawrence and Nohria's drives?",
    choices: ["Acquire", "Bond", "Learn", "Comply"],
    answer: 3,
    topic: "FourDrive",
    explain: "The drives are Acquire, Bond, Learn and Defend."
  },
  {
    q: "A team offsite and regular social events primarily satisfy which drive?",
    choices: ["Acquire", "Bond", "Learn", "Defend"],
    answer: 1,
    topic: "FourDrive",
    explain: "Bond is met through connection and belonging."
  },
  {
    q: "Which motivation strategy is a financial reward linked to performance?",
    choices: ["Career advancement", "Support", "Performance-related pay", "Investment in training"],
    answer: 2,
    topic: "Strategies",
    explain: "Bonuses and commissions tied to goals are performance-related pay."
  },
  {
    q: "Career advancement motivates employees mainly by...",
    choices: [
      "increasing status and responsibility",
      "increasing overtime rates",
      "reducing task complexity",
      "improving physical workspace"
    ],
    answer: 0,
    topic: "Strategies",
    explain: "Career advancement is a non-financial motivator that increases status and responsibility."
  },
  {
    q: "\"Support\" as a strategy most closely involves...",
    choices: [
      "punishing poor performance",
      "praising achievements, checking wellbeing, accommodations",
      "pay increases for targets",
      "replacing staff who underperform"
    ],
    answer: 1,
    topic: "Strategies",
    explain: "Support combines recognition, wellbeing checks and flexibility."
  },
  {
    q: "Which is the BEST example of a sanction?",
    choices: ["Providing mentoring", "Awarding a bonus", "Issuing a formal warning", "Promoting to team leader"],
    answer: 2,
    topic: "Strategies",
    explain: "Sanctions penalise poor performance or policy breaches."
  },
  {
    q: "Short-term boost but risk of resentment if limited opportunities describes...",
    choices: ["Support", "Sanctions", "Career advancement", "Training"],
    answer: 2,
    topic: "Strategies",
    explain: "Promotions can motivate but create resentment if places are scarce."
  },
  {
    q: "\"Investment in training\" primarily motivates because it...",
    choices: [
      "creates fear of job loss",
      "offers immediate cash",
      "builds skill and signals value",
      "reduces feedback requirements"
    ],
    answer: 2,
    topic: "Strategies",
    explain: "Training builds skill and signals that the employee is valued."
  },
  {
    q: "Which HRM action best aligns with Maslow's SAFETY need?",
    choices: ["Flexible social clubs", "Clear policies and job security", "Opportunities to lead", "Celebrating team wins"],
    answer: 1,
    topic: "Maslow",
    explain: "Safety needs are met by security, stability and protection from threats."
  },
  {
    q: "A restaurant with complaints about rude staff could use Locke and Latham by...",
    choices: [
      "setting clear behavioural goals and giving feedback",
      "raising wages only",
      "rotating jobs weekly",
      "cutting hours for offenders"
    ],
    answer: 0,
    topic: "Locke",
    explain: "Set specific customer service goals and provide feedback."
  },
  {
    q: "Which pairing is CORRECT?",
    choices: ["Acquire -> job security", "Learn -> curiosity and mastering skills", "Defend -> social belonging", "Bond -> material rewards"],
    answer: 1,
    topic: "FourDrive",
    explain: "Learn relates to curiosity and mastering skills."
  },
  {
    q: "HRM helps achieve business objectives mainly by...",
    choices: [
      "reducing marketing spend",
      "motivating and aligning employee performance",
      "outsourcing all roles",
      "cutting training entirely"
    ],
    answer: 1,
    topic: "HRM",
    explain: "Alignment and motivation drive productivity."
  },
  {
    q: "Which is a long-term motivation effect of ongoing rewards?",
    choices: [
      "Sustained recognition leading to consistent effort",
      "Immediate but brief performance spike only",
      "Lower commitment to goals",
      "Reduced skill development"
    ],
    answer: 0,
    topic: "Strategies",
    explain: "Continued recognition helps sustain effort over time."
  },
  {
    q: "Job rotation primarily aims to...",
    choices: ["increase variety and flexibility", "increase wages", "punish errors", "lock people into one role"],
    answer: 0,
    topic: "HRM",
    explain: "Job rotation increases variety and develops flexibility."
  },
  {
    q: "\"Remuneration\" in HRM refers to...",
    choices: [
      "the process of recruitment",
      "non-financial recognition only",
      "the amount paid for work (wage or salary)",
      "disciplinary procedures"
    ],
    answer: 2,
    topic: "HRM",
    explain: "Remuneration is the amount paid for work."
  }
];

// U3_HR (Managing Employees - SAC 2B)
const u3_hr = [
  {
    q: "Which option is an example of on-the-job training?",
    choices: ["External seminar", "Conference workshop", "Job rotation across departments", "Online university course"],
    answer: 2,
    topic: "U3 HR - Training",
    explain: "On-the-job includes coaching, demonstration, and rotation within the workplace."
  },
  {
    q: "Management by Objectives (MBO) works best when goals are:",
    choices: ["Vague and manager-set only", "Specific, jointly set, time-bound, with continuous feedback", "Hidden from employees", "Reviewed annually without dialogue"],
    answer: 1,
    topic: "U3 HR - Performance management",
    explain: "MBO requires clear, jointly agreed goals and ongoing feedback to align effort with business objectives."
  },
  {
    q: "Which is the BEST match of termination type and description?",
    choices: [
      "Resignation — role is no longer required",
      "Retirement — employee exits labour force due to age/lifestyle",
      "Dismissal — employee chooses to leave for a new job",
      "Redundancy — serious misconduct breach"
    ],
    answer: 1,
    topic: "U3 HR - Termination",
    explain: "Retirement is voluntary exit from the workforce; redundancy is job no longer existing; dismissal is for performance/conduct."
  },
  {
    q: "In workplace relations, who approves enterprise agreements and may arbitrate disputes?",
    choices: ["Human Resource Manager", "Union", "Fair Work Commission", "Employer association"],
    answer: 2,
    topic: "U3 HR - Workplace relations",
    explain: "The FWC approves enterprise agreements, rules on industrial action, and arbitrates disputes."
  },
  {
    q: "A key advantage of off-the-job training is that it:",
    choices: [
      "Requires no cost",
      "Provides exposure to external expertise and new ideas",
      "Never interrupts production",
      "Eliminates the need for on-the-job learning"
    ],
    answer: 1,
    topic: "U3 HR - Training",
    explain: "External programs bring specialist knowledge and networking, despite cost and time away from work."
  },
  {
    q: "A potential limitation of self-evaluation is that employees may:",
    choices: [
      "Be unable to reflect at all",
      "Over- or under-rate themselves due to bias or fear of perception",
      "Receive too much manager feedback",
      "Avoid setting goals under MBO"
    ],
    answer: 1,
    topic: "U3 HR - Performance management",
    explain: "Self-ratings can be distorted by bias; pairing with manager feedback and evidence helps."
  }
];

// U3_O3 (Operations Management)
const u3_ops = [
  {
    q: "Which set correctly lists the key elements of an operations system?",
    choices: [
      "Inputs, processes, outputs",
      "Materials, labour, capital",
      "Quality control, quality assurance, TQM",
      "Planning, organising, leading"
    ],
    answer: 0,
    topic: "U3 O3 - Operations system",
    explain: "Operations converts inputs via processes into outputs (goods/services)."
  },
  {
    q: "A core difference between manufacturing and service operations is that services are typically:",
    choices: ["Tangible and easily stored", "Intangible and produced/consumed simultaneously", "Capital-intensive with long storage life", "Independent of customer presence"],
    answer: 1,
    topic: "U3 O3 - Manufacturing vs service",
    explain: "Services are intangible, often delivered with the customer present, and not storable."
  },
  {
    q: "Which technology pairing best links to design and execution in operations?",
    choices: [
      "CAD and CAM",
      "AI and awards",
      "Lean and packaging",
      "CSR and inventory"
    ],
    answer: 0,
    topic: "U3 O3 - Technology",
    explain: "CAD designs products; CAM controls/automates manufacturing to execute those designs."
  },
  {
    q: "Global outsourcing is MOST appropriate when a firm seeks:",
    choices: [
      "To keep all non-core activities in-house",
      "Specialist capability and cost efficiencies for non-core processes",
      "To eliminate quality controls",
      "To avoid any coordination with external partners"
    ],
    answer: 1,
    topic: "U3 O3 - Global considerations",
    explain: "Outsourcing non-core tasks to specialist providers can improve efficiency and flexibility."
  },
  {
    q: "A CSR initiative focused on INPUTS would MOST likely be:",
    choices: [
      "Offering repairs and take-back programs",
      "Using renewable energy and ethical suppliers",
      "Reducing defects through QA",
      "Automating a production line"
    ],
    answer: 1,
    topic: "U3 O3 - CSR in operations",
    explain: "CSR for inputs includes sustainable sourcing and renewable energy to reduce environmental impact."
  },
  {
    q: "Which materials strategy pairs planning with inventory reduction?",
    choices: [
      "Forecasting & Just-in-Time",
      "Appraisals & MBO",
      "Lean & enterprise agreements",
      "Website hits & benchmarking"
    ],
    answer: 0,
    topic: "U3 O3 - Materials management",
    explain: "Forecasting predicts demand; JIT reduces inventory by receiving materials as needed."
  }
];

// U4_AOS2 (Implementing change)
const u4_aos2 = [
  {
    q: "During change, communicating the 'why' and listening to concerns primarily aims to:",
    choices: ["Increase profit immediately", "Reduce resistance and build commitment", "Avoid training costs", "Replace KPIs"],
    answer: 1,
    topic: "U4 AOS2 - Leadership & communication",
    explain: "Clear, two-way communication and empathy lower resistance and engage staff in the new direction."
  },
  {
    q: "Which strategy DIRECTLY targets quality-related KPIs like customer complaints and defects?",
    choices: ["Lean production only", "Quality strategies (QC, QA, TQM)", "Redeployment of resources", "Global outsourcing"],
    answer: 1,
    topic: "U4 AOS2 - Quality strategies",
    explain: "QC/QA/TQM lift conformance and reduce defects, improving complaint-related KPIs."
  },
  {
    q: "Senge’s ‘systems thinking’ means leaders should:",
    choices: [
      "Optimise each department independently",
      "View the organisation holistically with interdependent parts",
      "Limit change to a single unit at a time",
      "Avoid feedback loops"
    ],
    answer: 1,
    topic: "U4 AOS2 - Learning Organisation",
    explain: "Systems thinking integrates disciplines and feedback across the whole system to enable continuous learning."
  },
  {
    q: "Which is the BEST example of a low-risk strategy to overcome resistance?",
    choices: ["Communication and support", "Threats of dismissal", "Secretive rollout", "Immediate restructuring without consultation"],
    answer: 0,
    topic: "U4 AOS2 - Overcoming resistance",
    explain: "Low-risk approaches (communicate, empower, support, incentives) build acceptance sustainably."
  },
  {
    q: "Initiating lean production techniques primarily targets which outcome?",
    choices: ["Higher wastage and higher prices", "Reduced waste and improved efficiency", "More inventory and longer lead times", "Less employee involvement"],
    answer: 1,
    topic: "U4 AOS2 - Lean (TIMWOODS)",
    explain: "Lean removes waste across transport, inventory, motion, waiting, over-processing, over-production, defects, skills."
  },
  {
    q: "Developing a positive corporate culture during/after change is MOST supported by:",
    choices: ["Opaque decision making", "Rituals, recognition, and leaders modelling values", "Cutting training and feedback", "Centralising all decisions with no consultation"],
    answer: 1,
    topic: "U4 AOS2 - Corporate culture",
    explain: "Define values, lead by example, train, and celebrate wins to sustain change and trust."
  }
];

// U4_AOS1 (Reviewing performance - the need for change)
const u4_aos1 = [
  {
    q: "Which KPI best indicates whether a business is taking sales from competitors?",
    choices: ["Percentage of market share", "Net profit figures", "Rates of staff absenteeism", "Number of workplace accidents"],
    answer: 0,
    topic: "U4 AOS1 - KPIs",
    explain: "Market share shows the proportion of industry sales captured; rising share implies winning customers from rivals."
  },
  {
    q: "A manager studies KPI trends to adjust policies before problems occur. This is an example of a ____ approach to change.",
    choices: ["Reactive", "Passive", "Proactive", "Coercive"],
    answer: 2,
    topic: "U4 AOS1 - Proactive vs Reactive",
    explain: "Proactive change anticipates future conditions and acts in advance; reactive follows an event."
  },
  {
    q: "Which pair is MOST likely to be a driving force for change?",
    choices: ["Organisational inertia & time", "Managers & competitors", "Legislation & employee resistance", "Financial constraints & habits"],
    answer: 1,
    topic: "U4 AOS1 - Driving forces",
    explain: "Managers initiate strategies; competitor actions push firms to adapt to remain competitive."
  },
  {
    q: "A fall in number of sales accompanied by rising customer complaints suggests a need to focus on:",
    choices: ["Cost cutting only", "Improving quality in production", "Reducing website hits", "Increasing staff turnover"],
    answer: 1,
    topic: "U4 AOS1 - KPIs application",
    explain: "Sales and complaints point to quality gaps; quality strategies target defects and satisfaction."
  },
  {
    q: "Which statement best describes organisational inertia?",
    choices: [
      "Momentum that accelerates change implementation",
      "A tendency to maintain current practices even when change is needed",
      "A legal restriction on entering new markets",
      "A lack of available capital for new technology"
    ],
    answer: 1,
    topic: "U4 AOS1 - Restraining forces",
    explain: "Inertia is the ‘status quo’ pull that restrains movement toward a desired future state."
  },
  {
    q: "Benchmarking helps managers evaluate KPIs by:",
    choices: [
      "Replacing objectives with qualitative comments",
      "Comparing performance with targets, time periods, or competitors",
      "Predicting exchange rates",
      "Eliminating the need for data reliability"
    ],
    answer: 1,
    topic: "U4 AOS1 - KPIs & benchmarking",
    explain: "Benchmarking sets a reference point to interpret KPI results meaningfully."
  }
];

export const QUESTION_SECTIONS = {
  coreMotivation,
  u3_hr,
  u3_ops,
  u4_aos2,
  u4_aos1
};

export const DEFAULT_BANK = [
  ...coreMotivation,
  ...u3_hr,
  ...u3_ops,
  ...u4_aos2,
  ...u4_aos1
];

