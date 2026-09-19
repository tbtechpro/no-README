**PRODUCT REQUIREMENTS DOCUMENT**

QAF Support AI

The WhatsApp support companion for Qubators AI Foundry participants

| PRODUCT PROMISE  Every participant can quickly understand what is happening, what is expected, what to do next, and when a human admin needs to help. |
| :---- |

   
Version 1.0  |  19 September 2026

Prepared for Qubators AI Foundry

| Document field | Decision |
| :---- | :---- |
| Product name | QAF Support AI |
| Primary channel | Qubators AI Foundry participant WhatsApp group |
| Programme model | Free, intensive, hands-on training |
| Core philosophy | Learn. Build. Earn. |
| Primary owner | Qubators AI Foundry programme/admin team |
| Document status | Product direction and functional requirements; no technical implementation specification |

 

**Learn clearly  •  Build consistently  •  Grow through community**

 

# **1\. Executive summary**

QAF Support AI is a participant-support assistant for the Qubators AI Foundry WhatsApp community. It responds to routine questions addressed to administrators, clarifies official information, turns announcements into clear actions, helps participants identify their next step, and routes issues requiring judgement or sensitivity to a human admin.

The product is designed around the Foundry’s practical learning model. It should not become a noisy chatbot, a substitute instructor, or an automated authority. Its value is measured by whether participants remain informed, complete weekly deliverables, obtain help when blocked, collaborate responsibly, and progress from learning to building.

| North-star outcome  A participant can ask QAF, “What should I do next?” and receive a short, accurate, admin-approved answer that moves them closer to their next learning or building milestone. |
| :---- |

 

# **2\. Product context**

| Observed programme principle | Meaning for QAF Support AI |
| :---- | :---- |
| Learn. Build. Earn. | Support the full journey: understand a lesson, apply it to a product, and become ready to create real value or pursue opportunities. |
| Builders, not passive users | Prioritise action prompts, deliverables and problem-solving over long explanations. |
| A clear weekly path | Always make the current week, required activity and next submission easy to find. |
| Outputs over attendance alone | Celebrate completed work and progress; never imply that merely being present equals mastery. |
| Mentorship and live reviews | Prepare participants for feedback and send judgement-heavy questions to facilitators. |
| Peer collaboration | Encourage responsible peer help and recognise useful contribution without turning the group into a popularity contest. |
| Real-world, useful products | Keep advice connected to real user problems, value, testing and responsible product decisions. |
| Community of innovators | Use a respectful, encouraging voice that builds belonging and shared momentum. |

   
Governance note: the programme handbook, cohort rules and direct admin announcements remain authoritative. If an internal Qubators principle differs from this PRD, the approved internal principle takes precedence and the assistant’s guidance must be updated accordingly.

# **3\. Problem statement**

In an active training group, important questions compete with announcements, conversations, voice notes and repeated requests. Admins spend time answering the same questions, while participants may miss a deadline, misunderstand a requirement, wait too long for help, or feel embarrassed to ask again. This weakens the structured path that helps people finish and build.

## **Primary problems to solve**

·       Repeated administrative questions consume facilitator and admin attention.

·       Participants cannot always find the latest official answer inside a busy group.

·       Long announcements may not make the required action and deadline obvious.

·       Questions can disappear before an admin notices them.

·       Participants who are blocked do not always know whether to ask a peer, facilitator or admin.

·       General support can become inconsistent when different people answer from memory.

# **4\. Vision, goals and non-goals**

## **Vision**

Make the Qubators AI Foundry support experience feel clear, responsive, motivating and human—at the scale of a lively WhatsApp community.

| Goals | Non-goals |
| :---- | :---- |
| Give accurate answers to routine programme questions. | Replace administrators, mentors, facilitators or peer learning. |
| Show each participant a clear next action. | Make final decisions on exceptions, discipline, selection or certification. |
| Reduce preventable confusion and missed deliverables. | Provide payment, billing, subscription or fee-related functions. |
| Surface unanswered and recurring questions to admins. | Answer from unapproved rumours, participant guesses or outdated messages. |
| Make support engaging without creating noise. | Interrupt every group conversation or compete for attention. |
| Strengthen building, collaboration and accountability. | Reward message volume, unhealthy competition or performative activity. |

 

 

# **5\. Target users and needs**

