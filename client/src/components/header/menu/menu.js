import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

/**
 * A wrapper Menu component.
 *
 * The eventual dom should end up looking something like:
 *
 *   <ul class="menu">
 *     <li class="menu-item">...</li>
 *   </ul>
 *
 * @param {object} props
 * @param {string} className Any additional class names to add to the menu
 * @param {string} children JSX of HTML elements (should really be either SubMenus or MenuLinks)
 * @param {string} isSubMenu Boolean saying if the parent is the sub menu or a main menu
 */
class Menu extends Component {
  constructor(props) {
    super(props);

    this.toggleMenu = this.toggleMenu.bind(this);

    this.state = {
      menuOpen: false
    }
  }

  toggleMenu() {
    let menuOpen = !this.state.menuOpen;
    this.setState({ menuOpen });
  }

  render() {
    const {
      children,
      isSubMenu,
      className = '',
    } = this.props;

    const {
      menuOpen
    } = this.state;


    let menuClass = isSubMenu ? 'sub-menu' : 'menu';
    let menuOpenClass = menuOpen ? 'open' : 'close';

    return (<>
      {
        isSubMenu ?
          <ul className={`${menuClass} ${className}`}>
            {children}
          </ul >
          :
          <div className={`menu-container ${menuOpenClass}`}>
            <ul className={`${menuClass} ${className}`}>
              {React.Children.map(children, child => (
                React.cloneElement(child, { toggleMenu: this.toggleMenu })
              ))}
            </ul>
          </div>
      }
    </>);
  }
}


Menu.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isSubMenu: PropTypes.bool,
  noStick: PropTypes.bool,
  scrollContainerId: PropTypes.string
}

export default Menu;