import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

/**
 * Menu item holding some plain text.
 *
 * @param {object} props
 * @param {string} className Optional className for custom styling
 * @param {string} toggleMenu Function to close menu (only used in mobile)
 * @param {string} children JSX of HTML elements, or in most cases just text
 */
class MenuText extends Component {
  constructor(props) {
    super(props);

    this.isCurrent = this.isCurrent.bind(this);
  }


  isCurrent() {
    // Check to see if we on on the page this link goes to
    return this.props.to === window.location.pathname.replace(process.env.PUBLIC_URL, '');
  }

  render() {
    const {
      children,
      toggleMenu,
      className = ''
    } = this.props;

    // eslint-disable-next-line multiline-ternary
    let isCurrent = this.isCurrent() ? 'current' : '';

    return (
      <li className={`menu-item menu-text ${isCurrent} ${className}`} onClick={toggleMenu}>
        <div>{children}</div>
      </li>
    );
  }
}

MenuText.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  toggleMenu: PropTypes.func
}

export default MenuText;