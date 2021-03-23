export default {
  getLayerDef(layerId, dataSourceName) {
    return {
      id: layerId,
      type: 'circle',
      source: dataSourceName,
      paint: {
        'circle-radius': 7,
        'circle-color': "#FEC841",
        'circle-opacity': ["case", 
          ["==", ["feature-state", "hasAlert"], false], 
          1, 
          0
        ],
      }
    };
  }
}