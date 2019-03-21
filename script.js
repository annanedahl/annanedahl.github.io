(function() {
/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
if (window.navigator.userAgent.indexOf('Chrome') > -1) {
    let originalInitTile = L.GridLayer.prototype._initTile;
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();

            tile.style.width = tileSize.x + 1 + 'px';
            tile.style.height = tileSize.y + 1 + 'px';
        }
    });
}

var token = "e66bfbb40256177e56f7a5b64b14f73b";
var attribution = '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';

// Make the map object using the custom projection
//proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
var crs = new L.Proj.CRS('EPSG:25832',
'+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', {
    resolutions: [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,0.8,0.4,0.2],
    origin: [120000,6500000],
    bounds: L.bounds([120000, 5661139.2],[1378291.2, 6500000])
});

window.addEventListener("load", () => {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(position => {
			console.log(position);
			//mymap.panTo(L.latLng(position.coords.latitude, position.coords.longitude));
		});
    }
	var mymap = L.map("map", {
        crs: crs,
        continuousWorld: true,
        center: [55.7, 12.6], // Set center location
        zoom: 9, // Set zoom level
        minzoom: 0,
        maxzoom: 13
    });

    var ortofotowmts = L.tileLayer('https://services.kortforsyningen.dk/orto_foraar?token=' + token + '&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
		minZoom: 0,
        maxZoom: 13,
        attribution: attribution,
        crossOrigin: true,
        zoom: function () {
            var zoomlevel = mymap._animateToZoom ? mymap._animateToZoom : mymap.getZoom();
            if (zoomlevel < 10)
                return 'L0' + zoomlevel;
            else
                return 'L' + zoomlevel;
        }
	}).addTo(mymap);

    // Skærmkort [WMTS:topo_skaermkort]
    var toposkaermkortwmts = L.tileLayer.wms('https://services.kortforsyningen.dk/topo_skaermkort', {
        layers: 'dtk_skaermkort',
        token: token,
        format: 'image/png',
        attribution: attribution
	});

	// Hillshade overlay [WMS:dhm]
	var hillshade = L.tileLayer.wms('https://services.kortforsyningen.dk/dhm', {
		transparent: true,
		layers: 'dhm_terraen_skyggekort_transparent_overdrevet',
		token: token,
		format: 'image/png',
		attribution: attribution,
		continuousWorld: true,
	});

	// Define layer groups for layer control
    var baseLayers = {
        "Ortofoto WMTS": ortofotowmts,
        "Skærmkort WMTS": toposkaermkortwmts
    };
    var overlays = {
		"Hillshade": hillshade
    };

    // Add layer control to map
    L.control.layers(baseLayers, overlays).addTo(mymap);

    // Add scale line to map
	L.control.scale({imperial: false}).addTo(mymap); // disable feet units

	mymap.locate({
		setView: true,
		maxZoom: 16,
		enableHighAccuracy: true
	});

	let marker = L.circle(L.latLng(55.7, 12.6), 10).addTo(mymap);

	function onLocationFound(e) {
		console.log(e.latlng);
	    var radius = e.accuracy / 2;
		marker.setLatLng(e.latlng);
	}
	mymap.on('locationfound', onLocationFound);

	function onLocationError(e) {
	    console.error(e.message);
	}
	mymap.on('locationerror', onLocationError);
});

})();
//mapbox token
// pk.eyJ1Ijoib2theXNwaXNlc3RlZGVyIiwiYSI6ImNqdGllbzJrNjE2czM0YXJyYm1xenFqazAifQ.W7Y82UOH7lE9rjxwD96d7A
