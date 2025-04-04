import { useEffect } from 'react';
import * as conf from './conf'
export type Coord = { x: number; y: number; dx: number; dy: number }
export type Point = {x:number; y: number}
type Ball = { coord: Coord; life: number; invincible?: number }
type Size = { height: number; width: number }
type Wall = { leftTop:Point, rightBottom:Point}
type ObjectCercle = {coord: Coord; radius: number; life: number}
export type Rectangle = {coord: Coord, width:number, height:number, life: number}
type Hero = {coord: Coord, hitBox: {hx: number, hy: number}, vie: number, force : number}

// Mur de droite = 1 et Mur haut = 0 et Mur gauche = 2  

const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)

export type State = {
  hero : Hero
  limite: Array<Wall>
  size: Size
  endOfGame: boolean
  tirs: Array<Ball>
  debris: Array<ObjectCercle>
  ennemisQuiTire: Array<[number, Rectangle]>
  tirsEnnemie: Array<Ball>
  shootCooldownHero : number
  ennemyDelay : number
}

const dist2 = (o1: Coord, o2: Coord) =>
  Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2)

const iterate = (bound: Size) => (ball: Ball) => {
  
  return {
    ...ball, 
    coord: {
      ...ball.coord,
      x: ball.coord.x + ball.coord.dx,
      y: ball.coord.y + ball.coord.dy,
    },
  }
}

const mouvDebris = (bound: Size) => (ball: ObjectCercle) => {
  
  return {
    ...ball, 
    coord: {
      ...ball.coord,
      x: ball.coord.x + ball.coord.dx,
      y: ball.coord.y + ball.coord.dy,
    },
  }
}

const mouvTirD = (bound: Size) => ([i, rect]: [number, Rectangle]) => {

  let newdy = rect.coord.dy
  if (rect.coord.y === 200) {
    newdy = 0
  }

  return [
    i,
    {
      ...rect,
      coord: {
        ...rect.coord,
        y: rect.coord.y + newdy,
        dy: newdy,
      },
    },
  ]as [number, Rectangle];;
}


/*export const click =
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    const target = state.pos.find(
      (p) =>
        dist2(p.coord, { x: offsetX, y: offsetY, dx: 0, dy: 0 }) <
        Math.pow(conf.RADIUS, 2) + 100
    )
    if (target) {
      target.coord.dx += Math.random() * 10
      target.coord.dy += Math.random() * 10
    }
    return state
  }*/


