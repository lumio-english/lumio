/* Lumio English — student dashboard in Arabic or English (Oct 2026).
   The dashboard opens in Arabic; the student (or a parent) can switch to English with the button in the top bar.
   The choice is the same "lumio_lang" setting the home page and the login page use (default Arabic).
   How: the page is written in English, and in Arabic mode this file translates the interface text in place --
   whole text nodes (exact phrases), a few patterns with numbers/names, and placeholder/title/aria-label
   attributes -- including everything the dashboard renders later (a MutationObserver watches the page).
   Learning content stays English on purpose: lesson titles, words, sentences and story names are not in the
   dictionary, so they are left as they are. */
(function () {
  "use strict";
  var lang = "ar";
  try { lang = localStorage.getItem("lumio_lang") === "en" ? "en" : "ar"; } catch (e) {}
  var root = document.documentElement;
  window.LUMIO_LANG = lang;

  function addToggle() {
    var bar = document.querySelector(".sd-topbar");
    if (!bar || document.getElementById("sdLangBtn")) return;
    var b = document.createElement("button");
    b.type = "button"; b.id = "sdLangBtn"; b.className = "sd-lang-btn";
    b.textContent = lang === "ar" ? "English" : "العربية";
    b.setAttribute("lang", lang === "ar" ? "en" : "ar");
    b.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    b.setAttribute("data-noi18n", "");
    b.onclick = function () { try { localStorage.setItem("lumio_lang", lang === "ar" ? "en" : "ar"); } catch (e) {} location.reload(); };
    // next to the phone "Menu" button (the other top-bar buttons fold behind it on phones), else before the streak
    var anchor = bar.querySelector(".s26-menubtn") || bar.querySelector("#streakChip") || bar.querySelector(".sd-logout");
    bar.insertBefore(b, anchor || null);
    var st = document.createElement("style");
    st.textContent = ".sd-lang-btn{display:inline-flex;align-items:center;border:1px solid #F3DCCB;background:#FFF6EF;border-radius:999px;padding:8px 13px;font:800 14px 'Nunito','Tajawal',sans-serif;color:#C2410C;cursor:pointer;white-space:nowrap;flex:none}" +
      ".sd-lang-btn[lang=ar]{font-family:'Tajawal','Nunito',sans-serif}" +
      "body.theme-teen .sd-lang-btn,body.theme-teen-light .sd-lang-btn{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18);color:#FFB27A}";
    document.head.appendChild(st);
  }
  if (lang !== "ar") {
    root.classList.remove("i18n-wait");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addToggle); else addToggle();
    return;
  }
  root.lang = "ar"; root.dir = "rtl"; root.classList.add("lang-ar");

  /* ---------- level names (also inside longer sentences) ---------- */
  var LEVELS = [
    ["Pre-A · First Words", "ما قبل المستوى الأول · كلماتي الأولى"],
    ["Level 1 · About Me", "المستوى 1 · عن نفسي"],
    ["Level 2 · My World", "المستوى 2 · عالمي"],
    ["Level 3 · Everyday Life", "المستوى 3 · الحياة اليومية"],
    ["Level 3 · Real Life", "المستوى 3 · الحياة الواقعية"],
    ["Level 4 · Smart Choices", "المستوى 4 · اختيارات ذكية"],
    ["Level 5 · Telling My Story", "المستوى 5 · أحكي قصتي"],
    ["Level 6 · Looking Ahead", "المستوى 6 · نحو المستقبل"],
    ["Level 7 · Wide World", "المستوى 7 · العالم الواسع"],
    ["Level 8 · Think & Talk", "المستوى 8 · فكّر وتحدّث"],
    ["Level 9 · Express Yourself", "المستوى 9 · عبّر عن نفسك"],
    ["Level 10 · Ready for the World", "المستوى 10 · جاهز للعالم"]
  ];
  var iso = function (x) { return "\u2068" + x + "\u2069"; };   // first-strong isolate: "This is..." stays "This is..."
  function lv(s) { LEVELS.forEach(function (p) { s = s.split(p[0]).join(p[1]); }); return s.replace(/\bLevel (\d+)\b/g, "المستوى $1").replace(/\bPre-A\b/g, "ما قبل المستوى الأول"); }

  /* ---------- exact phrases ---------- */
  var D = {
    // top bar, menus, chapters
    "Menu": "القائمة", "Log out": "تسجيل الخروج", "My Profile": "ملفي", "My profile": "ملفي", "Messages": "الرسائل",
    "Guides · الأدلة": "الأدلة", "Referrals": "الإحالات", "My Referrals": "إحالاتي", "day streak": "أيام متتالية",
    "Chapters": "الفصول", "Chapter one": "الفصل الأول", "Chapter two": "الفصل الثاني", "Chapter three": "الفصل الثالث",
    "Chapter four": "الفصل الرابع", "Chapter five": "الفصل الخامس", "Chapter six": "الفصل السادس", "Chapter seven": "الفصل السابع", "Chapter eight": "الفصل الثامن",
    "Today's mission": "مهمة اليوم", "My adventure": "مغامرتي", "My progress": "تقدّمي", "Unlocked for you": "فُتح لك",
    "Story & game": "القصة واللعبة", "My classes": "حصصي", "English Hub": "مركز الإنجليزية", "Hub": "المركز", "Rewards": "المكافآت", "More": "المزيد",
    "What to do next, and your homework for this lesson.": "ماذا تفعل الآن، وواجب هذا الدرس.",
    "Every finished lesson lights the next step of your map.": "كل درس تُنهيه يضيء الخطوة التالية في خريطتك.",
    "Classes attended, your scores and every lesson you can go back to.": "الحصص التي حضرتها، ودرجاتك، وكل درس يمكنك الرجوع إليه.",
    "Your story and your level game open as you finish lessons.": "قصتك ولعبة مستواك تُفتحان كلما أنهيت دروسًا.",
    "Your next live class, booking, and rating your teacher.": "حصتك المباشرة القادمة، والحجز، وتقييم معلمك.",
    "Words, idioms, songs and more, open any time.": "كلمات وتعابير وأغانٍ والمزيد، مفتوحة في أي وقت.",
    "Points, badges and your study buddies.": "النقاط والأوسمة وأصدقاء الدراسة.",
    "Your level manual, your account and help.": "دليل مستواك، وحسابك، والمساعدة.",
    "To be continued": "يتبع", "To be continued…": "يتبع…", "Come back tomorrow for the next page of your story.": "عُد غدًا لتقرأ الصفحة التالية من قصتك.",
    // hero
    "Your story,": "قصتك،", "the last page": "الصفحة الأخيرة", "My schedule": "جدولي", "📅 My schedule": "📅 جدولي", "Subscribed": "مشترك",
    "Open today's chapter": "افتح فصل اليوم", "Streak": "أيام متتالية", "Stars earned": "النجوم", "Reward points": "نقاط المكافأة", "Sessions": "الحصص",
    "Not currently subscribed": "غير مشترك حاليًا", "Subscription activated": "تم تفعيل الاشتراك",
    // mission
    "Lesson": "الدرس", "Prepare": "التحضير", "Live class": "الحصة المباشرة", "Homework": "الواجب", "Continue": "متابعة",
    "Now · In the app": "الآن · في التطبيق", "In the app": "في التطبيق", "On Teams": "على Teams", "After class": "بعد الحصة",
    "Homework for this lesson": "واجب هذا الدرس", "Interactive Homework": "الواجب التفاعلي", "Homework Sheet": "ورقة الواجب", "Homework sheet": "ورقة الواجب",
    "PDF to print": "ملف PDF للطباعة", "Flashcards": "البطاقات التعليمية", "Ready to start your very first lesson?": "مستعد لتبدأ أول درس لك؟",
    "Start prep": "ابدأ التحضير", "Writing": "الكتابة", "Prep": "التحضير", "Class": "الحصة", "To do": "مطلوب", "Not booked": "غير محجوزة",
    "Done": "تم", "Now": "الآن", "Locked": "مقفل", "Unlocked": "مفتوح", "Open": "افتح", "Play": "العب", "Next": "التالي", "Yes": "نعم", "Not now": "ليس الآن",
    "All lessons done! 🎉": "انتهيت من كل الدروس! 🎉", "Level complete! 🎉": "أكملت المستوى! 🎉",
    "Finish this lesson's homework to unlock the next one.": "أنهِ واجب هذا الدرس لتفتح الدرس التالي.",
    "Prep and class done! Finish your homework to unlock the next lesson.": "انتهى التحضير والحصة! أنهِ واجبك لتفتح الدرس التالي.",
    "Prep done! This unlocks your homework once your teacher marks your class attended.": "انتهى التحضير! يُفتح واجبك عندما يسجّل معلمك حضورك للحصة.",
    "Your live class with your teacher unlocks the next lesson — check My Schedule below.": "حصتك المباشرة مع معلمك تفتح الدرس التالي — انظر جدولي في الأسفل.",
    "Keep your streak going — one more lesson today!": "حافظ على أيامك المتتالية — درس واحد آخر اليوم!",
    "One last step: take the level test to earn your certificate.": "خطوة أخيرة: أدِّ اختبار المستوى لتحصل على شهادتك.",
    "📝 Do homework": "📝 حلّ الواجب", "📝 Take the level test": "📝 أدِّ اختبار المستوى", "🔁 Retake the level test": "🔁 أعد اختبار المستوى", "🏆 See certificate": "🏆 اعرض الشهادة",
    // adventure / map / test
    "Show as a list": "اعرض كقائمة", "Finish each lesson to unlock the next one!": "أنهِ كل درس لتفتح الدرس التالي!", "My certificate": "شهادتي",
    "Level test": "اختبار المستوى", "questions": "سؤالًا", "to pass": "للنجاح", "skills: words, Arabic→English, sentences, listening": "المهارات: الكلمات، والترجمة من العربية إلى الإنجليزية، والجمل، والاستماع",
    "Opens the moment all 20 lessons are done — then your certificate.": "يُفتح فور إنهاء الدروس العشرين — ثم تحصل على شهادتك.",
    "Opens when you reach this lesson": "يُفتح عندما تصل إلى هذا الدرس",
    // progress
    "Lessons finished": "الدروس المكتملة", "Classes attended": "الحصص التي حضرتها", "Attendance": "الحضور", "Prep score": "درجة التحضير",
    "Homework score": "درجة الواجب", "Teacher grade": "تقييم المعلم", "Prep + class + homework": "تحضير + حصة + واجب",
    "None marked yet": "لم يُسجَّل بعد", "After your first class": "بعد حصتك الأولى", "Not started yet": "لم يبدأ بعد", "None done yet": "لم يُنجَز بعد",
    "Given after each class": "يُعطى بعد كل حصة", "My lessons": "دروسي", "All": "الكل", "Lessons done": "الدروس المنجزة",
    "Go back to any lesson: replay the prep, redo the homework or open its flashcards and sheets.": "ارجع إلى أي درس: أعد التحضير، أو أعد الواجب، أو افتح بطاقاته وأوراقه.",
    "Open My Profile to see every grade": "افتح ملفي لترى كل الدرجات", "Average of": "متوسط", "Review your tricky words": "راجع كلماتك الصعبة",
    // story & game
    "Lumi's Magic Map": "خريطة لومي السحرية", "A four-part adventure story!": "قصة مغامرة من أربعة أجزاء!",
    "Play the parts up to your current lesson. A new part opens with every lesson you reach!": "اقرأ الأجزاء حتى درسك الحالي. يُفتح جزء جديد مع كل درس تصل إليه!",
    "Read again": "اقرأ مرة أخرى", "The last one!": "الجزء الأخير!", "You finished the whole story! 🎉": "أنهيت القصة كلها! 🎉", "You finished": "أنهيت",
    "Answer correctly to build the Treehouse Club, piece by piece!": "أجب بشكل صحيح لتبني نادي بيت الشجرة قطعة قطعة!",
    "Shop the list, watch your budget, print the receipt!": "تسوّق من القائمة، وراقب ميزانيتك، واطبع الإيصال!",
    "Find the evidence and crack the case!": "ابحث عن الأدلة وحُلّ القضية!", "Read the crystal ball and judge each prediction!": "اقرأ الكرة البلورية واحكم على كل توقّع!",
    "Reply to the crew's group chat — tap or type it back!": "ردّ على محادثة الفريق — اضغط أو اكتب الرد!",
    "Flip through the year with the Twelve Months Club!": "تنقّل بين شهور السنة مع نادي الاثني عشر شهرًا!",
    "Listen and tap the right picture with Lumi!": "استمع واضغط على الصورة الصحيحة مع لومي!", "Available in Pre-A so far": "متاح في ما قبل المستوى الأول حاليًا",
    // classes / booking
    "No classes booked yet — book one below!": "لا توجد حصص محجوزة بعد — احجز واحدة في الأسفل!", "Book my next class": "احجز حصتي القادمة", "Book a class": "احجز حصة",
    "One class": "حصة واحدة", "Fixed weekly": "موعد أسبوعي ثابت",
    "Pick a day, then a time (Saudi time), then your teacher. Up to 4 students share a class at the same lesson · max 3 a week · cancel up to 30 min before.":
      "اختر يومًا، ثم وقتًا (بتوقيت السعودية)، ثم معلمك. حتى 4 طلاب في الحصة على الدرس نفسه · 3 حصص أسبوعيًا كحد أقصى · الإلغاء حتى 30 دقيقة قبل الحصة.",
    "Times in Saudi time · no open times this day": "الأوقات بتوقيت السعودية · لا توجد أوقات متاحة في هذا اليوم",
    "Big times are Saudi time;": "الأوقات الكبيرة بتوقيت السعودية؛", "your own time": "وتوقيتك", "is under each one.": "تحت كل واحد منها.",
    "no class": "لا حصة", "off": "عطلة", "Book this class?": "تحجز هذه الحصة؟", "Yes, book it ✓": "نعم، احجزها ✓",
    "Cancel this class?": "تلغي هذه الحصة؟", "Class cancelled.": "تم إلغاء الحصة.", "That day has passed.": "هذا اليوم قد مضى.",
    "No classes that day — try another.": "لا حصص في هذا اليوم — جرّب يومًا آخر.", "No open times that day — try another.": "لا أوقات متاحة في هذا اليوم — جرّب يومًا آخر.",
    "Lessons run Sunday to Thursday.": "الدروس من الأحد إلى الخميس.", "Nothing to book yet": "لا شيء للحجز بعد", "Your class": "حصتك",
    "Remove your fixed schedule?": "تحذف موعدك الثابت؟", "Fixed schedule removed.": "تم حذف الموعد الثابت.",
    "Classes already booked stay as they are — you can cancel any of them one by one. We just stop booking new weeks automatically.":
      "الحصص المحجوزة تبقى كما هي — يمكنك إلغاء أي منها واحدة واحدة. فقط نتوقف عن حجز أسابيع جديدة تلقائيًا.",
    "Everything in the next three weeks is already booked. Your weekly times are saved.": "كل شيء في الأسابيع الثلاثة القادمة محجوز بالفعل. تم حفظ أوقاتك الأسبوعية.",
    "Lesson 1 progress": "تقدّم الدرس 1", "Preparation": "التحضير", "New teacher · no ratings yet": "معلم جديد · لا تقييمات بعد",
    "⏸️ Your subscription is paused — your teacher will activate it after the next payment, then you can book here.": "⏸️ اشتراكك متوقف مؤقتًا — سيفعّله معلمك بعد الدفعة القادمة، ثم يمكنك الحجز هنا.",
    "🎟️ No sessions left on your package — ask your teacher to add more, then book here.": "🎟️ لا توجد حصص متبقية في باقتك — اطلب من معلمك إضافة المزيد، ثم احجز هنا.",
    "🎉 Every lesson of this level is attended or booked. Your teacher will open the next level after the level test.": "🎉 كل دروس هذا المستوى حُضرت أو حُجزت. سيفتح معلمك المستوى التالي بعد اختبار المستوى.",
    "Sun": "الأحد", "Mon": "الإثنين", "Tue": "الثلاثاء", "Wed": "الأربعاء", "Thu": "الخميس", "Fri": "الجمعة", "Sat": "السبت",
    // hub
    "Vocabulary": "المفردات", "Grammar": "القواعد", "Idioms": "التعابير", "Phonics": "الأصوات", "Spelling": "التهجئة", "Songs": "الأغاني",
    "Word games": "ألعاب الكلمات", "Writing & speaking": "الكتابة والتحدث", "Writing & Speaking": "الكتابة والتحدث", "Writing Practice": "تدريب الكتابة",
    "Letter sounds, blends, and sight words": "أصوات الحروف والمقاطع وكلمات الرؤية", "The 4 rules behind every word": "القواعد الأربع وراء كل كلمة",
    "Sing along with your level's songs": "غنِّ مع أغاني مستواك", "Memory Match, Word Pop and Word Builder with your lesson words": "لعبة الذاكرة وفقاعات الكلمات وبناء الكلمات بكلمات درسك",
    "Unlocks at Level 3": "يُفتح في المستوى 3", "Unlocks at Level 1": "يُفتح في المستوى 1", "This isn't ready for your level yet": "هذا غير جاهز لمستواك بعد",
    "Memory Match": "لعبة الذاكرة", "Word Pop": "فقاعات الكلمات", "Word Builder": "بناء الكلمات", "Balloon Pop": "فرقعة البالونات",
    "Flip the cards and find the pairs": "اقلب البطاقات وجد الأزواج", "Pop the bubble with the right word": "فرقع الفقاعة ذات الكلمة الصحيحة",
    "Put the letters in order": "رتّب الحروف", "Listen, then pop the balloon with that word": "استمع، ثم فرقع البالون الذي عليه الكلمة",
    "Play with the words from your latest lesson. Your best score is saved for your teacher to see.": "العب بكلمات آخر درس لك. تُحفظ أفضل نتيجة لك ليراها معلمك.",
    "Clear": "مسح", "Save": "حفظ", "Download": "تنزيل", "Type your answer here...": "اكتب إجابتك هنا...", "Nice popping! 🎈": "فرقعة رائعة! 🎈", "Out of hearts!": "انتهت القلوب!",
    // rewards
    "Points": "النقاط", "Bonus hours": "ساعات إضافية", "My badges": "أوسمتي", "Meet your study buddies": "تعرّف على أصدقاء الدراسة", "Tap a friend to say hi!": "اضغط على صديق لتلقي التحية!",
    "Every 50 points you collect can be redeemed for 1 bonus class hour, added straight to your sessions left!": "كل 50 نقطة تجمعها يمكن استبدالها بساعة حصة إضافية، تُضاف مباشرة إلى حصصك المتبقية!",
    "Redeem 50 points → +1 hour": "استبدل 50 نقطة ← ساعة إضافية", "First step": "الخطوة الأولى", "Finish 1 full lesson": "أنهِ درسًا كاملًا",
    "On a roll": "متحمّس", "3-day streak": "3 أيام متتالية", "Star collector": "جامع النجوم", "10 stars": "10 نجوم", "Super star": "نجم خارق", "30 stars": "30 نجمة",
    "Perfectionist": "المتقن", "3-star a lesson": "3 نجوم في درس", "Halfway there": "في منتصف الطريق", "10 lessons": "10 دروس",
    "Level up!": "ارتقِ مستوى!", "Dedicated": "مثابر", "10 full lessons": "10 دروس كاملة", "Experience": "الخبرة", "XP earned": "نقاط الخبرة المكتسبة",
    "Max XP in a lesson": "أعلى نقاط خبرة في درس", "Kid crew": "فريق الصغار", "Teen crew": "فريق اليافعين",
    "Redeemed here, but your teacher's device may not see it yet — it'll catch up next time you're online.": "تم الاستبدال هنا، وقد لا يراه جهاز معلمك بعد — سيتحدّث عند اتصالك التالي بالإنترنت.",
    "I'll help you learn!": "سأساعدك على التعلّم!", "I've got your back!": "أنا معك!", "Let's have fun!": "هيا نستمتع!", "Let's play and learn!": "هيا نلعب ونتعلّم!",
    "Let's read together!": "هيا نقرأ معًا!", "Ready when you are!": "جاهز متى ما كنت جاهزًا!", "Your learning buddy!": "رفيقك في التعلّم!", "Level up your English!": "طوّر لغتك الإنجليزية!",
    // more / account
    "My level manual": "دليل مستواي", "Every lesson in your level, explained for your family": "كل درس في مستواك، مشروحًا لعائلتك",
    "Account & help": "الحساب والمساعدة", "A short tour for families": "جولة قصيرة للعائلات", "How to join, book and do homework": "كيف تنضم وتحجز وتحل الواجب",
    "Teacher notes and reminders": "ملاحظات المعلم والتذكيرات", "Invite friends, earn free sessions": "ادعُ أصدقاءك واكسب حصصًا مجانية",
    "Details, grades, report": "التفاصيل والدرجات والتقرير", "Download my performance report": "تنزيل تقرير أدائي", "Need help?": "تحتاج مساعدة؟",
    "Parent guide · دليل ولي الأمر": "دليل ولي الأمر", "Your notifications": "إشعاراتك",
    "No messages yet. You'll see class reminders, new lessons, and notes from your teacher here.": "لا رسائل بعد. ستظهر هنا تذكيرات الحصص والدروس الجديدة وملاحظات معلمك.",
    "No referrals yet. Tell a friend about Lumio and ask your teacher to add them here — every friend who subscribes earns you free sessions!": "لا إحالات بعد. أخبر صديقًا عن Lumio واطلب من معلمك إضافته هنا — كل صديق يشترك يكسبك حصصًا مجانية!",
    "Attended a trial": "حضر حصة تجريبية", "Took the test": "أدّى الاختبار", "My avatar": "صورتي الرمزية", "Pick your avatar!": "اختر صورتك الرمزية!",
    "Pick a crew friend or a photo": "اختر صديقًا من الفريق أو صورة", "...or pick one of the Lumio crew": "...أو اختر واحدًا من فريق Lumio",
    "Upload my photo": "رفع صورتي", "✕ Remove photo": "✕ حذف الصورة", "You can change this anytime.": "يمكنك تغيير هذا في أي وقت.",
    "Avatar updated!": "تم تحديث الصورة الرمزية!", "Please choose an image file.": "من فضلك اختر ملف صورة.", "That doesn't look like a valid image.": "هذه لا تبدو صورة صالحة.",
    "Student": "طالب", "Level": "المستوى", "Lessons": "الدروس",
    "Are you sure? Once your teacher completes this, your account and progress are deleted permanently.": "هل أنت متأكد؟ بعد أن يكمل معلمك هذا، يُحذف حسابك وتقدّمك نهائيًا.",
    "Confirmed. Your teacher will complete the deletion.": "تم التأكيد. سيكمل معلمك الحذف.", "Okay — your account stays. Your teacher has been told.": "حسنًا — حسابك باقٍ. تم إبلاغ معلمك.",
    // welcome / onboarding / misc
    "Welcome to the Lumio English family!": "أهلًا بك في عائلة Lumio English!", "Welcome to the crew!": "أهلًا بك في الفريق!", "Welcome, friend!": "أهلًا يا صديقي!",
    "Let's get started!": "هيا نبدأ!", "التالي · Next": "التالي", "تخطي · Skip": "تخطي", "Due today · اليوم": "مطلوب اليوم",
    "Lumio English logo": "شعار Lumio English", "Close": "إغلاق", "Hi": "مرحبًا"
  };

  /* ---------- patterns (numbers, names) ---------- */
  var AMPM = function (s) { return s.replace(/\bAM\b/g, "ص").replace(/\bPM\b/g, "م"); };
  var PLURAL = function (n, one, two, few, many) { n = +n; return n === 1 ? one : n === 2 ? two : (n >= 3 && n <= 10) ? few : many; };
  var MONTHS = { Jan: "يناير", Feb: "فبراير", Mar: "مارس", Apr: "أبريل", May: "مايو", Jun: "يونيو", Jul: "يوليو", Aug: "أغسطس", Sep: "سبتمبر", Oct: "أكتوبر", Nov: "نوفمبر", Dec: "ديسمبر" };
  var DAYS = { Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" };
  var P = [
    [/^(\d{1,2}:\d{2}\s?(?:AM|PM))$/, function (m) { return AMPM(m[1]); }],
    [/^(\d+) left$/, function (m) { return "متبقٍ " + m[1]; }],
    [/^(\d+) sessions? left$/, function (m) { return m[1] + " " + PLURAL(m[1], "حصة متبقية", "حصتان متبقيتان", "حصص متبقية", "حصة متبقية"); }],
    [/^(\d+) days?$/, function (m) { return m[1] + " " + PLURAL(m[1], "يوم", "يومان", "أيام", "يومًا"); }],
    [/^([\d,]+) pts$/, function (m) { return m[1] + " نقطة"; }],
    [/^([\d,]+) XP$/, function (m) { return m[1] + " نقطة خبرة"; }],
    [/^Lesson (\d+)$/, function (m) { return "الدرس " + m[1]; }],
    [/^Lesson (\d+) · (.+)$/, function (m) { return "الدرس " + m[1] + " · " + iso(m[2]); }],
    [/^Lesson (\d+) steps$/, function (m) { return "خطوات الدرس " + m[1]; }],
    [/^Lesson (\d+) progress$/, function (m) { return "تقدّم الدرس " + m[1]; }],
    [/^(\d+)\/(\d+) lessons done \(prep \+ class \+ homework\)$/, function (m) { return m[1] + "/" + m[2] + " دروس منجزة (تحضير + حصة + واجب)"; }],
    [/^(\d+) of (\d+) lessons done$/, function (m) { return m[1] + " من " + m[2] + " دروس منجزة"; }],
    [/^· (\d+) of (\d+) lessons$/, function (m) { return "· " + m[1] + " من " + m[2] + " دروس"; }],
    [/^(\d+) more lessons? unlocks? as you go$/, function (m) { return m[1] + " درسًا آخر تُفتح كلما تقدّمت"; }],
    [/^(\d+) topics · Arabic \+ audio$/, function (m) { return m[1] + " مواضيع · بالعربية وبالصوت"; }],
    [/^(\d+) grammar topics, with Arabic$/, function (m) { return m[1] + " موضوعًا في القواعد، بالعربية"; }],
    [/^(\d+) idioms to explore$/, function (m) { return m[1] + " تعبيرًا لتكتشفه"; }],
    [/^(\d+) prompts to type or record$/, function (m) { return m[1] + " سؤالًا للكتابة أو التسجيل"; }],
    [/^(\d+) units · sounds, blends, sight words$/, function (m) { return m[1] + " وحدات · أصوات ومقاطع وكلمات رؤية"; }],
    [/^Finished \((\d+)\)$/, function (m) { return "المكتملة (" + m[1] + ")"; }],
    [/^Moves: (\d+)$/, function (m) { return "الحركات: " + m[1]; }],
    [/^Pairs: (\d+)\/(\d+)$/, function (m) { return "الأزواج: " + m[1] + "/" + m[2]; }],
    [/^Score: (\d+)$/, function (m) { return "النتيجة: " + m[1]; }],
    [/^Word (\d+)\/(\d+)$/, function (m) { return "الكلمة " + m[1] + "/" + m[2]; }],
    [/^Hi, (.+)!$/, function (m) { return "مرحبًا يا " + iso(m[1]) + "!"; }],
    [/^(.+)[’']s story,$/, function (m) { return "قصة " + iso(m[1]) + "،"; }],
    [/^chapter (\d+)$/, function (m) { return "الفصل " + m[1]; }],
    [/^Today's page · (\w+) (morning|afternoon|evening|night)$/, function (m) { return "صفحة اليوم · " + (DAYS[m[1]] || m[1]) + " " + { morning: "صباحًا", afternoon: "ظهرًا", evening: "مساءً", night: "ليلًا" }[m[2]]; }],
    [/^(\w{3}) (\d+) – (\w{3}) (\d+) · this week$/, function (m) { return m[2] + " " + (MONTHS[m[1]] || m[1]) + " – " + m[4] + " " + (MONTHS[m[3]] || m[3]) + " · هذا الأسبوع"; }],
    [/^This tour will walk you through (.+)'s real dashboard, section by section\.$/, function (m) { return "ستأخذك هذه الجولة في صفحة " + iso(m[1]) + " الحقيقية، قسمًا قسمًا."; }],
    [/^Let's start (.+) with Lesson (\d+): “(.+)”\. Follow the glowing path: every stop is a chapter of your English adventure\.$/, function (m) { return "لنبدأ " + lv(m[1]) + " بالدرس " + m[2] + ": «" + iso(m[3]) + "». اتبع المسار المضيء: كل محطة فصل من مغامرتك في الإنجليزية."; }],
    [/^(.+) Follow the glowing path: every stop is a chapter of your English adventure\.$/, function (m) { return tr(m[1]) + " اتبع المسار المضيء: كل محطة فصل من مغامرتك في الإنجليزية."; }],
    [/^Unlocks after Lesson (\d+) — (\d+)\/(\d+) so far!$/, function (m) { return "يُفتح بعد الدرس " + m[1] + " — " + m[2] + "/" + m[3] + " حتى الآن!"; }],
    [/^Locked — (\d+) lessons? to go$/, function (m) { return "مقفل — باقٍ " + m[1] + " " + PLURAL(m[1], "درس", "درسان", "دروس", "درسًا"); }],
    [/^Opens after your (live class|homework) for Lesson (\d+)$/, function (m) { return "يُفتح بعد " + (m[1] === "homework" ? "واجب" : "حصتك المباشرة في") + " الدرس " + m[2]; }],
    [/^Finish all (\d+) lessons first — (\d+) to go!$/, function (m) { return "أنهِ الدروس الـ" + m[1] + " أولًا — باقٍ " + m[2] + "!"; }],
    [/^Part (\d+) unlocked! Next part after Lesson (\d+)\.$/, function (m) { return "فُتح الجزء " + m[1] + "! الجزء التالي بعد الدرس " + m[2] + "."; }],
    [/^You read Part (\d+)! Next part after Lesson (\d+)\.$/, function (m) { return "قرأت الجزء " + m[1] + "! الجزء التالي بعد الدرس " + m[2] + "."; }],
    [/^You passed the level test with (\d+)% — your certificate is ready!$/, function (m) { return "نجحت في اختبار المستوى بنسبة " + m[1] + "% — شهادتك جاهزة!"; }],
    [/^Your best level-test score is (\d+)% — you need (\d+)% for the certificate\. Try again!$/, function (m) { return "أفضل نتيجة لك في اختبار المستوى " + m[1] + "% — تحتاج " + m[2] + "% للشهادة. حاول مرة أخرى!"; }],
    [/^Level test passed · (\d+)%$/, function (m) { return "اجتزت اختبار المستوى · " + m[1] + "%"; }],
    [/^Best so far (\d+)% — you need (\d+)% for the certificate\.$/, function (m) { return "أفضل نتيجة حتى الآن " + m[1] + "% — تحتاج " + m[2] + "% للشهادة."; }],
    [/^All (\d+) lessons done — this unlocks your certificate\.$/, function (m) { return "انتهت الدروس الـ" + m[1] + " — هذا يفتح شهادتك."; }],
    [/^Teacher grade · (\d+) class(es)?$/, function (m) { return "تقييم المعلم · " + m[1] + " " + PLURAL(m[1], "حصة", "حصتان", "حصص", "حصة"); }],
    [/^(.+) level test$/, function (m) { return "اختبار " + lv(m[1]); }],
    [/^Take the (.+) level test$/, function (m) { return "أدِّ اختبار " + lv(m[1]); }],
    [/^Retake the (.+) level test$/, function (m) { return "أعد اختبار " + lv(m[1]); }],
    [/^(.+) adventure map$/, function (m) { return "خريطة مغامرة " + lv(m[1]); }],
    [/^Finish (Level .+|Pre-A .+)$/, function (m) { return "أنهِ " + lv(m[1]); }],
    [/^(Level \d+ · [^·]+|Pre-A · [^·]+) · Lesson (\d+)$/, function (m) { return lv(m[1]) + " · الدرس " + m[2]; }],
    [/^(Level \d+ · [^·]+|Pre-A · [^·]+) · (.+)$/, function (m) { return lv(m[1]) + " · " + iso(m[2]); }],
    [/^(Level \d+ · .+|Pre-A · .+)$/, function (m) { var r = lv(m[1]); return r !== m[1] ? r : null; }],
    [/^🎉 You've earned (\d+) free sessions? from referrals so far\. Every friend who subscribes adds (\d+) more!$/, function (m) { return "🎉 كسبت " + m[1] + " حصص مجانية من الإحالات حتى الآن. كل صديق يشترك يضيف " + m[2] + " أخرى!"; }],
    [/^Every friend who subscribes earns you (\d+) free sessions — added straight to your sessions left\.$/, function (m) { return "كل صديق يشترك يكسبك " + m[1] + " حصص مجانية — تُضاف مباشرة إلى حصصك المتبقية."; }]
  ];

  // leading emoji / symbols and trailing punctuation are kept around the translated core
  var EDGE = /^([^A-Za-z0-9؀-ۿ]*)([\s\S]*?)([\s.!?…:]*)$/;
  var cache = {};
  function tr(s) {
    if (s in cache) return cache[s];
    var out = null;
    if (D[s] != null) out = D[s];
    else {
      for (var i = 0; i < P.length && out == null; i++) { var m = P[i][0].exec(s); if (m) out = P[i][1](m); }
      if (out == null) {
        var e = EDGE.exec(s);
        if (e && (e[1] || e[3])) {
          var core = e[2];
          if (D[core] != null) out = e[1] + D[core] + e[3];
          else if (D[core + e[3]] != null) out = e[1] + D[core + e[3]];
        }
      }
    }
    cache[s] = out;
    return out;
  }
  function skip(el) { return !el || el.closest("[data-noi18n],script,style,textarea,input,[contenteditable],.lp-word,.spg-ar,body [lang='ar']"); }
  function doText(n) {
    var raw = n.nodeValue; if (!raw || !/[A-Za-z]/.test(raw)) return;
    var core = raw.replace(/\s+/g, " ").trim();
    var t = tr(core);
    if (t != null && t !== core) { n.nodeValue = raw.replace(/^\s*/, function (w) { return w ? " " : ""; }).replace(/\S[\s\S]*\S|\S/, t); return; }
    // untranslated English (lesson titles, names) with punctuation: isolate it so "This is..." doesn't show as "...This is"
    if (t == null && !/[\u0600-\u06FF\u2066-\u2069]/.test(raw) && /[.…!?:;,()“”"']/.test(core)) n.nodeValue = "\u2066" + raw + "\u2069";
  }
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  function doAttrs(el) {
    ATTRS.forEach(function (a) {
      var v = el.getAttribute(a); if (!v || !/[A-Za-z]/.test(v)) return;
      var t = tr(v.replace(/\s+/g, " ").trim()); if (t != null) el.setAttribute(a, t);
    });
  }
  function walk(node) {
    if (node.nodeType === 3) { if (!skip(node.parentElement)) doText(node); return; }
    if (node.nodeType !== 1 || skip(node)) return;
    doAttrs(node);
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 1) { if (!skip(n)) doAttrs(n); }
      else if (!skip(n.parentElement)) doText(n);
    }
  }
  // the Arabic helper lines under each heading repeat what is now already in Arabic
  var css = document.createElement("style");
  css.textContent = "html.lang-ar .sj-ar,html.lang-ar .sj-pt>.sj-ar{display:none!important}" +
    "html.lang-ar body{font-family:'Tajawal','Nunito',sans-serif}" +
    // right-to-left: Lumi moves to the left side of the cover so the Arabic title (which starts on the right) is clear
    "html[dir=rtl] .sj-mascot{right:auto;left:-6px}html[dir=rtl] .sj-cover h1{padding-right:0;padding-left:70px}" +
    "@media (min-width:600px){html[dir=rtl] .sj-mascot{right:auto;left:14px}html[dir=rtl] .sj-kicker,html[dir=rtl] .sj-cover h1{padding-right:0;padding-left:180px}}" +
    "@media (min-width:900px){html[dir=rtl] .sj-cover h1{padding-left:0}}";
  (document.head || root).appendChild(css);
  // Native dialogs (confirm/alert) get the same translation
  ["confirm", "alert"].forEach(function (k) {
    var orig = window[k]; if (!orig) return;
    window[k] = function (msg) { var s = String(msg == null ? "" : msg), t = tr(s.trim()); return orig.call(window, t != null ? t : s); };
  });
  var busy = false;
  function start() {
    addToggle();
    walk(document.body);
    root.classList.remove("i18n-wait");
    new MutationObserver(function (list) {
      if (busy) return; busy = true;
      try {
        list.forEach(function (m) {
          if (m.type === "characterData") { if (!skip(m.target.parentElement)) doText(m.target); return; }
          if (m.type === "attributes") { if (!skip(m.target)) doAttrs(m.target); return; }
          m.addedNodes.forEach(walk);
        });
      } finally { busy = false; }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  setTimeout(function () { root.classList.remove("i18n-wait"); }, 2500);   // never keep the page hidden
  window.LumioI18n = { lang: lang, tr: tr };
})();
