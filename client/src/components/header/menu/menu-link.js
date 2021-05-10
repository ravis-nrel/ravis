import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import './style.scss';

/**
 * Menu item holding a react-router Link.
 *
 * @param {object} props
 * @param {string} to The target link
 * @param {string} className Optional className for custom styling
 * @param {string} toggleMenu Function to close menu (only used in mobile)
 * @param {string} children JSX of HTML elements, or in most cases just text
 */
class MenuLink extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    className: PropTypes.string,
    toggleMenu: PropTypes.func,
    location: PropTypes.object.isRequired,
  }

  isCurrent = () => {
    // Check to see if we on on the page this link goes to
    return this.props.to === this.props.location.pathname.replace(process.env.PUBLIC_URL, '');
  }

  render() {
    const {
      children,
      to,
      toggleMenu,
      className = ''
    } = this.props;

    let isCurrent = this.isCurrent() ? 'current' : '';

    return (
      <li className={`menu-item ${isCurrent} ${className}`} onClick={toggleMenu}>
        <Link to={to}>{children}</Link>
      </li>
    );
  }
}

export default withRouter(MenuLink);