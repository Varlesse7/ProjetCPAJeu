import * as conf from './conf'
import { State, Point, Coord } from './state'
const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
  ORANGE: '#ffA500',
  PURPLE: '#800080',

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

const tir = new Image()
tir.src = '/img/TirCorrect.png'

const drawTir = (
  ctx: CanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
) => {
  if (tir.complete){
    ctx.beginPath()
    ctx.drawImage(tir,x,y, conf.RADIUS, conf.RADIUS)
    ctx.fill()
  }
}

const missile1 = new Image()
missile1.src = '/img/Missile_1.png'

const missile2 = new Image()
missile2.src = '/img/Missile_2.png'

const drawMissile = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height }: { coord: Coord, width : number, height : number  },
) => {
  ctx.beginPath()
  var img = new Image()

  if (coord.dx < 0 && missile1.complete){
    ctx.drawImage(missile1,coord.x,coord.y, width, height)
  }
  if (coord.dx > 0 && missile2.complete){
    ctx.drawImage(missile2,coord.x,coord.y, width, height)
  }
  ctx.fill()
}

const ennemieTir = new Image()
ennemieTir.src = '/img/EnnemieTir.png'

const drawEnnemieTir = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height }: { coord: Coord, width : number, height : number  },
) => {
  if (ennemieTir.complete){
    ctx.beginPath()
    ctx.drawImage(ennemieTir,coord.x,coord.y, width, height)
    ctx.fill()
  }

}

var tirEnneImg = new Image()
tirEnneImg.src = '/img/TirEnnemie.png'

const drawTirEnnemie = (
  ctx: CanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
) => {
  if (tirEnneImg.complete){
    ctx.beginPath()
    ctx.drawImage(tirEnneImg, x, y, 5, 5)
    ctx.fill()
  }
}

const debrisImg = new Image()
debrisImg.src = '/img/Debris.png'

const drawDebris = (
  ctx: CanvasRenderingContext2D,
  { coord, radius }: { coord: Coord; radius: number },
) => {
  if (debrisImg.complete){
    ctx.beginPath()
    ctx.drawImage(debrisImg, coord.x, coord.y, radius, radius)
    ctx.fill()
  }
}

const bombeImage = new Image()
bombeImage.src = '/img/Bombe.png'

const drawBombe = (
  ctx: CanvasRenderingContext2D,
  { coord, radius }: { coord: Coord; radius: number },
) => {
  if (bombeImage.complete){
    ctx.beginPath()
    ctx.drawImage(bombeImage, coord.x, coord.y, radius, radius)
    ctx.fill()
  }
}
  
const bossImage = new Image()
bossImage.src = '/img/BossViolet.png'

const drawBoss = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height}: { coord: Coord, width: number, height: number },
) => {
  if (bossImage.complete){
    ctx.beginPath()
    ctx.drawImage(bossImage, coord.x, coord.y, width, height)
    ctx.fill()
  }
}

const bossCligImage = new Image()
bossCligImage.src = '/img/BossRouge.png' 

const drawBossClignotant = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height}: { coord: Coord, width: number, height: number },
) => {
  if (bossCligImage.complete){
    ctx.beginPath()
    ctx.drawImage(bossCligImage, coord.x, coord.y, width, height)
    ctx.fill()
  }
}

const laserImage = new Image()
laserImage.src = '/img/Laser.png'

const drawLaser = (
  ctx: CanvasRenderingContext2D,
  { coord, width, height}: { coord: Coord, width: number, height: number },
) => {
  if (laserImage.complete){
    ctx.beginPath()
    ctx.drawImage(laserImage, coord.x, coord.y, width, height)
    ctx.fill()
  }
  
}

const eVT = new Image()
eVT.src = "/img/EnnemieVersToi_Bas.png"

const eVTBD = new Image()
eVTBD.src = "/img/EnnemieVersToi_BasD.png"

const eVTBG = new Image()
eVTBG.src = "/img/EnnemieVersToi_BasG.png"

