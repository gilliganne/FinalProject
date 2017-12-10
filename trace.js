require([
 "esri/map",
 "esri/layers/FeatureLayer",
"esri/units",
"esri/dijit/ElevationProfile",
"esri/Color",
"dojo/dom", 
"dojo/on",     
"dojo/domReady!"

  ],
  function(
    Map,
    FeatureLayer,
Units,
ElevationsProfileWidget,
Color, 
dom, 
on
  ) {
     
      var epWidget;
      var map = new Map("map", {
      basemap: "topo",
      center: [-103.20, 29.32],
      zoom: 12
    });

    var featureLayer = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/BIBE_Trails/FeatureServer/0");
    map.addLayer(featureLayer);
                map.on("load", init);

                function init() {

featureLayer.on("click", function(evt){
                   var geo = evt.graphic.geometry;
console.log(geo);
epWidget.set("measureUnits", "MILES");
epWidget.set("profileGeometry", geo);
 
});

                    var chartOptions = {
                        titleFontColor: "#ffffff",
                        axisFontColor: "#ffffff",
                        sourceTextColor: "white",
                        busyIndicatorBackgroundColor: "#666"
                    };             

                    var profileParams = {
                        map: map,
                        chartOptions: chartOptions,
                        profileTaskUrl: "https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer",
                        scalebarUnits: Units.MILES
                    };

                    epWidget = new ElevationsProfileWidget(profileParams, dom.byId("profileChartNode"));
                    epWidget.startup();

                }
            })