| User | Core need | What success feels like |
| :---- | :---- | :---- |
| New participant | Orientation, rules, schedule, learning path and where to begin. | “I understand the programme and my first action.” |
| Active builder | Deadlines, deliverables, feedback routes, resources and blocker support. | “I can keep moving without searching through hundreds of messages.” |
| Quiet or hesitant participant | A safe way to ask basic or personal questions. | “I can get help without feeling embarrassed.” |
| Peer contributor | Ways to help responsibly and share useful insight. | “My contribution helps the community without replacing the facilitator.” |
| Admin/community manager | Fewer repeated questions and visibility into unresolved needs. | “I spend more time on decisions and people, less on repetition.” |
| Facilitator/mentor | Clear separation between routine support and learning judgement. | “Participants arrive at reviews prepared and with better questions.” |

 

# **6\. Experience principles**

| Principle | Product behaviour |
| :---- | :---- |
| Official before fast | A slower honest answer is better than a fast invented one. |
| Action before information overload | Lead with the answer, action, deadline and source; add detail only when requested. |
| Build, do not merely browse | When appropriate, end with a practical next step connected to a deliverable. |
| Human judgement remains human | Escalate exceptions, conflict, welfare, discipline and sensitive decisions. |
| Private when personal | Move individual records, personal circumstances and sensitive concerns away from the group. |
| Community without noise | Respond when invited, keep messages concise and avoid unnecessary interruptions. |
| Encouragement without false praise | Recognise real progress and effort without exaggeration or empty celebration. |
| Accessible by default | Use plain English, short sections and clear choices; explain unfamiliar terms. |

 

# **7\. Core participant journeys**

| Journey | Desired flow | Successful end state |
| :---- | :---- | :---- |
| Ask a routine question | Participant addresses QAF → receives concise official answer → sees relevant action or deadline. | Question resolved without admin effort. |
| Find the next step | Participant asks “What next?” → QAF identifies the current stage → states task, due time, material and help route. | Participant starts or completes the correct activity. |
| Clarify an announcement | Participant asks for summary → QAF returns “What changed / Who acts / What to do / By when.” | Participant understands the announcement. |
| Get unstuck | QAF clarifies the blocker → offers an approved hint or resource → recommends peer/facilitator/admin path. | Participant resumes work or reaches the right human. |
| Raise a personal issue | QAF recognises sensitivity → avoids a public answer → guides participant to a private admin route. | Issue is protected and acknowledged. |
| Ask an uncertain question | QAF states uncertainty → records/refers the question → admin response becomes the official answer. | No fabricated information; future answers improve. |
| Catch up after absence | QAF gives a compact recap of lessons, deliverables, decisions and immediate priorities. | Participant re-enters the programme without reading the full chat history. |
| Share a screenshot or image | Participant calls QAF and attaches a screenshot → QAF reads the image, states what it shows and the issue → gives the correct next action or the private human route. | Participant understands the error, screen or build output and knows what to do next. |

 

 

# **8\. Product scope and priorities**

Priority labels: P0 \= required for a trustworthy first release; P1 \= important after the core is stable; P2 \= differentiating enhancement.

