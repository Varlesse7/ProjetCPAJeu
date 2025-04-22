/* eslint-disable array-callback-return */
import FastPriorityQueue from "fastpriorityqueue";
import * as conf from './conf'
export type Coord = { x: number; y: number; dx: number; dy: number }
export type Point = {x:number; y: number}
type Ball = { coord: Coord; life: number; invincible?: number }
type Size = { height: number; width: number }
type Wall = { leftTop:Point, rightBottom:Point}
type ObjectCercle = {coord: Coord; radius: number; life: number}
export type Rectangle = {coord: Coord, width:number, height:number, life: number}
type Hero = {coord: Coord, hitBox: {hx: number, hy: number}, vie: number, force : number}

type Node = {
  coord: Coord;
  g: number; // Coût depuis le départ
  h: number; // Heuristique (distance estimée jusqu'à la cible)
  f: number; // f = g + h
  parent?: Node;
};

// Mur de droite = 1 et Mur haut = 0 et Mur gauche = 2  

const randomInt = (max: number) => Math.floor(Math.random() * max)

export type State = {
  hero : Hero
  limite: Array<Wall>
  size: Size
  endOfGame: boolean
  tirs: Array<Ball>
  debris: Array<ObjectCercle>
  ennemisQuiTire: Array<[number, Rectangle]>
  ennemisVersHero: Array<ObjectCercle>
  ennemisSurCote: Array<Rectangle>
  tirsEnnemie: Array<Ball>
  tirsEnnemieRebond: Array<Ball>
  shootCooldownHero : number
  ennemyDelay : number
  ennemisTues : number
  ennemisBoss : Array<Rectangle>
  isBoss : boolean
  laser : Array<Rectangle>
  bombe: Array<ObjectCercle>
  clign: boolean
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

const iterateRebond = () => (ball:Ball) => {
  const invincible = ball.invincible ? ball.invincible - 1 : ball.invincible
  const coord = ball.coord
  const dx =
    (coord.x + conf.RADIUS < (window.innerWidth/3) || coord.x > ((window.innerWidth/3)*2)-conf.RADIUS
      ? -coord.dx
      : coord.dx)
  const dy =
    (coord.y + conf.RADIUS > window.innerHeight || coord.y < conf.RADIUS
      ? -coord.dy
      : coord.dy)
  return {
    ...ball,
    invincible,
    coord: {
      x: coord.x + dx,
      y: coord.y + dy,
      dx,
      dy,
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

const mouvBombe = (state: State, limite: number, ball: ObjectCercle) => {
  /*console.log("New")
  console.log(ball)
  console.log("limite = "+limite)*/
  if (ball.coord.y <= limite){
    return {
      ...ball, 
      coord: {
        ...ball.coord,
        x: ball.coord.x + ball.coord.dx,
        y: ball.coord.y + ball.coord.dy,
      },
    }
  }

  return ball;
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

const mouvY = (bound: Size) => (rect: Rectangle) => {
  
  return {
    ...rect, 
    coord: {
      ...rect.coord,
      x: rect.coord.x + rect.coord.dx,
      y: rect.coord.y + rect.coord.dy,
    },
  }
}

// 🔹 Heuristique : Distance de Manhattan
const heuristique = (a: Coord, b: Coord): number => 
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// 🔹 Algorithme A* modifié
const astar = (start: Coord, goal: Coord, bound: Size): Coord[] => {
  const openSet = new FastPriorityQueue<Node>((a, b) => a.f < b.f);
  openSet.add({ 
    coord: start, 
    g: 0, 
    h: heuristique(start, goal), 
    f: heuristique(start, goal) 
  });

  const closedSet: Set<string> = new Set();
  const gScoreMap: Map<string, number> = new Map();
  const cameFrom: Map<string, Node> = new Map();

  gScoreMap.set(`${start.x},${start.y}`, 0);

  while (!openSet.isEmpty()) {
    const current = openSet.poll()!;

    // Condition d'arrêt avec tolérance de 10px
    if (Math.abs(current.coord.x - goal.x) <= 10 && 
        Math.abs(current.coord.y - goal.y) <= 10) {
      let path: Coord[] = [];
      let temp: Node | undefined = current;
      while (temp) {
        path.push(temp.coord);
        temp = cameFrom.get(`${temp.coord.x},${temp.coord.y}`);
      }
      return path.reverse();
    }

    closedSet.add(`${current.coord.x},${current.coord.y}`);

    // Voisins avec un pas de 4 pixels
    for (const neighborCoord of getNeighbors(current, bound, 2)) {
      const neighborKey = `${neighborCoord.x},${neighborCoord.y}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeGScore = current.g + 2; // Coût basé sur la distance
      if (!gScoreMap.has(neighborKey) || tentativeGScore < gScoreMap.get(neighborKey)!) {
        gScoreMap.set(neighborKey, tentativeGScore);
        const hScore = heuristique(neighborCoord, goal);
        const neighborNode = { 
          coord: neighborCoord, 
          g: tentativeGScore, 
          h: hScore, 
          f: tentativeGScore + hScore,
          parent: current 
        };

        openSet.add(neighborNode);
        cameFrom.set(neighborKey, current);
      }
    }
  }
  return [];
};

// 🔹 getNeighbors modifié pour un pas de 4
const getNeighbors = (node: Node, bound: Size, step: number = 2): Coord[] => {
  const { x, y } = node.coord;
  const moves: Coord[] = [
    { x: x - step, y, dx: -step, dy: 0 }, // Gauche
    { x: x + step, y, dx: step, dy: 0 },  // Droite
    { x, y: y - step, dx: 0, dy: -step }, // Haut
    { x, y: y + step, dx: 0, dy: step },   // Bas
    { x: x - step, y: y - step, dx: -step, dy: 0 }, // Gauche
    { x: x + step, y: y + step, dx: step, dy: 0 },  // Droite
    { x: x - step, y: y + step, dx: 0, dy: -step }, // Haut
    {  x: x + step, y: y - step, dx: 0, dy: step }   // Bas
  ];
  return moves.filter(n => 
    n.x >= 0 && 
    n.y >= 0 && 
    n.x < bound.width && 
    n.y < bound.height
  );
};

// 🔹 Fonction de mouvement adaptée
const mouvAStar = (bound: Size, hero: Coord) => {
  let lastPath: Coord[] = [];
  let lastGoal: Coord | null = null;
  let isApproachingGoal = false;

  return (ball: ObjectCercle) => {
    const distanceToGoal = heuristique(ball.coord, hero);
    
    // Si on est déjà assez proche, on va directement vers le goal
    if (distanceToGoal <= 20) {
      isApproachingGoal = true;
      const dx = Math.sign(hero.x - ball.coord.x) * 4;
      const dy = Math.sign(hero.y - ball.coord.y) * 4;
      return {
        ...ball,
        coord: {
          x: ball.coord.x + dx,
          y: ball.coord.y + dy,
          dx,
          dy
        }
      };
    }

    // Recalcul du chemin seulement si nécessaire
    if (!lastGoal || heuristique(hero, lastGoal) > 50 || lastPath.length === 0) {
      lastPath = astar(ball.coord, hero, bound);
      lastGoal = {...hero};
      isApproachingGoal = false;
    }

    if (!isApproachingGoal && lastPath.length > 1) {
      const nextStep = lastPath[1];
      lastPath.shift();
      
      // Lissage du mouvement
      const dx = nextStep.x - ball.coord.x;
      const dy = nextStep.y - ball.coord.y;
      
      return {
        ...ball,
        coord: {
          x: ball.coord.x + dx,
          y: ball.coord.y + dy,
          dx,
          dy
        }
      };
    }

    // Fallback: mouvement direct si aucun chemin
    const dx = Math.sign(hero.x - ball.coord.x) * 4;
    const dy = Math.sign(hero.y - ball.coord.y) * 4;
    return {
      ...ball,
      coord: {
        x: ball.coord.x + dx,
        y: ball.coord.y + dy,
        dx,
        dy
      }
    };
  };
};

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
  
const collideHeroTir = (h: Hero, oc: Ball ) => {
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
  
const collideHeroRect = (hero: Hero, rect: Rectangle): boolean => {
  return !(
      hero.coord.x + hero.hitBox.hx/2 < rect.coord.x ||
      hero.coord.x - hero.hitBox.hx/2 > rect.coord.x + rect.width ||
      hero.coord.y + hero.hitBox.hy/2 < rect.coord.y ||
      hero.coord.y - hero.hitBox.hy/2 > rect.coord.y + rect.height
  );
};

let delayLaser = 100000
let delayTir = 10000
let listePosBombe = new Array(0)
let delay = 0
let invicible = 0
export var totalEn = conf.TOTALENNEMIE
export var partie = 0


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

  console.log(state.ennemisTues)
  console.log(totalEn)

  if(state.ennemisTues < totalEn){
    state.ennemisQuiTire = state.ennemisQuiTire.map(([cooldown, ennemie]:[number, Rectangle]) =>{
      if (ennemie.coord.y === 200){
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
    const apparanceDelay = 250 - ( 50 * partie );
    if (state.ennemyDelay <= 0) {
      
      switch (randomInt(4)){
  
        case 0 :
          //possibilité d'algo de gravité
          state.debris.push(
            {coord:{
              x: randomInt(window.innerWidth - (120+(2*conf.BOUNDLEFT))) + (60+conf.BOUNDLEFT),
              y: 0,
              dx:0, 
              dy:2},
            radius : 25 + (25*partie),
            life : 2 + (1*partie) // faire un truc en fonction du rayon pour la vie
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
            life: 1 + (1* partie) //possibilité de modifier la vie
            }
          ])
          break;
  
          case 1:
            state.ennemisVersHero.push(
              {coord:{
                x: randomInt(window.innerWidth - (120+(2*conf.BOUNDLEFT))) + (60+conf.BOUNDLEFT),
                y: 0,
                dx:0, 
                dy:2},
              radius : 50 - (10 * partie),
              life : 2 + (1 * partie) // faire un truc en fonction du rayon pour la vie
            });
            break;
  
          case 3:
            const s1= conf.BOUNDLEFT+1
            const s2 = conf.BOUNDLEFT*2 -1
            state.ennemisSurCote.push(
              {coord: {
                x: (Math.abs(s1-state.hero.coord.x) < Math.abs(s2-state.hero.coord.x))? s2 : s1 ,
                y: state.hero.coord.y-(state.hero.hitBox.hy/2),
                dx: (Math.abs(s1-state.hero.coord.x) < Math.abs(s2-state.hero.coord.x))? -(1*partie) : (1*partie), 
                dy:0 },
              width:100, 
              height:30, 
              life: 1 //possibilité de modifier la vie
              }
            );
            break;
  
        default : 
          break;
  
      }
      
      state.ennemyDelay = apparanceDelay;
    } else {
      state.ennemyDelay--;
    }
  
    //Collision débris - tir
    state.tirs.map((p1) => {
      state.debris.map((c) => {
        if (collideBOC(p1.coord, c)){
          p1.life--
          c.life--
          if(c.life===0) state.ennemisTues++
        }
      })
      state.ennemisVersHero.map((c) => {
        if (collideBOC(p1.coord, c)){
          p1.life--
          c.life--
          if(c.life===0) state.ennemisTues++
        }
      })
    })
  
    state.tirsEnnemie.map((p) => {
      if (collideHeroTir(state.hero, p)){
        p.life = 0;
        state.hero.vie --;
      }
    })
  
    state.ennemisQuiTire.map(([_,r]) => {
      if(collideHeroRect(state.hero,r)){
        r.life = 0;
        state.hero.vie = 0;
        state.ennemisTues++
      }
      state.tirs.map((p)=> {
        if (collideEnnemieTir(r, p)){
          r.life--;
          if (r.life <= 0){
            state.ennemisTues++
          }
          p.life = 0;
        }
      })
      
    })
  
    //Collision debri-héros
    state.debris.map((d) => {
      if (collideROC(state.hero,d)) {
        d.life = 0
        state.hero.vie --;
        state.ennemisTues++
      }
  
    })
  
    state.ennemisVersHero.map((d) => {
      if (collideROC(state.hero,d)) {
        d.life = 0
        state.hero.vie --;
        state.ennemisTues++
      }
    })
  
    state.ennemisSurCote.map((r) => {
      if(collideHeroRect(state.hero,r)){
        r.life = 0;
        state.hero.vie --;
        state.ennemisTues++
      }
      state.tirs.map((p)=> {
        if (collideEnnemieTir(r, p)){
          p.life = 0;
        }
      })
    })
  
  }else{
    if (!state.isBoss){
      state.isBoss = true;
      state.debris = new Array(0)
      state.ennemisQuiTire = new Array(0)
      state.ennemisVersHero = new Array(0)
      state.ennemisSurCote = new Array(0)
      state.ennemisBoss.push({
        coord:{
          x: (window.innerWidth/3) + 50,
          y: 0,
          dx: 0,
          dy: 0
        },
        width: (window.innerWidth/3-100),
        height: 150,
        life: conf.BOSSLIFE +(50 * partie)
      })
    }else {

      if ((delay % 1000) === 0){
        switch (randomInt(3)){
          case 0 :
            delayTir = 100
            break
          case 1 : 
            listePosBombe.push(randomInt(window.innerHeight/2) + window.innerHeight/2)
            state.bombe.push({
              coord:{
                x: randomInt(window.innerWidth/3 - 200) + window.innerWidth/3 + 100,
                y: 100,
                dx: 0,
                dy: 2 
              },
              radius: 25,
              life: 1000,
            })
            break
          case 2 : 
            delayLaser = 100
            state.clign = true
            
        }
      }

      if (delayLaser === 0){
        state.laser.push({
          coord:{
            x: window.innerWidth/3 + 100,
            y: 100,
            dx: 0,
            dy: 0,
          },
          width: (window.innerWidth/3-200),
          height: 0,
          life: 100000,
        })
      }

      if(delayTir === 0 || delayTir === 50 || delayTir === 100){
        const milieu = window.innerWidth/3 + window.innerWidth/6
        const newDx = ((state.hero.coord.x - milieu) /(state.hero.coord.y - 100))
        state.tirsEnnemie.push({
          life: 1,
          coord: {
            x: milieu,
            y: 100,
            dx: newDx*2,
            dy: 2,
          }
        })
      }
     
      state.laser.map((l) => {
        l.height += 2
        if (collideHeroRect(state.hero, l) && invicible <= 0){
          invicible = 100
          state.hero.vie --;
        }
      })

      invicible --;

      state.tirsEnnemie.map((p) => {
        if (collideHeroTir(state.hero, p)){
          p.life = 0;
          state.hero.vie --;
        }
      })
        
      delay ++;
      delayTir --;
      delayLaser --;

      state.ennemisBoss.map((b) => {
        if (collideHeroRect(state.hero, b)){
          state.hero.vie = 0;
        }
        state.tirs.map((t) => {
          if (collideEnnemieTir(b, t)){
            b.life--;
            t.life = 0;
          }
        })
      })
      if (state.ennemisBoss.length === 0 ){
        state.ennemisTues = 0
        state.isBoss = false
        state.hero.vie = conf.PLAYERLIFE
        partie ++
        totalEn *= 2
        state.bombe = new Array(0)
        state.tirsEnnemieRebond = new Array(0)
        state.tirsEnnemie = new Array(0)
        state.laser = new Array(0)

      }
    }

  }

  if(state.hero.vie === 0) {
      state.hero.coord.x =1
      state.endOfGame = true
  }

  state.tirsEnnemieRebond.map((tR) => {
    if (collideHeroTir(state.hero, tR)){
      state.hero.vie --
      tR.life --
    }
    if (collideEnnemieTir(state.ennemisBoss[0], tR)){
      state.ennemisBoss[0].life --;
      tR.life --
    }
  })

  state.bombe.map((b) => {
    if (collideROC(state.hero, b)){
      state.hero.vie -= 2
      b.life = 0
    }

    if (b.coord.y > listePosBombe[state.bombe.indexOf(b)]){
      state.tirsEnnemieRebond.push({
        life: 1,
        invincible: 0,
        coord: {
          x: b.coord.x+5,
          y: b.coord.y+5,
          dx: 1,
          dy: 1,
        }
      })
      state.tirsEnnemieRebond.push({
        life: 1,
        invincible: 0,
        coord: {
          x: b.coord.x-5,
          y: b.coord.y-5,
          dx: -1,
          dy: -1,
        }
      })
      state.tirsEnnemieRebond.push({
        life: 1,
        invincible: 0,
        coord: {
          x: b.coord.x-5,
          y: b.coord.y+5,
          dx: -1,
          dy: 1,
        }
      })
      state.tirsEnnemieRebond.push({
        life: 1,
        invincible: 0,
        coord: {
          x: b.coord.x+5,
          y: b.coord.y-5,
          dx: 1,
          dy: -1,
        }
      })
    }
  })

  state.bombe = state.bombe.filter((b) => b.life > 0 && b.coord.y <= listePosBombe[state.bombe.indexOf(b)])
  
  return {
    ...state,
    tirs: state.tirs.map(iterate(state.size)).filter((p) => p.coord.y > 0 && p.life > 0),
    tirsEnnemie: state.tirsEnnemie.map(iterate(state.size)).filter((p) => p.coord.y > 0 && p.life > 0),
    tirsEnnemieRebond: state.tirsEnnemieRebond.map(iterateRebond()).filter((p) => p.coord.y > 0 && p.life > 0),
    debris: state.debris.map(mouvDebris(state.size)).filter((p) => p.coord.y < window.innerHeight && p.life > 0),
    ennemisQuiTire: state.ennemisQuiTire.map(mouvTirD(state.size)).filter(([_, rect]) => rect.coord.y < window.innerHeight && rect.life > 0),
    ennemisVersHero: state.ennemisVersHero.map(mouvAStar(state.size, state.hero.coord)).filter((p) => p.coord.y < window.innerHeight && p.life > 0),
    ennemisSurCote: state.ennemisSurCote.map(mouvY(state.size)).filter((p) => p.life >0 && (p.coord.x +p.width < conf.BOUNDLEFT || p.coord.x +p.width > conf.BOUNDLEFT) ),
    ennemisBoss: state.ennemisBoss.filter((p) => p.life >0),
    endOfGame: state.endOfGame,
    laser: state.laser.filter((l) => l.height+100 <= window.innerHeight+200),
    bombe: state.bombe.map((b) =>{
      const posLimite = listePosBombe[state.bombe.indexOf(b)]
      listePosBombe.slice(listePosBombe[state.bombe.indexOf(b)])
      return mouvBombe(state, posLimite, b)
    }),
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
            if (ay - stepy - hy > state.limite[0].rightBottom.y){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, y: ay - stepy}}}
            }
            return state;
          case "s":
          case "S":
            if (ay + stepy+ hy< state.limite[3].leftTop.y){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, y: ay + stepy}}}
            }
            return state;
          case "q":
          case "Q":
            if (ax - stepx - hx> state.limite[1].rightBottom.x){
              return {...state, hero:{...state.hero, coord: {...state.hero.coord, x: ax - stepx}}}
            }
            return state;
          case "d":
          case "D":
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
