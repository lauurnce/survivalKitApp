-- ============================================================
-- Multimedia — Modules & Sections
-- Subject ID: 30000000-0003-0001-0001-000000000001
-- 3rd Year, Semester 1 — major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- section 3 + the practice drills are PAID (kind='activity').
-- No IDE playgrounds (GPT specified no ide_language/starter_code).
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0001-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('7e929126-052f-589a-92ca-ba044becbd35','30000000-0003-0001-0001-000000000001','Lesson 1: Multimedia Foundations and Workflow','lesson-1-multimedia-foundations-and-workflow',1),
  ('75730f01-6f88-56d6-95fd-4b4ede5fcbce','30000000-0003-0001-0001-000000000001','Lesson 2: Visual Design and Digital Imaging','lesson-2-visual-design-and-digital-imaging',2),
  ('2c1d5b05-ca76-578e-9580-570309e5cf8a','30000000-0003-0001-0001-000000000001','Lesson 3: Audio Design and Production','lesson-3-audio-design-and-production',3),
  ('e6c18ed9-ec62-51fd-9dac-30d64c50555d','30000000-0003-0001-0001-000000000001','Lesson 4: Video Production and Compression','lesson-4-video-production-and-compression',4),
  ('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','30000000-0003-0001-0001-000000000001','Lesson 5: Animation and Motion Graphics','lesson-5-animation-and-motion-graphics',5),
  ('93abdd94-028d-5497-a29d-ea981ecbed93','30000000-0003-0001-0001-000000000001','Lesson 6: Interaction Design, UI, and Storyboarding','lesson-6-interaction-design-ui-storyboarding',6),
  ('c5025b6a-9043-54d5-81a7-78ae458f52f8','30000000-0003-0001-0001-000000000001','Lesson 7: Authoring, Integration, and Delivery','lesson-7-authoring-integration-and-delivery',7),
  ('871cd8ff-4850-522a-84be-335f2af192c9','30000000-0003-0001-0001-000000000001','Lesson 8: Accessibility, Ethics, and Multimedia Evaluation','lesson-8-accessibility-ethics-evaluation',8);

-- ============================================================
-- LESSON 1: Multimedia Foundations and Workflow
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7e929126-052f-589a-92ca-ba044becbd35','content','What Multimedia Means in IT',$md$
Multimedia is the integrated use of several media forms in one digital product. In practice, that usually means combining text, images, audio, video, animation, and interactivity to communicate information or support a task.

In a BSIT context, multimedia is not only about making content look attractive. It is about building digital materials that are:

- clear for users,
- efficient to load and deliver,
- appropriate for the platform,
- usable and accessible,
- aligned with a real communication or business goal.

A multimedia project can be as simple as an onboarding presentation for a startup or as complex as an interactive learning module for a university LMS. The key idea is **integration**. A strong multimedia output does not treat media elements as separate decorations. Instead, each element supports the message.

Consider a local example. A barangay disaster-preparedness kiosk may use:

- text for reminders,
- icons for quick recognition,
- audio for spoken instructions,
- video for evacuation demonstrations,
- buttons for interactive navigation.

That is multimedia because the user receives one unified experience through multiple media types.

