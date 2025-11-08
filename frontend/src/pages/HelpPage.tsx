import { useRecordVisit } from "../hooks/useRecordVisit";
import styles from "./HelpPage.module.css";

const sections = [
  {
    icon: "📷",
    title: "Image-based AR",
    steps: [
      { title: "Open the Image AR mode", description: "Select “Image-based AR” from the home navigation." },
      { title: "Allow camera access", description: "Grant permission when prompted so image tracking can start." },
      {
        title: "Point at trained imagery",
        description:
          "Aim your camera at Uluru, MCG, or other trained posters. Keep the artwork centred and steady for best tracking.",
        examples: [
          { src: "/images/Uluru_Australia.jpg", label: "Uluru (Example)" },
          { src: "/images/MCG_Australia.jpg", label: "MCG (Example)" },
        ],
      },
      {
        title: "Immerse in the story",
        description: "When the image locks, spatial video overlays and UI playback at the bottom of the screen.",
      },
    ],
    tip: "Ensure the scene is well lit and avoid glare or reflections on the image.",
  },
  {
    icon: "🎯",
    title: "Marker-based AR",
    steps: [
      { title: "Launch the Marker AR mode", description: "From the home screen choose “Marker-based AR”." },
      { title: "Allow camera access", description: "The camera feed powers realtime marker detection." },
      {
        title: "Show compatible markers",
        description: "Use official Echoes patterns, standard Hiro/Kanji markers, or configured barcodes.",
      },
      {
        title: "Stay aligned",
        description: "Keep the marker in frame to maintain stable playback and synced overlays.",
      },
    ],
    tip: "Print markers on matte stock with high contrast. Hold them flat in consistent lighting.",
  },
  {
    icon: "📍",
    title: "Location-based AR",
    steps: [
      { title: "Open the Location AR mode", description: "Choose “Location-based AR” on the landing page." },
      {
        title: "Enable location services",
        description: "Permit precise location so the experience can trigger at the correct radius.",
      },
      {
        title: "Travel to the site",
        description: "Head towards Uluru, the MCG, or any configured coordinate to arm the experience.",
      },
      {
        title: "Explore the overlay",
        description:
          "Once inside the radius, spatial stories and video panels appear—move around to reveal different angles.",
      },
    ],
    tip: "Keep GPS active, and for the best accuracy stand with clear sky view away from tall buildings.",
  },
];

function HelpPage(): JSX.Element {
  useRecordVisit("help");
  return (
    <div className={styles.help}>
      <header className={styles.header}>
        <div>
          <h1>Echoes of Eternity AR Field Guide</h1>
          <p>Quick-start checklists for every detection mode in the experience suite.</p>
        </div>
      </header>

      <main className={styles.sections}>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.modeHeader}>
              <span aria-hidden>{section.icon}</span>
              <h2>{section.title}</h2>
            </div>
            <ol className={styles.steps}>
              {section.steps.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                    {step.examples && (
                      <div className={styles.examples}>
                        <p>
                          Try the experience with these artefacts—display them on another screen or print, then align
                          your camera.
                        </p>
                        <div className={styles.exampleGrid}>
                          {step.examples.map((example) => (
                            <figure key={example.label}>
                              <img src={example.src} alt={example.label} loading="lazy" />
                              <figcaption>{example.label}</figcaption>
                            </figure>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <aside className={styles.tip}>
              <strong>Tip:</strong> {section.tip}
            </aside>
          </section>
        ))}
      </main>

      <footer className={styles.footer}>
        <p>
          Need deeper analytics? Switch to the <strong>Time-Weave Dashboard</strong> for persona insights, live nudges,
          and MaaS-ready storytelling.
        </p>
      </footer>
    </div>
  );
}

export default HelpPage;

