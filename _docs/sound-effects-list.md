# Lumio sound effects and music: what to download from Artlist

The site already plays these automatically once the files exist. Put each file in `assets/sfx/` with **exactly** the name below (lower case, `.mp3`). A missing file is simply skipped: the correct and wrong sounds then fall back to the old built-in beep, so you can add them one at a time.

Students can mute effects and music with the round speaker button on games and stories. Muting never affects the spoken words.

| File name | Where it plays | What to look for on Artlist (SFX) | Length |
|---|---|---|---|
| `correct.mp3` | Every right answer in lessons, homework and games | "correct answer", "success chime", "positive notification", bright and soft, not a cash register | 0.3 to 0.8 s |
| `wrong.mp3` | Every wrong answer | "soft error", "wrong answer gentle", "boop"; kind, not a buzzer that scares young children | 0.3 to 0.6 s |
| `star.mp3` | A single big win: a quiz question in class (Present), a game round | "sparkle", "magic twinkle", "star collect" | 0.5 to 1.2 s |
| `complete.mp3` | Lesson finished, homework submitted, game won | "level complete", "kids celebration", "win jingle", short and happy | 1.5 to 3 s |
| `music-games.mp3` | Loops quietly in every game | Music: "kids playful", "light ukulele", "happy marimba", instrumental, no vocals, a loop that starts and ends cleanly | 1 to 2 min |
| `music-story.mp3` | Loops quietly while reading the story | Music: "gentle adventure", "storybook", "soft orchestral kids", instrumental, calm | 1 to 3 min |

## Tips

- Choose one family of sounds (the same pack or artist) so everything feels like one product.
- Keep effects short; children hear them many times a day.
- Download as MP3 if Artlist offers it. If you only get WAV, send the WAV files and Claude will convert and level them.
- Check the licence covers a website/app used by your paying students (Artlist's standard licence covers online platforms; confirm on your plan).

## How to deliver

Send the files to Claude (or upload them into `assets/sfx/` on GitHub with these names). Claude checks the volume of each so they all sound equally loud, then publishes: `python3 _docs/level-sfx.py <folder with the downloads>` trims the silence and masters every file to -16 LUFS (music loops are not trimmed or faded, so they stay seamless) and writes them to `assets/sfx/`.
