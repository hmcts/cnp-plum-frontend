const rp = require('request-promise');
const { Logger } = require('@hmcts/nodejs-logging');
const { RECIPE_BACKEND_URL } = process.env;

const logger = Logger.getLogger('index.js');

const get = async (req, res) => {
  logger.info('Yay, logging!');

  const options = {
    uri: `http://plum-recipe-backend-pr-249.service.core-compute-preview.internal/recipes`,
    json: true
  };

  try {
    const { recipes } = await rp(options);
    return res.render('index', { recipes });
  } catch (err) {
    logger.error(err.stack);
    return res
      .status(500)
      .render('error', { message: 'Problem communicating with backend' });
  }
};

module.exports = get;
