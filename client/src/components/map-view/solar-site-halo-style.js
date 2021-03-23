export default {
  getLayerDef(layerId, dataSourceName) {
    return {
      id: layerId,
      type: 'circle',
      source: dataSourceName,
      paint: {
        'circle-radius': ['*', ['literal', 20], ['feature-state', 'alertScale']],
        'circle-opacity': 0,
        'circle-stroke-color': '#FEC841',
        'circle-stroke-width': ['*', ['literal', 3], ['feature-state', 'alertScale']],
        'circle-stroke-opacity': ["case", 
          ["==", ["feature-state", "hasAlert"], true], 
          1, 
          0
        ]
      },
      layout: {
        visibility: "visible"
      }
    };
  }
}
