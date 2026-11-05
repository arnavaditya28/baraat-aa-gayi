# Baraat Aa Gayi! 🐴🥁

A desi shaadi co-op game that runs in the browser. The baraat is coming, the paneer has run out, Fufaji is upset, and the ghodi just ran off. Keep the wedding going until the 10:42 muhurat.

Play solo or with two people on one laptop, in one of two modes:

- **👀 Mehmaan Mode**: you're a guest. Walk around and talk to anyone while the wedding happens around you. When something goes wrong, the right person sorts it out (Lallan chases the ghodi, Mama fixes the generator, Pandey Ji makes more paneer). No timers or penalties, and an "Agli Rasam" button skips to the next ceremony.
- **💪 Kaam Karo Mode**: you handle the problems yourself before their timers run out.

Nobody talks unless you talk to them. If someone is part of a problem, they tell you about it when you go to them.

## How to play

| | Player 1 | Player 2 |
|---|---|---|
| Move | WASD | Arrow keys |
| Do the job (hold) | E | Enter |

- **Mouse**: click anyone or anything. Every relative, stall and object reacts
- **E / Enter** near someone: talk to them or use the thing
- **Esc**: pause
- **M**: mute or unmute (any time, also stops voices)

The venue is a big map you walk around: entrance road and parking, the red carpet and gate, the dance floor and DJ, the shamiyana, the mandap, the food court (kitchen, buffet, mithai, golgappa and chai stalls), the bride's room, the photo booth, the jhula and the gift table. A minimap and edge arrows show where problems are. In 2-player the camera zooms out to keep both players on screen.

Things to try: chai for a speed boost, golgappe, DJ song requests, the dhol, the photo booth, the jhula, fireworks, knocking on the bride's room door, setting off a car alarm in the parking.

Characters speak their lines out loud using the browser's built-in voices (Indian English voices such as Microsoft Heera/Ravi when installed), each with their own pitch and speed.

**Bollywood Mode**: in the sound settings, pick a song file from your own computer for each situation (menu/taiyari, baraat entry, dance floor, sad Fufaji moments, ghodi chase, pheras/vidaai). The game switches between them as the situation changes and remembers your picks in the browser. There is also a single "one song everywhere" option. Files stay on your computer and are never uploaded; the game itself ships only original music.

When a ❗ bubble appears somewhere, go there and hold your action key. If the timer runs out, the family's **Izzat** drops. At 0 the wedding is cancelled.

- 😤 **Fufaji naraaz**: take a plate from the buffet and bring it to him
- 🐴 **Ghodi bhaag gayi**: catch Rani by touching her
- 🍮 **Chotu gang**: touch the kids to chase them off the mithai
- 👓 **Dadi ka chashma**: find the glasses and bring them to Dadi
- 🙏 **Nani**: press your key next to her for her blessing (+Izzat, has a cooldown)
- 💍 **Pinky Bua**: avoid her. If she catches you, mash your key to escape
- 🕺 **Bablu Chacha**: touch him and you have to dance
- 📸 **Click Bhaiya**: when he calls for a family photo, get away

The wedding has three phases: **Taiyari → Baraat Aa Gayi! → Pheras**. At the end you get a result card (expectation vs reality, a funny title for each player) to download or send on WhatsApp.

## Run it locally

No build step and no dependencies. Either open `index.html` directly, or serve the folder:

```bash
python -m http.server 8765
```

then open http://localhost:8765.

## Project layout

```
index.html        screens and HUD markup
css/style.css     all styling
js/data.js        relatives, dialogue, crises, songs, headlines, titles (edit content here)
js/audio.js       procedural music and sound effects (Web Audio API)
js/render.js      drawing: characters, ghodi, lights, bubbles
js/game.js        game loop, world, crises, phases, freeze-frame memes
js/ui.js          title screen, HUD, news break, settings, result card, sharing
```

Most new content (a relative, a dialogue line, a crisis, a song) only needs a change in `js/data.js`.

## Originality

All music is synthesized in code from original melodies and lyrics. There are no film songs, clips, real meme images or celebrity likenesses. Every character is an original type, and the jokes are about situations, not communities.

## Ideas for later

- Online co-op with a room code (WebRTC)
- 3–4 player roles
- Regional weddings: Punjabi, South Indian, Bengali, Marwari
- Sangeet, haldi and mehendi levels
- Short replay clips of the worst moment
