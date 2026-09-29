/* ============================================================
   LUMIO SONGS — data for songs.html (the Songs library) and any
   page that plays the class routine (logo, Hello, Goodbye).

   Audio lives in assets/songs/. All songs were generated on Artlist
   (Lyria 3 Pro), trimmed, faded and levelled to -16 LUFS.
   Kids group = Pre-A, Level 1, Level 2. Teen group = Levels 3-6.

   Each song: { id, kind, title, file, sections:[{label, t?, lines:[]}] }
   `t` is the second the section starts in the audio (taken from the
   generator's own timing); songs without `t` show lyrics without
   the moving highlight.
   ============================================================ */
(function () {
  const L = s => s.trim().split("\n").map(x => x.trim()).filter(Boolean);

  const GROUP = {
    kids: {
      levels: ["pre-a", "level1", "level2"],
      logo: "assets/songs/logo-kids.mp3",
      logoShort: "assets/songs/logo-kids-short.mp3",
      hello: {
        id: "kids-hello", kind: "hello", title: "Hello, Hello, How Are You?",
        file: "assets/songs/kids-hello.mp3",
        sections: [
          { label: "Intro", lines: ["Lu - mi - o!"] },
          { label: "Verse 1", lines: L(`
            Hello, hello, how are you?
            I am happy, how about you?
            Good morning, friends, it's time to play,
            We learn in English every day!`) },
          { label: "Chorus", lines: L(`
            Wave your hands and say hello!
            Clap, clap, clap, here we go!
            Lumi's here, and so are you,
            Hello, hello, how are you?`) },
          { label: "Verse 2", lines: L(`
            Sara, Noor and Omar too,
            Hamad, Ziad say hi to you!
            Open your eyes and open your ears,
            Lumio time is finally here!`) },
          { label: "Chorus", lines: L(`
            Wave your hands and say hello!
            Clap, clap, clap, here we go!
            Lumi's here, and so are you,
            Hello, hello, how are you?`) },
          { label: "Outro", lines: ["Lu - mi - o!"] },
        ],
      },
      goodbye: {
        id: "kids-goodbye", kind: "goodbye", title: "Goodbye from Lumio",
        file: "assets/songs/kids-goodbye.mp3",
        sections: [
          { label: "Verse 1", lines: L(`
            Goodbye, goodbye, it's time to go,
            We learned so much with Lumio.
            Thank you, teacher, thank you, friends,
            Now our English lesson ends.`) },
          { label: "Chorus", lines: L(`
            See you, see you, see you soon,
            Morning, evening, afternoon!
            Wave goodbye and say it slow,
            Good - bye from Lumio!`) },
          { label: "Verse 2", lines: L(`
            Practice words at home with me,
            With mom and dad, one, two, three.
            Sing a song and read a book,
            Next time come and take a look!`) },
          { label: "Chorus", lines: L(`
            See you, see you, see you soon,
            Morning, evening, afternoon!
            Wave goodbye and say it slow,
            Good - bye from Lumio!`) },
          { label: "Outro", lines: ["Lu - mi - o!"] },
        ],
      },
    },
    teen: {
      levels: ["level3", "level4", "level5", "level6"],
      logo: "assets/songs/logo-teen.mp3",
      logoShort: "assets/songs/logo-teen-short.mp3",
      hello: {
        id: "teen-hello", kind: "hello", title: "Ready to Go",
        file: "assets/songs/teen-hello.mp3",
        sections: [
          { label: "Intro", lines: ["Lu - mi - o!"] },
          { label: "Verse 1", lines: L(`
            What's up, crew? We're back again,
            Log in, tune in, say hi to your friends.
            Phones on silent, headphones on,
            New words waiting, let's jump right on.`) },
          { label: "Chorus", lines: L(`
            Hey, hey, we're ready to go,
            Speak it, own it, let the English flow!
            One team, one voice, Lumio,
            Hey, hey, we're ready to go!`) },
          { label: "Verse 2", lines: L(`
            Sara's got the notes, Ziad's got the game,
            Noor asks questions, Hamad knows your name,
            Omar's got a story he wants to share,
            Pull up a seat, the crew is here.`) },
          { label: "Chorus", lines: L(`
            Hey, hey, we're ready to go,
            Speak it, own it, let the English flow!
            One team, one voice, Lumio,
            Hey, hey, we're ready to go!`) },
          { label: "Outro", lines: ["Lu - mi - o!"] },
        ],
      },
      goodbye: {
        id: "teen-goodbye", kind: "goodbye", title: "Next Time, Same Crew",
        file: "assets/songs/teen-goodbye.mp3",
        sections: [
          { label: "Verse 1", lines: L(`
            That's a wrap, great job today,
            You spoke up loud, you found your way.
            Every word is a level up,
            Mistakes are fine, we don't give up.`) },
          { label: "Chorus", lines: L(`
            See you next time, same place, same crew,
            Keep practicing, the next move's on you!
            Logging off, but the words still grow,
            See you next time on Lumio!`) },
          { label: "Bridge", lines: L(`
            Homework's waiting, don't forget,
            The best of you has not come yet.`) },
          { label: "Chorus", lines: L(`
            See you next time, same place, same crew,
            Keep practicing, the next move's on you!
            Logging off, but the words still grow,
            See you next time on Lumio!`) },
          { label: "Outro", lines: ["Lu - mi - o!"] },
        ],
      },
    },
  };

  // Level songs: lyrics and section start times are the ones the chosen
  // take actually sings (read back from the generator), not the prompt.
  const S = (t, label, text) => ({ t, label, lines: L(text) });

  const LEVELS = {
    "pre-a": {
      name: "Pre-A · First Words",
      songs: [
        { id: "pre-a-theme", kind: "theme", title: "First Words Shining Light", file: "assets/songs/pre-a-theme.mp3", sections: [
          S(0, "Intro", "Lu - mi - o!"),
          S(3.3, "Verse 1", `A, B, C, and one, two, three,
            Red and blue and a big green tree,
            Mom and dad and a teddy bear,
            First words, first words everywhere!`),
          S(16.4, "Chorus", `Say it, say it, one more time!
            Every word is yours and mine!
            Little words, big and bright!
            First words shining, shining light!`),
          S(29.5, "Verse 2", `Cat and dog and a yellow sun,
            Run and jump, it's so much fun,
            Happy, happy, clap your hands,
            Now you're speaking English, friends!`),
          S(42.6, "Chorus", `Say it, say it, one more time!
            Every word is yours and mine!
            Little words, big and bright!
            First words shining, shining light!`),
          S(55.7, "Outro", "Lu - mi - o!"),
        ] },
        { id: "pre-a-learning", kind: "learning", title: "I Can, I Like, I Have", file: "assets/songs/pre-a-learning.mp3", sections: [
          S(0, "Verse 1", `I can run, I can jump! (I can run, I can jump!)
            I can clap, clap, clap! (I can clap, clap, clap!)
            I can sing, I can sit! (I can sing, I can sit!)
            I can stand up just like that! (I can stand up just like that!)`),
          S(12, "Chorus", `I can, I like, I have, it is!
            Say it with me, easy like this!
            I can, I like, I have, it is!
            Say it with me, easy like this!`),
          S(24, "Verse 2", `I like apples, I like rice! (I like apples, I like rice!)
            I like milk, it's very nice! (I like milk, it's very nice!)
            I have a ball, I have a car! (I have a ball, I have a car!)
            I have a teddy, here we are! (I have a teddy, here we are!)`),
          S(36, "Verse 3", `It is red and it is blue! (It is red and it is blue!)
            It is pink and purple too! (It is pink and purple too!)
            It is yellow, it is green! (It is yellow, it is green!)
            Happy colors to be seen! (Happy colors to be seen!)`),
          S(48, "Chorus", `I can, I like, I have, it is!
            Say it with me, easy like this!
            Lu - mi - o! (Lu - mi - o!)
            Lu - mi - o! (Lu - mi - o!)
            Lu - mi - o!`),
        ] },
        { id: "pre-a-review", kind: "review", title: "Big Review Parade", file: "assets/songs/pre-a-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Hello! Thank you! What's your name?
            Let's all play the review game!
            One, three, five, seven, ten,
            Count it up and count again!`),
          S(16.7, "Chorus", `Big review, big review,
            Look at all that you can do!
            Every word we learned is here,
            Clap your hands and give a cheer!`),
          S(33.4, "Verse 2", `Kite and rabbit, zebra, cat,
            Elephant and monkey, look at that!
            Banana, milk, and rice and cake,
            Look how many words we make!
            Eyes and hands and mom and me,
            Book and teacher, one, two, three!
            Happy, tired, jump and clap,
            Now we're ready, clap, clap, clap!`),
          S(50.1, "Chorus", `Big review, big review!
            Look at all that you can do!
            Every word we learned is here!
            Clap your hands and give a cheer!
            Lu - mi - o!`),
        ] },
      ],
    },
    "level1": {
      name: "Level 1 · About Me",
      songs: [
        { id: "level1-theme", kind: "theme", title: "All About Me", file: "assets/songs/level1-theme.mp3", sections: [
          S(0, "Intro", "Lu - mi - o!"),
          S(4.3, "Verse 1", `This is me and this is you,
            I am happy, how are you?
            This is my house, my kitchen too,
            My bedroom window, sky so blue!`),
          S(17.2, "Chorus", `All about me, all about me,
            Look at me and you will see!
            I like, I can, I have, I am,
            All about me, yes I can!`),
          S(28.9, "Verse 2", `I am wearing a hat and shoes,
            Sunny, rainy, which to choose?
            Monday, Tuesday, every day,
            I have a pet who loves to play!`),
          S(41.8, "Chorus", `All about me, all about me,
            Look at me and you will see!
            I like, I can, I have, I am,
            All about me, yes I can!`),
          S(53.5, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level1-learning", kind: "learning", title: "Where Is It?", file: "assets/songs/level1-learning.mp3", sections: [
          S(0, "Verse 1", `Where is the ball? Where is the ball?
            It is in the box, in the box, that's all!
            Where is the book? Where can it be?
            It is on the table, look and see!`),
          S(14.4, "Chorus", `In, on, under, where, where, where?
            Look around, it's over there!`),
          S(19.2, "Verse 2", `Where is the cat? Under the chair!
            What color is it? Orange hair!
            What color is it? It is red,
            A red ball under my bed!`),
          S(33.6, "Chorus", `In, on, under, where, where, where?
            Look around, it's over there!`),
          S(38.4, "Verse 3", `How is the weather? It is sunny!
            It is rainy, windy, cloudy, funny!
            It is hot and it is cold,
            How is the weather? Now you know!`),
          S(52.8, "Chorus", `In, on, under, where, where, where?
            Look around, it's over there!`),
          S(57.6, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level1-review", kind: "review", title: "Show and Tell", file: "assets/songs/level1-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Count with me from one to twenty,
            Big and small, I have so many!
            Circle, square, a triangle, star,
            Look how clever all we are!`),
          S(20, "Chorus", `Show and tell, show and tell!
            I can say it, I can spell!
            This is my world, this is me!
            Level One, one, two, three!`),
          S(32, "Verse 2", `I like pizza, I don't like peas,
            Broccoli, lemon, no thank you please!
            I can swim and I can draw,
            Turtle, hamster, look at all!
            Fast and slow and hot and cold,
            Happy, sad, and clean and bold,
            Slide and swing and fly a kite,
            Monday, Friday, day and night!`),
          S(48, "Chorus", `Show and tell, show and tell!
            I can say it, I can spell!
            This is my world, this is me!
            Level One, one, two, three!
            Lu - mi - o!`),
        ] },
      ],
    },
    "level2": {
      name: "Level 2 · My World",
      songs: [
        { id: "level2-theme", kind: "theme", title: "My World", file: "assets/songs/level2-theme.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Hello! Nice to meet you! What's your name?
            Come and join us, let's play a game!
            This is my family, my uncle, my aunt,
            My cousins, my grandparents, come and dance!`),
          S(15.3, "Chorus", `This is my world, big and wide!
            Come on in, come on inside!
            Morning, evening, day and night!
            In my world, everything's bright!`),
          S(30.6, "Verse 2", `I wake up and I brush my teeth,
            Get dressed, put on my shoes and leave,
            I go to school and do my best,
            Then home for homework and some rest!`),
          S(45.9, "Chorus", `This is my world, big and wide!
            Come on in, come on inside!
            Morning, evening, day and night!
            In my world, everything's bright!
            Lu - mi - o!`),
        ] },
        { id: "level2-learning", kind: "learning", title: "What Time Is It?", file: "assets/songs/level2-learning.mp3", sections: [
          S(0, "Verse 1", `What time is it? (It's seven o'clock!)
            Wake up, wake up, tick-tock, tick-tock!
            What time is it? (It's half past eight!)
            Go to school, don't be late!`),
          S(11.4, "Chorus", `Tick-tock, tick-tock, look at the clock!
            Hour and minute, round they walk!
            Quarter past and quarter to!
            What time is it? I'll tell you!`),
          S(22.8, "Verse 2", `What time is it? (It's twelve, it's noon!)
            Lunch time, lunch time, get your spoon!
            What time is it? (It's eight at night!)
            Pajamas on and sleep tight!`),
          S(34.2, "Chorus", `Tick-tock, tick-tock, look at the clock!
            Hour and minute, round they walk!
            Quarter past and quarter to!
            What time is it? I'll tell you!`),
          S(45.6, "Verse 3", `When is your birthday? (It's in May!)
            Balloons and candles, hip hooray!
            January, June, December too!
            Twelve months in a year for you!`),
          S(57, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level2-review", kind: "review", title: "My Poster", file: "assets/songs/level2-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Stand up, sit down, raise your hand,
            Open your book, now understand!
            Twenty, thirty, forty, fifty,
            Up to a hundred, isn't that nifty!`),
          S(18.8, "Chorus", `Review, review, my poster's done,
            Every word for everyone!
            This and that and these and those,
            Look how much my English grows!`),
          S(29.2, "Verse 2", `Boxes, watches, babies, feet,
            Children, men and women meet!
            Do you like drawing? Yes, I do!
            Do you like cooking? Me too!`),
          S(39.6, "Verse 3", `Wake up, get dressed, go to bed,
            Healthy food and books I read!
            Uncle, cousin, niece, nephew,
            Happy birthday, hooray for you!`),
          S(50, "Chorus", `Review, review, my poster's done,
            Every word for everyone!
            This and that and these and those,
            Look how much my English grows!
            Lu - mi - o!`),
        ] },
      ],
    },
    "level3": {
      name: "Level 3 · Everyday Life",
      songs: [
        { id: "level3-theme", kind: "theme", title: "Everyday Life", file: "assets/songs/level3-theme.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Wake up, check the group chat,
            Memes and jokes and all of that,
            Hang out with the crew today,
            Laugh it off and find our way.`),
          S(20, "Chorus", `This is everyday life, yeah!
            Every day we get it right, yeah!
            Hoodie on and sneakers tight!
            Everyday life, we shine so bright!`),
          S(40, "Verse 2", `I can skate and I can code,
            Can you dance? Let's hit the road!
            Game night, movie, popcorn too,
            Everyday life with the crew.`),
          S(50, "Chorus", `This is everyday life, yeah!
            Every day we get it right, yeah!
            Hoodie on and sneakers tight!
            Everyday life, we shine so bright!`),
          S(56, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level3-learning", kind: "learning", title: "Right Now", file: "assets/songs/level3-learning.mp3", sections: [
          S(0, "Verse 1", `Every day I wake up, every day I train,
            She plays guitar, he studies again,
            They watch a movie every Friday night,
            We hang out, and it feels just right.`),
          S(13.1, "Chorus", `Every day: I play, she plays,
            Right now: I'm playing, that's the way!
            Simple for the things we do,
            Right now is happening, me and you!`),
          S(26.2, "Verse 2", `Right now I'm texting, right now I'm scrolling,
            Right now we're gaming, the level is rolling,
            Right now she's studying, highlighting notes,
            Right now we're chilling, and nobody votes!`),
          S(39.3, "Chorus", `Every day: I play, she plays,
            Right now: I'm playing, that's the way!
            Simple for the things we do,
            Right now is happening, me and you!`),
          S(52.4, "Bridge", `Faster, bigger, better than before,
            Compare it, share it, we want more!
            Lu - mi - o!`),
        ] },
        { id: "level3-review", kind: "review", title: "Time Capsule", file: "assets/songs/level3-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Put it in the time capsule,
            Hoodie, sneakers, poster on the wall,
            Charger, password, group chat too,
            Everything that's me and you.`),
          S(16, "Chorus", `Open it up in a year or two!
            Look at all the English we knew!
            Crew and champion, mystery, clue!
            Level Three, we made it through!`),
          S(28, "Verse 2", `Hallway, cafeteria, locker, bell,
            The new kid's nervous, we know that well,
            Raise your hand and participate,
            Memorize, present, and celebrate!
            What's your opinion? Do you agree?
            Decide and vote, fair and free,
            Strategy, teamwork, cheer so loud,
            The big match, and we're so proud!`),
          S(44, "Chorus", `Open it up in a year or two!
            Look at all the English we knew!
            Crew and champion, mystery, clue!
            Level Three, we made it through!`),
          S(56, "Outro", "Lu - mi - o!"),
        ] },
      ],
    },
    "level4": {
      name: "Level 4 · Smart Choices",
      songs: [
        { id: "level4-theme", kind: "theme", title: "Smart Choices", file: "assets/songs/level4-theme.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Alarm goes off, it's a brand new day,
            Planner open, I plan my way,
            Screen time limit, homework done,
            Smart choices, then some fun!`),
          S(16.7, "Chorus", `Smart choices, every day!
            Think it through before you play!
            Save a little, spend it right!
            Smart choices, future bright!`),
          S(33.4, "Verse 2", `Pocket money, price tag, sale,
            Budget, savings, I won't fail,
            Borrow, lend, and earn and save,
            Goal jar growing every day!`),
          S(50.1, "Chorus", `Smart choices, every day!
            Think it through before you play!
            Save a little, spend it right!
            Smart choices, future bright!
            Lu - mi - o!`),
        ] },
        { id: "level4-learning", kind: "learning", title: "You Should", file: "assets/songs/level4-learning.mp3", sections: [
          S(0, "Verse 1", `You should get some sleep, you shouldn't stay up late,
            You should say sorry when you make a mistake,
            You should try again, you shouldn't give in,
            Every little habit helps you win!`),
          S(16, "Chorus", `Always, usually, sometimes, never!
            Smart little habits last forever!
            Should or shouldn't, make the call!
            Good advice can help us all!`),
          S(32, "Verse 2", `Would you like some juice? Yes, I'd like some, please!
            Are there any snacks? Just some crunchy cheese!
            How much is it? How many do you need?
            Check your budget, then you can proceed!`),
          S(48, "Chorus", `Always, usually, sometimes, never!
            Smart little habits last forever!
            Should or shouldn't, make the call!
            Good advice can help us all!
            Lu - mi - o!`),
        ] },
        { id: "level4-review", kind: "review", title: "Future Plans", file: "assets/songs/level4-review.mp3", sections: [
          S(0, "Intro", "Lu - mi - o!"),
          S(4, "Verse 1", `Schedule ready, bedtime set,
            Always learning, no regret,
            Reply to messages, video chat,
            Earbuds, notebook, just like that.`),
          S(16, "Chorus", `Look how far we've come!
            Every choice, every one!
            Dream, ambition, goal in sight!
            Level Four, we made it right!`),
          S(28, "Verse 2", `Discount, budget, earn some coins,
            Talented, outstanding, the whole team joins!
            Advice and warning, comment, share,
            Cooperate and show you care.`),
          S(38, "Verse 3", `Options, consequence, think it through,
            Confident and calm, it's up to you,
            Culture, explore, a project to do,
            We disagree, but we get through!`),
          S(46, "Chorus", `Look how far we've come!
            Every choice, every one!
            Dream, ambition, goal in sight!
            Level Four, we made it right!`),
          S(58, "Outro", "Lu - mi - o!"),
        ] },
      ],
    },
    "level5": {
      name: "Level 5 · Telling My Story",
      songs: [
        { id: "level5-theme", kind: "theme", title: "This Is My Story", file: "assets/songs/level5-theme.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Yesterday I went to the mall,
            I saw my friends, we had a ball,
            We ate some pizza, we took a photo,
            What a day, I want you to know!`),
          S(24, "Chorus", `This is my story, let me tell,
            What happened, and it all went well!
            First, then, next, and finally,
            This is my story, my memory!`),
          S(42.5, "Verse 2", `Last summer we flew away,
            Packed our suitcase, explored all day,
            It was amazing, it was loud,
            I was nervous, then so proud!
            Lu - mi - o!`),
        ] },
        { id: "level5-learning", kind: "learning", title: "Did You?", file: "assets/songs/level5-learning.mp3", sections: [
          S(0, "Verse 1", `Play, played, watch, watched,
            Walk, walked, and cook, cooked!
            Go, went, see, saw,
            Eat, ate, and that's not all!`),
          S(13.1, "Chorus", `Did you? Did you? Yes, I did!
            Did you? Did you? No, I didn't!
            What did you do? Tell me true,
            Yesterday, what happened to you?`),
          S(26.2, "Verse 2", `Have, had, take, took,
            Buy, bought, and find, found, look!
            Meet, met, get, got,
            Past simple, hit the spot!`),
          S(39.3, "Chorus", `Did you? Did you? Yes, I did!
            Did you? Did you? No, I didn't!
            What did you do? Tell me true,
            Yesterday, what happened to you?`),
          S(52.4, "Bridge", `I was waiting at the bus stop, it was raining all day,
            While I was waiting, the thunder came my way!
            Lu - mi - o!`),
        ] },
        { id: "level5-review", kind: "review", title: "A Day to Remember", file: "assets/songs/level5-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            First I got ready, then I went out,
            Next there was a crowd, they began to shout,
            After that, a surprise, a prize for me,
            Finally, an unforgettable memory!`),
          S(20, "Chorus", `A day to remember, a day to recall,
            Was it amazing? The best of all!
            Because I tried and because I learned,
            Every page of my story turned!`),
          S(40, "Verse 2", `I lost my backpack, I searched all around,
            I was so worried, then it was found!
            I broke a plate, I said sorry, I fixed it fast,
            A mistake is a lesson from the past!`),
          S(50, "Chorus", `A day to remember, a day to recall,
            Was it amazing? The best of all!
            Because I tried and because I learned,
            Every page of my story turned!
            Lu - mi - o!`),
        ] },
      ],
    },
    "level6": {
      name: "Level 6 · Looking Ahead",
      songs: [
        { id: "level6-theme", kind: "theme", title: "Looking Ahead", file: "assets/songs/level6-theme.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Next year I'm going to try something new,
            Join a team, and volunteer too,
            I think I'll travel, I'll probably grow,
            Looking ahead, here we go!`),
          S(20, "Chorus", `Looking ahead, looking ahead!
            Plans in my pocket, dreams in my head!
            Going to, will, and ready to fly!
            Looking ahead to a brighter sky!`),
          S(36, "Verse 2", `This weekend I'm meeting my friends downtown,
            We're hosting a party, the best in town,
            Tomorrow I'm starting a brand new plan,
            I'll succeed, I know I can!`),
          S(50, "Chorus", `Looking ahead, looking ahead!
            Plans in my pocket, dreams in my head!
            Going to, will, and ready to fly!
            Looking ahead to a brighter sky!`),
          S(58, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level6-learning", kind: "learning", title: "Going To or Will", file: "assets/songs/level6-learning.mp3", sections: [
          S(0, "Verse 1", `When I've got a plan, I use going to:
            I'm going to study, I'm going to review!
            When I predict, I use will:
            I think it will rain, it probably will!`),
          S(20, "Chorus", `Going to, going to, a plan in my hand,
            Will, will, a guess, understand?
            Have to, don't have to, rules we know,
            Quickly, carefully, off we go!`),
          S(32, "Verse 2", `You have to do your chores, and you have to be kind,
            You don't have to be perfect, just open your mind!
            Speak clearly, politely, confidently too,
            That's how we say it, that's how we do!`),
          S(48, "Chorus", `Going to, going to, a plan in my hand,
            Will, will, a guess, understand?
            Have to, don't have to, rules we know,
            Quickly, carefully, off we go!`),
          S(56, "Outro", "Lu - mi - o!"),
        ] },
        { id: "level6-review", kind: "review", title: "My Future Plans", file: "assets/songs/level6-review.mp3", sections: [
          S(0, "Verse 1", `Lu - mi - o!
            Plan it, apply it, definitely try,
            Predict the future, aim for the sky,
            Traveling, hosting, meeting a friend,
            This is the start and not the end!`),
          S(16, "Chorus", `My future plans, here they are,
            Every step will take me far!
            More interesting, the most exciting too,
            Level Six, the future is you!`),
          S(32, "Verse 2", `Rules at home, curfew, trust, respect,
            Independent, honest, the way we connect,
            Carefully, patiently, safely we go,
            Efficiently, and now we know!
            Debate and evidence, convince with care,
            Comparing cultures everywhere,
            A school trip, unexpected, memorable day,
            Ready for tomorrow, we're on our way!`),
          S(48, "Chorus", `My future plans, here they are,
            Every step will take me far!
            More interesting, the most exciting too,
            Level Six, the future is you!
            Lu - mi - o!`),
        ] },
      ],
    },
  };

  const groupOf = level => (GROUP.teen.levels.includes(level) ? "teen" : "kids");

  /* Songs for one level in class order: Hello, Theme, Learning, Review, Goodbye. */
  function songsFor(level) {
    const g = GROUP[groupOf(level)];
    const lv = LEVELS[level] || LEVELS["pre-a"];
    return [g.hello, ...lv.songs, g.goodbye];
  }

  window.LUMIO_SONGS = { GROUP, LEVELS, groupOf, songsFor };
})();
