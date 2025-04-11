import * as conf from './conf'
import { State, Point, Coord } from './state'
const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
  ORANGE: '#ffA500',
  PURPLE: '#800080'
}

const toDoubleHexa = (n: number) =>
  n < 16 ? '0' + n.toString(16) : n.toString(16)

export const rgbaTorgb = (rgb: string, alpha = 0) => {
  let r = 0
  let g = 0
  let b = 0
  if (rgb.startsWith('#')) {
    const hexR = rgb.length === 7 ? rgb.slice(1, 3) : rgb[1]
    const hexG = rgb.length === 7 ? rgb.slice(3, 5) : rgb[2]
    const hexB = rgb.length === 7 ? rgb.slice(5, 7) : rgb[3]
    r = parseInt(hexR, 16)
    g = parseInt(hexG, 16)
    b = parseInt(hexB, 16)
  }
  if (rgb.startsWith('rgb')) {
    const val = rgb.replace(/(rgb)|\(|\)| /g, '')
    const splitted = val.split(',')
    r = parseInt(splitted[0])
    g = parseInt(splitted[1])
    b = parseInt(splitted[2])
  }

  r = Math.max(Math.min(Math.floor((1 - alpha) * r + alpha * 255), 255), 0)
  g = Math.max(Math.min(Math.floor((1 - alpha) * g + alpha * 255), 255), 0)
  b = Math.max(Math.min(Math.floor((1 - alpha) * b + alpha * 255), 255), 0)
  return `#${toDoubleHexa(r)}${toDoubleHexa(g)}${toDoubleHexa(b)}`
}

const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
}

const drawCirle = (
  ctx: CanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
  color: string
) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.fill()
}

const drawObjCircle = (
  ctx: CanvasRenderingContext2D,
  { coord, radius }: { coord: Coord; radius: number },
  color: string
) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

const drawObjRect = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height }: { coord: Coord, width : number, height : number  },
  color: string
) => {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.fillRect(coord.x, coord.y, width, height)
  ctx.fill()

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.strokeRect(coord.x, coord.y, width , height);
}

const drawWall = (
  ctx: CanvasRenderingContext2D,
  {leftTop, rightBottom}: {leftTop:Point, rightBottom:Point},
  r : number,
  g : number,
  b : number
) => {
  ctx.beginPath()
  ctx.fillStyle = `rgb(
        ${Math.floor(r)}
        ${Math.floor(g)}
        ${Math.floor(b)}
        )`;
  ctx.fillRect(leftTop.x,leftTop.y, rightBottom.x-leftTop.x, rightBottom.y-leftTop.y  )
  ctx.fill()
}

const drawHero = (
  ctx: CanvasRenderingContext2D,
  {x, y}: {x:number, y:number},
  {hx, hy}: {hx:number, hy:number},
  r : number,
  g : number,
  b : number
) => {
  ctx.beginPath()
  ctx.fillStyle = `rgb(
        ${Math.floor(r)}
        ${Math.floor(g)}
        ${Math.floor(b)}
        )`;
  ctx.fillRect(x-hx/2,y-hx/2, hx, hy)
  ctx.fill()
}

const computeColor = (life: number, maxLife: number, baseColor: string) =>
  rgbaTorgb(baseColor, (maxLife - life) * (1 / maxLife))

export const render = (ctx: CanvasRenderingContext2D) => (state: State) => {
  clear(ctx)

  state.tirs.map( (tir) => 
    drawCirle (ctx, tir.coord, COLORS.GREEN)
  )
  state.tirsEnnemie.map( (tir) => 
    drawCirle (ctx, tir.coord, COLORS.ORANGE)
  )

  state.debris.map( (debri) =>
    drawObjCircle(ctx, debri, COLORS.RED)
  )

  state.ennemisQuiTire.map( (ennemie) => 
    drawObjRect(ctx, ennemie[1], COLORS.ORANGE)
  )

  state.ennemisVersHero.map( (debri) =>
    drawObjCircle(ctx, debri, COLORS.PURPLE)
  )
  
  drawHero(ctx, state.hero.coord, state.hero.hitBox,  0, 255, 0);

  state.limite.map( (w) =>
    drawWall(ctx, w, 245, 184, 135)
  )

  
  if (state.endOfGame) {
    const text = 'END'
    ctx.font  = '48px arial'
    ctx.strokeText(text, state.size.width / 2 - 200, state.size.height / 2)
  }
}
