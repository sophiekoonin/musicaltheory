import cx from "classnames"

import styles from "./Piano.module.scss"

// this is a React port of pianosvg
// https://github.com/spacejack/pianosvg

// 128 midi notes in total
const NUM_NOTES = 128

const NOTE_COLOURS = [
  "w",
  "b",
  "w",
  "b",
  "w",
  "w",
  "b",
  "w",
  "b",
  "w",
  "b",
  "w"
]

const Widths = {
  w: 24,
  b: 24 * 0.7
}
const Heights = {
  w: 120,
  b: 120 * 0.6
}
/** Count white keys included from 0 to id (not including id) */
function wkCountToId(id: number) {
  if (!Number.isSafeInteger(id) || id < 0 || id >= NUM_NOTES) {
    throw new Error("Invalid id for count: " + id)
  }
  let x = 0
  for (let i = 0; i < id; ++i) {
    if (NOTE_COLOURS[i % 12] === "w") {
      ++x
    }
  }
  return x
}

function idToX(id: number) {
  const x = wkCountToId(id)
  if (NOTE_COLOURS[id % 12] === "w") {
    return x * Widths.w
  }
  // Black key offset
  return x * Widths.w - Widths.b / 2
}

type Props = {
  octaves: number
  currentNotes: Array<number>
  play: (id: number) => void
  stop: (id: number) => void
  pedal: boolean
}

type KeyProps = {
  id: number
  colour: string
  x: number
  pedal: boolean
  play: (id: number) => void
  stop: (id: number) => void
  currentNotes: Array<number>
}

function handleKeyAction(event: KeyboardEvent, callback: () => void) {
  if (event.key === " " || event.code === "Space") {
    callback()
    event.preventDefault()
  }
}

function Key({ colour, id, x, pedal, play, stop, currentNotes }: KeyProps) {
  const playNote = () => (pedal || currentNotes.includes(id) ? null : play(id))
  const stopNote = () => (pedal ? null : stop(id))

  function toggleNote(id: number) {
    if (!pedal) return
    if (!currentNotes.includes(id)) {
      play(id)
    } else {
      stop(id)
    }
  }
  const props = {
    className: cx(styles.key, {
      [styles.pressed]: currentNotes.includes(id)
    }),
    onClick: () => toggleNote(id),
    onMouseDown: playNote,
    role: "button",
    onMouseOut: stopNote,
    onMouseUp: stopNote,
    onKeyPress: (e: KeyboardEvent) => handleKeyAction(e, () => toggleNote(id)),
    onKeyDown: (e: KeyboardEvent) => handleKeyAction(e, playNote),
    onKeyUp: (e: KeyboardEvent) => handleKeyAction(e, stopNote),
    tabIndex: x + 10,
    key: id,
    "data-keyid": id
  }

  /* Note to reader: ordinarily I'd use a button for stuff like this, but you can't have a button inside an SVG */
  return colour === "w" ? (
    // @ts-expect-error
    <g {...props}>
      <path
        d={`M${
          x + Widths.w
        },141.531l0,-116.531l-24,0l0,116.531c0,1.915,1.554,3.469,3.469,3.469l17.062,0c1.915,0,3.469,-1.554,3.469,-3.469z`}
        fill="#ebebeb"
      />
      <path
        d={`M${
          x + Widths.w
        },141.531l0,-116.531l-24,0l0,116.531c0,1.915,1.554,3.469,3.469,3.469l17.062,0c1.915,0,3.469,-1.554,3.469,-3.469zm-1,-113.062l0,113.062c0,1.363,-1.106,2.469,-2.469,2.469l-17.062,0c-1.363,0,-2.469,-1.106,-2.469,-2.469l0,-115.531l22,0c0,0,0,2.469,0,2.469z`}
        className={styles.outline}
      />
    </g>
  ) : (
    // @ts-expect-errorw
    <g {...props}>
      <path
        d={`M${
          x + Widths.b
        },94.919v-69.919h-16.8v69.919c0,1.149,1.088,2.081,2.428,2.081h11.944c1.34,0,2.428,-0.932,2.428,-2.081z`}
      />
    </g>
  )
}

export default function Piano({
  octaves = 2,
  currentNotes,
  play,
  stop,
  pedal
}: Props) {
  const numNotes = octaves * 12
  const whiteKeys = []
  const blackKeys = []
  for (let i = 0; i < numNotes; i++) {
    const keyColour = NOTE_COLOURS[i % 12]
    const key = {
      x: idToX(i) + 10,
      id: i
    }
    keyColour === "w" ? whiteKeys.push(key) : blackKeys.push(key)
  }

  const keyProps = {
    pedal,
    play,
    stop,
    currentNotes
  }

  const width = whiteKeys.length * Widths.w + 20
  return (
    <svg className={styles.piano} width={width}>
      <rect
        className={styles.frame}
        width={width}
        height={Heights.w + 30}
        rx="8"
      />
      <rect
        x="60"
        width="85%"
        y="10"
        rx="5"
        height="3px"
        fill="hsl(266, 82%, 70%)"
      />
      <g id="buttons">
        <circle r="5" cx="15" cy="12.5" fill="#fffea6" />
        <circle r="5" cx="30" cy="12.5" fill="#fbdaff" />
        <circle r="5" cx="45" cy="12.5" fill="#dafffa" />
      </g>
      <g className={styles.white}>
        {whiteKeys.map((k) => (
          <Key colour="w" x={k.x} id={k.id} key={k.id} {...keyProps} />
        ))}
      </g>
      <g className={styles.black}>
        {blackKeys.map((k) => (
          <Key colour="b" x={k.x} id={k.id} key={k.id} {...keyProps} />
        ))}
      </g>
    </svg>
  )
}