For exams, you should be able to explain multimedia as both a technical field and a communication strategy. It involves software tools, file formats, design principles, compression methods, and user-centered planning.
$md$, 1),
('7e929126-052f-589a-92ca-ba044becbd35','content','Core Elements of Multimedia',$md$
A multimedia system usually works with six common elements:

| Element | Main Purpose | Common Examples |
|---|---|---|
| Text | Explain, label, guide | titles, captions, instructions |
| Graphics/Images | Show objects, emphasize ideas | photos, diagrams, icons |
| Audio | Add narration, emotion, feedback | voice-over, music, alerts |
| Video | Present motion and real context | interviews, demonstrations |
| Animation | Show change over time | motion graphics, transitions |
| Interactivity | Let users control flow | buttons, menus, quizzes |

Each element has strengths and limits.

- **Text** is precise and searchable, but long text can slow users down.
- **Images** communicate quickly, but may be misunderstood without labels.
- **Audio** supports mood and accessibility, but users may be in silent environments.
- **Video** is powerful for demonstration, but large files can affect performance.
- **Animation** is useful for processes, but too much motion distracts.
- **Interactivity** increases engagement, but poor navigation confuses users.

A good multimedia author asks: *Which element best serves this message?* For example, if you need to explain how to renew a permit online, a short screen-recorded video may work better than a long paragraph. If you need users to compare three options quickly, a table or infographic may be better than narration.

The rule is simple: **use media intentionally, not just abundantly.**
$md$, 2),
('7e929126-052f-589a-92ca-ba044becbd35','activity','Multimedia Systems and Production Workflow',$md$
A multimedia product is rarely built in one step. Most projects follow a workflow with four broad phases.

### Pre-production

This is the planning stage. You define audience, objective, scope, content requirements, technical requirements, deadlines, and team roles.

### Production

This is where assets are created: images are designed or edited, audio is recorded, video is shot, animations are built, and interface screens are drafted.

### Post-production

Assets are improved and assembled: color correction, sound cleanup, editing, compositing, exporting, format conversion, and quality checks.

### Delivery and maintenance

The product is published, tested, and improved: deployment to web, app, kiosk, LMS, or presentation system; device compatibility checks; file optimization; user feedback collection; and updates and revisions.

A useful way to think about workflow is:

> Plan first, produce second, refine third, deliver last.

Skipping planning usually causes rework. For example, if a team edits a long campus promotional video before agreeing on the target length and audience, it may need major cuts later. That wastes time.

In IT environments, workflow discipline matters because multimedia often connects with system requirements such as storage, loading speed, usability, and deployment constraints. Before creating anything, prepare a multimedia plan that answers: What is the goal? Who is the audience? What media are needed? What are the constraints? How will success be measured? A common classroom mistake is starting with tools instead of goals — the better question is "What does the audience need to understand or do after using this?"
$md$, 3),
('7e929126-052f-589a-92ca-ba044becbd35','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. Define multimedia in your own words.
2. Why is integration an important idea in multimedia?
3. Differentiate pre-production, production, post-production, and delivery.
4. Give one strength and one limitation of audio in multimedia.
5. Why is audience analysis necessary before creating assets?
6. What makes interactivity useful in an IT-based multimedia project?
7. In what way is multimedia connected to system performance?
8. Why is "use media intentionally" a better principle than "use many media"?

**Worked Exam-Style Problems**

**Problem 1: Choosing the Right Media Mix.** A college department wants digital orientation material for incoming BSIT students. Goals: explain enrollment steps; show campus locations; reduce repeated questions; keep it usable on phones.

*Step-by-step solution*
1. List communication needs: steps need sequence; locations need visuals; repeated questions need quick answers; mobile needs light, readable content.
2. Match media: text for short instructions; icons/graphics for office recognition; map images for navigation; short video for processes; interactive menu/FAQ buttons for jumping to concerns.
3. Reject the unnecessary: long autoplay audio (users in public); one long video for everything (inconvenient on phones).
4. Recommend structure: home screen with buttons (Enrollment, Campus Map, Fees & Requirements, FAQs), each using short text, visuals, and optional short video.

*Final answer:* a mobile-friendly interactive orientation module with short text, icons, campus maps, FAQ navigation, and short optional videos — supports clarity, quick access, and low-friction phone use.

**Problem 2: Estimating Basic Asset Storage.** 20 images at 3 MB each; 3 audio clips at 8 MB each; 2 videos at 120 MB each. Estimate total storage.

*Step-by-step solution*
- Images: $20 \times 3 = 60$ MB
- Audio: $3 \times 8 = 24$ MB
- Video: $2 \times 120 = 240$ MB
- Total: $60 + 24 + 240 = 324$ MB

*Final answer:* about **324 MB** before adding space for project files, drafts, and exports. Reserve more in practice.

**Hands-On Exercise.** Create a one-page multimedia project brief for an interactive information kiosk for a local festival (objective, target users, media elements, platform, constraints, one success metric). Then build a simple asset matrix:

| Asset | Purpose | Source | Status |
|---|---|---|---|
| Festival logo | branding | client-provided | pending |
| Venue photos | orientation | own photos | to capture |
| Voice-over | instructions | to record | pending |

**How to Pass This Topic**

- Memorize the six elements of multimedia.
- Be ready to explain the workflow in order.
- In situational questions, justify your answer using goal + audience + platform.
- For "best media" questions, do not answer with just a tool — explain why the medium fits the task.
- Professors often reward students who distinguish planning issues from production issues.
$md$, 4);