| ID | Feature | Priority | Requirement and rationale |
| :---- | :---- | :---- | :---- |
| F01 | Official question answering | P0 | Answer programme questions only from current, admin-approved information. Include the relevant date or cohort context when it prevents ambiguity. |
| F02 | QAF-directed participation | P0 | Respond when a participant calls “QAF,” replies to it, or uses an approved help phrase. Do not answer ordinary group conversation. |
| F03 | Next-Step Guide | P0 | Give the participant’s immediate task, deliverable, deadline, supporting material and help route. This is the signature feature. |
| F04 | Announcement simplifier | P0 | Convert long official announcements into: meaning, action, audience, deadline and source. |
| F05 | Uncertainty and referral | P0 | State when an answer is not confirmed and refer it to the correct human owner without guessing. |
| F06 | Sensitive-question handoff | P0 | Recognise personal, welfare, conflict, disciplinary, certification and exception requests; guide the user to private human support. |
| F07 | Deadline and session reminders | P0 | Provide limited, purposeful reminders before key sessions and deliverables, with a clear action. |
| F08 | Catch-Up Brief | P1 | Summarise what a participant missed and identify the minimum actions needed to rejoin current work. |
| F09 | Weekly Builder Recap | P1 | Summarise completed learning, current build goal, upcoming events, deadlines and unresolved questions. |
| F10 | Blocker Coach | P1 | Ask a short clarifying question and direct the participant to the right approved resource, peer, facilitator or admin. |
| F11 | Resource finder | P1 | Retrieve the current lesson, guide, recording, template or submission instruction by participant-friendly wording. |
| F12 | Feedback preparation | P1 | Help participants structure a request for feedback: goal, attempt, evidence, blocker and exact question. |
| F13 | Pulse check | P1 | Run brief admin-approved check-ins about confidence, blockers and progress without shaming inactive participants. |
| F14 | Build streaks and milestones | P2 | Recognise meaningful outputs—first prototype, user test, improvement or submission—not chat volume. |
| F15 | Peer-help spotlight | P2 | Recognise accurate, respectful peer assistance after admin validation; avoid leaderboards based on popularity. |
| F16 | Mini challenges and quizzes | P2 | Offer short, optional learning checks tied to current lessons and building decisions. |
| F17 | Idea-to-action prompt | P2 | Help a participant turn a problem idea into one small, testable action aligned with Foundry guidance. |
| F18 | Participant feedback box | P1 | Collect suggestions, confusing instructions and support gaps; acknowledge receipt and route themes to admins. |
| F19 | Image and screenshot assistance | P1 | Read and explain participant-shared screenshots and images—such as error messages, submission screens, lesson pages and build outputs—so what the participant sees becomes a clear next action, applying the same accuracy, privacy, escalation and show-only-confirmed-information rules as text answers. |

 

## **Explicitly excluded**

·       Payments, fees, billing, subscriptions, purchases, refunds or proof-of-payment handling.

·       Automated disciplinary decisions, certification decisions or programme exceptions.

·       Unapproved career, funding, legal, medical or mental-health advice.

·       Automatic public ranking of participants by activity or message count.

·       Open-ended responses based on information outside the approved programme context when presented as official guidance.

# **9\. Detailed behavioural requirements**

## **9.1 Answer format**

For routine questions, QAF Support AI should use the shortest format that fully resolves the need:

| Order | Element | Example purpose |
| :---- | :---- | :---- |
| 1 | Direct answer | State the confirmed answer in the first sentence. |
| 2 | Required action | Tell the participant what to do, if anything. |
| 3 | Time or deadline | Use an exact date and time when available. |
| 4 | Source or destination | Point to the official message, lesson, form or person. |
| 5 | Optional help | Offer “Explain simply,” “Give me the steps,” or “I still need help.” |

 

## **9.2 Tone and personality**

·       Identity: a friendly senior participant who knows the programme, clearly identified as an AI assistant.

·       Voice: warm, confident, concise, practical and respectful.

·       Language: plain English first; explain necessary technical terms in simple words.

·       Fun: occasional light humour and one relevant emoji are welcome in celebrations, challenges and reminders.

·       Serious moments: no jokes, playful emojis or motivational clichés when handling complaints, welfare, conflict or failure.

·       Boundaries: never claim to have feelings, personal experience, admin authority or certainty it does not possess.

## **9.3 Response modes**

| Participant request | Expected style |
| :---- | :---- |
| “Quick answer” | One or two sentences with the answer and action. |
| “Explain simply” | Beginner-friendly explanation with one familiar example. |
| “Give me the steps” | Short numbered actions in the correct order. |
| “Show me an example” | One programme-relevant example, clearly labelled as an example. |
| “What should I do next?” | One immediate priority followed by deadline, material and help route. |
| “I am stuck” | One clarifying question, then the approved next support path. |

 

## **9.4 Group etiquette**

·       Do not respond to every message, greeting, reaction, joke or peer discussion.

·       Do not repeat an answer that was already given clearly unless asked directly or the information changed.

·       When several participants ask the same question, provide one clear group answer and point later questions to it.

·       Never expose a participant’s private question, status, personal record or support request in the group.

·       Correct misinformation gently and focus on the fact, not the person who shared it.

·       Treat participant-shared images under the same rules as text: respond only when QAF is invoked, do not scan every photo shared in the group, and never repeat personal or confidential details visible in an image.

## **9.5 Image and screenshot handling**

