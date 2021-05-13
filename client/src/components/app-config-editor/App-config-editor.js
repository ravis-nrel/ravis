import React, { Component } from "react";
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "./selectors";
import "./App-config-editor.scss";
import RegionService from "../../data/RegionService";
import SiteService from "../../data/SiteService";
import ForecastService from "../../data/ForecastService";
import { randomStr } from "../../data/Utils";
import { withRouter } from "react-router-dom";
import {
  Accordion,
  Dropdown,
  Form,
  Input,
  Icon,
  Button,
  Radio
} from "semantic-ui-react";

class AppConfigEditor extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getRampThresholdSettings = this.getRampThresholdInputField.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.saveClicked = this.saveClicked.bind(this);
    this.handleAccordionClick = this.handleAccordionClick.bind(this);
    this.handleCreateCustomRegion = this.handleCreateCustomRegion.bind(this);

    this.customRegionName = null;
    this.customRegionSites = [];

    this.state = {
      isInitialized: false,
      activeDataset: props.activeDataset,
      activeIndex: -1,
      customRegionName: '',
      customRegionSites: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.sitesLoaded && !this.state.isInitialized) {
      this.setInitialState();
    }
  }

  componentDidMount() {
    this.setInitialState();
  }

  // Use controlled components style for form inputs as per
  // https://reactjs.org/docs/forms.html#controlled-components
  setInitialState() {
    if (this.state.isInitialized) return;
    if (!this.props.sitesLoaded) return;

    let regions = RegionService.getRegions();

    let {
      globalRampThresholdId,
      globalRampThresholdInputs
    } = this.getGlobalRampThresholdConfig();
    this.setState({ [globalRampThresholdId]: this.props.globalRampThreshold });

    let regionalRampThresholdInputs = [];
    let siteRampThresholdInputs = [];
    let rampThresholdId, value;

    regions.forEach(region => {
      rampThresholdId = `rgnRmpThrsh_${region.id}`;
      value = region.rampThreshold || "";
      this.setState({ [rampThresholdId]: value });
      region.rampThresholdId = rampThresholdId;
      regionalRampThresholdInputs.push({
        id: region.id,
        name: region.name,
        rampThresholdId: region.rampThresholdId
      });
      region.sites.forEach(site => {
        rampThresholdId = `stRmpThrsh_${site.id}`;
        value = site.rampThreshold || "";
        this.setState({ [rampThresholdId]: value });
        site.rampThresholdId = rampThresholdId;
        siteRampThresholdInputs.push({
          name: site.name,
          rampThresholdId: rampThresholdId,
          regionId: region.id
        });
      });
    });

    this.setState({
      globalRampThresholdInputs,
      regionalRampThresholdInputs,
      siteRampThresholdInputs,
      isInitialized: true
    });
  }

  getGlobalRampThresholdConfig() {
    let globalRampThresholdId = "glbRmpThrsh_01",
      globalRampThresholdInputs = [
        {
          name: "",
          rampThresholdId: globalRampThresholdId
        }
      ];
    return { globalRampThresholdId, globalRampThresholdInputs };
  }

  goHome() {
    let homePath = "/";
    if (window.location.pathname.indexOf('ravis') !== -1) {
      homePath = "/ravis";
    }
    this.props.history.push(homePath);
  }

  handleInputChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }

  cancelClicked() {
    this.goHome();
  }

  saveClicked() {
    let regions = RegionService.getRegions(),
      globalThreshold = parseInt(this.state["glbRmpThrsh_01"]);

    if (isNaN(globalThreshold)) {
      globalThreshold = this.props.globalRampThreshold;
    }

    regions.forEach(region => {
      let regionThreshold = parseInt(this.state[`rgnRmpThrsh_${region.id}`]);
      if (isNaN(regionThreshold)) {
        delete region.rampThreshold;
      } else {
        region.rampThreshold = regionThreshold;
      }
      region.sites.forEach(site => {
        let siteThreshold = parseInt(this.state[`stRmpThrsh_${site.id}`]),
          resolvedThreshold;
        if (isNaN(siteThreshold)) {
          delete site.rampThreshold;
          if (isNaN(regionThreshold)) {
            resolvedThreshold = globalThreshold;
          } else {
            resolvedThreshold = regionThreshold;
          }
        } else {
          site.rampThreshold = siteThreshold;
          resolvedThreshold = siteThreshold;
        }
        if (!site.disabled) {
          ForecastService.updateRampThresholdForSite(site.id, resolvedThreshold);
        }
      });
    });

    if (this.props.activeDataset !== this.state.activeDataset) {
      this.props.fetchForecastRequest();
    }
    this.props.setActiveDataset(this.state.activeDataset);
    this.props.setGlobalRampThreshold(globalThreshold);
    this.handleCreateCustomRegion();
    this.goHome();
  }

  handleSiteSelect(e, { value }) {
    let sites = SiteService.getAllSites(),
      customSites;

    customSites = value.reduce((acc, val) => {
      acc.push(sites.find(site => site.name === val));
      return acc;
    }, []);

    this.setState({
      customRegionSites: customSites
    });
  }


  handleCustomRegionName(e) {
    this.setState({
      customRegionName: e.target.value
    });
  }

  handleCreateCustomRegion() {
    if (this.state.customRegionName !== '' && this.state.customRegionSites.length > 0) {
      let customRegion = RegionService.createCustomRegion(this.state.customRegionName, this.state.customRegionSites);
      RegionService.addNewRegion(customRegion);
      this.props.updateAddNewRegionTimestamp();
      this.setState({
        customRegionName: '',
        customRegionSites: []
      });
    }
  }

  getRampThresholdInputField(locale, includeLabel = true) {
    let placeholder = "Global Default",
      inputId = locale.rampThresholdId,
      labelText = includeLabel ? locale.name : '';

    return (
      <Form.Group key={inputId}>
        <Form.Field>
          <label>{labelText}</label>
          <Input
            name={inputId}
            label={{ basic: true, content: "MW" }}
            labelPosition="right"
            size="mini"
            placeholder={placeholder}
            value={this.state[inputId]}
            onChange={this.handleInputChange}
          />
        </Form.Field>
      </Form.Group>
    );
  }

  getRegionalRampBlock(region, activeIndex, idx) {
    let regionInput,
      regionalSiteInputConfigs,
      siteThreshInputs = [];

    regionInput = this.getRampThresholdInputField(region, false);
    regionalSiteInputConfigs = this.state.siteRampThresholdInputs.filter(site => site.regionId === region.id);
    regionalSiteInputConfigs.forEach(site => {
      siteThreshInputs.push(this.getRampThresholdInputField(site));
    });

    return (
      <span key={`region${idx}`}>
        <h3>{region.name}</h3>
        {regionInput}
        <div className="sub-region">
          <Accordion.Title as="h4" className="ui header" active={activeIndex === idx} index={idx} onClick={this.handleAccordionClick}>
            <Icon name="dropdown" />
            Individual Sites
          </Accordion.Title>
          <Accordion.Content active={activeIndex === idx}>
            {siteThreshInputs}
          </Accordion.Content>
        </div>
      </span>
    )
  }

  render() {
    if (!this.state.isInitialized) {
      return <div className="app-config">Application Loading</div>;
    }

    const { activeIndex } = this.state;

    let globalThreshIns = [],
      regionalThreshIns = [],
      siteOpts;

    siteOpts = SiteService.getAllSites().reduce((acc, site) => {
      let id = `site.id-${randomStr()}`;

      acc.push({
        key: id,
        text: site.name,
        value: site.name
      });

      return acc;
    }, []);
    this.state.globalRampThresholdInputs.forEach(g => {
      globalThreshIns.push(this.getRampThresholdInputField(g));
    });

    this.state.regionalRampThresholdInputs.forEach((region, idx) => {
      regionalThreshIns.push(this.getRegionalRampBlock(region, activeIndex, idx));
    });

    return (
      <div className="app-config">
        <Form>
          <Button.Group className="cancel-save-btn" floated="right">
            <Button onClick={this.cancelClicked}>Cancel</Button>
            <Button.Or />
            <Button positive onClick={this.saveClicked}>
              Save
            </Button>
          </Button.Group>
          <div className="form-body">
            <div className="config-form-group">
              <h2>Ramp Threshold Configuration</h2>
              <h3>Global Default</h3>
              {globalThreshIns}
              <Accordion id="site-accordion">
                {regionalThreshIns}
              </Accordion>
            </div>
            <div className="config-form-group">
              <h2>Create Custom Region</h2>
              <h3>Region Name</h3>
              <Input placeholder="Custom Region Name..."
                onChange={(e) => {
                  this.handleCustomRegionName(e);
                }}
              />
              <h3>Add Sites</h3>
              <Dropdown
                placeholder="Sites"
                fluid
                multiple
                search
                selection
                options={siteOpts}
                onChange={(e, { value }) => {
                  this.handleSiteSelect(e, { value })
                }} >
              </Dropdown>
            </div>
            <div className="config-form-group">
              <h2>Dataset Configuration</h2>
              <h3>Active/Displayed</h3>
              <Radio
                toggle
                name='activeDataset'
                label="NREL Sample Data with Eclipse"
                value="eclipse"
                checked={this.state.activeDataset === 'eclipse'}
                onChange={this.handleInputChange} /><br />
              <Radio
                toggle
                name='activeDataset'
                label="NREL Sample Data without Eclipse"
                value="no_eclipse"
                checked={this.state.activeDataset === 'no_eclipse'}
                onChange={this.handleInputChange} />
            </div>
          </div>
        </Form>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AppConfigEditor));
