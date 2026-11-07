// Single source of truth for site content. Edit here; the page renders from this.
// Every project has a `model` key that maps to a CAD builder in js/models/index.js.

export const person = {
  first: "Tashvi",
  last: "Singla",
  email: "tashvi225@gmail.com",
  locations: ["New York, NY", "Houston, TX"],
  tagline:
    "Mechanical engineering student at Columbia, minoring in aerospace. I design and build hardware, from battery packs and rocket feed systems to robotic hands and drones.",
  school: "Columbia University",
  degree: "B.S. Mechanical Engineering",
  minor: "Aerospace Engineering",
  gpa: "3.8 / 4.0",
  grad: "Expected 2029",
  links: [
    { label: "Email", href: "mailto:tashvi225@gmail.com", text: "tashvi225@gmail.com" },
    // Add when ready:
    // { label: "LinkedIn", href: "https://www.linkedin.com/in/...", text: "linkedin.com/in/..." },
    // { label: "Resume", href: "resume.pdf", text: "Download PDF" },
  ],
};

export const coursework = [
  "Thermodynamics",
  "Solid Mechanics",
  "Space Flight Mechanics",
  "Ordinary Differential Equations",
  "Fluid Mechanics",
];

export const skills = {
  "CAD / Manufacturing": [
    "SolidWorks", "Onshape", "FEA Simulation", "DFM", "Structural Analysis",
    "3D Printing", "Laser Cutting", "CNC",
  ],
  "Programming & Tools": [
    "Python", "Java", "SQL", "R", "Excel", "Mission Planner", "OpenRocket", "Arduino",
  ],
};

export const experience = [
  {
    org: "Zeta Energy Corporation",
    role: "Mechanical Engineering Intern",
    period: "Jun 2026 – Sep 2026",
    place: "Houston, TX",
    bullets: [
      "Engineered a custom lithium-sulfur battery pack with a 100% improvement in Wh/kg at equivalent weight, validated through qualification and flight testing.",
      "Designed structural mounting, wiring, and connector integration for the pack's electronics assembly, laid out around thermal and safety constraints.",
    ],
    projects: ["li-s-battery"],
  },
  {
    org: "Columbia Formula SAE",
    role: "Manufacturing Team · Dynamics Team",
    period: "Sep 2025 – Present",
    place: "New York, NY",
    bullets: [
      "Fabricating the nose cone and ergo jig using carbon fiber molding and CNC machining.",
      "Redesigned a suspension rod in SolidWorks to cut unsprung mass while raising torsional stiffness; validated with first principles and FEA.",
    ],
    projects: ["fsae-suspension", "fsae-nosecone"],
  },
  {
    org: "Columbia Space Initiative",
    role: "Rockets Propulsion-Fluids · Roboglove",
    period: "Sep 2025 – Present",
    place: "New York, NY",
    bullets: [
      "Developing the gearbox for an electronic regulator feed-system valve on a hybrid rocket engine running liquid oxygen.",
      "Designed and fabricated the structural linkage of a tendon-driven robotic hand exoskeleton for space suit integration; tendon-routing iterations raised grip force 25% and cut dexterity task time 15%.",
    ],
    projects: ["ereg-gearbox", "roboglove"],
  },
  {
    org: "Columbia Robotics",
    role: "Drones Team",
    period: "Sep 2026 – Present",
    place: "New York, NY",
    bullets: [
      "Designed the frame, arms, propellers, and a snake-style payload mechanism for a quadcopter in Onshape; 3D printed a prototype arm and props to check fit and stiffness.",
    ],
    projects: ["quadcopter"],
  },
  {
    org: "Columbia Engineers Without Borders",
    role: "Funding & Grants Lead · Mpakadan, Ghana",
    period: "Sep 2025 – Present",
    place: "New York, NY",
    bullets: [
      "On-site assessment of the electrical grid, power stability, and transformer performance against design specs.",
      "Authored wiring schematics, load calculations, and full technical documentation of the electrical design; secured $5,000 in fundraising and grants.",
    ],
    projects: [],
  },
  {
    org: "FIRST FRC Robotics Team #8576",
    role: "Vice President · Fundraising & Finance Officer",
    period: "Jan 2022 – May 2025",
    place: "Fulshear, TX",
    bullets: [
      "Primary design lead for a 126-member team through a 6-week build cycle, CAD to competition-ready hardware; won the Texas State Championship.",
    ],
    projects: ["frc-robot"],
  },
];

