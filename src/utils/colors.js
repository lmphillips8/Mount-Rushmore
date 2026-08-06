// Cycles through the 4 rotation colors defined in index.css
// (--rot-1 orange, --rot-2 blue, --rot-3 green, --rot-4 gold).
// Used for: answer-position badges (1-4), and per-person avatar/card colors
// in the community view (assigned by their position in the answers list).
const ROTATION = ["rot-1", "rot-2", "rot-3", "rot-4"];

export function rotationClass(index) {
  return ROTATION[index % ROTATION.length];
}