-- ============================================================
-- LESSON 2: Visual Design and Digital Imaging
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('75730f01-6f88-56d6-95fd-4b4ede5fcbce','content','Principles of Visual Communication',$md$
Good multimedia is not only functional. It must also be visually understandable. Four basic design principles are often used in screen-based outputs.

### Contrast

Contrast helps users notice what matters. You can create it through size, color, shape, weight, and spacing. If everything looks equally strong, nothing stands out.

### Alignment

Objects should look intentionally placed. Alignment creates order and professionalism. Poor alignment makes a layout feel unfinished even when the content is correct.

### Repetition

Repeated styles build consistency. Repeating colors, button shapes, heading styles, and icon rules helps users learn the interface faster.

### Proximity

Related items should stay close together. If a label is too far from the image or button it describes, users may misread the screen.

You should also remember **visual hierarchy** — arranging parts so the user sees the most important item first, then the next, then the supporting details. Typical hierarchy tools include bigger headings, stronger color contrast, placement near the top, whitespace, and bold emphasis.

In exam situations, if you are asked why a design is confusing, look for weak hierarchy, poor alignment, low contrast, and inconsistent grouping.
$md$, 1),
('75730f01-6f88-56d6-95fd-4b4ede5fcbce','content','Raster, Vector, Resolution, and Color',$md$
Digital images are commonly divided into raster and vector graphics.

### Raster graphics

Raster images are made of pixels. They are ideal for photographs, detailed textures, and realistic visuals. Common formats: JPG/JPEG, PNG, GIF, WebP. Their weakness is scaling — when enlarged too much, they become blurry or pixelated.

### Vector graphics

Vector images are based on mathematical paths. They are ideal for logos, icons, diagrams, and illustrations with clean shapes. Common formats: SVG, AI, EPS, PDF. Their strength is scalability — they can be resized without losing sharpness.

### Resolution

Resolution refers to the amount of image detail, usually described by pixel dimensions such as 1280 × 720, 1920 × 1080, 3840 × 2160. For screen use, pixel dimensions matter more than print-oriented terms.

### Color models

Two color models are important: **RGB** for screens and **CMYK** for print. Since multimedia outputs are often screen-based, RGB is the default in many IT projects.

A practical rule: use JPG for photos with small file size; use PNG for transparent graphics; use SVG for scalable icons and logos.
$md$, 2),
('75730f01-6f88-56d6-95fd-4b4ede5fcbce','activity','File Formats, Optimization, and Typography',$md$
Choosing the wrong format can cause poor quality or unnecessarily large files.

| Format | Best Use | Strength | Limitation |
|---|---|---|---|
| JPG/JPEG | photos | small size | no transparency; lossy |
| PNG | logos, UI elements, transparent graphics | clean edges; transparency | larger size |
| GIF | simple looping graphics | animation support | limited color |
| SVG | icons, logos, diagrams | scalable; light for simple art | not ideal for detailed photos |
| WebP | web images | good compression | compatibility should still be checked |

When optimizing images, think about three things: **quality** (readable and visually acceptable), **size** (large files slow loading), and **purpose** (a hero banner, thumbnail, icon, and full-screen photo do not need the same export settings). A common workflow: crop → adjust color/brightness → resize for actual display → export in the appropriate format → test in the final environment. Optimization is not "making the file as small as possible" — it is the best balance between clarity and efficiency.

### Typography and layout for screen media

Good screen typography usually follows these rules: use readable font sizes; avoid too many font families; maintain strong text/background contrast; keep line length comfortable; use spacing to separate ideas; reserve all caps for short emphasis only. A simple, effective pattern is one style for headings, one for body text, and one accent style only when necessary.

For layout, think in grids and zones — users should predict where to find the title, navigation, content, and actions. A common Filipino student-project mistake is overdecorating with too many colors, outlines, effects, and fonts; a cleaner layout usually communicates better.
$md$, 3),
('75730f01-6f88-56d6-95fd-4b4ede5fcbce','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What is contrast, and why is it important?
2. Differentiate raster and vector graphics.
3. Why does a raster image lose quality when enlarged too much?
4. When should you use PNG instead of JPG?
5. What is visual hierarchy?
6. Why is RGB the usual color model for screen-based multimedia?
7. Give two reasons why poor typography harms usability.
8. What is the difference between optimization and compression alone?

**Worked Exam-Style Problems**

**Problem 1: Computing Uncompressed Image Size.** An image is 1920 × 1080 with 24 bits per pixel. Estimate the uncompressed size in bytes.

*Step-by-step solution*
- Pixels: $1920 \times 1080 = 2{,}073{,}600$
- Bits: $2{,}073{,}600 \times 24 = 49{,}766{,}400$
- Bytes: $49{,}766{,}400 \div 8 = 6{,}220{,}800$

*Final answer:* about **6,220,800 bytes (~6.2 MB)** before compression.

**Problem 2: Choosing the Correct Format.** A school website needs a student-organization logo, a graduation photo, and a transparent button icon.

*Step-by-step solution*
- Logo: sharp edges + scalable → **SVG** (or PNG if a raster export is required)
- Graduation photo: photographic, load fast → **JPG/JPEG**
- Transparent icon: transparency + clean edges → **PNG**

**Hands-On Exercise.** Take any existing poster, slide, or landing-page mockup and improve it using stronger contrast, better alignment, clearer grouping, and simpler typography. Then write a short justification: What was wrong before? Which principle did you apply? Why is the revised version easier to use?

**How to Pass This Topic**

- Memorize format choices: JPG for photos, PNG for transparency, SVG for scalable graphics.
- "Justify your format choice" appears often — never answer with the file type alone.
- Review the image-size formula: $\text{Size} = \dfrac{\text{width} \times \text{height} \times \text{bit depth}}{8}$
- In design critiques, use formal terms: contrast, alignment, hierarchy, readability, consistency.
- Avoid vague answers such as "make it nicer." Be specific.
$md$, 4);

