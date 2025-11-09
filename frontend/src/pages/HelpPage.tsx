import { useRecordVisit } from "../hooks/useRecordVisit";
import styles from "./HelpPage.module.css";

const sections = [
  {
    icon: "🎯",
    title: "Marker-based AR",
    steps: [
      {
        title: "Launch Marker AR",
        description:
          "From the home screen choose “Marker-based AR”. This loads the AR.js marker tracker and downloads the calibration data.",
      },
      {
        title: "Allow camera access",
        description:
          "Grant permission when prompted. Without a live camera feed the marker reader can’t lock onto patterns.",
      },
      {
        title: "Prepare your marker",
        description:
          "Use official Echoes markers, the default Hiro/Kanji presets, or your configured barcode pattern. Keep the print flat and crease-free.",
        examples: [
          { src: "/images/pattern-Uluru_Australia.png", label: "Uluru (Example)" },
          { src: "/images/pattern-MCG_Australia.png", label: "MCG (Example)" },
        ],
      },
      {
        title: "Frame and focus",
        description:
          "Hold the marker 30–60 cm from the device, keep it well lit, and centre it on screen. Let the autofocus settle before moving.",
      },
      {
        title: "Maintain lock",
        description:
          "Move slowly and keep the entire marker visible. If tracking flickers, pause and re-centre the card to resume smooth playback.",
      },
    ],
    tip: "Print markers on matte stock with high contrast, avoid glossy laminates, and brief guests to keep the marker parallel to the camera.",
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

