import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PlanItineraries.module.css";

const REGION_BLUEPRINTS = [
  {
    id: "nsw",
    name: "New South Wales",
    short: "NSW",
    color: "var(--accent-sky)",
    mapPosition: { top: "62%", left: "78%" },
    overview:
      "Harbour icons, sandstone cliffs, and UNESCO peaks combine with Dreamtime overlays and data-rich coastal guardianships.",
    sites: [
      {
        name: "Sydney Opera House",
        summary: `Sails shimmer with reactive projections of Bennelong's shoreline, while AR audio tours layer conductor batons and First Nations stories across the stages. Wander harbour forecourts guided by echoing light, discovering rehearsal holograms and festival futures in a seamless blend of performing arts, architecture, salt-laced breeze embracing sunset harbour resonance nightly.`,
        bestTime: "Sunrise rehearsals or late evening Vivid projections; weekdays keep forecourts quieter.",
      },
      {
        name: "Sydney Harbour Bridge Climb",
        summary: `Ascend steel arches as AR safety halos trace historic rivet repairs and 1932 opening-day footage, replayed against today's skyline. Wearable lenses reveal ferry routes, Dreamtime flight paths, and migrating whales beneath, finishing with holographic signatures of workers projected on summit girders, syncing breath with harbour winds and scintillating Vivid beams.`,
        bestTime: "Book dawn climbs for softer breezes and golden light; twilight slots glow during Vivid season.",
      },
      {
        name: "Blue Mountains Three Sisters",
        summary: `Lookouts now anchor immersive legends of Meehni, Wimlah, and Gunnedoo as volumetric spirits rise at dusk, teaching respectful exploration. Guided AR bushwalk overlays map safe paths, biodiversity hotspots, and Gundungurra language prompts. Layered canyon mist reveals climbing gradients, trail times, and weather shifts without disturbing lyrebird territories or sacred formations.`,
        bestTime: "Arrive for sunrise mist or late afternoon glow; weekdays reduce Echo Point crowds.",
      },
      {
        name: "Hunter Valley Vineyards",
        summary: `Cellar doors activate flavour constellations showing tannin stories above each glass, combining Wonnarua songlines with digital terroir layers. Cycling routes appear as holographic ribbons through vines, highlighting sustainability practices, biodiversity corridors, and picnic pockets. Sunset drones choreograph tasting flights, pairing AR chefs with seasonal menus and music curated for indulgence.`,
        bestTime: "Golden hour tastings in autumn harvest; midweek bookings keep cellar sessions intimate.",
      },
      {
        name: "Bondi to Coogee Coastal Walk",
        summary: `Clifftop trail markers pulse with tidal AR overlays projecting rip current safety, migrating humpback silhouettes, and Indigenous shell midden stories. Pause at Tamarama for wearable-guided wellness stretches synced to ocean breath. Sculptures by the Sea persists digitally year-round, unlocking artist interviews, accessibility gradients, and photogrammetry souvenirs along sunlit sandstone amphitheatres.`,
        bestTime: "Set out at dawn for calmer paths and softened tides; winter weekends capture whale arcs.",
      },
      {
        name: "Lord Howe Island",
        summary: `Visitor numbers stay capped yet digital guardians render reef health dashboards through transparent tablets, aligning with UNESCO protocols. Experience holographic seabird migrations, snorkel route beacons, and volcanic history layering lagoon vistas. Community-led AR storytelling ensures Pitcairn descendants narrate sustainably, guiding cyclists, hikers, and paddlers across palm-lined peaks and coral sanctuaries.`,
        bestTime: "April–June shoulder seasons balance warm lagoons with lighter visitor caps.",
      },
      {
        name: "Jenolan Caves",
        summary: `Glowstone pathways reveal limestone ages, shimmering in sync with echolocation readings from resident bats. AR lanterns project colonial expeditions, Wiradjuri cosmology, and subterranean waterways, highlighting fragile chambers to protect. Guided concerts mix binaural recordings with live ensembles, translating cathedral acoustics into luminous waveforms that visitors sculpt through gesture-responsive interfaces underground.`,
        bestTime: "Reserve evening soundscape tours midweek; winter keeps chambers crisp and uncrowded.",
      },
      {
        name: "Taronga Zoo Sydney",
        summary: `Exhibits integrate conservation briefings displayed on transparent domes, overlaying wildlife health metrics. Immersive bushland boardwalks trigger holographic zookeeper companions, Gamilaroi language snippets, and safe vantage cues. Night Safari AR headsets spotlight nocturnal species while dimming human impact, letting families forge empathy, sponsor habitats, and plan future volunteering across the network.`,
        bestTime: "Dusk Safari sessions Thursday–Saturday; arrive early for quieter keeper talks.",
      },
      {
        name: "Port Stephens Sand Dunes",
        summary: `Dune safaris now include LiDAR maps updating hourly to protect Worimi Country, steering riders along wind-approved corridors. AR sand-surf boards coach balance metrics while projecting humpback migration routes offshore. Twilight campfires unlock constellations, cultural dances, and shipwreck histories, giving adventurers respectful immersion without compromising fragile, shifting coastal ecology each season.`,
        bestTime: "Sunset tours May–November align with whale migrations and cooler sands.",
      },
      {
        name: "Kiama Blowhole",
        summary: `Coastal decks deploy mist sensors predicting eruptions, glowing teal when geysers surge. Smart bracelets translate Dharawal sea lore, synchronizing with cliffside light to illustrate whale migrations. Capture slow-motion sprays via AR photographers guiding framing, exposure, and safe distances, ensuring families experience roaring basalt chambers responsibly during south-coast road trips together.`,
        bestTime: "Visit within two hours of high tide on southerly swell days; mornings stay calmer.",
      },
    ],
  },
  {
    id: "vic",
    name: "Victoria",
    short: "VIC",
    color: "var(--brand-stronger)",
    mapPosition: { top: "76%", left: "73%" },
    overview:
      "Coastal drives, creative laneways, and alpine escapes blend with cultural storytelling and regenerative gastronomy.",
    sites: [
      {
        name: "Great Ocean Road",
        summary: `Self-drive itineraries sync with vehicle HUDs showing erosion watchpoints, avoidance detours, and Gunditjmara cultural overlays. Windswept viewpoints reveal whale pods through volumetric binoculars. Torquay surf breaks display live swell holograms, while accessible stops trigger stories from Traditional Owners, artisans, and rangers, celebrating coastline stewardship amid dramatic cliffs, rainforest hinterland journeys.`,
        bestTime: "Late autumn weekdays for mellow surf and easier parking; sunrise pullovers sparkle.",
      },
      {
        name: "Twelve Apostles",
        summary: `Clifftop decks feature AR erosion forecasts and archaeophotogrammetry revealing vanished stacks. Sunset drones weave interpretive light, mapping Apostles' limestone layers alongside Gadubanud legends. Elevated boardwalks highlight penguin burrows, coastal flora, and safe selfie zones, letting travellers appreciate fragility while planning regenerative stays in Port Campbell villages and inland dairy communities.`,
        bestTime: "Sunset shoulder seasons (March–May, September) for glowing stacks and lighter crowds.",
      },
      {
        name: "Royal Botanic Gardens Melbourne",
        summary: `Augmented canopy walks project plant health data, pollinator movements, and Boon Wurrung seasonal calendars. Hidden speakers layer cicada choruses with orchestra samples for mindful strolls. Families borrow AR herbariums to visualize medicinal uses, climate resilience, and water-smart gardening tips, culminating in laser-kissed lotus lagoons reflecting city skyscrapers after twilight serenely.`,
        bestTime: "Arrive early morning for dew-lit greenery; Friday twilights host AR sound baths.",
      },
      {
        name: "Phillip Island Penguin Parade",
        summary: `Boardwalk beacons dim lighting as AR burrow cams stream chicks greeting returning rafts. Rangers narrate Bunurong shoreline lore over geofenced audio, teaching respectful viewing. Thermal overlays keep visitors spaced, while eco-shuttles gamify carbon savings. Families unlock adopt-a-rookery holograms, planning future marine adventures across Victoria's nature corridors and sanctuaries for generations.`,
        bestTime: "Sunset year-round; winter sees earlier parade times and richer skies.",
      },
      {
        name: "Yarra Valley Wineries",
        summary: `Vintage vaults glow with AR fermentation timelines, pairing varietals with seasonal produce and Wurundjeri history. Balloon rides overlay wide panoramas with trail suggestions, art studios, and wildlife sightings. Guests earn sustainability credits via smart glasses tracking water use, microclimate shifts, and regenerative farming, redeemable for tree plantings and immersive tastings.`,
        bestTime: "Autumn harvest weekends; sunrise balloons and evening cellar dinners pair flawlessly.",
      },
      {
        name: "Sovereign Hill Ballarat",
        summary: `Goldfields streets animate with holographic miners explaining rush histories, union victories, and Wadawurrung perspectives. Panned nuggets trigger AR metallurgy lessons, while candlelit tours reveal underground seams using volumetric lanterns. Heritage pastries carry QR scents, letting families pre-order treats, book workshops, and plan trips to neighbouring art spaces and spa towns.`,
        bestTime: "Winter Wonderlights after dusk; midweek mornings for school-free demonstrations.",
      },
      {
        name: "Grampians National Park",
        summary: `Sandstone ranges host AR climbing guides projecting safe holds, Buninyong Dreaming, and weather alerts across iconic walls. Trail beacons translate Djab Wurrung plant knowledge, identifying bush tucker and healing sites. Sunset sky domes reinterpret rock art via constellations, encouraging respectful camping, regenerative tourism pledges, and multi-day loops connecting craft villages.`,
        bestTime: "Spring wildflower season; dawn climbs avoid heat and highlight valley mists.",
      },
      {
        name: "Wilsons Promontory",
        summary: `Azure beaches sparkle with AR tide charts predicting stingray sightings and safe snorkel pockets. Hike telepresence lookouts projecting wombat burrows, Boon Wurrung language, and night-sky astrophotography tutorials. Rangers gamify Leave No Trace challenges, awarding points redeemable for citizen science missions, coastal revegetation, or passes aboard the park's bioluminescent kayaking fleet.`,
        bestTime: "Late summer weekdays for calmer coves; winter nights for Milky Way paddles.",
      },
    ],
  },
  {
    id: "qld",
    name: "Queensland",
    short: "QLD",
    color: "var(--accent-emerald)",
    mapPosition: { top: "36%", left: "74%" },
    overview:
      "Reefs, rainforests, and hinterlands fuse tropical biodiversity with immersive conservation storytelling and blue-sky wellness.",
    sites: [
      {
        name: "Great Barrier Reef (Cairns)",
        summary: `Electric catamarans display reef health holograms, showcasing coral recovery, citizen science tasks, and Yirrganydji sea lore. Snorkellers wear anti-fog visors tracking species sightings, feeding marine databases instantly. Reef HQ teleports remote classrooms, while night dives choreograph biodegradable light ribbons guiding turtles without stress, amplifying conservation impact for future caretakers everywhere.`,
        bestTime: "May–October for clear waters; night dives align with new moons.",
      },
      {
        name: "Daintree Rainforest",
        summary: `Aerial boardwalks weave through fan palms while AR canopy portals render megafauna ancestors and Kuku Yalanji creation stories. Bioacoustic sensors translate cassowary calls into light pulses, alerting hikers to slow respectfully. River cruises blend holographic crocodiles with real-time safety cues, championing low-carbon vessels and regenerative stays in Mossman Gorge lodges.`,
        bestTime: "Dry season mornings (June–August) keep humidity low and wildlife active.",
      },
      {
        name: "Whitsunday Islands",
        summary: `Sailing charters overlay Heart Reef viewpoints, tidal drifts, and Ngaro heritage anchors on translucent sails. Whitehaven's silica sands display reef-safe sunscreen reminders and manta sightings in iridescent pixels. Evening sand lounges turn into AR story domes projecting starlit navigation, coral restoration pledges, and curated playlists tuned to surrounding tide harmonics.`,
        bestTime: "September shoulder weeks; book tidal windows around low tide for swirling sandbars.",
      },
      {
        name: "Gold Coast Hinterland",
        summary: `Highland skywalks project waterfall velocity, birdlife trajectories, and Yugambeh language cues. Glow-worm caves use AR to simulate bioluminescence cycles without disturbing colonies. Adventure parks share live canopy feeds, guiding zipline pacing and regenerative actions like tree planting. Wellness lodges sync sunrise yoga with forest soundscapes and digital detox itineraries daily.`,
        bestTime: "Visit after summer rains (March–April) for lush cascades and cooler air.",
      },
      {
        name: "Fraser Island (K'gari)",
        summary: `Self-driving e-vehicles trace Butchulla pathways, limiting beach erosion while narrating stewardship commitments. Eli Creek AR bubbles show sand filtration, rainforest regeneration, and perched lake hydrology. Night sky domes recount story constellations, guiding turtle hatchling protection. Visitors earn freshwater credits supporting habitat projects and sustainable stays across this largest sand island.`,
        bestTime: "April–July when tracks are firm and whale season begins offshore.",
      },
      {
        name: "Tangalooma Wrecks",
        summary: `Snorkel trails display AR fish guides, ship histories, and tidal safety arcs over calm Moreton Bay waters. Evening beach clean-ups gamify marine debris, unlocking holographic dolphin companions celebrating progress. Dune lookouts broadcast Quandamooka stories, bioluminescent plankton forecasts, and ferry schedules, ensuring day-trippers plan low impact, extended stays supporting island communities.`,
        bestTime: "High-tide mornings for snorkelling clarity; winter sunsets for glowing plankton.",
      },
      {
        name: "Brisbane South Bank",
        summary: `Riverside precincts host AR art walks projecting Yuggera storytelling, festival previews, and culinary pop-ups. The Wheel of Brisbane overlays night panoramas with climate resilience projects, active transport routes, and rooftop farm invitations. Interactive lagoons monitor water quality, while wearable passes coordinate gallery entries, theatre seats, and nearby AR exploration pods.`,
        bestTime: "Twilight weekends sync with market buzz; midweek mornings suit families seeking space.",
      },
      {
        name: "Lamington National Park",
        summary: `Gondwana rainforests glow with AR mycology guides, showing fungal networks beneath suspended treetop walks. Birding headsets translate Albert's lyrebird songs into animated choreography. Eco-lodges stream cloud forest moisture data, helping travellers schedule waterfalls at peak spray. Trails embed respect checkpoints acknowledging Yugambeh custodians and inviting conservation pledges before continuing deeper.`,
        bestTime: "Mist-laced dawn hikes after overnight rain; winter skies sparkle for star walks.",
      },
      {
        name: "Kuranda Scenic Railway",
        summary: `Heritage carriages feature smart windows replaying construction-era feats, Barron Gorge stories, and Djabugay language lessons. Rainforest scents infuse cabins via sustainable diffusers. Passengers unlock AR overlays aligning waterfalls, skyrail gondolas, and butterfly sanctuaries, planning stops seamlessly. Return journeys gamify reusable souvenir choices, lowering waste while supporting mountain communities for generations.`,
        bestTime: "Late morning departures avoid fog; pair with afternoon skyrail for changing views.",
      },
    ],
  },
  {
    id: "wa",
    name: "Western Australia",
    short: "WA",
    color: "var(--brand-strong)",
    mapPosition: { top: "52%", left: "24%" },
    overview:
      "From quokka haven to red desert gorges, experiences blend dark-sky stargazing with marine sanctuaries and cultural wisdom.",
    sites: [
      {
        name: "Rottnest Island",
        summary: `Electric ferries share Noongar welcome stories while AR deck maps highlight quokka zones, reef trails, and cycling gradients. Onshore, mixed-reality ranger pods teach coastal restoration, turtle tracking, and Wadjemup history. Sunset domes project dark-sky constellations, encouraging overnight eco-stays and responsible nightlife far from fragile nesting dunes protecting delicate shorelines forever.`,
        bestTime: "Spring wildflowers September–October; sunrise ferries beat day-trip rush.",
      },
      {
        name: "Ningaloo Reef",
        summary: `Glass-bottom kayaks beam whale shark silhouettes beneath, providing spacing guides and Yinigudura sea lore. Coral nurseries broadcast health metrics via holographic polyps, inviting visitors to adopt regrowth modules. Sunset beach pods align astrophotography tutorials with turtle crawls, ensuring red-light compliance while celebrating Western Australia's remote, stargazing marine sanctuary every season.`,
        bestTime: "March–July whale shark swims; book sunset slots for gentle currents.",
      },
      {
        name: "Kings Park Perth",
        summary: `Botanic terraces project Noongar six-season calendars atop native wildflowers, guiding scent-led trails and pollinator watches. Drone taxis deliver visitors quietly, mapping skyline biodiversity corridors and Swan River AR regattas. Evening light stories ripple across the DNA Tower, synchronizing with family picnics, wellness sessions, and community planting rosters for city guardians.`,
        bestTime: "Spring blooming (September) for wildflower festivals; sunset picnics year-round.",
      },
      {
        name: "Margaret River",
        summary: `Cave tastings merge Wadandi smoke ceremonies with AR terroir projections, translating soil minerals into colour gradients. Surf trackers recommend reef breaks, nearby cellar doors, and farm-to-table feasts. Forest glamping domes stream nocturnal wildlife, encouraging quiet hours. Digital passes connect artisans, wellness studios, and stargazing clearings across the lush cape region.`,
        bestTime: "Harvest February–April; winter swells suit surfers and cosy cellar evenings.",
      },
      {
        name: "Karijini National Park",
        summary: `Gorge descents feature AR hazard overlays calibrating ladder grips, water depth, and seasonal closures. Guided swims translate Banyjima Dreaming, while drone beacons monitor sudden floods. Night sky platforms interpret meteor showers alongside iron ore geology, promoting multi-day stays that support remote communities and protect desert waterways for future travellers safely.`,
        bestTime: "Dry season May–September; sunrise hikes keep gorge temps manageable.",
      },
      {
        name: "Wave Rock",
        summary: `Hyden's iconic granite wave becomes a daytime canvas for AR surf history, Noongar legends, and wildflower bloom forecasts. Sunset projections reveal ancient water catchments and stargazing coordinates. Visitors borrow kinetic boards simulating surfing balance, learning about drought resilience, saline lakes, and wheatbelt farm-stay loops sustaining country hospitality for curious families.`,
        bestTime: "Spring wildflowers (August–October); sunrise light dramatizes the wave face.",
      },
    ],
  },
  {
    id: "sa",
    name: "South Australia",
    short: "SA",
    color: "#ffb347",
    mapPosition: { top: "68%", left: "55%" },
    overview:
      "Outback arcs, wine sanctuaries, and coastal wildlife weave sustainability dashboards with cultural custodianship.",
    sites: [
      {
        name: "Kangaroo Island",
        summary: `Wildlife corrals use AR heat mapping to space visitors from sleepy sea lions, koalas, and glossy black-cockatoos. Bushfire regeneration dashboards highlight new growth, while Yerta Bulti guides narrate Ramindjeri sea trails. Nightfall tastings pair Ligurian honey with stargazing holograms announcing Southern Ocean whale migrations and conservation volunteering rosters for travellers.`,
        bestTime: "Autumn calm seas (April–May); winter nights for aurora and whale spotting.",
      },
      {
        name: "Barossa Valley",
        summary: `Heritage cottages project AR winemaker diaries, revealing generations of blending with Peramangk land stewardship. Cycle trails highlight soil types, terroir, and regenerative practices. Shared tasting tables sync playlists to flavour profiles, while digital passports reward transport, cooking classes, and pilgrimages to nearby towns celebrating German, Italian, and First Nations influences.`,
        bestTime: "Vintage February–April; midweek tastings keep cellar doors relaxed.",
      },
      {
        name: "Flinders Ranges",
        summary: `Ikara's amphitheatre hosts AR-guided hikes overlaying Adnyamathanha creation stories, fossil timelines, and star routes. Desert drones monitor wildlife corridors, advising on campsite placement. Night observatories sync with optical telescopes, projecting supernovae and cultural narratives onto surrounding escarpments, inspiring multi-day conservation volunteering and outback culinary trails celebrating resilient ingredients for travellers.`,
        bestTime: "Autumn and spring for mild heat; sunset hikes glow across Wilpena Pound.",
      },
      {
        name: "Adelaide Central Market",
        summary: `Market halls glow with AR produce scanners tracing grower stories, seasonal swaps, and Kaurna acknowledgements. Street-food stalls broadcast allergen alerts, waste diversion stats, and cooking class invites. Evening cultural loops guide visitors to laneway jazz, rooftop gardens, and River Torrens light walks, enabling slow travel itineraries anchored in flavour experiences.`,
        bestTime: "Early Friday mornings; stay for late-night eats on Saturdays.",
      },
      {
        name: "Coober Pedy Opal Fields",
        summary: `Underground churches and dugouts integrate AR cooling dashboards, showing energy savings amid desert heat. Opal mines overlay gemstone geology, mining safety, and Anangu custodianship. Sunset breakaways host holographic night skies, guiding astrophotographers and cultural storytellers. Visitors plan eco-drive itineraries linking painted desert lookouts, indigenous art centres, and sustainable opal workshops.`,
        bestTime: "Winter nights for cool digs; plan sunset drives to Breakaways Reserve.",
      },
    ],
  },
  {
    id: "tas",
    name: "Tasmania",
    short: "TAS",
    color: "#58e3ff",
    mapPosition: { top: "90%", left: "82%" },
    overview:
      "Cool-climate wilderness and avant-garde art connect dark skies, regenerative dining, and island storytelling.",
    sites: [
      {
        name: "Cradle Mountain",
        summary: `Dove Lake circuits feature AR weather bands forecasting alpine shifts, wombat sightings, and Palawa sky stories. Boardwalk sensors protect fragile mosses while guiding step pace. Evenings bring reflective dome theatres projecting Aurora Australis and conservation quests, encouraging visitors to volunteer on track work, wildlife monitoring, or dark-sky photography residencies seasonally.`,
        bestTime: "Winter aurora nights; dawn hikes in summer for crisp reflections.",
      },
      {
        name: "MONA Hobart",
        summary: `Riverside galleries sync body sensors with immersive art, adjusting projections and Tasmanian compositions. Ferry journeys overlay Derwent estuary ecology, aquaculture, and colonial histories. Underground vaults host AR wine pairings, seasonal produce tastings, and First Nations collaborations, inspiring longer stays that connect Hobart street culture, mountain trails, and island-wide festivals joyfully.`,
        bestTime: "Arrive via morning ferry; linger Fridays for sunset concerts and late openings.",
      },
      {
        name: "Freycinet National Park",
        summary: `Wineglass Bay lookouts deploy AR horizon rings highlighting Hazards granite, marine sanctuaries, and oyster leases. Kayak routes show tide rhythms, whale sightings, and palawa ranger tips. Nightfall glamping sites project constellations reflecting seafaring trails, encouraging regenerative seafood dining and extended journeys through Tasmania's east coast village network for curious explorers.`,
        bestTime: "April–May for still bays; pre-dawn climbs secure unobstructed lookouts.",
      },
      {
        name: "Port Arthur Historic Site",
        summary: `Convict ruins awaken through AR reenactments, projecting justice debates, survivor letters, and Palawa resilience. Twilight lantern tours use volumetric storytelling to overlay timelines and restorative narratives. Harbour cruises highlight eco-cruise routes, Tasman Peninsula sea cliffs, and future AR dives exploring kelp forests, encouraging respectful remembrance and sustainable travel for all.`,
        bestTime: "Late afternoon into evening for lantern tours; winter fog thickens atmosphere.",
      },
    ],
  },
  {
    id: "nt",
    name: "Northern Territory",
    short: "NT",
    color: "#ffd85f",
    mapPosition: { top: "40%", left: "55%" },
    overview:
      "Sacred monoliths, desert gorges, and tropical wetlands amplify Anangu, Bininj, and Luritja leadership with immersive astronomy.",
    sites: [
      {
        name: "Uluru-Kata Tjuta National Park",
        summary: `Visitors adopt no-photo pledges while AR guides share Anangu Tjukurpa narratives with precise cultural protocols. Sunrise silhouettes trigger language lessons, cardinal direction overlays, and ranger-approved walking tempos. Night sky domes illuminate constellations aligning with rock formations, supporting astronomy festivals, artist residencies, and remote community-led enterprises across desert seasons with respect.`,
        bestTime: "Shoulder months (April, September) for cooler walks and stargazing clarity.",
      },
      {
        name: "Kakadu National Park",
        summary: `Wet season flights display AR flood mapping, crocodile nesting zones, and Bininj cultural insights. Nourlangie rock shelters overlay animated art, translating seasonal messages. Yellow Water cruises integrate wildlife counts, language prompts, and bush medicine markers. Stargazing platforms share ranger astronomy, digital field journals, and citizen science missions spanning savanna, wetlands.`,
        bestTime: "Late dry season (August–October) for open roads and billabong sunsets.",
      },
      {
        name: "Litchfield National Park",
        summary: `Magnetic termite mounds light up via AR to explain cardinal engineering and climate adaptation. Waterfalls display safe swimming levels, respectful photography prompts, and Wagait stories. E-vehicle loops recommend shaded picnic spots, night safari trails, and mindfulness pauses, ensuring visitors appreciate Top End biodiversity while supporting Indigenous ranger programs every season.`,
        bestTime: "Green season (December–March) fills waterfalls; mornings stay cooler for swims.",
      },
      {
        name: "Kings Canyon",
        summary: `Rim walks now feature AR cliff beacons mapping wind shifts, geological layers, and Luritja lore. Desert oases provide hydration analytics, plant stories, and regenerative travel pledges. Sunset amphitheatres project constellations mirrored in canyon walls, scheduling cultural performances, drone-free flight slots, and links to surrounding space-observatory road trips for adventurous families.`,
        bestTime: "First light departures May–September; afternoon sunset decks fill quickly.",
      },
    ],
  },
  {
    id: "act",
    name: "Australian Capital Territory",
    short: "ACT",
    color: "#cad8f5",
    mapPosition: { top: "66%", left: "70%" },
    overview:
      "Civic storytelling meets bushland sanctuaries, connecting national memory with space exploration and wellness corridors.",
    sites: [
      {
        name: "Australian War Memorial",
        summary: `Interactive galleries layer AR soldier diaries, peacekeeping missions, and Ngunnawal Country acknowledgements. Drone flyover feeds provide memorial skyline views, mapping reflection spaces and ceremonial paths. Visitors compose digital poppy dedications, schedule twilight vigils, and connect with national walking trails linking lakeside memorials, arboretum forests, and parliament precincts for shared remembrance.`,
        bestTime: "Dawn Last Post ceremonies; book guided sessions midweek for quieter reflection.",
      },
      {
        name: "National Museum of Australia",
        summary: `Architectural loops now project Songlines digital threads connecting First Nations artefacts, migrant histories, and future innovation labs. Touchless exhibits trigger AR craft workshops, ethical tourism routes, and regional festival suggestions. Lakeside decks host drone light shows recounting grand national narratives, steering visitors toward Canberra's cycling, culinary, and wellness circuits year-round.`,
        bestTime: "Late morning entry; sunset drone shows run Friday–Sunday.",
      },
      {
        name: "Tidbinbilla Nature Reserve",
        summary: `Sanctuary shuttles display wildlife telemetry, showing platypus dives, koala naps, and Ngunnawal seasonal calendars. Night spotlight tours swap bright beams for AR silhouettes preserving dark skies. Science hubs invite citizen astronomers, space agency interns, and families to co-create habitat plans linking Deep Space Complex missions with roaming wildlife corridors harmoniously.`,
        bestTime: "Evening spotlight tours post-dusk; winter mornings for misty valleys.",
      },
      {
        name: "Parliament House Canberra",
        summary: `Visitors borrow civics lenses translating debates into real-time summaries, multilingual captions, and Wiradjuri acknowledgements. Rooftop lawns display renewable energy dashboards, pollinator gardens, and drone delivery routes. Guided tours weave AR timelines of Federation, women's suffrage, and future policy labs, encouraging travellers to engage respectfully with national decision-making every visit meaningfully.`,
        bestTime: "Question Time sittings (Tues–Thurs) for live debates; book rooftop tours early.",
      },
    ],
  },
];