-- ============================================================
-- LESSON 3: Audio Design and Production
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('2c1d5b05-ca76-578e-9580-570309e5cf8a','content','Audio Fundamentals',$md$
Audio adds clarity, realism, emotion, and feedback to multimedia. To use it well, you need a few core concepts.

### Frequency
Frequency relates to pitch. Higher frequency sounds are perceived as higher in pitch.

### Amplitude
Amplitude relates to loudness. Stronger amplitude means louder sound.

### Sample rate
In digital audio, sample rate means how many times per second the sound is measured. It is often expressed in hertz, such as 44,100 Hz or 48,000 Hz. A higher sample rate can capture more detail, but it also increases file size.

### Bit depth
Bit depth affects how precisely each sample is stored. Common values include 16-bit and 24-bit. Higher bit depth provides more detail and dynamic range.

### Channels
Mono uses one channel; stereo uses two channels. For many voice-based materials, mono may be enough. For music and immersive content, stereo is more common.

Audio in multimedia is not just about recording something. It is about recording the right sound at the right quality for the intended use.
$md$, 1),
('2c1d5b05-ca76-578e-9580-570309e5cf8a','content','Recording and Editing Workflow',$md$
A simple audio workflow looks like this:

1. **Plan the content** — script, speaker, tone, duration.
2. **Prepare the recording environment** — quiet room, reduced echo, proper microphone distance, test recording first.
3. **Record cleanly** — stable speaking volume, minimal background noise, clear pronunciation.
4. **Edit** — trim silence, remove obvious mistakes, reduce noise, normalize levels, add fades where needed.
5. **Export** — choose the right format, test playback on target devices.

For instructional projects, poor audio can damage the whole experience more than students expect. Users will often tolerate average visuals, but unclear narration quickly becomes frustrating.

Good sound design also includes silence. Not every second needs music or effects. Clean pauses can improve comprehension.
$md$, 2),
('2c1d5b05-ca76-578e-9580-570309e5cf8a','activity','Audio Formats, Compression, and Sound Design',$md$
Common audio formats include:

| Format | Best Use | Notes |
|---|---|---|
| WAV | editing, archival, high quality | large file size |
| MP3 | general listening, web delivery | lossy compression |
| AAC/M4A | streaming and mobile delivery | efficient compression |
| OGG | some web and open-source contexts | compatibility varies |

Two broad concepts matter: **uncompressed or lightly compressed audio** is better during editing because quality is preserved; **compressed audio** is better for delivery because file sizes are smaller. A classroom rule of thumb: use WAV while processing, export to MP3 or AAC for distribution depending on the platform. Compression reduces size by removing or simplifying audio data — that helps delivery, but too much compression can make audio sound thin or distorted.

### Sound design in multimedia

Audio has several practical functions: narration for teaching, background music for mood, sound effects for realism or feedback, alerts for interface events, and ambient sound for immersion. Sound should support the purpose, not overpower it — a training module should prioritize speech clarity; a promotional video may use music more strongly; an app interface should use very subtle effects.

When syncing sound with visuals, timing matters: a delayed click sound or mismatched voice-over feels unprofessional. Also remember user context — some learners use phones in noisy jeepney rides; some work in libraries with sound off. That is why subtitles, captions, and visual cues are still important even when audio is present.
$md$, 3),
('2c1d5b05-ca76-578e-9580-570309e5cf8a','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. What is sample rate?
2. What is bit depth?
3. Differentiate mono and stereo.
4. Why is a test recording important?
5. When would WAV be preferred over MP3?
6. What happens if audio is compressed too aggressively?
7. Why should narration be prioritized in instructional multimedia?
8. Give two roles of sound effects in interactive media.

**Worked Exam-Style Problems**

**Problem 1: Calculating PCM Audio Bitrate.** Stereo recording: sample rate = 44,100 Hz; bit depth = 16 bits; channels = 2.

*Step-by-step solution*
- $\text{Bitrate} = \text{sample rate} \times \text{bit depth} \times \text{channels}$
- $44{,}100 \times 16 \times 2 = 1{,}411{,}200$ bits/sec
- In kbps: $1{,}411{,}200 \div 1000 = 1411.2$ kbps

*Final answer:* **1,411,200 bps (1411.2 kbps).**

**Problem 2: Estimating Audio File Size.** Same settings, 210-second recording.

*Step-by-step solution*
- Bitrate: $1{,}411{,}200$ bits/sec
- Bits: $1{,}411{,}200 \times 210 = 296{,}352{,}000$
- Bytes: $296{,}352{,}000 \div 8 = 37{,}044{,}000$
- $\approx 37.0$ MB

*Final answer:* about **37 MB** before compression.

**Hands-On Exercise.** Prepare a voice-over plan for a 2-minute educational piece on online safety (target audience, script outline, recording setup, noise risks, export format for editing, export format for final delivery). Then record a short 20–30 second sample and evaluate: Is the voice clear? Is the pace appropriate? Is there background noise? Is the volume stable? Would captions still be needed?

**How to Pass This Topic**

- Memorize the bitrate formula for PCM audio.
- Do not confuse sample rate with bit depth.
- In situational questions, mention both quality and file size.
- For voice-heavy content, professors expect you to prioritize clarity over effects.
- If you recommend background music, say how you will keep it from competing with narration.
$md$, 4);

