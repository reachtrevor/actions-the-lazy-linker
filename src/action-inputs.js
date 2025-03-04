const core = require('@actions/core');
const memoize = require('./utils/memoize');

function getInputs() {
  const GITHUB_TOKEN = core.getInput('github-token', { required: true });
  const JIRA_TOKEN = core.getInput('jira-api-key', { required: true });
  const JIRA_USER_EMAIL = core.getInput('jira-user-email', { required: true });
  const ATLASSIAN_ORG_NAME = core.getInput('atlassian-org-name', {
    required: true
  });

  // optional inputs
  const FAIL_WHEN_JIRA_ISSUE_NOT_FOUND =
    core.getInput('fail-when-jira-issue-not-found') === 'true' || false;

  const DESCRIPTION_CHARACTER_LIMIT = Number(
    core.getInput('description-character-limit')
  );

  const nextDescriptionLimit =
    Number.isNaN(DESCRIPTION_CHARACTER_LIMIT) ||
    DESCRIPTION_CHARACTER_LIMIT <= 0
      ? null
      : DESCRIPTION_CHARACTER_LIMIT;

  return {
    JIRA_TOKEN,
    ATLASSIAN_ORG_NAME,
    JIRA_USER_EMAIL,
    GITHUB_TOKEN,
    FAIL_WHEN_JIRA_ISSUE_NOT_FOUND,
    DESCRIPTION_CHARACTER_LIMIT: nextDescriptionLimit
  };
}

module.exports.getInputs = memoize(getInputs);
