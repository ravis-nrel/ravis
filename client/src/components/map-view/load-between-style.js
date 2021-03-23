export default {
  getLayerDef(layerId, dataSourceName) {
    return {
      id: layerId,
      type: 'line',
      source: dataSourceName,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': '#dd5d12',
        'line-width': ["case", 
          [">=", ["get", "percentCapacity"], ["literal", .90]], 
          4,
          [">=", ["get", "percentCapacity"], ["literal", .75]], 
          2, 
          0
        ],
        'line-opacity': ["case", 
          [">=", ["get", "percentCapacity"], ["literal", .9]], 
          0.6,
          [">=", ["get", "percentCapacity"], ["literal", .75]], 
          0.3, 
          0
        ],
      }
    };
  }
}