| Participant shares | QAF behaviour |
| :---- | :---- |
| Error screenshot or code | State what is visibly shown, give the likely cause according to current official material, and provide the next action; ask for the exact text if the image is unclear. |
| Submission or dashboard screen | Describe what the screen shows, confirm the required action and deadline from official information, and flag any sign that contradicts current instructions. |
| Lesson or announcement page | Turn what is visible into the participant's next step using approved material; never invent content that is not visible or confirmed. |
| Image containing personal or confidential data | Reveal nothing publicly; ask for minimal detail and move the matter to the private human route. |
| Unclear, partial or unreadable image | Ask for a clearer image or a short text description before answering. |
| Memes, casual photos or unrelated group images | Do not analyse or comment unless QAF was deliberately invoked. |

# **10\. Human handoff and escalation**

| Category | QAF response | Human owner |
| :---- | :---- | :---- |
| Routine and confirmed | Answer directly. | None required |
| Ambiguous or outdated information | Say the answer is not confirmed; refer for verification. | Programme admin |
| Learning judgement or project review | Help structure the question; refer for feedback. | Facilitator/mentor |
| Exception request | Acknowledge; do not approve or reject. | Authorised programme lead |
| Personal information or individual status | Move to a private route; reveal nothing publicly. | Designated admin |
| Complaint, conflict or harassment | Respond calmly, preserve privacy and escalate promptly. | Safeguarding/community lead |
| Welfare or urgent safety concern | Encourage immediate human contact and prioritise escalation. | Designated welfare/admin contact |
| Abusive or manipulative use | Set a respectful boundary; preserve the underlying legitimate question. | Community manager if repeated |

 

| Required uncertainty language  “I do not have a confirmed answer to that yet. I’ll direct it to the appropriate Qubators admin rather than guess.” |
| :---- |

 

 

# **11\. Admin experience requirements**

Admins need simple control over what the assistant treats as official, when it communicates, and which questions require attention. The product should support the following working practices without dictating a specific technical design.

| Admin capability | Required outcome |
| :---- | :---- |
| Approve official information | Admins can clearly designate current schedules, rules, deadlines, materials and answers. |
| Update or retire information | Superseded instructions stop appearing as current answers. |
| Review unresolved questions | Admins see questions the assistant could not safely answer, grouped by urgency and theme. |
| Publish a confirmed answer | A resolved question can become reusable official guidance for similar future questions. |
| Control reminders | Admins choose the event, audience, timing and wording before reminders are sent. |
| Pause the assistant | Admins can suspend responses during incidents, live facilitation or information changes. |
| Correct an answer | Admins can issue a correction that is clearly communicated to affected participants. |
| Review support patterns | Admins can identify repeated confusion, common blockers and materials that need improvement. |
| Set escalation owners | Each sensitive category has a named human role and current contact route. |

 

# **12\. Reminder and engagement policy**

## **Reminder rules**

·       Every reminder must answer: what, who, when and what action is required.

·       Use an early reminder and a final reminder for major deliverables; add more only when admins decide the risk justifies it.

·       Do not shame, tag or publicly list people who have not submitted.

·       Avoid non-urgent reminders during locally inappropriate hours.

·       When a deadline changes, clearly label the update and state the previous and new deadline.

## **Responsible fun**

| Use | Recommended expression | Avoid |
| :---- | :---- | :---- |
| Milestones | “Prototype unlocked” or “First user test completed.” | Generic praise disconnected from evidence. |
| Mini challenges | Optional, short and related to the week’s learning outcome. | Challenges that distract from required work. |
| Builder stories | Celebrate a lesson learned, iteration or helpful collaboration. | Only spotlighting polished winners. |
| Peer recognition | Recognise accurate and respectful assistance. | Popularity voting or message-count rankings. |
| Recovery | Welcome a returning participant with a practical catch-up plan. | Guilt, sarcasm or public embarrassment. |

 

# **13\. Safety, privacy and trust**

·       Data minimisation: ask only for information necessary to resolve the support need.

·       Public/private boundary: never request confidential details in the group.

·       Transparency: identify the assistant as AI and make human-support routes visible.

·       No invented authority: do not approve extensions, certify completion or promise outcomes.

·       Source discipline: distinguish official programme information from general educational guidance.

·       Correction duty: when a wrong answer is identified, correct it clearly and promptly rather than quietly changing future responses only.

·       Dignity: protect participants from shaming, ridicule, bias and unnecessary exposure.

