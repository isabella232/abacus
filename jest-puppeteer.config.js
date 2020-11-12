require('dotenv').config()

module.exports = {
  launch: {
    headless: process.env.PUPPETEER_HEADLESS === 'false' ? false : true,
  },
  server: {
    command:
      'echo "Building app..." && REACT_APP_E2E_TEST_BUILD=true npm run build && echo "Starting app..." && npm run start -- -l 3001',
    debug: true, // Allows us to see the output of the above commands.
    launchTimeout: 180 * 1000,
    port: 3001,
  },
}
