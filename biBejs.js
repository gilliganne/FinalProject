

//	* Geo4422/5408 Big Bend Webmapping Project 2017
// 	* Kenneth Gustafson, Benjamin Griffith, Anne Gilligan, Kelly Baker, Timmy Szpakowski

//Initiate and load modules
require([         
	"esri/map", 
	"esri/layers/FeatureLayer",
	"esri/dijit/Search",
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
		Search,
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
        center: [-103.20, 29.5],
        zoom: 10
      });
      
      //Search Trails Feature
      var search = new Search({
      	sources: [{
      		featureLayer: new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/BIBE_Trails/FeatureServer/0", {
      			outFields: ["x"],
      			infoTemplate: new InfoTemplate("Trail Name", "Trail Name: ${TRLNAME} </br>Miles: ${Miles}</br>")
      		}),
      		outFields: ["TRLNAME","Miles"],
      		displayField: "TRLNAME",
      		suggestionTemplate: "${TRLNAME}: ${MILES}",
      		names: "Trail Names",
      		placeholder: "Enter Trail Name",
      		enableSuggestions: true
      	}],
      	map:map
      }, "search");
      search.startup();
      
      //Basemap Gallery 
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
      trailsInfo.setTitle("<b>${TRLNAME} Trail</b>");
      trailsInfo.setContent("<b>${TRLNAME} Trail <br><br></b> <b>Distance:</b> ${Miles} miles <br> <b>Development:</b> ${TRLCLASS} <br> <b>Average Slope:</b> ${Avg_Slope} <br> <b>Maximum Slope:</b> ${Max_Slope}");
      var trailsFeat = new FeatureLayer("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/BIBE_Trails/FeatureServer/0",
      {
      mode: FeatureLayer.MODE_ONDEMAND,
      infoTemplate: trailsInfo,
      outFields: ["TRLNAME", "Miles", "TRLCLASS", "Avg_Slope", "Max_Slope"]                   
		        });

//add trails to map
	map.addLayer(trailsFeat);

//create campsites infoTemplate

	var campInfo = new InfoTemplate();
	campInfo.setTitle("<b>${Descript}</b>");
	campInfo.setContent("<b>${Descript}</b> <br><br><b>Type:</b> ${FeatType}");
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
	visitorInfo.setContent("<b>${NAME1_} Visitor Center</b><br> <br>Travel to one of the Visitor Centers to pay park entrance fees. Backcountry and river permits are also issued here. Additionally, Visitor Centers are a good place to gather extra information on the park, seek advice from one of the Park Rangers, or browse the gift shop!");
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
	roadsInfo.setContent("<b>${RDNAME}</b> <br><br> <b>Surface Type:</b> ${RDSURFACE}");
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
		   //allows selected features to be input into elevation profile    
			trailsFeat.on("click", function(evt){
	                   var geo = evt.graphic.geometry;
				console.log(geo);
				epWidget.set("measureUnits", "MILES");
				epWidget.set("profileGeometry", geo);
			
			});		
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
                                        
                        scalebarUnits: Units.MILES
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
             });
