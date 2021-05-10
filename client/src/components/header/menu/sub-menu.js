import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import InlineSVG from 'svg-inline-react';

import Menu from './menu';
import './style.scss';

import { ReactComponent as ChevronLeft } from './chevron-left.svg';

/**
 * Menu item holding another menu.
 *
 * @param {object} props
 * @param {string} children JSX or html elements - Should really just be MenuLinks
 * @param {string} label The text label of the submenu
 * @param {string} toggleMenu Function to close menu (only used in mobile)
 * @param {string} className Optional className for custom styling
 */
class SubMenu extends Component {
  constructor(props) {
    super(props);

    this.childIsCurrent = this.childIsCurrent.bind(this);
    this.toggleShowItems = this.toggleShowItems.bind(this);

    this.state = {
      showItems: false
    }
  }

  /**
   * Check to see if we on on the page one of the children goes to
  */
  childIsCurrent() {
    const children = React.Children.toArray(this.props.children)
    return children.find(child => child.props.to === window.location.pathname.replace(process.env.PUBLIC_URL, ''));
  }

  /**
   * Only used on Mobile
   */
  toggleShowItems() {
    this.setState({ showItems: !this.state.showItems });
  }

  render() {
    const {
      children,
      label,
      toggleMenu,
      className = ''
    } = this.props;

    let isCurrent = this.childIsCurrent() ? 'current' : '';
    // On mobile, the sub-menu should stay open if a user is on one of the links in that menu
    let showItemsClass = this.state.showItems || this.childIsCurrent() ? 'show' : '';
    return (
      <li
        onClick={this.toggleShowItems}
        className={`menu-item ${isCurrent} ${className} ${showItemsClass}`}
      >
        <span>
          {label}
          {/* <InlineSVG
            src={ChevronLeft}
            className="submenu-chevron"
          /> */}
          <ChevronLeft className="submenu-chevron" />
        </span>
        <Menu isSubMenu>
          {/* Need to pass through toggleMenu so that the menu closes when a MenuLink is clicked */}
          {React.Children.map(children, child => (
            React.cloneElement(child, { toggleMenu })
          ))}
        </Menu>
      </li>
    );
  }
}

SubMenu.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  toggleMenu: PropTypes.func
}

export default SubMenu;