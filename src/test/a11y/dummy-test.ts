/* eslint-disable jest/expect-expect */
describe('Fake test to work around an issue', () => {
  it('does nothing', async () => {
    // print something to avoid the test being empty
    console.log('This is a dummy test to work around an issue with Jest and Cucumber.');
    //see https://github.com/facebook/jest/issues/5783#issuecomment-450626450
  });
});
