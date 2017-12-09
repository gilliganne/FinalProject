//	* Geo5408 Group Project 2016
// 	* Matthew Washburn, Saeideh Gharehchahi, Kevin Schilly, Laura Brown

//Initiate and load modules
require([         
	"esri/map", 
	"esri/layers/FeatureLayer",
	"esri/dijit/InfoWindowLite",
	"esri/InfoTemplate",
	"esri/dijit/BasemapGallery",
	"esri/dijit/Legend",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
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
		Query,
		QueryTask,
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
        center: [-103.20, 29.50],
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
      var template = new InfoTemplate();
      template.setTitle("<b>${TRLNAME}</br>");
      template.setContent("${TRLNAME} is ${Miles} long.");
      var featureLayer = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/BIBE_Trails/FeatureServer/0",
      {
      mode: FeatureLayer.MODE_ONDEMAND,
      infoTemplate: template,
      outFields: ["TRLNAME", "Miles"]                   
		        });
      
    map.addLayer(featureLayer);
                    
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
