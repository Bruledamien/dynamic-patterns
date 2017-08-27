/* ---------------------------------------------------------------------------*/
// setup the canvas (dimensions, color)
const width = 600;
const height = 650;
const strokewidth = 8;
var canvas = SVG('drawing').size(width, height);
canvas.rect(width, height).stroke({width: 3, color :'blue'}).opacity(0.2);

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
    if (array.unshift(el) > 5000) {
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

let rdir = -1;
function rtransform(x, y, type) {
  if (type) {
    // type 1
    const rangle = 30 + Math.random() * 315
    let rlength = 16 + 14 * Math.random();
    // if previous stitch was upwards, go in opposite direction THEN rotate.
    return rotate(x, y, x, y - rdir * 20, rangle);
  } else {
    // type 0
    rdir = Math.random() > 1/2 ? 1 : - 1;
    let rlength = 10 + 14 * Math.random();
    return [x, y - rdir * rlength];
  }
}

/* ---------------------------------------------------------------------------*/
//
const stitchParams = [
  { width: strokewidth, color: '#00160d', opacity: 0.9, linecap: 'round' }, // type 0 stitch
  { width: strokewidth, color: '#c6bf00', opacity: 0.5, linecap: 'round' } // type 1 stitch
];

let type = 0;
const animationDuration = 60000; // (1 frame lasts 60 seconds)
function drawStich(x1, y1) {
  // draws stitch of type 0 or 1 beginning at position x1, y1
  loopBreaker = 50; // max number of tries before deciding path is blocked
  counter = 0;
  do {
    counter++;
    [x2, y2] = rtransform(x1, y1, type);
    // if stitch is surrounded by other stitches it will loop forever hence the loopBreaker
    if (counter > loopBreaker
      // we also want to limit maximum positions of stitches.
      || x2 < -0.5*width || width*1.5 < x2 || y2 < -height || 2*height < y2 ) {
      // no drawing and reinit x2, y2 starting point for next stitch
      return [x1, y1, Math.random() * width, Math.random() * height - height];
    }
  } while (crossing(x1, y1, x2, y2, memory));
  // issue : pattern can be lower than height and it sticks at the end of animation.
  // Should be condition based (animate till out of frame then remove)
  stitch = canvas.line(x1, y1, x2, y2).stroke(stitchParams[type]);
  stitch.animate(animationDuration).dy(2*height);
  type === 1 && stitch.back(); // put type 1 stitches below type 0.
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

const drawingSpeed = 1 // (in milliseconds; 1 second = 1000)
const loopId = setInterval(drawStitches, drawingSpeed);