-- ============================================================
-- LESSON 4: Video Production and Compression
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('e6c18ed9-ec62-51fd-9dac-30d64c50555d','content','Planning Video for Multimedia',$md$
Video is one of the strongest multimedia elements because it combines image, motion, and sound. But strong video output begins before recording.

Useful planning tools include:

- **Script** — defines what will be said or shown.
- **Shot list** — lists the planned shots, such as wide shot, medium shot, close-up, screen recording, cutaway.
- **Storyboard** — maps the visual sequence frame by frame or scene by scene.
- **Production plan** — includes location, equipment, speakers, schedule, and permissions.

A video for a university event recap and a video for a software tutorial are not planned the same way. The first may focus on emotional highlights. The second must focus on screen clarity, sequence, and readability.

Good planning also prevents continuity errors. If a speaker suddenly changes position or a process step is skipped, viewers notice.
$md$, 1),
('e6c18ed9-ec62-51fd-9dac-30d64c50555d','content','Video Fundamentals',$md$
To make good decisions, understand these core terms.

### Resolution
Examples: 1280 × 720, 1920 × 1080, 3840 × 2160. Higher resolution increases detail but also increases processing and storage needs.

### Frame rate
Frame rate is measured in frames per second (fps), such as 24 fps, 30 fps, 60 fps. Higher frame rate gives smoother motion, especially for games, sports, or UI demos.

### Codec
A codec compresses and decompresses video data. It affects quality, compatibility, and file size.

### Container
A container is the file wrapper, such as MP4, MOV, MKV.

Many students confuse codec and container. Remember: **codec = how the data is compressed; container = how the data is packaged.** Bitrate also matters — higher bitrate usually means higher quality and larger files.
$md$, 2),
('e6c18ed9-ec62-51fd-9dac-30d64c50555d','activity','Editing, Post-Production, and Delivery',$md$
After recording, post-production usually includes trimming unusable footage, arranging clips, correcting color, adjusting audio, adding titles, inserting transitions, and exporting for target use.

Transitions should be purposeful. Overusing flashy transitions can make academic or professional outputs look weak — simple cuts and dissolves are often enough. For instructional or institutional videos, readability matters: titles must stay on screen long enough, screen captures must be legible, narration must match the sequence. Effective video editing means clarity, pacing, continuity, synchronization, and consistency of visual style.

### Delivery and streaming considerations

A video that looks excellent on a lab computer may perform poorly on a low-bandwidth connection. Export settings should match the actual use case:

- **For classroom projection:** clarity and legibility matter most.
- **For mobile viewing:** smaller file size and subtitle readability matter.
- **For LMS or web upload:** compatibility and streaming efficiency matter.

A practical delivery checklist: Is the resolution appropriate? Is the bitrate too high for the audience? Is the text readable on small screens? Are captions available? Does the file play on common devices? A technically correct video is not always an effective video — delivery decisions should be based on audience, platform, and network conditions.
$md$, 3),
('e6c18ed9-ec62-51fd-9dac-30d64c50555d','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. What is the purpose of a storyboard?
2. Differentiate codec and container.
3. Why does frame rate matter?
4. Give one situation where 60 fps is more useful than 24 fps.
5. Why is bitrate important in export decisions?
6. What editing issues make a tutorial video ineffective?
7. Why should mobile viewers be considered during export?
8. What is a continuity error?

**Worked Exam-Style Problems**

**Problem 1: Estimating Video Size from Bitrate.** Exported at 8 Mbps, duration 120 seconds.

*Step-by-step solution*
- $8$ Mbps $= 8{,}000{,}000$ bits/sec
- Bits: $8{,}000{,}000 \times 120 = 960{,}000{,}000$
- Bytes: $960{,}000{,}000 \div 8 = 120{,}000{,}000$
- $\approx 120$ MB

*Final answer:* about **120 MB.**

**Problem 2: Export Decision.** A software-demo video for students who mostly watch on phones with unstable internet — 4K at very high bitrate, or 1080p at moderate bitrate?

*Step-by-step solution*
1. Use case: mobile viewing, unstable internet, instructional purpose.
2. What matters most: readable interface, smooth playback, manageable file size.
3. Compare: 4K high bitrate gives more detail but is heavier and harder to stream; 1080p moderate bitrate is usually clear enough and more practical.

*Final answer:* use **1080p at a moderate bitrate** — it balances readability and accessibility for the target audience.

**Hands-On Exercise.** Create a mini pre-production set for a 1-minute tutorial video on how to submit a file to an LMS: objective, audience, script outline, 6-shot storyboard, recommended export settings, subtitle plan.

**How to Pass This Topic**

- Always define resolution, frame rate, bitrate, codec, and container correctly.
- In export questions, answer based on platform constraints, not just "best quality."
- For tutorial videos, mention screen readability and audio sync.
- Practice matching technical settings to real use cases.
- When in doubt, justify your choice with clarity + compatibility + file size.
$md$, 4);

