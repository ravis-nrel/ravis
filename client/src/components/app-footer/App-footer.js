import React, { Component } from 'react';
import './App-footer.scss';

class AppFooter extends Component {

  render() {
    return (
      <div className="app-footer">
        <div className="footer-branding">
          <div className="nrel-brand">
            Designed and developed by the<br />National Renewable Energy Laboratory (NREL)
            <a id="nrel-brand" href="https://www.nrel.gov" alt="NREL.gov" arial-label="https://www.nrel.gov" target="_blank" rel="noopener noreferrer"> </a>
          </div>
          <div className="doe-brand">
            Funded by the<br />Solar Energy Technologies Office (SETO)
            <a id="doe-brand" href="https://www.energy.gov" alt="energy.gov" aria-label="https://www.energy.gov" target="_blank" rel="noopener noreferrer"> </a>
          </div>
        </div>
      </div>
    );
  }
}

export default AppFooter;
