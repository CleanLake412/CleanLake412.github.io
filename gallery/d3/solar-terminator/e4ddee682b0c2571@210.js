// https://observablehq.com/@mbostock/solar-terminator@210
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Solar Terminator

It is currently night in the blue region.`
)});
  main.variable(observer("map")).define("map", ["DOM","width","height","d3","projection","graticule","land","night","sphere"], function(DOM,width,height,d3,projection,graticule,land,night,sphere)
{
  const context = DOM.context2d(width, height);
  const path = d3.geoPath(projection, context);
  context.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
  context.beginPath(), path(land), context.fillStyle = "#000", context.fill();
  context.beginPath(), path(night), context.fillStyle = "rgba(0,0,255,0.3)", context.fill();
  context.beginPath(), path(sphere), context.strokeStyle = "#000", context.stroke();
  return context.canvas;
}
);
  main.variable(observer("height")).define("height", ["d3","projection","width","sphere"], function(d3,projection,width,sphere)
{
  const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, sphere)).bounds(sphere);
  const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
  return dy;
}
);
  main.variable(observer("projection")).define("projection", ["d3"], function(d3){return(
d3.geoNaturalEarth1()
)});
  main.variable(observer("sun")).define("sun", ["solar"], function(solar)
{
  const now = new Date;
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = solar.century(now);
  const longitude = (day - now) / 864e5 * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
}
);
  main.variable(observer("night")).define("night", ["d3","antipode","sun"], function(d3,antipode,sun){return(
d3.geoCircle()
    .radius(90)
    .center(antipode(sun))
  ()
)});
  main.variable(observer("antipode")).define("antipode", function(){return(
([longitude, latitude]) => [longitude + 180, -latitude]
)});
  main.variable(observer("sphere")).define("sphere", function(){return(
{type: "Sphere"}
)});
  main.variable(observer("graticule")).define("graticule", ["d3"], function(d3){return(
d3.geoGraticule10()
)});
  main.variable(observer("land")).define("land", ["topojson","world"], function(topojson,world){return(
topojson.feature(world, world.objects.land)
)});
  main.variable(observer("world")).define("world", function(){return(
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json").then(response => response.json())
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3-geo@1")
)});
  main.variable(observer("solar")).define("solar", ["require"], function(require){return(
require("solar-calculator@0.3/dist/solar-calculator.min.js")
)});
  return main;
}
