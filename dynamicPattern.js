/* ---------------------------------------------------------------------------*/
// setup the canvas (dimensions, color)
const width = 600;
const height = 600;
const strokewidth = 4;
var draw = SVG('drawing').size(width, height);
draw.rect(width, height).fill('blue').opacity(0.3);

/* ---------------------------------------------------------------------------*/
// functions with explicit names that do simple math in a complicated language.
// you only need to understand what goes in and what goes out.
/* ---------------------------------------------------------------------------*/

function intersects(a,b,c,d, p,q,r,s) {
  // returns true if and only if the line described by points
  // (a,b)--(c,d) and the line (p,q)--(r,s) intersect.
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

function crossing(x1, y1, x2, y2, memory) {
  // returns true if the line (x1,y1)--(x2,y2) intersects a line saved in memory
  for (i=0; i<memory.length; i++) {
      if (intersects(x1, y1, x2, y2, ...memory[i])){
        return true;
      }
  }
  return false;
}

function unshiftpop(el, array) {
  // adds element "el" to list "array" and deletes an element if array is too big
    if (array.unshift(el) > 1000) {
      array.pop();
    }
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function rtransform(x, y, type) {
  console.log('type', type, x ,y);
  if (type) {
    const rdir = Math.random() > 1/2 ? 1 : - 1;
    const rlength = 14 + 8 * Math.random();
    return [x, y + rdir * rlength];
  } else {
    const rangle = 30 + Math.random() * 315 ;
    return rotate(x, y, x, y - 20, rangle);
  }
}

/* ---------------------------------------------------------------------------*/
//
const stitchParams = [
  { width: strokewidth, color: 'red', opacity: 0.7, linecap: 'round' }, // type 0 stitch
  { width: strokewidth, color: 'grey', opacity: 0.3, linecap: 'round' } // type 1 stitch
];

let type = 0;
function drawStich(x1, y1) {
  // draws stitch of type 0 or 1 beginning at position x1, y1
  loopBreaker = 50; // max number of tries before deciding path is blocked
  counter = 0;
  do {
    counter++;
    if (counter > loopBreaker) {
      console.log('');
      // no draing and reinit x2, y2 starting point for next stitch
      return [x1, y1, Math.random() * width, Math.random() * height];
    }
    [x2, y2] = rtransform(x1, y1, type);
  } while (crossing(x1, y1, x2, y2, memory));
  stitch = draw.line(x1, y1, x2, y2).stroke(stitchParams[type]);
  type = type ^ 1;
  // returns position of stitch
  return [x1, y1, x2, y2];
}

/* ---------------------------------------------------------------------------*/
// Where the drawing action really happens :

let x2 = width/2;
let y2 = height/2;
const memory = [];

nbOfStitches = 0;
maxNbOfStitches = 5000;

const drawStitches = () => {
  nbOfStitches++;
  if (nbOfStitches > maxNbOfStitches) {
    clearInterval(loopId);
  }
  let stitch = drawStich(x2, y2);
  unshiftpop(stitch, memory);
  [x1, y1, x2, y2] = stitch;
}

const loopId = setInterval(drawStitches, 100);