const drawEVH = (
  ctx: CanvasRenderingContext2D,
  { coord, radius }: { coord: Coord; radius: number },
  color: string
) => {
  ctx.beginPath()
  ctx.fillStyle = color
  

  if (coord.dx === 0 && coord.dy > 0 && eVT.complete){
    ctx.drawImage(eVT, coord.x-(radius/2), coord.y-(radius/2), radius, radius)
  }
  if (coord.dx > 0 && coord.dy > 0 && eVTBD.complete){
    ctx.drawImage(eVTBD, coord.x-(radius/2), coord.y-(radius/2), radius, radius)
  }
  if (coord.dx < 0 && coord.dy > 0 && eVTBG.complete){
    ctx.drawImage(eVTBG, coord.x-(radius/2), coord.y-(radius/2), radius, radius)
  }
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

const murImg = new Image()
murImg.src = '/img/Brique.png'

const drawMur = (
  ctx: CanvasRenderingContext2D,
  {leftTop, rightBottom}: {leftTop:Point, rightBottom:Point},
) => {
  ctx.beginPath()
  ctx.drawImage(murImg, leftTop.x,leftTop.y, rightBottom.x-leftTop.x, rightBottom.y-leftTop.y  )
  ctx.fill()
}

const drawHero = (
  ctx: CanvasRenderingContext2D,
  {x, y}: {x:number, y:number},
  {hx, hy}: {hx:number, hy:number},
) => {
  ctx.beginPath()
  var img = new Image()
  img.src = '/img/Hero.png'
  ctx.drawImage(img,x-hx/2,y-hx/2, hx, hy)
  ctx.fill()
}

let delayClig = 0
const fond = new Image()
fond.src = '/img/Fond.jpg'

export const render = (ctx: CanvasRenderingContext2D) => (state: State) => {
  clear(ctx)

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  state.laser.map((l) =>
    drawLaser(ctx, l)
  )

  state.tirs.map( (tir) => 
    drawTir(ctx, tir.coord)
  )
  
  state.debris.map( (debri) =>
    drawDebris(ctx, debri)
  )

  state.ennemisQuiTire.map( (ennemie) => 
    drawEnnemieTir(ctx, ennemie[1])
  )

  state.ennemisBoss.map( (ennemie) => {
    if (state.clign){
      if (delayClig <= 100){
        delayClig += 1;
        if (delayClig %30 < 15){
          drawBoss(ctx, ennemie);
        }else{
          drawBossClignotant(ctx, ennemie);
        }
      }else {
        delayClig = 0;
        state.clign = false;
      }
    }else {
      drawBoss(ctx, ennemie);
    }
    
  })

  state.ennemisVersHero.map( (eVH) =>
    drawEVH(ctx, eVH, COLORS.PURPLE)
  )

  state.ennemisSurCote.map( (ennemie) => 
    drawMissile(ctx, ennemie)
  )

  drawHero(ctx,state.hero.coord, state.hero.hitBox);

  state.limite.map( (w) =>
    drawMur(ctx, w)
  )

  state.tirsEnnemieRebond.map((t) => {
    drawTirEnnemie(ctx, t.coord)
  })

  const nbrKill = "Nombre de kill : "+state.ennemisTues+'/'+conf.TOTALENNEMIE;
  ctx.font = '32px serial'
  ctx.fillStyle = "white";
  ctx.fillText(nbrKill, 0, 32)

  const HpRest = "Vie :" + state.hero.vie
  ctx.fillText(HpRest, 0, 64)

  if (state.ennemisBoss.length > 0 && state.isBoss){
    const nbrPV = ""+state.ennemisBoss[0].life+"/150"
    ctx.fillText(nbrPV, (window.innerWidth/2)-50, 50)
  }
  
  state.bombe.map((b) => 
    drawBombe(ctx, b)
  )
  
  
  state.tirsEnnemie.map( (tir) => 
    drawTirEnnemie (ctx, tir.coord)
  )

  if (state.endOfGame) {
    const text = 'Perdu/Mort'
    ctx.font  = '48px arial'
    ctx.fillText(text, window.innerWidth/2 - 125, window.innerHeight / 2)
  }

}
