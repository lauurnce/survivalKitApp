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