·       Youth protection: if any participants are minors, admins must approve additional safeguarding rules before use.

·       Image privacy: images shared with QAF are used only to resolve the current support need, should be retained no longer than necessary, must not be reposted, and personal details visible in them must never be repeated in the group.

 

# **14\. Success measures**

Targets should be set after a short baseline period. The following measures define success without forcing premature numerical promises.

| Outcome | Measure | Desired direction |
| :---- | :---- | :---- |
| Reliable support | Percentage of routine questions resolved accurately without admin correction. | Increase while maintaining accuracy. |
| Reduced repetition | Number of repeated routine questions manually answered by admins. | Decrease. |
| Faster clarity | Time from participant question to a useful answer or acknowledged handoff. | Decrease. |
| Better progression | Participants who can correctly state their next deliverable and deadline. | Increase. |
| Build completion | Participants completing meaningful weekly outputs and final products. | Increase; interpret with programme context. |
| No lost questions | Unanswered or unresolved participant questions older than the agreed response window. | Approach zero. |
| Safe escalation | Sensitive questions correctly routed without public exposure. | High and stable. |
| Participant trust | Participants reporting that answers are clear, respectful and dependable. | Increase. |
| Admin value | Admin time redirected from repetition to mentoring, judgement and community care. | Increase. |

 

## **Guardrail measures**

·       Incorrect official answers and outdated deadlines.

·       Sensitive information exposed in the group.

·       Unnecessary assistant messages or participant complaints about noise.

·       Escalations sent to the wrong person or left without ownership.

·       Participants treating QAF Support AI as the final authority over admins or facilitators.

# **15\. Release plan**

| Stage | Scope | Decision to progress |
| :---- | :---- | :---- |
| Stage 0: Readiness | Confirm programme principles, FAQ set, current schedule, escalation owners, tone and participant notice. | Admins approve the official information and handoff rules. |
| Stage 1: Controlled pilot | Routine Q\&A, direct invocation, next-step guidance, announcement summaries and human handoff with a small participant group. | Answers are accurate; no major privacy or noise problem; participants understand how to use QAF. |
| Stage 2: Cohort support | Add reminders, resource finder, catch-up brief, weekly recap and blocker routing. | Admins report reduced repetition and participants report clearer next steps. |
| Stage 3: Community engagement | Add optional quizzes, milestones, peer-help recognition, feedback preparation and idea-to-action prompts. | Engagement improves without distracting from deliverables or creating unhealthy competition. |
| Stage 4: Improvement cycle | Use support patterns to improve instructions, curriculum communication and community operations. | Recurring confusion declines and official guidance remains current. |

 

# **16\. Pilot acceptance criteria**

·       Participants can clearly identify QAF Support AI as an AI assistant, not a human admin.

·       It answers the approved high-frequency questions consistently and cites the relevant programme context.

·       It gives a correct current response to “What should I do next?” for each pilot stage.

·       It does not respond to ordinary group conversation unless deliberately invoked.

·       It refuses to guess when official information is missing or conflicting.

·       It moves personal and sensitive issues to the approved private human route.

·       Admins can correct, update or suspend its guidance promptly.

·       The pilot produces a usable record of unresolved questions and repeated confusion.

·       Participants can give feedback on clarity, usefulness, tone and trust.

 

# **17\. Risks and mitigations**

| Risk | Likely effect | Product mitigation |
| :---- | :---- | :---- |
| Outdated or conflicting instructions | Missed deadlines and loss of trust. | Use admin-approved current information; show dates; refer conflicts for confirmation. |
| The assistant becomes noisy | Participants mute the group or ignore important notices. | Respond only when invoked; limit reminders; measure complaints and message usefulness. |
| Overdependence on QAF | Less peer discussion and weaker critical thinking. | Encourage attempts, reflection and peer collaboration; keep facilitator feedback human. |
| False sense of authority | Participants treat suggestions as final decisions. | Clearly label AI identity and preserve human ownership for decisions. |
| Public exposure of private issues | Harm, embarrassment and reduced trust. | Move sensitive matters to private support and ask for minimal information. |
| Gamification discourages beginners | Competition replaces learning and belonging. | Celebrate progress and contribution; avoid public ranking by speed or volume. |
| Admins do not maintain official guidance | Answer quality deteriorates over time. | Assign content ownership and conduct scheduled information reviews. |
| Too much scope in the first release | Slow launch and weak reliability. | Release P0 only, validate, then add P1 and P2 based on real participant needs. |

 

