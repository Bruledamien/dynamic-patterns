// PARAMS : définition des couleurs
var colors = {
  ultraMarine: "rgba(19,37,60,0.8)",
  vert: "rgba(56,78,60, 0.8)",
  rosePoudre: "rgba(243,218,206,0.8)",
  justeBleu: "rgba(13,29,236,0.8)",
  corail: "rgba(241,88,65,0.8)",
  soleilHiver: "rgba(255,248,160,0.8)"
};

var backgroundColors = {
  blanc: "rgba(255,255,255,0.9)",
  gris: "rgba(205,205,205,0.9)",
  noir: "rgba(0,0,0,0.9)"
}


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


// SITES
var calc = function(val) {
  return Math.sqrt((1.001 - val/100)) * Math.sqrt(width * height);
}

var minZones = 1;
var maxZones = 100;
var sitesAll = d3.range(calc(minZones)).map(
  function(d) { return [Math.random() * width, Math.random() * height]; }
);

var sites = sitesAll.slice(0, this.tailleZones);

var dynamicPattern = function(sites) {

  var site = svg.append("g")
      .attr("class", "sites")
    .selectAll("circle")
    .data(sites)

  site.enter().append("circle")
      .call(redrawSite);

  site.exit().remove()

  function redrawSite(site) {
    site
        .attr("cx", function(d) { return d[0]; })
        .attr("cy", function(d) { return d[1]; });
  }

  // VORONOI POLYGONS

  var voronoi = d3.voronoi()
      .extent([[-1, -1], [width + 1, height + 1]]);

  var polygonData = voronoi.polygons(sites)

  var polygon = svg.append("g")
      .attr("class", "polygons")
    .selectAll("path")
    .data(polygonData)

  polygon.exit().remove()

  polygonEnter = polygon.enter().append("path")
      .call(redrawPolygon);

  function redrawPolygon(polygon) {
    polygon.attr("d", function(d) {
      return d ? "M" + d.join("L") + "Z" : null;
    });
    polygon.attr("density", function(d) { return randomDensity() })
  }


  // LINES (STITCH FILLING)

  var frontData = [], backData =[];

  computeStitchData(polygonEnter);

  d3.select("g.stitchb").remove()

  var stitchb = svg.append("g")
      .attr("class", "stitchb")
    .selectAll("line")
    .data(backData)
    .enter().append("line")
      .call(redrawLine);

  d3.select("g.stitchf").remove()

  var stitchf = svg.append("g")
      .attr("class", "stitchf")
    .selectAll("line")
    .data(frontData)
    .enter().append("line")
      .call(redrawLine);

  function redrawLine(line) {
    line.attr("x1", function(d) { return d[0]; })
        .attr("y1", function(d) { return d[1]; })
        .attr("x2", function(d) { return d[2]; })
        .attr("y2", function(d) { return d[3]; });
  }

  // STITCH COMPUTATION

  function computeStitchData(poly) {
    poly.each(
      function(d, i) {
        fillPolygon(this);
      }
    )
  }

  function fillPolygon(path) {

    var bbox = path.getBBox();
    var pathString = d3.select(path).attr("d");
    var density = d3.select(path).attr("density");
    var spacing = 1./density;
    var lineHeight = spacing * 2;

    function addStitchF(x1, y1) {
      var x1 = x1 + randomIn(-spacing/3, spacing/3)
      //var x1 = x1 + randomIn(-1, 1)
      var x2 = x1 + randomIn(-1, 1)
      var y1 = y1 + randomIn(- lineHeight/5, lineHeight/5)
      var y2 = y1 + randomIn(10, 15);
      newline = [x1, y1, x2, y2]
      frontData.push(newline)
      return newline;
    }

    function doStuff(i, j) {
      coords = [bbox.x + i * spacing, bbox.y + j * lineHeight]
      inside = isInside(coords, pathString)
      if (inside) {
        [X2, Y2, Z1, Z2] = addStitchF(coords[0], coords[1]);
        if (typeof X1 != "undefined" && spacing < 30) {
          backData.push([X1,Y1,X2,Y2]);
        }
        X1 = Z1, Y1 = Z2;
      }
    }

    function stichLeftRight(y1) {
      for (var i=0; i < bbox.width / spacing; i++){
        doStuff(i, j);
      }
      return [X1, Y1, X2, Y2]
    }

    function stitchRightLeft(y1) {
      for (var i=Math.floor(bbox.width / spacing); i > 0  ; i--){
        doStuff(i, j);
      }
      return [X1, Y1, X2, Y2]
    }

    let X1, Y1, X2, Y2;
    for (var j=0; j < bbox.height / lineHeight; j++) {
       if (j % 2 == 0 ) {
         stitchRightLeft(j);
       } else {
         stichLeftRight(j);
       }
    }
  }

  // HELPERS

  function randomDensity() {
    // PARAMS : densité
    densities = [0.00001, 0.00001, 0.00001, 0.00001, 0.02, 0.02, 0.05, 0.1, 0.1, 0.125]
    return densities[Math.floor(Math.random() * densities.length)];
  }

  function randomIn(min, max) {
    return Math.random() * (max - min) + min;
  }
}

var paramsObj = function() {
  // PARAMS: valeurs par défaut
  this.tailleZones = 5;
  this.filRecto = colors["rosePoudre"];
  this.filVerso = colors["justeBleu"];
  this.backGround = backgroundColors["noir"];
}

window.onload = function() {

  dynamicPattern(sites);
  var params = new paramsObj();
  var gui = new dat.GUI();
  var sitesCtrl = gui.add(params, 'tailleZones', minZones, maxZones);
  var rectoCtrl = gui.add(params, 'filRecto', colors);
  var versoCtrl = gui.add(params, 'filVerso', colors);
  var backgroundCtrl = gui.add(params, 'backGround', backgroundColors);


  sitesCtrl.onChange(function(value) {
    var sites = sitesAll.slice(0, calc(value));
    dynamicPattern(sites);
  });

  rectoCtrl.onChange(function(value) {
    d3.select("g.stitchf")
      .selectAll("line")
      .attr('stroke', function(d) { return value; });
  });
  versoCtrl.onChange(function(value) {
    d3.select("g.stitchb")
      .selectAll("line")
      .attr('stroke', function(d) { return value; });
  });
  backgroundCtrl.onChange(function(value) {
    d3.select("svg")
      .attr("style", function(d) {
        return "background: " + value;
      });
  });
};
