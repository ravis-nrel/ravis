import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './style.scss';

/**
 * Renders a comms friendly header
 *
 * @param {object} props - React props passed to this component
 * @param {object} props.appTitle - The title of the app (can be a string or JSX)
 * @param {object} props.children - A collect of li items to be rendered as navigational items
 * @param {string} noStick Boolean determining if the menu bar should not be sticky to the top of the page
 * @param {string} isSlim Boolean for slimmer headers. Mostly used for data-viewer pages
 */
class NRELHeader extends Component {

  render() {
    const {
      children,
      appTitle,
      className = '',
    } = this.props;

    return (
      <nav
        id="shared-nrel-header"
        className={className}
      >
        <header className="ravis-header">
          <h1 className="ravis-title">{appTitle}</h1>
          <a
            className="header-link"
            href="https://www.nrel.gov"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={require('./images/nrel-logo@2x-01.png')}
              width="280px"
              alt="nrel-logo"
              className="nrel-logo-image"
            />
          </a>
        </header>
        {children ?
          <>
            {children}
          </>
          :
          <Fragment />
        }

      </nav>
    );
  }
}

NRELHeader.propTypes = {
  appTitle: PropTypes.any.isRequired,
  className: PropTypes.string,
  children: PropTypes.node
}

export default NRELHeader;