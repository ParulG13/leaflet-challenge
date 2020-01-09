// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicUrl="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  // Define streetmap and darkmap layers
  var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [graymap, satellitemap, outdoors]
  });
  graymap.addTo(myMap);
  
  var tectonicplates = new L.LayerGroup();
  var earthquakes = new L.LayerGroup();
  
  var baseMaps = {
    Satellite: satellitemap,
    Grayscale: graymap,
    Outdoors: outdoors
  };

  var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
  };

  L
  .control
  .layers(baseMaps, overlays)
  .addTo(myMap);

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  // createFeatures(data.features);
  console.log(data.features)
  
  function style(feature){
    return{
      opacity: 1,
      fillOpacity: 1,
      fillColor: color(feature.properties.mag),
      color: "#000000",
      radius: radius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    }
  }
    function color(magnitude){
      switch (true) {
        case magnitude > 5:
          return "brown";
        case magnitude > 4:
          return "red";
        case magnitude > 3:
          return "orange";
        case magnitude > 2:
          return "yellow";
        case magnitude > 1:
          return "green";
        default:
          return "lightgreen";
        }
      }
    function radius(magnitude){
      if (magnitude == 0){
        return 1;
      }
      return magnitude * 4;
    }


    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: style,
      onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
      }
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);

    var legend = L.control({
      position: "bottomright"
    });
  
    // Then add all the details for the legend
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
  
      var grades = [0, 1, 2, 3, 4, 5];
      var colors = [
        "lightgreen",
        "green",
        "yellow",
        "orange",
        "red",
        "brown"
      ];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };
  
  legend.addTo(myMap);


d3.json(tectonicUrl, function(data){
  console.log(data);
  L.geoJson(data, {
    color: "orange",
    weight: 2
  })
  .addTo(tectonicplates);

  // Then add the tectonicplates layer to the map.
  tectonicplates.addTo(myMap);
  });

});