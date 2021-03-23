import React, { Component } from 'react';
import './App-header.scss';
import { withRouter } from 'react-router-dom';

class AppHeader extends Component {

  constructor(props) {
    super(props);
    this.onClickConfig = this.onClickConfig.bind(this);
  }

  onClickConfig() {
    let configPath = "/config";
    if(window.location.pathname.indexOf('ravis') !== -1) {
      configPath = "/ravis/config";
    }

    this.props.history.push(configPath);
  }

  render() {
    return (
      <div className="app-header">
        <h1 className="aviano">
          RaViS
        </h1>
        <div className="graphic">
          <svg width="990" height="20">
            <path d="
                M 0 20
                L 20 0
                H 50
                L 30 20
                z
                " 
                fill="#816927" stroke="#5F170F" strokeWidth="1"></path>
            <path d="
                M 33 20
                L 53 0
                H 83
                L 63 20
                z
                " 
                fill="#BF9A33" stroke="#5F170F" strokeWidth="1"></path>
            <path d="
                M 66 20
                L 86 0
                H 980
                L 960 20
                z
                " 
                fill="#FEC841" stroke="#5F170F" strokeWidth="1"></path>                                
          </svg>
          <svg className="cog" viewBox="0 0 512 512" onClick={this.onClickConfig}>
            <path d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z" fill="#B8B8B8"></path>
          </svg>
        </div>
      </div>
    );
  }

}

export default withRouter(AppHeader);
