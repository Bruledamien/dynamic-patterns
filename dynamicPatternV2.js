/* ---------------------------------------------------------------------------*/
// setup the canvas (dimensions, color)
const width = 1200;
const height = 1200;
var canvas = SVG('drawing').size(width, height);
// careful : some stitches are positioned to the back (i.e behind the canvas).
// Opacity of canvas should not be 1.
canvas.rect(width, height).fill({ color: 'red', opacity: 0 }).stroke({ color: 'black', width: 5 });

//SVGpathArray = SVG.pathArray()
var pathString = 'M0 0 H50 A20 20 0 1 0 100 50 v25 C50 125 0 85 0 85 z';
var pathString = "M 100 100 L 300 100 L 200 300 z"
var pathString = "M 24 58 L48 50 L54 14 L22 6 L26 26 L2 34 Z"
 var pathString = "M 100,100 L150,100 a50,25 0 0,0 150,100 q50,-50 70,-170 Z" //NO
// example: convex
var pathString = "M1,410.783346 C1,410.783346 367.927991,-268.832584 690.790889,122.379343 C1013.65379,513.591271 1181.86718,1000.99997 701.429412,1001 q-250,0 -500,-150 Q0,700 1,410.783346 Z"
// example: concave
var pathString = "M534.014412,494.680881 C326.331277,308.203524 1,363.849357 1,363.849357 C1,363.849357 372.038777,368.406101 575.846365,249.559994 C709.326852,171.723656 647.149274,-114.620488 794.047554,52.5114874 C880.564235,150.944932 575.763914,321.305039 635.771341,423.044204 C725.233931,574.722915 865.834593,300.542794 942.264223,400.520234 C1034.51979,521.199548 1037.9573,1000.99998 806.278585,1001 C598.123901,1001.00001 659.610219,607.452552 534.014412,494.680881 Z"


var path = canvas.path(pathString)
//path.move(20, 20)
path.stroke({ color: 'red', width: 1, linecap: 'round', linejoin: 'round' })
path.fill('none')

b = path.bbox()
//canvas.rect(b.width, b.height).addClass('box').move(b.x, b.y).fill('none').stroke({ color: 'blue', width: 1, linecap: 'round', linejoin: 'round' })

var density = 35;

stitchMaxHeight = 25;
function randomIn(min, max) {
  return Math.random() * (max - min) + min;
}

function drawStich(x1, y1, color) {
  var x1 = x1 + randomIn(-5, 5)
  var y1 = y1 + randomIn(-5, 5)
  var x2 = x1 + randomIn(-2, 2)
  var y2 = y1 + randomIn(10, 17);
  stitch = canvas.line(x1, y1, x2, y2).stroke({ color: color, width: 4, linecap: 'round', linejoin: 'round' });
  return [x1, y1, x2, y2];
}

for (var i=0; i < width / density; i++) {
  for (var j=0; j < height / stitchMaxHeight; j++) {
    coords = [i * density, j * stitchMaxHeight]
    inside = isInside(coords, pathString) || isInside(coords, pathString)
    if (!inside) {
      drawStich(coords[0], coords[1], 'grey');
    }
  }
}

density2 = 15
for (var i=0; i < b.width / density2; i++) {
  for (var j=0; j < b.height / stitchMaxHeight; j++) {
    coords = [b.x + i * density2, b.y + j * stitchMaxHeight]
    inside = isInside(coords, pathString) || isInside(coords, pathString)
    if (inside) {
      drawStich(coords[0], coords[1], 'darkgrey');
    }
  }
}

//var point = [50, 50]
// var testpathstr = "M10 10 H 90 V 90 H 10 L 10 10"
// var testpath = canvas.path(testpathstr).stroke({ color: 'green', width: 2, linecap: 'round', linejoin: 'round' })
// var dot = canvas.circle(10).fill('#f06').move(50, 50)

// console.log(isInside(point,testpathstr))

console.log(isInside);
//console.log(SVGpathArray)
//console.log(SVGpathArray.bbox())
