import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, mouseMove, endOfGame, handleKeyPress, Rectangle } from './state'
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

  const tirs = new Array(0)
  const debris = new Array(0)
  const ennemisQuiTire = new Array<[number, Rectangle]>()

  const initialState: State = {
    hero : {
      coord : {
        x: ((test[2].leftTop.x - test[1].rightBottom.x) /2)+ test[1].rightBottom.x,
        y: window.innerHeight - 150,
        dx: 4,
        dy: 4,
      },
      hitBox : {
        hx: 25, 
        hy: 25,
      },
      vie: 3,
      force: 10,
    },
    limite: test,
    tirsEnnemie: new Array(0),
    
    size: { height: height - conf.BOUNDTOP, width: width - conf.BOUNDLEFT  },
    endOfGame: false,
    tirs: tirs,
    shootCooldownHero : 0,
    ennemyDelay : 0,
    debris : debris,
    ennemisQuiTire : ennemisQuiTire
  }

  const ref = useRef<any>()
  const state = useRef<State>(initialState)

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current)
    render(ctx)(state.current)
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  } 

  /*const onClick = (e: PointerEvent) => {
    state.current = click(state.current)(e)
  }*/

  const onMove = (e: PointerEvent) => {
    state.current = mouseMove(state.current)(e)
  }

  const onKey = (e: KeyboardEvent) => {
    state.current = handleKeyPress(state.current)(e)
  }

  useEffect(() => {
    if (ref.current) {
      initCanvas(iterate)(ref.current)
      //ref.current.addEventListener('click', onClick)
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
