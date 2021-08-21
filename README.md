# On My Way

Imaging you want to pickeup your friends at their place at 11am for a hike, what would you do to keep them informed about your location? Most likely you will need to:

1. Send out them a message when you leave your place so that they can roughly estimate your arrival time.
2. Send out another message when you are close to their place.
3. Send out a thrid message after your arrival

On My Way is a self-hosted web application aiming to make it ealiser and safer. It allows you to share your realtime location in a map to the subscribers. The subscripbers can check the estimated time to their location via Web UI, receive notifications about your current status.


## Supported cars/location services
- [X] Tesla
- [ ] Google Map

## Supported notification type:
- [X] Browser notification (Not available on mobile devices)
- [ ] IOS Push notification
- [ ] Android Push notification
- [ ] Text message

# Development

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn start_server`

Start the backend server. Some available environment variables:

``` bash
# Token for mapbox
MAPBOX_TOKEN=

# Enable debug mode. You will need to either set this variable to any value or set both TESLA_EMAIL and TESLA_PASSWORD.
# Once debug mode is enabled, the server will return mock value for Tesla API.
TESLA_DEBUG=

# The email address of your Tesla account
TESLA_EMAIL=

# The password of your Tesla account
TESLA_PASSWORD=
```