-- ============================================================
-- LESSON 5: Animation and Motion Graphics
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','content','What Animation Adds to Multimedia',$md$
Animation shows change over time. It is useful when static images are not enough.

In multimedia, animation can explain a process, direct attention, simulate motion, improve feedback, and support storytelling.

Examples: a loading icon, an animated process diagram, a title reveal, an onboarding character, a moving interface cue.

Animation is most effective when it answers a question like:

- What changes?
- In what order?
- At what speed?
- What should the user notice?

If a process has multiple steps, animation can reduce explanation time by making the sequence visible.
$md$, 1),
('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','content','Principles of Animation',$md$
Even simple digital animation becomes better when it follows core principles such as:

### Timing
How long an action takes. Fast timing feels sudden; slow timing feels gentle or heavy.

### Spacing
How movement is distributed between positions. Equal spacing creates mechanical motion. Uneven spacing creates more natural motion.

### Anticipation
A small movement before the main action prepares the viewer.

### Follow-through
Parts of an object may continue moving briefly after the main action stops.

### Easing
Objects often accelerate and decelerate instead of moving at one constant speed.

In motion graphics and interface animation, these principles make motion feel intentional rather than awkward.
$md$, 2),
('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','activity','Types of Animation and Responsible Motion Use',$md$
Different multimedia tasks use different kinds of animation.

| Type | Typical Use |
|---|---|
| Frame-by-frame | artistic or character motion |
| Keyframe/tween animation | motion graphics and UI transitions |
| 2D animation | explainer content, icons, educational visuals |
| 3D animation | product visualization, simulation, games |
| Motion graphics | titles, charts, branding, infographics |

In many IT and academic projects, keyframe-based 2D animation and motion graphics are the most practical because they are easier to manage and fit instructional or promotional work well. Animation should not be added just to "make it look high-tech" — if motion delays access, overloads the screen, or distracts from reading, it reduces usability.

### Asset preparation and responsible motion use

Before animating, prepare assets carefully: separate layers clearly, name files consistently, decide canvas size, confirm export destination, and simplify unnecessary detail. You should also decide duration, frame rate, target format, and whether sound is needed.

Responsible animation means short transition times, motion that supports understanding, avoiding excessive flashing or rapid movement, and respecting accessibility concerns. A useful design question is: *Does this motion help the user understand, navigate, or feel feedback?* If the answer is no, the motion may be unnecessary.
$md$, 3),
('28157b75-a9ed-5da2-bbe6-ee0447ed76ae','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. What is the purpose of animation in multimedia?
2. Differentiate timing and spacing.
3. What is anticipation?
4. Why is easing important?
5. Which kind of animation is commonly practical for instructional multimedia?
6. Why can too much animation hurt usability?
7. What is the difference between 2D animation and motion graphics?
8. Why is asset preparation important before animating?

**Worked Exam-Style Problems**

**Problem 1: Keyframe Timing.** An icon animation starts at frame 0 and ends at frame 36 in a 24 fps composition. How many seconds?

*Step-by-step solution*
- $\text{Time} = \dfrac{\text{frames}}{\text{fps}} = \dfrac{36}{24} = 1.5$ seconds

*Final answer:* **1.5 seconds.**

**Problem 2: Choosing Animation for a Process Explanation.** A faculty member wants to explain how data flows from input to processing to output. Static poster, short motion graphic, or full live-action video?

*Step-by-step solution*
1. Communication need: sequence, transformation, process understanding.
2. Evaluate: static poster shows stages but not motion; live-action is unnecessary for abstract data flow; motion graphic animates arrows, labels, and transitions clearly.

*Final answer:* a **short motion graphic** — it clearly shows sequence and movement without the overhead of live-action production.

**Hands-On Exercise.** Design a 15-second storyboard for an animated explainer on "Strong Password Creation": opening frame, 3–5 key visual moments, text cues, motion notes, audio cue if needed. Then explain which animation principles are used.

**How to Pass This Topic**

- Be ready to define timing, spacing, anticipation, and easing.
- In application questions, justify animation by its role in explaining change over time.
- If asked whether animation is appropriate, consider clarity, speed, and accessibility.
- Remember that animation has to be planned like any other media asset.
- Short, purposeful motion is usually stronger than flashy motion.
$md$, 4);