const SITE_COORDINATES = {
  "Sydney Opera House": { latitude: -33.8568, longitude: 151.2153 },
  "Sydney Harbour Bridge Climb": { latitude: -33.8523, longitude: 151.2108 },
  "Blue Mountains Three Sisters": { latitude: -33.7315, longitude: 150.312 },
  "Hunter Valley Vineyards": { latitude: -32.741, longitude: 151.0965 },
  "Bondi to Coogee Coastal Walk": { latitude: -33.8915, longitude: 151.2767 },
  "Lord Howe Island": { latitude: -31.5548, longitude: 159.084 },
  "Jenolan Caves": { latitude: -33.8208, longitude: 150.022 },
  "Taronga Zoo Sydney": { latitude: -33.843, longitude: 151.241 },
  "Port Stephens Sand Dunes": { latitude: -32.7739, longitude: 152.1034 },
  "Kiama Blowhole": { latitude: -34.6713, longitude: 150.8561 },
  "Great Ocean Road": { latitude: -38.6807, longitude: 143.392 },
  "Twelve Apostles": { latitude: -38.6644, longitude: 143.1054 },
  "Royal Botanic Gardens Melbourne": { latitude: -37.8304, longitude: 144.9796 },
  "Phillip Island Penguin Parade": { latitude: -38.5113, longitude: 145.1472 },
  "Yarra Valley Wineries": { latitude: -37.6555, longitude: 145.452 },
  "Sovereign Hill Ballarat": { latitude: -37.5735, longitude: 143.8491 },
  "Grampians National Park": { latitude: -37.1424, longitude: 142.518 },
  "Wilsons Promontory": { latitude: -39.03, longitude: 146.32 },
  "Great Barrier Reef (Cairns)": { latitude: -16.9186, longitude: 145.7781 },
  "Daintree Rainforest": { latitude: -16.17, longitude: 145.4185 },
  "Whitsunday Islands": { latitude: -20.282, longitude: 148.7557 },
  "Gold Coast Hinterland": { latitude: -28.1978, longitude: 153.2675 },
  "Fraser Island (K'gari)": { latitude: -25.2406, longitude: 153.1329 },
  "Tangalooma Wrecks": { latitude: -27.2086, longitude: 153.3656 },
  "Brisbane South Bank": { latitude: -27.4808, longitude: 153.0231 },
  "Lamington National Park": { latitude: -28.2283, longitude: 153.1357 },
  "Kuranda Scenic Railway": { latitude: -16.8227, longitude: 145.6387 },
  "Rottnest Island": { latitude: -32.006, longitude: 115.512 },
  "Ningaloo Reef": { latitude: -21.9067, longitude: 113.9992 },
  "Kings Park Perth": { latitude: -31.9617, longitude: 115.832 },
  "Margaret River": { latitude: -33.953, longitude: 115.073 },
  "Karijini National Park": { latitude: -22.4232, longitude: 118.2 },
  "Wave Rock": { latitude: -32.4473, longitude: 118.897 },
  "Kangaroo Island": { latitude: -35.834, longitude: 137.24 },
  "Barossa Valley": { latitude: -34.5325, longitude: 138.9583 },
  "Flinders Ranges": { latitude: -31.5986, longitude: 138.6316 },
  "Adelaide Central Market": { latitude: -34.929, longitude: 138.599 },
  "Coober Pedy Opal Fields": { latitude: -29.0137, longitude: 134.7545 },
  "Cradle Mountain": { latitude: -41.6533, longitude: 145.9944 },
  "MONA Hobart": { latitude: -42.821, longitude: 147.2517 },
  "Freycinet National Park": { latitude: -42.1219, longitude: 148.292 },
  "Port Arthur Historic Site": { latitude: -43.1469, longitude: 147.8523 },
  "Uluru-Kata Tjuta National Park": { latitude: -25.3444, longitude: 131.0369 },
  "Kakadu National Park": { latitude: -12.67, longitude: 132.835 },
  "Litchfield National Park": { latitude: -13.156, longitude: 130.777 },
  "Kings Canyon": { latitude: -24.2505, longitude: 131.5515 },
  "Australian War Memorial": { latitude: -35.2811, longitude: 149.1496 },
  "National Museum of Australia": { latitude: -35.2924, longitude: 149.1231 },
  "Tidbinbilla Nature Reserve": { latitude: -35.4778, longitude: 148.9409 },
  "Parliament House Canberra": { latitude: -35.3081, longitude: 149.1244 },
};

