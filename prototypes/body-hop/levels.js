// Body Hop levels. Checked by tools/solve.js (run `node tools/solve.js` after every edit).
// Legend: # wall . floor S spirit G guard C cat R red block B blue block r red bridge b blue bridge
//         ~ pit D locked door (guard only) V vent (cat only) _ plate | gate E exit
// par: optimal turns (moves + hops), from the solver. checks: what the level must require (see tools/solve.js).
(function (root) {
  const LEVELS = [
    {
      name: "First hop",
      teaches: "hopping; doors are guard-only",
      hint: "Walk into the guard to hop into it. Guards have keys.",
      map: [
        "##########",
        "#S.G..D.E#",
        "##########",
      ],
      par: 7, checks: ["needs:G"],
    },
    {
      name: "Different eyes",
      teaches: "colour vision: the cat doesn't see red",
      hint: "The guard sees red. The cat sees blue, so red isn't there for it.",
      map: [
        "###########",
        "#S.G...R.E#",
        "#.C....R..#",
        "###########",
      ],
      par: 10, checks: ["needs:C"],
    },
    {
      name: "Through the wall",
      teaches: "hop body to body; a hop only needs you to be next to it",
      hint: "You can hop from body to body. Stand next to one, wherever you are standing.",
      map: [
        "#########",
        "#S.C....#",
        "#.......#",
        "###RRR###",
        "###RGR###",
        "####D####",
        "#...E...#",
        "#########",
      ],
      par: 8, checks: ["needs:G", "needs:C", "door"],
    },
    {
      name: "Bridges",
      teaches: "bridges only exist for the body that sees their colour",
      hint: "A bridge is only there for the body that sees its colour.",
      map: [
        "#########",
        "#S.C....#",
        "#~~~~~b~#",
        "#...G...#",
        "#~~~r~~~#",
        "#......E#",
        "#########",
      ],
      par: 14, checks: ["needs:G", "needs:C"],
    },
    {
      name: "Dead weight",
      teaches: "plates and gates; a parked body holds a plate; the spirit weighs nothing",
      hint: "A body left on a plate keeps the gate open. The spirit weighs nothing.",
      map: [
        "#########",
        "#S..G...#",
        "#..._C..#",
        "######|##",
        "#......E#",
        "#########",
      ],
      par: 9, checks: ["needs:G", "needs:C", "plate"],
    },
    {
      name: "Make way",
      teaches: "parked bodies block; park where you can still hop back",
      hint: "Bodies you leave behind are in the way. Park them where you can still reach them.",
      map: [
        "#############",
        "###..########",
        "#S.CG.....VE#",
        "#############",
      ],
      par: 14, checks: ["needs:G", "needs:C", "reenter"],
    },
    {
      name: "Relay",
      teaches: "a cat asleep inside a wall is a link: plate cat to wall cat to guard",
      hint: "The plate is walled in by red. Who could ever stand next to it?",
      map: [
        "##########",
        "#S..C....#",
        "#........#",
        "#RRC######",
        "#R_RG.|DE#",
        "#RRR######",
        "##########",
      ],
      on: { "3,3": "R" }, // the second cat starts asleep inside the red wall
      par: 18, checks: ["needs:G", "needs:C", "reenter", "plate", "door"],
    },
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = LEVELS; else root.BODY_HOP_LEVELS = LEVELS;
})(typeof self !== "undefined" ? self : this);