-- ============================================================
-- LESSON 6: Interaction Design, UI, and Storyboarding
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('93abdd94-028d-5497-a29d-ea981ecbed93','content','Interactivity and User-Centered Design',$md$
Interactivity means the user is not just watching. The user can choose, click, navigate, respond, control sequence, and receive feedback.

Examples: menus, quiz buttons, interactive timelines, clickable maps, simulation controls.

In IT, interactivity must be designed around user goals. This is the heart of **user-centered design**. Instead of asking "What features can we add?" ask:

- What does the user need to do?
- What might confuse the user?
- What supports fast completion?

An interactive project fails if users cannot predict what to do next.
$md$, 1),
('93abdd94-028d-5497-a29d-ea981ecbed93','content','Navigation, Information Architecture, and Wireframes',$md$
**Information architecture** is the organization of content. It answers: What sections exist? Which items belong together? How does a user move from one part to another?

Common navigation structures include:

- linear,
- hierarchical,
- hub-and-spoke,
- non-linear exploratory.

A **wireframe** is a simple structural layout of screens. It does not need final colors or polished graphics. It shows the title area, menu placement, content blocks, buttons, and search or input fields.

Wireframes are useful because problems are easier to fix early than after full visual design.
$md$, 2),
('93abdd94-028d-5497-a29d-ea981ecbed93','activity','Usability Principles, Storyboards, and Prototypes',$md$
A usable multimedia interface usually has these qualities:

- **Consistency** — buttons, labels, and screen patterns behave similarly.
- **Feedback** — the system tells the user what happened (clicked, loading, saved, error).
- **Simplicity** — the interface avoids unnecessary complexity.
- **Visibility** — important actions should be easy to find.
- **Error prevention** — the design reduces common mistakes.
- **Accessibility awareness** — the design considers users with different needs.

For example, if an e-learning module uses a speaker icon for audio on one screen, it should not suddenly use a different symbol elsewhere without reason.

### Storyboards and low-fidelity prototypes

A storyboard helps plan the user experience over time. Unlike a film storyboard, an interactive storyboard may include screen state, user action, resulting system response, and next possible paths. A **low-fidelity prototype** is a rough version used for testing flow and logic before final production — paper sketches, slide-based click simulation, or grayscale digital mockups. Testing early reveals major issues like unclear labels, confusing menus, too many steps, missing feedback, and weak hierarchy. In many multimedia courses, storyboarding is where good projects start becoming organized instead of random.
$md$, 3),
('93abdd94-028d-5497-a29d-ea981ecbed93','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. What is interactivity?
2. What is user-centered design?
3. Differentiate information architecture and wireframing.
4. Why is consistency important in an interface?
5. What is system feedback?
6. What makes a low-fidelity prototype useful?
7. Give one example of error prevention in interface design.
8. Why should a menu structure be planned early?

**Worked Exam-Style Problems**

**Problem 1: Critiquing a Kiosk Interface.** A museum kiosk: home screen shows 12 equal-sized buttons; the "Back" button changes position on every screen; some buttons have text while others use unclear icons only; users do not know whether a video has started loading.

*Step-by-step solution*
1. Too many equal buttons → weak hierarchy. *Fix:* group into fewer categories; make high-priority actions larger.
2. Back button changes position → inconsistency. *Fix:* keep navigation controls in fixed locations.
3. Mixed labeling style → recognition problem. *Fix:* use text labels consistently; combine with icons if needed.
4. No loading feedback → lack of feedback. *Fix:* add a loading indicator or status message.

*Final answer:* the interface has hierarchy, consistency, labeling, and feedback problems; each should be corrected.

**Problem 2: Choosing a Navigation Structure.** A school's interactive orientation guide has four sections (admissions, fees, campus map, student services). Students enter for quick answers and return to the home screen often.

*Step-by-step solution*
1. User behavior: fast access to one topic; frequent return to main menu.
2. Compare: linear is poor (users may not need all sections in order); deep hierarchy needs too many clicks; hub-and-spoke fits (enter one section, return to a central home).

*Final answer:* a **hub-and-spoke structure.**

**Hands-On Exercise.** Create a 4-screen wireframe for an interactive campus help desk (Home, FAQs, Building Map, Contact Support). For each screen list: main action, navigation options, feedback message, possible user mistake and prevention method.

**How to Pass This Topic**

- Use proper terms: hierarchy, consistency, feedback, usability, wireframe, information architecture.
- In critiques, do not only say what is wrong — always say how to improve it.
- Professors often value logic of navigation more than artistic styling here.
- If a question asks for a design choice, justify it through user goal and task flow.
- Storyboards are not just drawings; they show sequence and response.
$md$, 4);

