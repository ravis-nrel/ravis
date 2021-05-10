import React, { Component } from 'react';

import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  AllianceLogo,
  DoeLogo,
} from './images';

import './style.scss';

/**
 * Renders a comms friendly footer
 * See https://github.com/NREL/nrel-app-template-bootstrap4 for original code
 */
class NRELFooter extends Component {
  render() {
    return (
      <div className="nrel-footer-wrapper">
        <footer id="footer" className="hidden-print">

          <div className="footertop">
            <div className="container">
              <div className="row">
                <div className="col-12 col-lg-5">
                  <a href="http://www.nrel.gov/index.html"><strong>National Renewable Energy Laboratory</strong></a>
                </div>
                <div className="col col-lg-7">
                  <div className="d-flex flex-column flex-lg-row justify-content-lg-start global">
                    <div><a href="http://www.nrel.gov/about/index.html">About</a></div>
                    <div><a href="http://www.nrel.gov/research/index.html">Research</a></div>
                    <div><a href="http://www.nrel.gov/index.html">Work with Us</a></div>
                    <div><a href="http://www.nrel.gov/news/index.html">News</a></div>
                    <div><a href="http://www.nrel.gov/careers/index.html">Careers</a></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footerbottom">
            <div className="container">
              <div className="row">
                <div className="col-md-4 col-lg-5">
                  <div><a href="http://www.nrel.gov/webmaster.html">Contact Us</a></div>
                  <div className="mt-2"><a href="http://www.nrel.gov/about/visiting-nrel.html">Visit</a></div>
                  <div className="mt-2"><a href="http://www.nrel.gov/news/subscribe.html">Subscribe</a></div>
                  <div className="mt-3">
                    <ul className="social-links list-inline">
                      <li className="list-inline-item"><a href="https://www.facebook.com/nationalrenewableenergylab" rel="noopener noreferrer" target="_blank">
                        <Facebook className="social-svg" />
                      </a></li>
                      <li className="list-inline-item"><a href="https://www.instagram.com/nationalrenewableenergylab/" rel="noopener noreferrer" target="_blank">
                        <Instagram className="social-svg" />
                      </a></li>
                      <li className="list-inline-item"><a href="https://www.linkedin.com/company/national-renewable-energy-laboratory" rel="noopener noreferrer" target="_blank">
                        <Linkedin className="social-svg" />
                      </a></li>
                      <li className="list-inline-item"><a href="https://www.youtube.com/user/NRELPR/" rel="noopener noreferrer" target="_blank">
                        <Youtube className="social-svg" />
                      </a></li>
                      <li className="list-inline-item"><a href="https://twitter.com/nrel/" rel="noopener noreferrer" target="_blank">
                        <Twitter className="social-svg" />
                      </a></li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-8 col-lg-7 globalsecondary">
                  <div className="row">
                    <div className="col-sm-6 col-lg-3">
                      <div className="mt-1"><a href="http://www.nrel.gov/accessibility.html">Accessibility</a></div>
                      <div className="mt-1"><a href="http://www.nrel.gov/disclaimer.html">Disclaimer</a></div>
                      <div className="mt-1"><a href="http://www.nrel.gov/security.html">Security and Privacy</a></div>
                      <div className="mt-1"><a href="http://www.nrel.gov/webmaster.html">Site Feedback</a></div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="mt-1"><a href="https://developer.nrel.gov/">Developers</a></div>
                      <div className="mt-1"><a href="https://thesource.nrel.gov/">Employees</a></div>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="mt-4">
                <div className="row">
                  <div className="col-sm-5">
                    <a href="https://www.allianceforsustainableenergy.org/">
                      <img className="mr-5" src={AllianceLogo} alt="Alliance for Sustainable Energy, LLC" />
                    </a>
                    <a href="https://energy.gov">
                      <img src={DoeLogo} alt="U.S. Department of Energy" />
                    </a>
                  </div>
                  <div className="col-12 col-sm-7">
                    <p className="nrel-attr">The National Renewable Energy Laboratory is a national laboratory of the <a href="https://energy.gov/">U.S. Department of Energy</a>, <a href="https://energy.gov/eere/office-energy-efficiency-renewable-energy">Office of Energy Efficiency and Renewable Energy</a>, operated by the <a href="https://www.allianceforsustainableenergy.org/">Alliance for Sustainable Energy LLC</a>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </footer>
      </div>
    );
  }
}

export default NRELFooter;
