class AlertService {

  constructor() {
    this._data = [];
  }

  detectRampsInForecast(forecast, threshold) {
    let alerts = [],
        data = forecast.data.medianData;
        
    data.forEach((d, i) => {
      if(i > 0) {
        const prev = data[i-1],
              diff = d.value - prev.value;
              
        if(Math.abs(diff) >= threshold) {
          alerts.push({
            type: 'ramp',
            direction: diff>0 ? 'up' : 'down',
            start: prev.timestamp,
            end: d.timestamp,
            diff: diff,
            scale: Math.abs(diff)/threshold
          })
        }
      } 
    });
    
    return alerts;
  }
}

const instance = new AlertService();
Object.freeze(instance)

export default instance;