-- ============================================================
-- LESSON 7: Authoring, Integration, and Delivery
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('c5025b6a-9043-54d5-81a7-78ae458f52f8','content','Bringing Assets Together',$md$
A multimedia project becomes usable only when separate assets are integrated into one working package.

Typical assets include text files, image files, audio clips, video clips, animation exports, interface layouts, subtitle files, and icons/navigation states.

Integration means combining them in a way that preserves quality, naming consistency, timing, layout, and version control.

A practical team rule is to use organized folders such as:

```
/images
/audio
/video
/ui
/exports
/docs
```

Consistent naming prevents confusion, for example:

```
homepage_banner_v2.png
voiceover_intro_final.wav
tutorial_cut03.mp4
```

Poor naming and messy folders are common reasons why group projects become difficult to maintain.
$md$, 1),
('c5025b6a-9043-54d5-81a7-78ae458f52f8','content','Authoring Environments and Packaging',$md$
An authoring environment is the tool or platform used to combine assets into a final interactive or presentational output. Depending on the project, multimedia may be packaged as a presentation, a web page, an LMS module, a kiosk app, a mobile interface, or a video package.

Regardless of platform, the same authoring concerns appear:

- how content is structured,
- how navigation works,
- how assets are linked,
- how large the final package becomes,
- how updates are managed.

A multimedia author should think in systems, not just files. If one image is updated, which screens are affected? If audio is revised, which timings have to change? Integration is partly a technical task and partly an organizational one.
$md$, 2),
('c5025b6a-9043-54d5-81a7-78ae458f52f8','activity','Optimization, Testing, and Documentation',$md$
Optimization at the integration stage includes compressing large assets when appropriate, removing unused files, resizing visuals for target screens, balancing quality and performance, and reducing loading delays.

In practical IT settings, optimization is affected by storage limits, bandwidth, device memory, browser or app compatibility, and user patience. An animation that looks excellent on a workstation may feel laggy on an older mobile phone; a high-resolution background video may be unnecessary if the main content is instructional text. Optimization is strongest when done with evidence: actual device testing, download speed checks, preview on small screens, playback testing.

### Testing, debugging, and documentation

Before release, test the project carefully. A basic checklist: Do all buttons work? Do files load correctly? Are image and video sizes appropriate? Are captions synced? Is audio audible but not overpowering? Are there spelling errors? Is the project usable on more than one device?

Documentation matters too. At minimum, teams should keep asset lists, version notes, source attributions, export settings, and revision logs. Documentation helps during grading, maintenance, and handoff.
$md$, 3),
('c5025b6a-9043-54d5-81a7-78ae458f52f8','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions**

1. Why is consistent file naming important?
2. What is asset integration?
3. Give two examples of multimedia packaging.
4. Why should optimization be based on target platform?
5. What is version control in a simple project context?
6. Why are unused files a problem?
7. What should be documented before submission?
8. Why is cross-device testing important?

**Worked Exam-Style Problems**

**Problem 1: Fixing a Project Organization Problem.** A team submits a folder with `final.mp4`, `final2.mp4`, `finalnew.mp4`, `image1.png`, `newlogo.png`, `audioeditedlatest.wav`, and no document explaining the final version.

*Step-by-step solution*
1. Issues: unclear naming, no version pattern, no folder grouping, no documentation.
2. Propose structure: folders `/video`, `/images`, `/audio`, `/docs`, `/exports`; consistent names like `promo_video_v01.mp4`, `promo_video_v02.mp4`, `promo_video_final.mp4`.
3. Add documentation: changelog, export settings, final approved file name.

*Final answer:* the project lacks naming standards, structure, and version documentation — reorganize with folders, readable names, and a simple revision log.

**Problem 2: Choosing an Optimization Strategy.** A multimedia lesson has 5 full-resolution DSLR photos, 2 short MP4 videos, 1 voice-over, 1 interactive menu. Students complain it loads slowly on phones.

*Step-by-step solution*
1. Likely heavy assets: full-resolution DSLR photos (often much larger than needed); video may also contribute.
2. Prioritize easy, high-impact actions: resize photos to actual display dimensions; compress photos appropriately; review video bitrate and resolution.
3. Voice-over and menu are likely not the main problem.

*Final answer:* optimize the **large photos first**, then check video export settings — those usually give the biggest performance gains.

**Hands-On Exercise.** Prepare a delivery and test plan for an interactive multimedia lesson: folder structure, naming convention, export formats, device test list, a 10-point QA checklist, and a short revision-log template.

**How to Pass This Topic**

- In integration questions, show both technical assembly and project organization.
- Do not treat documentation as optional — students often lose points here.
- Use concrete terms: asset manifest, versioning, QA, deployment, compatibility.
- When optimizing, prioritize assets with the biggest performance impact.
- A "final" file name alone is not a workflow.
$md$, 4);

