mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'cluster-map',
	style: 'mapbox://styles/mapbox/light-v10',
	center: [-103.59179687498357, 40.66995747013945], // us
	// center: [30.802498, 26.820553], // Egypt
	zoom: 4,
});
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
	map.addSource('campgrounds', {
		type: 'geojson',

		data: campgrounds,
		cluster: true,
		clusterMaxZoom: 14,
		clusterRadius: 50,
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': [
				'step',
				['get', 'point_count'],
				'#f38181',
				10,
				'#d69',
				30,
				'#b83b5e',
			],
			'circle-radius': ['step', ['get', 'point_count'], 15, 10, 25, 30, 35],
		},
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12,
		},
	});

	map.addLayer({
		id: 'unclustered-point',
		type: 'circle',
		source: 'campgrounds',
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-color': '#f08a5d',
			'circle-radius': 6,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff',
		},
	});

	map.on('click', 'clusters', e => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters'],
		});
		const clusterId = features[0].properties.cluster_id;
		map
			.getSource('campgrounds')
			.getClusterExpansionZoom(clusterId, (err, zoom) => {
				if (err) return;

				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom,
				});
			});
	});

	map.on('click', 'unclustered-point', e => {
		const { popUpMarkup } = e.features[0].properties;
		const coordinates = e.features[0].geometry.coordinates.slice();

		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(`${popUpMarkup}`)
			.addTo(map);
	});

	map.on('mouseenter', 'clusters', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'clusters', () => {
		map.getCanvas().style.cursor = '';
	});
});
