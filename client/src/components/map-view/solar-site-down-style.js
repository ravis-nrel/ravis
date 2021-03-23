export default {
  getLayerDef(layerId, dataSourceName) {
    return {
      id: layerId,
      type: 'symbol',
      source: dataSourceName,
      layout: {
        "icon-image": "triangle",
        "icon-size": .3,
        "icon-allow-overlap": true,
        visibility: "visible"
      },
      paint: {
        "icon-opacity": ["case", 
          ["==", ["feature-state", "rampDirection"], ["literal", "down"]], 
          1, 
          0
        ],
        "icon-translate": [0,1]
      }
    };
  }
}
