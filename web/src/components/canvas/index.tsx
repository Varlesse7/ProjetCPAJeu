import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame, handleKeyPress } from './state'
import { render } from './renderer'

const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)

const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }

const Canvas = ({ height, width }: { height: number; width: number }) => {

  const test = new Array(0) 
  test.push({leftTop:{x:0,y:0}, rightBottom:{x:width,y:conf.BOUNDTOP-(conf.RADIUS*2)}}) // Mur du haut
  test.push({leftTop:{x:0,y:0}, rightBottom:{x:conf.BOUNDLEFT-(conf.RADIUS*2),y:height}}) // Mur de gauche
  test.push({leftTop:{x:width-(conf.BOUNDLEFT),y:0}, rightBottom:{x:width,y:height}}) // Mur de droite
  test.push({leftTop:{x:0,y:height-conf.BOUNDTOP}, rightBottom:{x:width,y:height}}) // Mur du bas

  const listObjectC = new Array(0)
  listObjectC.push({center:{x:500, y:350}, radius : 25})
 
  const listObjectR = new Array(0)
  listObjectR.push({leftTop:{x:1000, y:400}, rightBottom : {x:1100, y:500}})

  const initialState: State = {
    hero : {
      coord : {
        x: ((test[2].leftTop.x - test[1].rightBottom.x) /2)+ test[1].rightBottom.x,
        y: window.innerHeight - 150,
        dx: 3,
        dy: 3,
      },
      hitBox : {
        hx: 50, 
        hy: 50,
      },
      vie: 3,
      force: 10,
    },
    pos: new Array(2).fill(1).map((_) => ({
      life: conf.BALLLIFE,
      coord: {
        x: randomInt(width - (120+(2*conf.BOUNDLEFT))) + (60+conf.BOUNDLEFT),
        y: randomInt(height - (120+(2*conf.BOUNDTOP))) + (60+conf.BOUNDTOP),
        dx: 4 * randomSign(),
        dy: 4 * randomSign(),
      },
    })),
    limite: test,
    objectC: listObjectC,
    objectR: listObjectR,
    
    size: { height: height - conf.BOUNDTOP, width: width - conf.BOUNDLEFT  },
    endOfGame: true,
  }

  const ref = useRef<any>()
  const state = useRef<State>(initialState)

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current)
    state.current.endOfGame = !endOfGame(state.current)
    render(ctx)(state.current)
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  }
  const onClick = (e: PointerEvent) => {
    state.current = click(state.current)(e)
  }

  const onMove = (e: PointerEvent) => {
    state.current = mouseMove(state.current)(e)
  }

  const onKey = (e: KeyboardEvent) => {
    state.current = handleKeyPress(state.current)(e)
  }

  useEffect(() => {
    if (ref.current) {
      initCanvas(iterate)(ref.current)
      ref.current.addEventListener('click', onClick)
      ref.current.addEventListener('mousemove', onMove)
      window.addEventListener("keydown",onKey)
    }
    return () => {
      ref.current.removeEventListener('click', onMove)
      ref.current.removeEventListener('mousemove', onMove)
      window.removeEventListener("keydown",onKey)
    }
  }, [])
  return <canvas {...{ height, width, ref }} />
}

export default Canvas
