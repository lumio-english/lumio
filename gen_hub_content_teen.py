# -*- coding: utf-8 -*-
"""Rebuilds vocab-hub/level3-4.json and writing-hub/level3-4.json to
match the rebuilt teen curriculum -- these were still showing the OLD
curriculum's themes (Jobs, Wild Animals, Opposites) completely
disconnected from what's actually taught now. Groups the new
curriculum's own vocabulary into hub themes (reusing the same
category groupings already used for Present deck visual theming, so
the whole platform tells one consistent story), and writes fresh
writing prompts.
"""
import json, glob

THEME_NAMES = {
    "social": ("Friends & Social Life", "الأصدقاء والحياة الاجتماعية"),
    "room":   ("My Room & Things", "غرفتي وأغراضي"),
    "school": ("School Life", "الحياة المدرسية"),
    "sport":  ("Sports & Competition", "الرياضة والمنافسة"),
    "game":   ("Games & Entertainment", "الألعاب والترفيه"),
    "money":  ("Money & Shopping", "المال والتسوق"),
    "default": ("Everyday Life", "الحياة اليومية"),
}

LEVEL3_THEME_BY_LESSON = {
    1: "social", 2: "social", 3: "social", 4: "room", 5: "room", 6: "social",
    7: "social", 8: "school", 9: "sport", 10: "game", 11: "sport", 12: "school",
    13: "school", 14: "social", 15: "school", 16: "game", 17: "default",
    18: "default", 19: "sport", 20: "default",
}
LEVEL4_THEME_BY_LESSON = {
    1: "social", 2: "room", 3: "social", 4: "school", 5: "social", 6: "room",
    7: "room", 8: "money", 9: "money", 10: "sport", 11: "room", 12: "default",
    13: "social", 14: "sport", 15: "default", 16: "school", 17: "default",
    18: "default", 19: "school", 20: "default",
}

LEVEL_NAMES = {"level3": "Level 3 · Real Life", "level4": "Level 4 · On My Own"}

def build_vocab_hub(level, theme_by_lesson):
    themes = {}
    seen_globally = set()
    for f in sorted(glob.glob(f"lessons/{level}/lesson*.json")):
        d = json.load(open(f, encoding="utf-8"))
        num = d["number"]
        theme_key = theme_by_lesson.get(num, "default")
        name, name_ar = THEME_NAMES[theme_key]
        if name not in themes:
            themes[name] = {"theme": name, "themeAr": name_ar, "words": []}
        for w in d["vocab"]:
            key = w["en"].lower()
            if key not in seen_globally:
                seen_globally.add(key)
                themes[name]["words"].append({"en": w["en"], "ar": w["ar"]})

    theme_order = ["Friends & Social Life", "My Room & Things", "School Life",
                   "Sports & Competition", "Games & Entertainment", "Money & Shopping", "Everyday Life"]
    out_themes = []
    for name in theme_order:
        if name in themes:
            out_themes.append({"theme": themes[name]["theme"], "themeAr": themes[name]["themeAr"], "words": themes[name]["words"]})

    out = {"level": level, "levelName": LEVEL_NAMES[level], "themes": out_themes}
    with open(f"vocab-hub/{level}.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    total_words = sum(len(t["words"]) for t in out_themes)
    print(f"vocab-hub/{level}.json: {len(out_themes)} themes, {total_words} words")


WRITING_PROMPTS = {
    "level3": [
        {"en": "Describe your room. What's in it, and what does it say about you?", "ar": "صف غرفتك. ماذا يوجد فيها، وماذا تقول عنك؟"},
        {"en": "Write about your crew — who are they, and what do you do together?", "ar": "اكتب عن شلتك — من هم، وماذا تفعلون معا؟"},
        {"en": "Describe a friend using at least 3 sentences.", "ar": "صف صديقا باستخدام ٣ جمل على الأقل."},
        {"en": "What's your favorite skill or sport, and why do you enjoy it?", "ar": "ما مهارتك أو رياضتك المفضلة، ولماذا تستمتع بها؟"},
        {"en": "Write directions from your classroom to the school library.", "ar": "اكتب الاتجاهات من صفك إلى مكتبة المدرسة."},
        {"en": "Compare yourself to a friend — who's faster, taller, or funnier?", "ar": "قارن نفسك بصديق — من الأسرع أو الأطول أو الأكثر مرحا؟"},
        {"en": "Write 3 classroom rules you think are important, and why.", "ar": "اكتب ٣ قواعد صفية تعتقد أنها مهمة، ولماذا."},
        {"en": "Describe what you and your friends are doing right now.", "ar": "صف ماذا تفعل أنت وأصدقاؤك الآن."},
        {"en": "Write about your favorite game night or movie night.", "ar": "اكتب عن ليلة ألعابك أو أفلامك المفضلة."},
        {"en": "Share an opinion about something at school, and explain why.", "ar": "شارك رأيا حول شيء في المدرسة، واشرح السبب."},
    ],
    "level4": [
        {"en": "Describe your daily routine from morning to night.", "ar": "صف روتينك اليومي من الصباح إلى الليل."},
        {"en": "How often do you do your favorite hobby? Write 3 sentences.", "ar": "كم مرة تمارس هوايتك المفضلة؟ اكتب ٣ جمل."},
        {"en": "Write a short message to a friend making weekend plans.", "ar": "اكتب رسالة قصيرة لصديق لترتيب خطط نهاية الأسبوع."},
        {"en": "Describe something that belongs to you and why it matters to you.", "ar": "صف شيئا يخصك ولماذا هو مهم بالنسبة لك."},
        {"en": "Write about how you save or spend your money.", "ar": "اكتب عن كيفية ادخارك أو إنفاقك لمالك."},
        {"en": "Describe the most talented person you know.", "ar": "صف أكثر شخص موهوب تعرفه."},
        {"en": "Write a polite request for something you'd like to order or receive.", "ar": "اكتب طلبا مهذبا لشيء تريد طلبه أو الحصول عليه."},
        {"en": "Give a friend 3 pieces of advice using should/shouldn't.", "ar": "أعط صديقا ٣ نصائح باستخدام يجب/لا يجب."},
        {"en": "Describe your future goal and how you plan to achieve it.", "ar": "صف هدفك المستقبلي وكيف تخطط لتحقيقه."},
        {"en": "Write about a culture or country you would like to explore.", "ar": "اكتب عن ثقافة أو دولة تود استكشافها."},
    ],
}

def build_writing_hub(level):
    out = {"level": level, "levelName": LEVEL_NAMES[level], "prompts": WRITING_PROMPTS[level]}
    with open(f"writing-hub/{level}.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"writing-hub/{level}.json: {len(out['prompts'])} prompts")


build_vocab_hub("level3", LEVEL3_THEME_BY_LESSON)
build_vocab_hub("level4", LEVEL4_THEME_BY_LESSON)
build_writing_hub("level3")
build_writing_hub("level4")
