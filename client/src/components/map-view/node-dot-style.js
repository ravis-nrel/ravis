export default {
  getLayerDef(layerId, dataSourceName) {
    return {
      id: layerId,
      type: 'circle',
      source: dataSourceName,
      paint: {
        'circle-radius': 4,
        'circle-color': "#696866"
      }
    };
  }
}