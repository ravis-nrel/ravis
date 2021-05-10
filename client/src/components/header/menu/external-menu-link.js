import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

/**
 * Menu item holding an external link.
 *
 * @param {object} props
 * @param {string} to The target link
 * @param {string} label the link label
 * @param {string} alt the link title (similar to an image alt tag)
 * @param {string} className an optional classname for the link for special styling
 */
class ExternalMenuLink extends Component {
  render() {
    const {
      to,
      label,
      alt,
      className = ''
    } = this.props;

    return (
      <li className={`menu-item ${className}`}>
        <a
          href={to}
          title={alt}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      </li>
    );
  }
}

ExternalMenuLink.propTypes = {
  to: PropTypes.string,
  label: PropTypes.node,
  alt: PropTypes.string,
  className: PropTypes.string,
}

export default ExternalMenuLink;