const REGIONS = REGION_BLUEPRINTS.map((region) => ({
  ...region,
  sites: region.sites.map((site) => ({
    ...site,
    coordinates: SITE_COORDINATES[site.name],
  })),
}));

const POPULATION_DENSITY_ENDPOINT = "/population-density-data/v0/retrieve";
const POPULATION_DENSITY_BASE_URL = (import.meta.env.VITE_CAMARA_POP_DENSITY_BASE_URL ?? "").replace(/\/$/, "");
const POPULATION_DENSITY_TOKEN = import.meta.env.VITE_CAMARA_POP_DENSITY_TOKEN ?? "";
const LOW_DENSITY_THRESHOLD = 50;
const HIGH_DENSITY_THRESHOLD = 200;

const getSiteKey = (site) => {
  const regionIdentifier = site.regionId ?? site.regionName ?? "unknown";
  return `${regionIdentifier}|${site.name}`;
};

const createCorrelator = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `corr-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;
};

const createBoundingPolygon = (coordinates, delta = 0.018) => {
  if (!coordinates) {
    return [
      { latitude: 0, longitude: 0 },
      { latitude: 0.018, longitude: 0.018 },
      { latitude: -0.018, longitude: 0.018 },
    ];
  }

  const { latitude, longitude } = coordinates;

  return [
    { latitude: latitude + delta, longitude: longitude - delta },
    { latitude: latitude + delta, longitude: longitude + delta },
    { latitude: latitude - delta, longitude: longitude + delta },
    { latitude: latitude - delta, longitude: longitude - delta },
  ];
};

const createPopulationDensityRequest = (site) => {
  const now = new Date();
  const startTime = now.toISOString();
  const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  return {
    area: {
      areaType: "POLYGON",
      boundary: createBoundingPolygon(site.coordinates),
    },
    startTime,
    endTime,
    precision: 7,
  };
};

const hashStringToNumber = (input) => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createDeterministicRandom = (seedValue) => {
  let seed = (seedValue % 2147483647 + 2147483647) % 2147483647;
  if (seed === 0) {
    seed = 1;
  }
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};

const SEASON_DEFINITIONS = [
  { name: "Summer", months: "Dec-Feb" },
  { name: "Autumn", months: "Mar-May" },
  { name: "Winter", months: "Jun-Aug" },
  { name: "Spring", months: "Sep-Nov" },
];

const SEASON_ORDER = SEASON_DEFINITIONS.reduce(
  (accumulator, season, index) => ({ ...accumulator, [season.name]: index }),
  {},
);

const createHistoricalDensity = (site) => {
  const key = getSiteKey(site) ?? site.name;
  const seed = hashStringToNumber(`${key}-history`);
  const random = createDeterministicRandom(seed);
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  const entries = [];

  years.forEach((year) => {
    SEASON_DEFINITIONS.forEach((season) => {
      const base = 70 + Math.round(random() * 160);
      const peakBoost = 25 + Math.round(random() * 80);
      const peak = base + peakBoost;
      const low = Math.max(15, base - Math.round(20 + random() * 45));
      const avg = Math.min(peak - 5, Math.max(low + 5, Math.round(base - random() * 10)));
      const tip =
        avg <= LOW_DENSITY_THRESHOLD
          ? "Low-density = clearer echoes and holographic clarity for AR storytellers."
          : avg >= HIGH_DENSITY_THRESHOLD
          ? "Crowd energy spikes — sync AR cues early and follow guided light paths."
          : "Balanced flow — AR nudges weave you through gently without losing immersion.";

      entries.push({
        year,
        season: season.name,
        months: season.months,
        avg,
        peak,
        low,
        tip,
      });
    });
  });

  const peakEntry = entries.reduce(
    (accumulator, entry) => (entry.peak > accumulator.peak ? entry : accumulator),
    entries[0],
  );

  const calmestEntry = entries.reduce(
    (accumulator, entry) => (entry.avg < accumulator.avg ? entry : accumulator),
    entries[0],
  );

  const reduction = Math.max(
    10,
    Math.min(70, Math.round(((peakEntry.peak - calmestEntry.avg) / peakEntry.peak) * 100)),
  );

  const recommendation = `Avoid ${peakEntry.season} ${peakEntry.year} peaks (~${peakEntry.peak}/km²). Try ${calmestEntry.season} ${calmestEntry.year} (~${calmestEntry.avg}/km²) for about ${reduction}% calmer space and richer AR golden-hour storytelling.`;

  const latestYear = years[years.length - 1];
  const earliestYear = years[0];

  const averageForYear = (targetYear) => {
    const filtered = entries.filter((entry) => entry.year === targetYear);
    if (filtered.length === 0) {
      return 0;
    }
    return Math.round(filtered.reduce((sum, entry) => sum + entry.avg, 0) / filtered.length);
  };

  const latestYearAverage = averageForYear(latestYear);
  const earliestYearAverage = averageForYear(earliestYear);

  let trendChange = 0;
  if (earliestYearAverage > 0) {
    trendChange = Math.round(((latestYearAverage - earliestYearAverage) / earliestYearAverage) * 100);
  }

  let trend;
  if (trendChange > 5) {
    trend = `3-year trend: +${trendChange}% rise in crowding — lean on AR density nudges before twilight.`;
  } else if (trendChange < -5) {
    trend = `3-year trend: ${trendChange}% softer flow — expect clearer Dreamtime audio overlays.`;
  } else {
    trend = "3-year trend: holding steady — AR guides adapt smoothly across seasons.";
  }

  const latestSeasons = entries
    .filter((entry) => entry.year === latestYear)
    .sort((a, b) => SEASON_ORDER[a.season] - SEASON_ORDER[b.season]);

  return {
    entries,
    latestYear,
    latestSeasons,
    peakEntry,
    calmestEntry,
    recommendation,
    trend,
    reduction,
  };
};

const classifyDensity = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "unknown";
  }
  if (value <= LOW_DENSITY_THRESHOLD) {
    return "low";
  }
  if (value <= HIGH_DENSITY_THRESHOLD) {
    return "medium";
  }
  return "high";
};

const deriveVisitHint = (bestTime) => {
  if (!bestTime) {
    return "an off-peak window";
  }
  const [firstClause] = bestTime.split(";").map((segment) => segment.trim());
  const [primaryHint] = firstClause.split("—").map((segment) => segment.trim());
  return primaryHint || "an off-peak window";
};

const normaliseHintForCopy = (hint) => {
  if (!hint || hint === "an off-peak window") {
    return hint || "an off-peak window";
  }
  const firstChar = hint.charAt(0);
  if (firstChar === firstChar.toLowerCase()) {
    return hint;
  }
  return firstChar.toLowerCase() + hint.slice(1);
};

const buildDensityInsight = (severity, hint) => {
  const normalisedHint = normaliseHintForCopy(hint);
  switch (severity) {
    case "low":
      return "Plenty of breathing room — capture AR overlays right now.";
    case "medium":
      return `Steady flow — consider ${normalisedHint} to drift past queues.`;
    case "high":
      return `Crowd surge — swap to ${normalisedHint} for calmer hologram glow.`;
    default:
      return "Tracking density — check back in a moment.";
  }
};

const buildDensityResult = ({ site, average, min, max, source, payload }) => {
  const severity = classifyDensity(average);
  const hint = deriveVisitHint(site.bestTime);
  return {
    average,
    min,
    max,
    severity,
    label: `Avg ${average}/km² now`,
    message: buildDensityInsight(severity, hint),
    updatedAt: new Date().toISOString(),
    source,
    requestPayload: payload,
  };
};

const createMockDensity = (site, payload = createPopulationDensityRequest(site)) => {
  const seed = hashStringToNumber(getSiteKey(site));
  const average = 30 + (seed % 220);
  const min = Math.max(5, Math.round(average * 0.6));
  const max = Math.round(average * 1.3);
  return buildDensityResult({
    site,
    average: Math.round(average),
    min,
    max,
    source: "mock",
    payload,
  });
};

const transformPopulationDensityResponse = (response, site, payload) => {
  const intervals = response?.timedPopulationDensityData ?? [];
  if (intervals.length === 0) {
    return null;
  }
  const latestInterval = intervals[intervals.length - 1];
  const cells = latestInterval?.cellPopulationDensityData?.filter(
    (cell) => cell?.dataType === "DENSITY_ESTIMATION",
  );
  if (!cells || cells.length === 0) {
    return null;
  }

  const aggregated = cells.reduce(
    (accumulator, cell) => ({
      min: Math.min(accumulator.min, cell.minPplDensity),
      max: Math.max(accumulator.max, cell.maxPplDensity),
      total: accumulator.total + cell.pplDensity,
    }),
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, total: 0 },
  );

  const average = Math.round(aggregated.total / cells.length);
  const min = Number.isFinite(aggregated.min) ? aggregated.min : average;
  const max = Number.isFinite(aggregated.max) ? aggregated.max : average;

  return buildDensityResult({
    site,
    average,
    min,
    max,
    source: "live",
    payload,
  });
};

const fetchPopulationDensityForSite = async (site) => {
  const payload = createPopulationDensityRequest(site);

  if (!POPULATION_DENSITY_BASE_URL) {
    return createMockDensity(site, payload);
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-correlator": createCorrelator(),
  };

  if (POPULATION_DENSITY_TOKEN) {
    headers.Authorization = `Bearer ${POPULATION_DENSITY_TOKEN}`;
  }

  try {
    const response = await fetch(`${POPULATION_DENSITY_BASE_URL}${POPULATION_DENSITY_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 202) {
      const mockResult = createMockDensity(site, payload);
      return {
        ...mockResult,
        label: "Processing CAMARA dataset…",
        message: "Async CAMARA callback pending — showing AR forecast preview.",
        source: "pending",
        requestPayload: payload,
      };
    }

    if (!response.ok) {
      throw new Error(`Population density request failed with status ${response.status}`);
    }

    const json = await response.json();
    const transformed = transformPopulationDensityResponse(json, site, payload);

    if (transformed) {
      return transformed;
    }
  } catch (error) {
    console.warn(`[PlanItineraries] Population density fallback for ${site.name}`, error);
  }

  return createMockDensity(site, payload);
};

