const { version } = require('../package.json');

const get = (req, res) => {
  res.json({
    api: 'ok',
    version,
    env: process.env
  });
};

module.exports = get;
