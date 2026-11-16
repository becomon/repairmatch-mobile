// Extends app.json. The Google Maps key is read from the build environment
// (EAS environment variable GOOGLE_MAPS_API_KEY) and never stored in the repo.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
});
