const axios = require('axios');

const { getInputs } = require('./action-inputs');

export class JiraConnector {
  constructor() {
    const { JIRA_TOKEN, JIRA_BASE_URL, JIRA_USER_EMAIL } = getInputs();

    this.JIRA_BASE_URL = JIRA_BASE_URL;
    this.JIRA_TOKEN = JIRA_TOKEN;

    const credentials = Buffer.from(
      `${JIRA_USER_EMAIL}:${JIRA_TOKEN}`
    ).toString('base64');

    this.client = axios.create({
      baseURL: `${JIRA_BASE_URL}/rest/api/2`,
      timeout: 2000,
      headers: { Authorization: `Basic ${credentials}` }
    });
  }

  async getIssue(issueKey) {
    const { DESCRIPTION_CHARACTER_LIMIT } = getInputs();
    const fields = 'summary,description,issuetype';

    try {
      const response = await this.client.get(
        `/issue/${issueKey}?fields=${fields},expand=renderedFields`
      );

      console.log('response exists: ', !!response);

      let description = await this.descriptionToMarkdown(
        response.data.fields.description
      );

      if (
        DESCRIPTION_CHARACTER_LIMIT &&
        description.length > DESCRIPTION_CHARACTER_LIMIT
      ) {
        description = `${description.substring(0, DESCRIPTION_CHARACTER_LIMIT)}...`;
      }

      return {
        key: response.data.key,
        summary: response.data.fields.summary,
        description,
        issuetype: response.data.fields.issuetype?.name,
        issuetypeicon: response.data.fields.issuetype?.iconUrl,
        url: `${this.JIRA_BASE_URL}/browse/${response.data.key}`
      };
    } catch (error) {
      throw new Error(JSON.stringify(error.response.data, null, 4));
    }
  }

  async descriptionToMarkdown(description) {
    let next = description;

    next = this.mdStatus(next);
    next = this.mdStripLinks(next);
    next = this.mdQuotes(next);

    // order matters, there is cross over between numbered lists and headings
    next = this.mdNumberedLists(next);
    next = this.mdHeading(next);

    return next;
  }

  mdNumberedLists(text) {
    const next = text.replace(/# /gm, '1. ');
    return next;
  }

  mdHeading(text) {
    const matches = text.match(/^(h1|h2|h3|h4|h5|h6)\./gm, '#');

    if (matches === null || !matches.length) {
      return text;
    }

    const next = matches.reduce((prev, match) => {
      const heading = match.match(/(\d)/g)[0];
      const number = Number(heading);

      const mdheading = new Array(number).fill('#').join('');

      return prev.replace(match, mdheading);
    }, text);

    return next;
  }

  mdQuotes(text) {
    let next = text;

    // replace first instance of {quote}, per line with >
    next = next.replace(/^{quote}/gm, '> ');
    // replace all other instances of {quote} with empty string
    next = next.replace(/{quote}$/gm, '');

    return next;
  }

  mdStripLinks(text) {
    const next = text.replace(/(\[.+\|.+\])|(\[~accountid.+\])/gm, '');

    return next;
  }

  mdStatus(text) {
    const next = text.replace(
      /\*?{color(:#[a-f0-9]{6}|[a-f0-9]{3})?}\*?/gm,
      '**'
    );

    return next;
  }
}