const collideBOC = (b:Coord, oc:ObjectCercle) => 
  dist2(b, {x: oc.coord.x, y: oc.coord.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS+oc.radius, 2)

const collideROC = (h: Hero, oc: ObjectCercle) => {
  const hx = h.coord.x;
  const hy = h.coord.y;
  const hw = h.hitBox.hx;
  const hh = h.hitBox.hy;
  const cx = oc.coord.x;
  const cy = oc.coord.y;
  const cr = oc.radius;
  const nearestX = Math.max(hx - hw / 2, Math.min(cx, hx + hw / 2));
  const nearestY = Math.max(hy - hh / 2, Math.min(cy, hy + hh / 2));
  const distX = cx - nearestX;
  const distY = cy - nearestY;
  return (distX * distX + distY * distY) <= (cr * cr);
};
  
const collideHeroTir = (h: Hero, oc: Ball) => {
  const hx = h.coord.x;
  const hy = h.coord.y;
  const hw = h.hitBox.hx;
  const hh = h.hitBox.hy;
  const cx = oc.coord.x;
  const cy = oc.coord.y;
  const cr = 5;
  const nearestX = Math.max(hx - hw / 2, Math.min(cx, hx + hw / 2));
  const nearestY = Math.max(hy - hh / 2, Math.min(cy, hy + hh / 2));
  const distX = cx - nearestX;
  const distY = cy - nearestY;
  return (distX * distX + distY * distY) <= (cr * cr);
};

const collideEnnemieTir = (h: Rectangle, oc: Ball) => {
  const hx = h.coord.x;
  const hy = h.coord.y;
  const hw = h.width;
  const hh = h.height;
  const cx = oc.coord.x;
  const cy = oc.coord.y;
  const cr = 5;
  const nearestX = Math.max(hx, Math.min(cx, hx + hw));
  const nearestY = Math.max(hy, Math.min(cy, hy + hh));
  const distX = cx - nearestX;
  const distY = cy - nearestY;
  return (distX * distX + distY * distY) <= (cr * cr);
};
  
const collideBORR = (b:Coord, or:Wall) => 
  ((dist2(b, {x: or.rightBottom.x, y: or.leftTop.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: or.rightBottom.x, y: or.rightBottom.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2))) || 
  (dist2(b, {x: or.rightBottom.x, y:b.y, dx:0, dy:0}) < Math.pow(conf.RADIUS,2) && b.y > or.leftTop.y && b.y < or.rightBottom.y)

const collideBORL = (b:Coord, or: Wall) => 
  (dist2(b, {x: or.leftTop.x, y: or.rightBottom.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: or.leftTop.x, y: or.leftTop.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: or.leftTop.x, y:b.y, dx:0, dy:0}) < Math.pow(conf.RADIUS,2) && b.y > or.leftTop.y && b.y < or.rightBottom.y)

const collideBORU = (b:Coord, or:Wall) =>
  (dist2(b, {x: or.rightBottom.x, y: or.leftTop.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: or.leftTop.x, y: or.leftTop.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: b.x, y:or.leftTop.y, dx:0, dy:0}) < Math.pow(conf.RADIUS,2) && b.x > or.leftTop.x && b.x < or.rightBottom.x) 


const collideBORB = (b:Coord, or:Wall) =>
  (dist2(b, {x: or.leftTop.x, y: or.rightBottom.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: or.rightBottom.x, y: or.rightBottom.y, dx: 0, dy: 0}) < Math.pow(conf.RADIUS, 2)) || 
  (dist2(b, {x: b.x, y:or.rightBottom.y, dx:0, dy:0}) < Math.pow(conf.RADIUS,2) && b.x > or.leftTop.x && b.x < or.rightBottom.x) 


const collide = (o1: Coord, o2: Coord) =>
  dist2(o1, o2) < Math.pow(2 * conf.RADIUS, 2)

const collideboing = (p1: Coord, p2: Coord) => {
  const nx = (p2.x - p1.x) / (2 * conf.RADIUS)
  const ny = (p2.y - p1.y) / (2 * conf.RADIUS)
  const gx = -ny
  const gy = nx

  const v1g = gx * p1.dx + gy * p1.dy
  const v2n = nx * p2.dx + ny * p2.dy
  const v2g = gx * p2.dx + gy * p2.dy
  const v1n = nx * p1.dx + ny * p1.dy
  p1.dx = nx * v2n + gx * v1g
  p1.dy = ny * v2n + gy * v1g
  p2.dx = nx * v1n + gx * v2g
  p2.dy = ny * v1n + gy * v2g
  p1.x += p1.dx
  p1.y += p1.dy
  p2.x += p2.dx
  p2.y += p2.dy
}

const collideboingS = (p1: Coord, p2:ObjectCercle) => {
  const nx = (p2.coord.x-p1.x) / (2 * conf.RADIUS)
  const ny = (p2.coord.y-p1.y) / (2 * conf.RADIUS)
  const gx = -ny
  const gy = nx

  const v1g = gx * p1.dx + gy * p1.dy
  const v1n = nx * p1.dx + ny * p1.dy
  p1.dx -= 2 * nx  + gx * v1g
  p1.dy -= 2 * ny  + gy * v1g
  p1.x += p1.dx
  p1.y += p1.dy
  
}

export const step = (state: State) => {
    
  // Gestion du délai de tir
  const shootingDelay = 60; 

  if (state.shootCooldownHero <= 0) {
    state.tirs.push({
      life: 1,
      coord: {
        x: state.hero.coord.x,
        y: state.hero.coord.y,
        dx: 0,
        dy: -2,
      },
    });
    state.shootCooldownHero = shootingDelay;
  } else {
    state.shootCooldownHero--;
  }

  state.ennemisQuiTire = state.ennemisQuiTire.map(([cooldown, ennemie]:[number, Rectangle]) =>{
    if (ennemie.coord.y == 200){
      if (cooldown <= 0) {
        state.tirsEnnemie.push({
          life:1,
        coord: {
          x: ennemie.coord.x+25,
          y: ennemie.coord.y+50,
          dx: 0,
          dy: 2,
        },
        })
        return [150, ennemie];
      }
      return [cooldown-1, ennemie];
    }
    return [cooldown, ennemie];
  }
)


  
  //Gestion du délai d'apparition d'ennemis
  const appearanceDelay = 200;
  if (state.ennemyDelay <= 0) {
    
    switch (randomInt(3)){

      case 1 :
        //possibilité d'algo de gravité
        state.debris.push(
          {coord:{
            x: randomInt(window.innerWidth - (120+(2*conf.BOUNDLEFT))) + (60+conf.BOUNDLEFT),
            y: 0,
            dx:0, 
            dy:2},
          radius : 25,
          life : 2 // faire un truc en fonction du rayon pour la vie
        });
        break;

      case 2 :
        state.ennemisQuiTire.push([ 
          150,
          {coord: {
            x: randomInt(window.innerWidth - (120+(2*conf.BOUNDLEFT))) + (60+conf.BOUNDLEFT),
            y: 0,
            dx:0, 
            dy:1 },
          width:50, 
          height:50, 
          life: 2 //possibilité de modifier la vie
          }
        ])
        break;

      default : 
        break

    }
    
    state.ennemyDelay = appearanceDelay;
  } else {
    state.ennemyDelay--;
  }

  //Collision débris - tir
  state.tirs.map((p1) => {
    state.debris.map((c) => {
      if (collideBOC(p1.coord, c)){
        p1.life--
        c.life--
      }
    })
  })

  state.tirsEnnemie.map((p) => {
    const coordH = state.hero.coord
    if (collideHeroTir(state.hero, p)){
      p.life = 0;
      state.hero.vie --;
    }
  })

  state.ennemisQuiTire.map(([_,r]) => {
    state.tirs.map((p)=> {
      if (collideEnnemieTir(r, p)){
        r.life--;
        p.life = 0;
      }
    })
  })


  if(state.hero.vie == 0) {
    state.hero.coord.x =1
    state.endOfGame = true
  }

  //Collision debri-héros
  state.debris.map((d) => {
    if (collideROC(state.hero,d)) {
      d.life = 0
      state.hero.vie --;
    }

  })


  return {
    ...state,
    tirs: state.tirs.map(iterate(state.size)).filter((p) => p.coord.y > 0 && p.life > 0),
    tirsEnnemie: state.tirsEnnemie.map(iterate(state.size)).filter((p) => p.coord.y > 0 && p.life > 0),
    debris: state.debris.map(mouvDebris(state.size)).filter((p) => p.coord.y < window.innerHeight && p.life > 0),
    ennemisQuiTire: state.ennemisQuiTire.map(mouvTirD(state.size)).filter(([_, rect]) => rect.coord.y < window.innerHeight && rect.life > 0),
    endOfGame: state.endOfGame,
  }
}

export const handleKeyPress = 
  (state: State) =>
    (event: KeyboardEvent):State => { 
        const stepx = state.hero.coord.dx;
        const stepy = state.hero.coord.dy;
        const ax = state.hero.coord.x;
        const ay = state.hero.coord.y;
        const hx = state.hero.hitBox.hx/2;
        const hy = state.hero.hitBox.hy/2;
        switch (event.key) {
          case "Z":
          case "z":
            console.log("z")
            
            if (ay - stepy - hy > state.limite[0].rightBottom.y){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, y: ay - stepy}}}
            }
            return state;
          case "s":
          case "S":
            console.log("s")
            if (ay + stepy+ hy< state.limite[3].leftTop.y){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, y: ay + stepy}}}
            }
            return state;
          case "q":
          case "Q":
            console.log("q")
            if (ax - stepx - hx> state.limite[1].rightBottom.x){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, x: ax - stepx}}}
            }
            return state;
          case "d":
          case "D":
            console.log("d")
            if (ax + stepx + hx < state.limite[2].leftTop.x){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, x: ax + stepx}}}
            }
            return state;
          default : 
            return state
        }
      }

export const mouseMove =
  (state: State) =>
  (event: PointerEvent): State => {
    return state
  }

export const endOfGame = (state: State): boolean => true
