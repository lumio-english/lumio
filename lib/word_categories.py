# -*- coding: utf-8 -*-
"""Word categories for every vocabulary entry (all levels).

Category = how the word is TAUGHT and GROUPED: the vocab-run label
("New Verbs", "New Words", "Grammar Words"), the recap grouping and the
flashcard back all read it. Set on each lesson JSON entry as "pos";
`categorize()` is the fallback for entries that still lack one.

Categories
  verb       action words (base, past or -ing form as the lesson teaches it)
  noun       things, people, places
  adjective  describing words (incl. feelings, comparatives, superlatives)
  adverb     how / how often (quickly, always, sometimes)
  phrase     fixed expressions and greetings (hello, nice to meet you, open your book)
  time       time expressions (yesterday, last week, two days ago, o'clock, Friday, May)
  connector  joining / sequencing words (because, so, first, then, finally, meanwhile)
  grammar    function words taught as grammar (this, these, my, her, in, on, under, I, she)
  number     zero .. hundred

GROUPS maps categories to the three recap/vocab-run buckets."""

GROUPS = {
    "verb": "verbs",
    "noun": "words", "adjective": "words", "adverb": "words", "phrase": "words", "number": "words",
    "time": "grammar", "connector": "grammar", "grammar": "grammar",
}
GROUP_LABELS = {"verbs": ("Verbs", "الأفعال"), "words": ("Words", "الكلمات"), "grammar": ("Grammar words", "كلمات القواعد")}
CATEGORY_LABELS = {
    "verb": ("Verb", "فعل"), "noun": ("Noun", "اسم"), "adjective": ("Adjective", "صفة"), "adverb": ("Adverb", "ظرف"),
    "phrase": ("Phrase", "عبارة"), "time": ("Time expression", "تعبير زمني"), "connector": ("Connector", "رابط"),
    "grammar": ("Grammar word", "كلمة قواعد"), "number": ("Number", "رقم"),
}

VERBS = set("""achieve agree apply argue attend bake be-quiet beat behave believe belong borrow break brush-my-teeth call catch-up
celebrate challenge-myself change chat check cheer chill clap clean collect come-home compromise consider contribute convince cooperate
dance decide deliver disagree discover do-homework double-check draw dream earn edit encourage expect explain explore finish focus follow
forget get-dressed go-to-bed go-to-school graduate greet grow-up guess hang-out have-breakfast have-dinner hope improve introduce invent
invite join juggle jump laugh lend level-up like line-up listen look match meet memorize miss move notice order organize participate
pass pause pay-attention perform plan post practice predict prefer prepare put-on-my-shoes raise-your-hand read read-a-book recommend
record regret rehearse relax remember reply request rest return review save score search share sing sit sit-down sleep-in solve spend stand
stand-up start study submit succeed suggest support swim take-a-shower text travel trust update visit volunteer vote wake-up watch win
write
played watched walked helped cleaned cooked visited baked rested went saw ate had took got bought found met fell-asleep flew packed
dropped forgot apologized spilled broke lost fixed woke-up got-ready left celebrated remembered reviewed memorized practiced passed
struggled improved explored arrived stayed returned laughed shared chose thought searched noticed happened handled interrupted
started-raining
listens plays practices studies watches
was-chatting was-cooking was-driving was-laughing was-listening was-raining was-scrolling was-sleeping was-studying was-texting
was-thinking were-playing were-studying were-talking were-waiting were-watching
cooking dancing singing studying texting typing posting browsing scrolling charging gaming streaming reading drawing traveling
hosting attending leaving starting chilling daydreaming whispering giggling""".split())

ADJECTIVES = set("""affordable allowed amazing angry annoying anxious awesome big black blue boring brown calm careful certain cheap cheaper
cloudy cold confident convenient cool cringe crowded crunchy delicious difficult dirty disappointed dull durable efficient embarrassed epic
excited fair fast faster fine foggy friendly grateful great green happy healthier hilarious hot hungry impressive independent lame late
mandatory memorable more-difficult more-expensive more-interesting nervous noisy okay old optional orange outstanding peaceful pink popular
productive proud purple quiet rainy ready reasonable red relaxing relieved required sad scared shy similar skilled slow small snowy spicy
stormy sunny surprised talented the-best the-most-colorful the-most-comfortable the-most-exciting the-most-popular the-most-reliable
the-most-traditional the-most-useful thrilled tired unexpected unforgettable unique unlikely weird white windy worried worth-it yellow young
lost""".split())

ADVERBS = set("""accurately carefully clearly confidently constantly correctly daily definitely easily efficiently gently honestly kindly loudly
maybe neatly nervously never occasionally patiently politely probably properly quickly quietly rarely safely slowly smoothly sometimes twice
weekly step-by-step""".split())

TIME = set("""a-while-ago afternoon ago earlier evening last-night last-summer last-week midnight morning night noon recently two-days-ago
yesterday o'clock half-past quarter-past quarter-to minute hour month year years-old bedtime weekend
monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november
december""".split())

CONNECTORS = set("""after-that at-last because by-the-time finally first in-the-end meanwhile next since so suddenly then therefore
as-soon-as""".split())

GRAMMAR = set("""i you he she her his my our your their this that these those here there in on under have-to don't-have-to""".split())

PHRASES = set("""good-morning good-night goodbye hello hi nice-to-meet-you please sorry thank-you welcome open-your-book fair-point
agree-partly point-of-view lesson-learned""".split())

NUMBERS = set("""zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen
nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred""".split())


def _key(en):
    return en.strip().lower().replace(" ", "-")


def categorize(w):
    """Category for a vocab entry (dict with "en", maybe "pos"). An explicit
    valid "pos" always wins; otherwise the word lists above decide, and
    anything left is a noun."""
    pos = (w.get("pos") or "").strip().lower()
    if pos in GROUPS:
        return pos
    k = _key(w.get("en", ""))
    if k in VERBS: return "verb"
    if k in ADJECTIVES: return "adjective"
    if k in ADVERBS: return "adverb"
    if k in TIME: return "time"
    if k in CONNECTORS: return "connector"
    if k in GRAMMAR: return "grammar"
    if k in PHRASES: return "phrase"
    if k in NUMBERS: return "number"
    return "noun"


def group_of(w):
    return GROUPS[categorize(w)]


def chip_label(w, en_label):
    """Header label for a vocab slide: 'New Verbs · played' / 'New Words · chore' / 'Grammar Words · yesterday'."""
    g = group_of(w)
    head = {"verbs": "New Verbs", "words": "New Words", "grammar": "Grammar Words"}[g]
    return f"{head} · {en_label}"


def recap_word_blocks(vocab, kind="chips"):
    """Recap 'Today I learned' blocks for a lesson's vocab, grouped
    VERBS / WORDS / GRAMMAR WORDS (empty groups skipped). Items are
    dicts {"en", "image"} so the chip renderer can honour per-lesson
    image overrides."""
    groups = {"verbs": [], "words": [], "grammar": []}
    for w in vocab:
        groups[group_of(w)].append({"en": w["en"], "image": w.get("image") or w["en"]})
    labels = {"verbs": "VERBS", "words": "WORDS", "grammar": "GRAMMAR WORDS"}
    return [{"kind": kind, "label": labels[g], "items": items} for g, items in groups.items() if items]
