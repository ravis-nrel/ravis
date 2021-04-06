# RAVIS
The client codebase includes the RAVIS web viewer code and other necessary project assets. This project started life as a Create React App project that was subsequently ejected and customized. However there are still many useful configuration and deployment tips that can be learned from the documentation at https://create-react-app.dev/

## Organization
The user interface is implemented as a single page web application in which all user interaction takes place within a customizable dashboard. This is achieved via a modular architecture in which each functional aspect is contained in a set of files constituting a single component. Each component maintains an insular set of functionalities and actions. By isolating each functional block within its own component, this design supports more efficient development, extension, and ultimately support. This will benefit us greatly in the future as new features and datasets are integrated, new components are required, and new requirements emerge for existing components.

### Components
The RAVIS client organizes all UI components into the `client/components/` directory. Each component is responsible for a specific frame, or aspect, of the viewer. Where heirarchies or complex tools exist component directories may contain multiple adjacent classes, or in some cases nested component directories. Proximity in the directory structure always implies logical and/or functional proximity as well.

Component directories include all of the pieces that come together to create that given component including:
  - The react component code
  - Assignment of the redux stateful props and actions
  - Styles (scss and css)
  - In the case of map components the MapboxGL style specifications are included as well
The only exception to this pattern are images, which are all consolidated into `client/images/`.

### Services
The RAVIS client utilizes a type of class we call a service. These services are responsible for handling data related concernes. Services are located at `cient/src/data/*Service.js`. Services are organized by the type of data they manage, e.g. Foreceast, Site, Region, or Alert data. Services are responsible for
  - Fetching data from the API, including regular re-fetching of forecasts
  - Performing on-the-fly aggregation of data
  - Applying business logic to the data to identify alerts
  - Applying relevant client configuration and settings to the data
  - Formatting the API provided data into the shape necessary for consumption by various components

If you are seeking to augment alerting functionality, integrate new types of forecasts, or add new business logic that involves access to the unprocesses API data, these services are the place to look.

### State
The RAVIS client utilizes Redux for managing state. It is outside of the scope of this documentation to attempt to teach Redux, however [the Redux homepage](https://redux.js.org/) is a good place to start.

RAVIS employs an organizational structure to assist in easily identifying all aspects of state. All of the actions and reducers are defined at the top level in `client/src/`. The reducers are further organized into logical groupings including analysis, and data based state. Each component includes its own dedicated `selectors.js` file which acts as a single destination for making stateful props and dispatchable actions available to each component.

## Available Scripts
In the project directory, you can run:

### `yarn start`
Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000 to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker
This application can very effectively be made into a Docker image. For a more comprehensive understanding please read the Docker section of the main README.

`docker build -t ravis-client .`