// kind: "Personal" | "Team" | "Internship"
// icon: key in ICONS (js/icons.js)
// model: key in MODELS (js/models/index.js); falls back to placeholder
export const projects = [
  {
    id: "model-rocket",
    title: "Model Rocket",
    subtitle: "Aerodynamic design & stability testing",
    kind: "Personal",
    icon: "rocket",
    model: "model-rocket",
    tags: ["OpenRocket", "Laser cutting", "3D printing"],
    summary:
      "Balsa airframe, laser-cut, with a 3D-printed nose cone and a spring-loaded payload release. Hand calcs and structural analysis on fin geometry and static margin; altitude and trajectory predicted in OpenRocket, then CG/CP placement checked against flight testing.",
    specs: [["Airframe", "Laser-cut balsa"], ["Nose cone", "3D printed"], ["Validation", "Flight test vs. OpenRocket"]],
  },
  {
    id: "drone-platform",
    title: "Drone Platform",
    subtitle: "Airframe, propulsion & power system",
    kind: "Personal",
    icon: "drone",
    model: "drone-platform",
    tags: ["UAV", "Propulsion", "Power systems", "Camera mount"],
    summary:
      "Propulsion layout, airframe structure, and power system integration for extended-endurance autonomous flight, sized around onboard sensor and compute payloads.",
    specs: [["Goal", "Extended endurance"], ["Payload", "Sensors + compute"]],
  },
  {
    id: "gear-train",
    title: "Multi-Stage Gear Train",
    subtitle: "Design, fabrication & efficiency testing",
    kind: "Personal",
    icon: "gear",
    model: "gear-train",
    tags: ["SolidWorks", "3D printing", "Testing"],
    summary:
      "Designed in SolidWorks and 3D printed. Gear ratio and torque output predicted analytically, then mechanical efficiency measured with a calibrated moment arm across several loading conditions.",
    specs: [["CAD", "SolidWorks"], ["Fab", "3D printed"], ["Test", "Calibrated moment arm"]],
  },
  {
    id: "li-s-battery",
    title: "Li-S Battery Pack",
    subtitle: "Zeta Energy · structural & electrical integration",
    kind: "Internship",
    icon: "battery",
    model: "li-s-battery",
    tags: ["6S2P", "Pouch cells", "Busbars", "BMS", "Drones"],
    summary:
      "A 6S2P lithium-sulfur pouch pack for a drone, built for low mass and easy assembly, with double the Wh/kg at equivalent weight. The first version was a fully 3D-printed enclosure. It held the cells well, but the shell was too heavy for the cells it carried, so I replaced it with foam interlayers, compression end plates, and a heat-shrink wrap. Li-S cells need steady stack pressure, so the plates and corner stops keep the foam at a controlled compression.",
    details: [
      ["Parallel first, then series", "Each pair of cells is joined in parallel and checked before the six pairs are chained in series. Balancing happens at every pair, a weak cell has less effect, and a bad pair gets caught early instead of inside a finished string."],
      ["Connections", "Negative tabs are bridged with a nickel strip and positive tabs with an aluminum busbar, each leaving a stub so the series jumper is its own insulated step. Testing showed thin nickel couldn't carry the full current, which pushed the series links toward nickel-plated copper."],
      ["Integration", "Balance leads to a 6S active-balancing BMS, XT60 main power, Kapton insulation at every joint, and a thermistor inside the stack."],
    ],
    specs: [["Configuration", "6S2P, 12 pouch cells"], ["Energy density", "+100% Wh/kg"], ["Retention", "Foam + end plates + heat shrink"], ["Validation", "Qualification + flight"]],
  },
  {
    id: "ereg-gearbox",
    title: "eReg Valve Gearbox",
    subtitle: "Columbia Space Initiative · hybrid rocket",
    kind: "Team",
    icon: "valve",
    model: "ereg-gearbox",
    tags: ["Propulsion", "LOX", "Gearbox"],
    summary:
      "Gearbox for the electronic pressure regulator that drives the feed-system valve on a liquid-oxygen hybrid rocket engine.",
    specs: [["Engine", "Hybrid, LOX oxidizer"], ["System", "Electronic regulator"]],
  },
  {
    id: "roboglove",
    title: "Roboglove",
    subtitle: "Tendon-driven hand exoskeleton",
    kind: "Team",
    icon: "hand",
    model: "roboglove",
    tags: ["Exoskeleton", "Space suits", "Prototyping"],
    summary:
      "Structural linkage for a tendon-driven robotic hand exoskeleton meant for space suit integration. Iterated tendon routing across prototypes.",
    specs: [["Grip force", "+25%"], ["Dexterity task time", "−15%"]],
  },
  {
    id: "fsae-suspension",
    title: "FSAE Suspension Rod",
    subtitle: "Columbia Formula SAE · dynamics",
    kind: "Team",
    icon: "car",
    model: "fsae-suspension",
    tags: ["SolidWorks", "FEA", "Vehicle dynamics"],
    summary:
      "Redesigned a suspension rod to cut unsprung mass while increasing torsional stiffness. Checked with first-principles analysis and FEA.",
    specs: [["Goal", "↓ unsprung mass, ↑ torsional stiffness"], ["Validation", "Hand calcs + FEA"]],
  },
  {
    id: "fsae-nosecone",
    title: "FSAE Nose Cone",
    subtitle: "Columbia Formula SAE · manufacturing",
    kind: "Team",
    icon: "car",
    model: "fsae-nosecone",
    tags: ["Carbon fiber", "CNC", "Composites"],
    summary: "Fabricating the car's nose cone and ergo jig with carbon fiber molding and CNC machining.",
    specs: [["Process", "Carbon fiber molding"], ["Tooling", "CNC machined"]],
  },
  {
    id: "quadcopter",
    title: "Quadcopter + Snake Payload",
    subtitle: "Columbia Robotics · drones",
    kind: "Team",
    icon: "drone",
    model: "quadcopter",
    tags: ["Onshape", "3D printing", "Mechanisms", "Camera mount"],
    summary:
      "Frame, arms, propellers, and a snake-style payload mechanism designed in Onshape. Printed a prototype arm and propellers to check fit and stiffness before the full build.",
    specs: [["CAD", "Onshape"], ["Prototype", "Printed arm + props"]],
  },
  {
    id: "frc-robot",
    title: "FRC Competition Robot",
    subtitle: "Team #8576 · Texas State Champions",
    kind: "Team",
    icon: "robot",
    model: "frc-robot",
    tags: ["Design lead", "6-week build", "Fabrication"],
    summary:
      "Primary design lead for a 126-member team, taking the robot from CAD to competition-ready hardware in a 6-week build. Won the Texas State Championship.",
    specs: [["Team size", "126"], ["Result", "Texas State Champions"]],
  },
];
