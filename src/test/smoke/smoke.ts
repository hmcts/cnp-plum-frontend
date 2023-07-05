import axios, { AxiosResponse } from 'axios';
import { expect } from 'chai';

const testUrl = process.env.TEST_URL || 'https://localhost:1337';

describe('Smoke Test', () => {
  describe('Home page loads', () => {
    test('with correct content', async () => {
      const response: AxiosResponse = await axios.get(testUrl, {
        headers: {
          'Accept-Encoding': 'gzip',
        },
      });
      expect(response.data).includes('<h1 class="govuk-heading-xl">Recipes</h1>');
    });
  });
});
