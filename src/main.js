const core = require('@actions/core');

const { getInputs } = require('./action-inputs');

const { GithubConnector } = require('./github-connector');
const { JiraConnector } = require('./jira-connector');

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  const { FAIL_WHEN_JIRA_ISSUE_NOT_FOUND } = getInputs(1);

  try {
    const githubConnector = new GithubConnector();
    const jiraConnector = new JiraConnector();

    if (!githubConnector.isPullRequest) {
      console.log('This action only works on pull requests.');
      setOutputs(null, null);
      process.exit(0);
    }

    const branch = githubConnector.headBranch;
    const jiraKeyMatch = branch.match(/[A-z]+-\d+/gi); // IVN-1234

    if (!jiraKeyMatch) {
      console.log('No Jira issue key found in the branch name.');
      setOutputs(null, null);
      process.exit(0);
    }

    const jiraIssueKey = jiraKeyMatch[0].toUpperCase();

    const jiraConnected = await jiraConnector.ping();

    if (!jiraConnected) {
      console.log('Failed to connect to Jira.');
      setOutputs(null, null);
      process.exit(0);
    }

    const issue = await jiraConnector.getIssue(jiraIssueKey);
    await githubConnector.updatePrDetails(issue);

    setOutputs(jiraIssueKey);
  } catch (error) {
    console.log('Failed to add Jira description to pull request.');
    core.error(error.message, error);

    setOutputs(null, null);

    if (FAIL_WHEN_JIRA_ISSUE_NOT_FOUND) {
      core.setFailed(error.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

function setOutputs(key) {
  core.setOutput('jira-issue-key', key);
}

module.exports = {
  run
};
