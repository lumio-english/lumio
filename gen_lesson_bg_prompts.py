# -*- coding: utf-8 -*-

STYLE = ("Atmospheric, moody, painterly illustration (digital painting style, "
         "not photographic, no real identifiable people, no readable text or "
         "letters anywhere in the image). Wide landscape format, 16:9 aspect "
         "ratio (e.g. 1600x900 or larger). Dark, night-time-plausible color "
         "palette with deep purples, indigos, and navy shadows, warm accent "
         "lighting (amber, teal, or soft orange glows) picking out key details "
         "-- this sits BEHIND app text and white cards, so keep it moody and "
         "atmospheric rather than bright or busy, with soft/blurred edges and "
         "enough negative space that overlaid text stays readable. Aimed at "
         "ages 9-13, stylish and a little cinematic, never cluttered.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

LEVEL3 = {
    1: ("Meet the Crew", "A group of teen friends hanging out together in a park at golden-hour dusk, silhouetted against warm fading light, long shadows, a sense of easy friendship"),
    2: ("What Do They Do?", "A lively neighborhood street at dusk with warm streetlights, distant silhouettes doing different everyday activities -- one on a bike, one reading on a bench, one bouncing a basketball"),
    3: ("Not My Thing", "A cozy living room lit only by TV glow at night, a couch, one silhouette looking away uninterested while soft blue screen-light washes the room"),
    4: ("My Room", "A warm, cozy teen bedroom at night -- string lights glowing, a desk lamp, posters on the wall as soft blurred shapes, a beanbag chair, intimate and personal"),
    5: ("This or That?", "A stylish walk-in closet or clothing rack scene, soft warm spotlighting on hanging jackets and sneakers, a mirror catching warm light"),
    6: ("Squad Goals", "A tight group of friends walking together down a path at sunset, warm rim-lighting on their silhouettes, long stretching shadows"),
    7: ("Whose Phone Is This?", "A cafe table scattered with phones, earbuds, and chargers under warm hanging pendant lights, shallow depth of field"),
    8: ("Around School", "A school hallway at dusk, rows of lockers receding into soft warm overhead light, quiet and atmospheric, a single open doorway glowing at the end"),
    9: ("Can You Skate?", "A skate park at dusk with dramatic warm floodlighting, ramps and rails in silhouette, a sense of motion and energy in the empty space"),
    10: ("20 Questions", "A cozy circle of friends sitting on the floor at night around a glowing mystery box or lantern, warm firelight-like glow on their silhouettes"),
    11: ("Who's Faster?", "A running track under tall stadium lights at night, motion-blurred lane lines suggesting speed, dramatic cool-to-warm lighting contrast"),
    12: ("The New Kid", "A school entrance at dusk, one silhouette standing slightly apart from a distant group, warm doorway light spilling out, a quiet hopeful mood"),
    13: ("Classroom Rules", "An empty classroom at dusk, rows of desks catching warm low light from a window, a chalkboard in soft shadow, calm and orderly"),
    14: ("Right Now", "A cozy hangout space with teens on couches, phone screens glowing softly blue against warm ambient lamp light, relaxed evening mood"),
    15: ("Study Buddies", "A library study nook at night, a desk lamp casting warm light over stacked books and notebooks, deep shadows beyond the light's edge"),
    16: ("Game Night", "A gaming setup at night, glowing screens and controller lights casting cool purple and teal neon light across a dark room"),
    17: ("Movie Marathon", "A cozy living room movie night, the glow of a screen washing over a couch with blankets and a popcorn bowl, warm and dark"),
    18: ("Big Questions", "An abstract, contemplative night sky scene, scattered stars, soft clouds catching moonlight, a mood of thoughtful wonder"),
    19: ("Reading Adventure: The Big Match", "A sports field or stadium at night under bright floodlights, blurred cheering crowd silhouettes in the stands, an exciting atmospheric mood"),
    20: ("Review + Time Capsule Project", "A nostalgic warm-lit scene of a time capsule box surrounded by keepsakes -- photos, small mementos -- soft golden light, a sense of looking back fondly"),
}

LEVEL4 = {
    1: ("Does She Even Sleep?", "A bedroom at early dawn, soft blue pre-sunrise light through a window, an alarm clock glowing on a nightstand, a sleepy hushed mood"),
    2: ("My Routine, My Rules", "A stylized montage-like scene of morning light streaming across a desk with a calendar and clock, calm structured mood, warm sunrise tones"),
    3: ("How Often Do You...?", "A cozy desk scene with a calendar and planner under soft desk-lamp light, small repeating icon-like doodles suggested in soft bokeh in the background"),
    4: ("Before and After", "An hourglass or large clock silhouette with light transitioning from cool blue on one side to warm amber on the other, symbolic of time passing"),
    5: ("Text Me", "A dark cozy room with a phone screen glowing warmly, soft chat-bubble-shaped light blooms floating around it in the darkness"),
    6: ("That's Mine", "A shared teen bedroom or locker at night with personal items -- a jacket, earbuds, a backpack -- softly lit by warm individual spotlights"),
    7: ("Got Any Snacks?", "A kitchen at night, the warm golden glow of an open fridge or pantry spilling out into a dark room, cozy late-night mood"),
    8: ("How Much Is That?", "A small shop or market stall at dusk with warm string lights, soft glowing price-tag shapes, a gentle bustling mood without visible people"),
    9: ("Saving Up", "A piggy bank or jar of coins under a single warm spotlight in an otherwise dark room, a sense of quiet patience and care"),
    10: ("Best in Show", "A dramatic spotlight on an empty stage, a trophy silhouette catching the warm light, deep shadow curtains framing the scene"),
    11: ("I'd Like...", "A cozy cafe or restaurant table at night, warm string lights overhead, a menu and a candle glow, inviting and relaxed"),
    12: ("You Should Try This", "Two silhouettes sitting together at dusk in quiet conversation on a bench, warm streetlight glow, a mentoring, supportive mood"),
    13: ("Group Chat", "A dark room with several phone screens glowing softly, chat-bubble light shapes floating in the darkness, a connected social mood"),
    14: ("Team Player", "A sports team huddle at dusk on a field, warm stadium lighting silhouetting the group gathered close together, a supportive team mood"),
    15: ("Big Decisions", "A path splitting into two directions under a dramatic dusk sky, warm light down one path and cool shadow down the other, symbolic of choice"),
    16: ("Under Pressure", "A quiet exam room or desk at night, a single warm lamp over an open notebook, a ticking-clock tension suggested through lighting contrast"),
    17: ("My Future Self", "A dreamy night scene with a distant glowing city skyline silhouette and stars above, aspirational and hopeful, soft warm and cool light mixing"),
    18: ("Around the World", "A softly glowing globe or world map silhouette with small warm light points marking distant places, a sense of wonder and travel"),
    19: ("Reading Adventure: The Group Project", "A group of teens gathered around a table at night working together, warm desk-lamp light pooling over papers and laptops, collaborative mood"),
    20: ("Review + Future Plans Project", "A vision-board style scene with soft-lit sticky notes, a calendar, and a small plant, warm hopeful morning light, looking forward"),
}

def build(level, data):
    out_lines = []
    out_lines.append(f"# {level.title()} — Per-Lesson Background Image Prompts\n")
    out_lines.append(
        "20 background scenes, one per lesson, sized/positioned automatically "
        "behind the existing dark gradient + text (a scrim overlay is already "
        "baked into the code, so the image can be a real full scene -- it "
        "doesn't need to be pre-darkened). Save each one named exactly as "
        "shown and drop into `assets/lesson-bg/" + level + "/` -- picked up "
        "automatically on the next regenerate, with automatic graceful "
        "fallback to the current theme-color background for any lesson "
        "that doesn't have an image yet.\n"
    )
    out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
    out_lines.append("---\n")
    batch_size = 10
    items = sorted(data.items())
    for b in range(0, len(items), batch_size):
        chunk = items[b:b + batch_size]
        out_lines.append(f"## Batch {b // batch_size + 1} ({len(chunk)} images)\n")
        for num, (title, desc) in chunk:
            fname = f"{num:02d}.jpg"
            prompt = f"{desc}. {STYLE}"
            out_lines.append(f"**`{fname}`** — *Lesson {num}: {title}*")
            out_lines.append(f"> {prompt}\n")
    with open(f"_docs/{level}-lesson-bg-prompts.md", "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print(f"{level}: {len(items)} prompts written")

build("level3", LEVEL3)
build("level4", LEVEL4)