const TOTAL_SITES = REGIONS.reduce((accumulator, region) => accumulator + region.sites.length, 0);

const ALL_SITES = REGIONS.flatMap((region) =>
  region.sites.map((site) => ({
    ...site,
    regionId: region.id,
    regionName: region.name,
    regionColor: region.color,
  })),
);

const SITE_HISTORICAL_DENSITY = Object.fromEntries(
  ALL_SITES.map((site) => [getSiteKey(site), createHistoricalDensity(site)]),
);

export default function PlanItineraries() {
  const [activeRegionId, setActiveRegionId] = useState(REGIONS[0]?.id ?? "");
  const [viewMode, setViewMode] = useState("region");
  const [populationDensities, setPopulationDensities] = useState({});
  const [activeDensityDetail, setActiveDensityDetail] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const activeRegion = useMemo(
    () => REGIONS.find((region) => region.id === activeRegionId) ?? REGIONS[0],
    [activeRegionId],
  );

  const regionSites = useMemo(() => {
    if (!activeRegion) {
      return [];
    }
    return activeRegion.sites.map((site) => ({
      ...site,
      regionId: activeRegion.id,
      regionName: activeRegion.name,
      regionColor: activeRegion.color,
    }));
  }, [activeRegion]);

  const displayedSites = viewMode === "region" ? regionSites : ALL_SITES;

  useEffect(() => {
    let isCancelled = false;

    const loadPopulationDensities = async () => {
      const entries = await Promise.all(
        ALL_SITES.map(async (site) => {
          const density = await fetchPopulationDensityForSite(site);
          return [getSiteKey(site), density];
        }),
      );
      if (!isCancelled) {
        setPopulationDensities(Object.fromEntries(entries));
      }
    };

    loadPopulationDensities();

    return () => {
      isCancelled = true;
    };
  }, []);

  const openDensityDetail = (site, interaction = "hover") => {
    const key = getSiteKey(site);
    const history = SITE_HISTORICAL_DENSITY[key] ?? createHistoricalDensity(site);
    const current = populationDensities[key];
    setActiveDensityDetail({
      key,
      site,
      history,
      current,
      interaction,
    });
  };

  const closeDensityDetail = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDensityDetail(null);
  };

  const handleDensityEnter = (site) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    openDensityDetail(site, "hover");
  };

  const handleDensityLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setActiveDensityDetail((previous) => (previous?.interaction === "hover" ? null : previous));
    }, 160);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.heroTag}>Echoes of Eternity AR · Plan Itineraries</span>
          <h1 className={styles.heroTitle}>Craft your Australian itinerary with AR-ready adventures</h1>
        </div>
        <p className={styles.heroIntro}>
          Blend heritage-rich storytelling, regenerative travel, and holographic wonder. Filter by region, preview Dreamtime overlays,
          and time visits for golden-hour reveals while locking in seamless AR tie-ins — from reef restoration pledges to parliament
          debates rendered live in your lenses.
        </p>
        <div className={styles.heroStats}>
          <span>{TOTAL_SITES} spotlight sites</span>
          <span>8 regions · coast to outback</span>
          <span>Mobile-first, AR-connected journeys</span>
        </div>
      </header>

      <section className={styles.explorer}>
        <div className={styles.mapPanel}>
          <div className={styles.mapBoard} aria-hidden="true">
            <AustraliaMap className={styles.mapIllustration} />
            <div className={styles.mapBackdrop} />
            {REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                className={`${styles.mapPin} ${region.id === activeRegion.id ? styles.mapPinActive : ""}`}
                style={{ top: region.mapPosition.top, left: region.mapPosition.left }}
                onMouseEnter={() => setActiveRegionId(region.id)}
                onFocus={() => setActiveRegionId(region.id)}
                onClick={() => {
                  setActiveRegionId(region.id);
                  setViewMode("region");
                }}
              >
                <span className={styles.pinLabel}>{region.short}</span>
                <span className={styles.pinCount}>{region.sites.length}</span>
              </button>
            ))}
          </div>
          <aside className={styles.regionDetails}>
            <div className={styles.regionHeader}>
              <div>
                <h2>{activeRegion.name}</h2>
                <p>{activeRegion.overview}</p>
              </div>
              <span className={styles.regionCount}>{activeRegion.sites.length} featured sites</span>
            </div>
            <div className={styles.controls}>
              <button
                type="button"
                className={`${styles.controlButton} ${viewMode === "region" ? styles.controlActive : ""}`}
                onClick={() => setViewMode("region")}
              >
                Focus {activeRegion.short}
              </button>
              <button
                type="button"
                className={`${styles.controlButton} ${viewMode === "all" ? styles.controlActive : ""}`}
                onClick={() => setViewMode("all")}
              >
                View all regions
              </button>
            </div>
            <ul className={styles.regionHighlights}>
              {REGIONS.map((region) => (
                <li key={`${region.id}-highlight`}>
                  <button
                    type="button"
                    className={`${styles.regionChip} ${region.id === activeRegion.id ? styles.regionChipActive : ""}`}
                    onClick={() => {
                      setActiveRegionId(region.id);
                      setViewMode("region");
                    }}
                  >
                    <span className={styles.regionDot} style={{ background: region.color }} />
                    {region.name}
                    <span className={styles.regionChipCount}>{region.sites.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className={styles.siteSection}>
        <div className={styles.siteHeader}>
          <div>
            <h3>
              {viewMode === "region" ? `${activeRegion.name} itineraries` : "All-region itinerary atlas"}
            </h3>
            <p>
              {viewMode === "region"
                ? "Plan flows that weave coastal outlooks, country-led stories, and AR activations tailored to this region."
                : "Skim every AR-enabled highlight and bookmark combinations that suit your travellers’ personas, timeframes, and accessibility needs."}
            </p>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendDot} />
            <span>Population density badge (people/km²): &lt;50 green · 50–200 amber · &gt;200 red</span>
          </div>
        </div>
        <div className={styles.siteGrid}>
          {displayedSites.map((site) => {
            const densityKey = getSiteKey(site);
            const density = populationDensities[densityKey];
            const severityClassName =
              density && density.severity && styles[`density${density.severity.charAt(0).toUpperCase() + density.severity.slice(1)}`];
            const badgeClassName = `${styles.densityBadge} ${severityClassName ?? styles.densityUnknown}`;
            const densityTooltip = density
              ? `Min ${density.min}/km² · Max ${density.max}/km² · Source ${density.source}`
              : "Awaiting CAMARA population density response";
            const sourceLabel =
              density?.source === "live"
                ? "Live CAMARA"
                : density?.source === "pending"
                ? "Awaiting CAMARA callback"
                : "Predictive preview";
            const updatedLabel =
              density?.updatedAt &&
              new Date(density.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <article key={`${site.regionId}-${site.name}`} className={styles.siteCard}>
                <header>
                  <span className={styles.siteRegion} style={{ color: site.regionColor }}>
                    {site.regionName}
                  </span>
                  <h4>{site.name}</h4>
                </header>
                <div
                  className={styles.densityRow}
                  onMouseEnter={() => handleDensityEnter(site)}
                  onMouseLeave={handleDensityLeave}
                >
                  <button
                    type="button"
                    className={badgeClassName}
                    title={densityTooltip}
                    onFocus={() => handleDensityEnter(site)}
                    onBlur={() => {
                      if (activeDensityDetail?.interaction === "hover") {
                        handleDensityLeave();
                      }
                    }}
                    onClick={() => openDensityDetail(site, "touch")}
                    aria-expanded={activeDensityDetail?.key === densityKey}
                  >
                    {density ? density.label : "Loading density…"}
                  </button>
                  <span className={styles.densityInsight}>
                    {density ? density.message : "Mapping anonymised flow with CAMARA preview…"}
                  </span>
                </div>
                {density ? (
                  <div className={styles.densityMeta}>
                    <span>Min {density.min}/km²</span>
                    <span>Max {density.max}/km²</span>
                    {updatedLabel ? <span>Updated {updatedLabel}</span> : null}
                    <span>{sourceLabel}</span>
                  </div>
                ) : (
                  <div className={`${styles.densityMeta} ${styles.densityMetaLoading}`}>
                    <span>Calibrating anonymised density bands…</span>
                  </div>
                )}
                {activeDensityDetail?.key === densityKey && activeDensityDetail.interaction === "hover" ? (
                  <DensityDetailPanel detail={activeDensityDetail} />
                ) : null}
                <p className={styles.siteSummary}>{site.summary}</p>
                <footer className={styles.siteFooter}>
                  <span className={styles.siteBestTime}>
                    <strong>Best time</strong>
                    <span>{site.bestTime}</span>
                  </span>
                  <button type="button" className={styles.sitePlanner}>
                    Add to itinerary
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
      {activeDensityDetail && activeDensityDetail.interaction !== "hover" ? (
        <DensityDetailOverlay detail={activeDensityDetail} onClose={closeDensityDetail} />
      ) : null}
    </div>
  );
}

function AustraliaMap({ className }) {
  return (
    <svg className={className} viewBox="0 0 800 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(88, 227, 255, 0.45)" />
          <stop offset="40%" stopColor="rgba(57, 225, 168, 0.25)" />
          <stop offset="100%" stopColor="rgba(12, 48, 96, 0.4)" />
        </linearGradient>
        <radialGradient id="mapGlow" cx="60%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(140, 206, 255, 0.35)" />
          <stop offset="100%" stopColor="rgba(6, 24, 52, 0.0)" />
        </radialGradient>
      </defs>
      <g fill="url(#mapGradient)" stroke="rgba(140, 206, 255, 0.35)" strokeWidth="4" strokeLinejoin="round">
        <path
          d="M88 284 L150 198 L238 162 L360 128 L478 148 L532 128 L612 170 L702 278 L662 348 L606 372 L652 438 L626 514 L560 560 L502 560 L436 514 L374 492 L308 560 L246 590 L202 566 L156 500 L110 452 L90 380 Z"
        />
        <path d="M356 632 L420 664 L388 708 L318 684 Z" />
      </g>
      <path
        d="M88 284 L150 198 L238 162 L360 128 L478 148 L532 128 L612 170 L702 278 L662 348 L606 372 L652 438 L626 514 L560 560 L502 560 L436 514 L374 492 L308 560 L246 590 L202 566 L156 500 L110 452 L90 380 Z"
        fill="url(#mapGlow)"
        stroke="none"
        opacity="0.4"
      />
    </svg>
  );
}

function DensityDetailPanel({ detail }) {
  return (
    <div className={styles.densityDetail}>
      <DensityDetailCard detail={detail} context="inline" />
    </div>
  );
}

function DensityDetailOverlay({ detail, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.densityOverlay}>
      <div className={styles.densityOverlayBackdrop} onClick={onClose} />
      <div
        className={styles.densityOverlayCard}
        role="dialog"
        aria-modal="true"
        aria-label={`${detail.site.name} density history`}
      >
        <DensityDetailCard detail={detail} context="overlay" onClose={onClose} />
      </div>
    </div>
  );
}

function DensityDetailCard({ detail, context, onClose }) {
  const { site, history, current } = detail;

  if (!history) {
    return null;
  }

  const currentSourceLabel =
    current?.source === "live" ? "Live CAMARA" : current?.source === "pending" ? "Pending CAMARA" : "Forecast window";

  return (
    <div className={styles.densityDetailCard}>
      <header className={styles.densityDetailHeader}>
        <div>
          <strong>{site.name}</strong>
          <span>Density memory</span>
        </div>
        {context === "overlay" ? (
          <button type="button" className={styles.densityDetailClose} onClick={onClose} aria-label="Close density history">
            ×
          </button>
        ) : null}
      </header>
      {current ? (
        <div className={styles.densityDetailCurrent}>
          <span>{current.label}</span>
          <span>
            Min {current.min}/km² · Max {current.max}/km² · {currentSourceLabel}
          </span>
        </div>
      ) : (
        <div className={`${styles.densityDetailCurrent} ${styles.densityMetaLoading}`}>
          <span>Awaiting live density snapshot…</span>
        </div>
      )}
      <p className={styles.densityDetailSummary}>{history.recommendation}</p>
      <div className={styles.densityCallouts}>
        <span>
          Peak {history.peakEntry.season} {history.peakEntry.year}: {history.peakEntry.peak}/km² ({history.peakEntry.months})
        </span>
        <span>
          Calmest {history.calmestEntry.season} {history.calmestEntry.year}: {history.calmestEntry.avg}/km² ({history.calmestEntry.months})
        </span>
      </div>
      <p className={styles.densityDetailTrend}>{history.trend}</p>
      <ul className={styles.densityDetailList}>
        {history.latestSeasons.map((entry) => (
          <li key={`${entry.year}-${entry.season}`} className={styles.densityDetailListItem}>
            <div className={styles.densityDetailListHeader}>
              <span>
                {entry.season} {entry.year}
              </span>
              <span>{entry.months}</span>
            </div>
            <div className={styles.densityDetailListStats}>
              <span>Avg {entry.avg}/km²</span>
              <span>Peak {entry.peak}/km²</span>
              <span>Base {entry.low}/km²</span>
            </div>
            <p>{entry.tip}</p>
          </li>
        ))}
      </ul>
      <footer className={styles.densityDetailFootnote}>
        Synthesised from anonymised CAMARA baselines; perfect for timing AR echoes and respectful site pacing.
      </footer>
    </div>
  );
}


