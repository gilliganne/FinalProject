//	* Geo4422/5408 Big Bend Webmapping Project 2017
// 	* Kenneth Gustafson, Benjamin Griffith, Anne , Kelly, Timmy 

//Initiate and load modules
require([         
	"esri/map", 
	"esri/layers/FeatureLayer",
	"esri/dijit/InfoWindowLite",
	"esri/InfoTemplate",
	"esri/dijit/BasemapGallery",
	"esri/dijit/Legend",
	"esri/toolbars/draw",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/CartographicLineSymbol",
	"esri/graphic", 
	"esri/units",
	"esri/dijit/ElevationProfile",
	"esri/Color",
	"dojo/dom",
	"dojo/dom-construct", 
	"dojo/on", 
	"dojo/domReady!"
	], function(
		Map, 
		FeatureLayer,
		InfoWindowLite,
		InfoTemplate,
		BasemapGallery,
		Legend,
		Draw,
		SimpleLineSymbol,
		CartographicLineSymbol,
		Graphic, 
		Units,
		ElevationsProfileWidget,
		Color, 
		dom,
		domConstruct, 
		on
	){                

		//Define elevation profile tool variables               
       var tb, epWidget, lineSymbol;
                
                //Initiate Map 
         var map = new Map("map", {
        basemap: "topo",
        center: [-103.20, 29.32],
        zoom: 10
      });
         var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: true,
        map: map
      }, "basemapGallery");
      basemapGallery.startup();
      
      basemapGallery.on("error", function(msg) {
        console.log("basemap gallery error:  ", msg);
      });
     
    var legend = new Legend({
      map: map,
         }, "legendDiv");
legend.startup(); 


//create trails infotemplate
      var trailsInfo = new InfoTemplate();
      trailsInfo.setTitle("<b>${TRLNAME}</b>");
      trailsInfo.setContent("${TRLNAME} is ${Miles} miles long.");
      var trailsFeat = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/BIBE_Trails/FeatureServer/0",
      {
      mode: FeatureLayer.MODE_ONDEMAND,
      infoTemplate: trailsInfo,
      outFields: ["TRLNAME", "Miles"]                   
		        });

//add trails to map
	map.addLayer(trailsFeat);

//create campsites infoTemplate

	var campInfo = new InfoTemplate();
	campInfo.setTitle("<b>${Descript}</b>");
	campInfo.setContent("Type: ${FeatType}");
	var campFeat = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/BIBE_Primitive_Campsite/FeatureServer/0",
	{
	mode: FeatureLayer.MODE_ONDEMAND,
	infoTemplate: campInfo,
	outFields: ["Descript", "FeatType"]
			});
//add visitor centers to map
	map.addLayer(campFeat);

//create visitor centers infoTemplate

	var visitorInfo = new InfoTemplate();
	visitorInfo.setTitle("<b>${NAME1_} Visitor Center</b>");
	visitorInfo.setContent("Travel to one of the Visitor Centers to pay park entrance fees. Backcountry and river permits are also issued here. Additionally, Visitor Centers are a good place to gather extra information on the park, seek advice from one of the Park Rangers, or browse the gift shop!");
	var visitorFeat = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/BIBE_Visitor_Centers/FeatureServer/0",
         {
	mode: FeatureLayer.MODE_ONDEMAND,
	infoTemplate: visitorInfo,
	outFields: ["NAME1_"]
		});
//add visitor center layer to map
	map.addLayer(visitorFeat);

//create roads infoTemplate
	var roadsInfo = new InfoTemplate();
	roadsInfo.setTitle("<b>${RDNAME}</b>");
	roadsInfo.setContent("Surface Type: ${RDSURFACE}");
	var roadsFeat = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/BIBE_Roads/FeatureServer/0",
	{
	mode: FeatureLayer.MODE_ONDEMAND,
	infoTemplate: roadsInfo,
	outFields: ["RDNAME","RDSURFACE"]
});
	//add roads layer to map
	map.addLayer(roadsFeat);
	
    
                //Event handler to initialize elevation profile when map loads
                map.on("load", init);            
              
                //Initiate elevation profile tool
                function init() {
                    
                    //Creates drawing method variable/function
                    var eleList = ["Polyline", "FreehandPolyline"];
                    for (var ele in eleList) {
                        on(dom.byId(eleList[ele]), "click", function (evt) {
                            initToolbar(evt.target.id.toLowerCase());
                        });
                    }
					
					//Creates selection of units variable/function
                    on(dom.byId("unitsSelect"), "change", function (evt) {
                        if (epWidget) {
                            epWidget.set("measureUnits", evt.target.options[evt.target.selectedIndex].value);
                        }                        
                    });

                    //LineSymbol used for freehand polyline and line.
                    lineSymbol = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color([179, 0, 179]), 2,
                        CartographicLineSymbol.CAP_ROUND,
                        CartographicLineSymbol.JOIN_MITER, 2
                    );       
					
					//Define visual parameters for profile graph
                    var chartOptions = {
                        titleFontColor: "black",
                        axisFontColor: "black",
                        sourceTextColor: "black",
                        busyIndicatorBackgroundColor: "#666"
                    };             

					//Parameters for elevation profile graph
                    var profileParams = {
                        map: map,
                        chartOptions: chartOptions,
                        profileTaskUrl: "http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute",
                                        
                        scalebarUnits: Units.KILOMETERS
                    };
					
					//Initialize elevation profile widget
                    epWidget = new ElevationsProfileWidget(profileParams, dom.byId("profileChartNode"));
                    epWidget.startup();
                }
				
				//Initialize toolbar/drawing parameters
                function initToolbar(toolName) {
                    epWidget.clearProfile();
                    map.graphics.clear();
                    tb = new Draw(map);
                    tb.on("draw-end", addGraphic);
                    tb.activate(toolName);
                    map.disableMapNavigation();
                }
				
				//Initialize and draw elevation profile graph
                function addGraphic(evt) {
                    //Deactivate the toolbar and clear existing graphics
                    tb.deactivate();
                    map.enableMapNavigation();
                    var symbol = lineSymbol;
                    map.graphics.add(new Graphic(evt.geometry, symbol));
                    epWidget.set("profileGeometry", evt.geometry);
                    var sel = dom.byId("unitsSelect");
                    if (sel) {
                        var val = sel.options[sel.selectedIndex].value;
                        epWidget.set("measureUnits", val);
                    }
                }
               
             });