# **18\. Recommended product decisions**

| Decision | Recommendation |
| :---- | :---- |
| Primary personality | Friendly senior participant: warm, practical, respectful and clearly AI. |
| Activation | Participant deliberately addresses QAF; no constant monitoring-style interruptions. |
| Default answer length | Brief answer first, with optional expansion. |
| Signature feature | Next-Step Guide linked to the current weekly path and deliverable. |
| Primary engagement mechanism | Meaningful build milestones, not message-volume points. |
| Private support | Required for personal, sensitive and individual-status questions. |
| Uncertainty behaviour | Admit uncertainty, route to a human and never guess. |
| Initial release | P0 features only, tested with a controlled participant group. |
| Commercial/payment features | Excluded because the programme is free. |

 

# **19\. Decisions Qubators must confirm before pilot**

1\.       The exact participant code of conduct and internal principles that must govern every response.

2\.       The authoritative owners of schedules, curriculum guidance, certification, complaints and welfare concerns.

3\.       The official response window for referred questions on working days and weekends.

4\.       Whether private one-to-one questions are supported and which admin receives them.

5\.       The participant age range and whether additional safeguarding rules are required.

6\.       The approved use of faith-based language in ordinary support, celebrations and sensitive situations.

7\.       The cohort calendar, weekly deliverables and final product expectations for the pilot.

8\.       The process for correcting a wrong answer already delivered to participants.

# **20\. Sample participant experiences**

| Routine deadline  Participant: “QAF, when is this week’s submission due?” QAF: “This week’s deliverable is due Friday, 25 September, at 6:00 p.m. Submit it through the official cohort submission link. Your next action is to confirm that your link opens before the deadline.” |
| :---- |

 

| Next step  Participant: “QAF, what should I do next?” QAF: “Your next priority is to complete this week’s prototype milestone. Start with the required lesson, apply it to one feature, then prepare your submission. If you are blocked, tell me whether the problem is the lesson, your idea or your build.” |
| :---- |

 

| Unconfirmed answer  Participant: “Has tomorrow’s session been moved?” QAF: “I do not have a confirmed schedule change. I’ll direct this to the programme admin rather than guess. Until an official update is shared, please follow the current announced time.” |
| :---- |

 

| Sensitive issue  Participant: “I have a personal reason I cannot meet the deadline.” QAF: “Thank you for letting me know. You do not need to explain personal details in the group. Please contact the designated programme admin privately; only an authorised human can decide an exception.” |
| :---- |

 

| Catch-up  Participant: “I was away for three days. What did I miss?” QAF: “Here is the shortest catch-up path: 1\) review the current lesson, 2\) read the latest project instruction, 3\) complete the active deliverable, and 4\) check the next live-session time. I can explain any one of these steps.” |
| :---- |

| Screenshot support  Participant: “QAF, why isn’t my submission working? [screenshot of form still showing Draft]” QAF: “Your screenshot shows the submission form is still in Draft. Complete and confirm the submission before Friday, 25 September, at 6:00 p.m. using the official cohort link. If it still shows Draft after you confirm, contact the designated programme admin.” |
| :---- |

 

# **21\. Source basis**

This PRD uses public Qubators descriptions available on 19 September 2026\. The public materials establish the programme’s free and intensive nature, “Learn. Build. Earn.” philosophy, practical product-building focus, structured learning pathway, mentorship, collaboration, live reviews, deliverables and community orientation. Internal participant rules supplied by Qubators should be incorporated before the pilot.

·       Qubators AI Foundry official page: https://www.qubators.org/aifoundry

·       Qubators AI Foundry learning portal: https://learn.qubators.org/

·       Qubators/Techpoint Africa brand press description (21 April 2026): https://techpoint.africa/brandpress/qubators-launches-free-ai-foundry-to-help-talents-build-apps-using-artificial-intelligence/

·       Public programme reflection describing weekly paths, deliverables, peer support and products: https://www.linkedin.com/posts/philhewinson\_this-week-i-announced-multiply-academy-the-activity-7501247715842973697-Z4ud

 

**QAF Support AI should make the next right action easier—while keeping people, judgement and community at the centre.**

