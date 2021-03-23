import React, { Component } from 'react';
import './Event-outlook.scss';
import TimeSlider from '../time-slider/Time-slider';

class EventOutlook extends Component {

  render() {
    return (
      <div className="section event-outlook">
        <div className="head">
          <svg width="1200" height="22">
            <path d="
                M 0 22 
                H 895
                L 920 0
                H 1175
                L 1200 22
                " 
                fill="none" stroke="#50B5EC" strokeWidth="1"></path>
          </svg>
          <h3 className="aviano">Event Outlook</h3>
        </div>
        
        <TimeSlider></TimeSlider>
      </div>
    );
  }

}

export default EventOutlook;
