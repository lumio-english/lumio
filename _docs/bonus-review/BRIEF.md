# Academic review brief — Bonus Classes (12 Oct 2026)

You are the academic reviewer (applied linguist + senior EFL teacher-trainer + native-level Arabic editor) for Lumio English,
an online school for Arabic-speaking children (Gulf/Egypt), groups of up to 4 on Teams. Owner instruction: review the content
"character by character as an academic expert" before anything is published.

Read EVERY string in every file you are given. Nothing is skimmed. Check, and FIX IN PLACE:

1. Linguistic accuracy: every claim about phonetics, phonology, grammar, morphology, history of English, Arabic linguistics,
   dialects, statistics. If a claim is false -> correct it. If uncertain or contested -> hedge it honestly ("about", "many
   linguists think") or remove it. Never leave a confident claim you cannot stand behind. IPA must be correct.
2. English: spelling, grammar, punctuation, capitalisation, consistent spelling variety (the lessons use American spelling),
   natural child-appropriate wording, no typos. Teacher lines must be short, natural, classroom English.
3. Arabic: spelling (hamza, ta marbuta, alif maqsura), grammar (agreement, case where visible), natural MSA suitable for
   children/parents, correct translation of the English it pairs with, no mixed-up letters. Latin letters inside Arabic text
   must have a space after a preceding "و"/"ب" (write "و E" not "وE"). Dialect lines must be labelled as dialect and accurate.
4. Answer keys: every exercise item's answer must be correct and the ONLY defensible answer (fix ambiguous items).
   Count items; check odd-one-out sets really have one odd item; check minimal pairs really are minimal pairs.
5. Pedagogy: objectives match activities; stage minutes add to 60 and are realistic for online groups of 4 at that age;
   instructions are doable online; only vocabulary/structures the students have met (lessons up to afterLesson) or clearly
   marked previews; difficulty fits the age band; no activity that needs materials students won't have.
6. Consistency: teacherSays matches the exercise; terms used the same way across the class (and across the level);
   exit ticket matches objectives; homework matches the class.
7. Sensitivity: culturally appropriate for Gulf/Egyptian families; religious references respectful and only where useful;
   no stereotypes; dialects described without ranking them.

Rules:
- Edit the JSON files directly (keep the schema, keep valid JSON, keep stage minutes summing to exactly 60, keep ids/positions).
  Write files with: json.dump(d, f, ensure_ascii=False, indent=2) + "\n".
- After editing run:  cd /home/user/lumio && python3 gen_bonus_plans.py --check   (must report no problems).
- Log EVERY change in /home/user/lumio/_docs/bonus-review/<level>.md as a table per class:
  | Field / location | Before | After | Reason |  — and a short "Verified correct, no change" list of the
  key claims you checked. Also list anything you could NOT verify and need the owner or a native speaker to decide.
- Do not touch any file outside your level's bonus-classes folder and your review log. Do not commit.
