# The Lazy Linker

[![GitHub Super-Linter](https://github.com/actions/hello-world-javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/hello-world-javascript-action/actions/workflows/ci.yml/badge.svg)

This action searches for a Jira issue key in the branch name, fetches
information about issue. The action will update the title of your Pull Request
and the description of the Pull Request.

E.g. `feature/PRO-123` or `LLM-1874`

![image](https://github.com/user-attachments/assets/38493ab3-1afb-4c9f-85cb-9b116e13f9cb)

### Motivation

Get context about the change instantly and save you and your peers hours of
copy-pasting and describing Pull Requests.

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
name: Example PR Workflow

on:
  pull_request:
    types:
      - opened

permissions:
  actions: read
  contents: read
  pull-requests: write

jobs:
  jira-lazy-link:
    name: Jira Lazy Linker
    runs-on: ubuntu-latest

    steps:
      - name: Print to Log
        id: print-to-log
        uses: reachtrevor/actions-the-lazy-linker@v1.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jira-base-url: ${{ secrets.JIRA_BASE_URL }}
          jira-api-key: ${{ secrets.JIRA_API_KEY }}
          jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
```

## Inputs

| Input                            | Default | Description                                                   |
| -------------------------------- | ------- | ------------------------------------------------------------- |
| `github-token`                   | -       | Github token provided by Github Actions                       |
| `jira-api-key`                   | -       | User API key from Jira Cloud                                  |
| `jira-base-url`                  | -       | Organization base url for Jira Cloud                          |
| `jira-user-email`                | -       | User email tied to API key from Jira Cloud                    |
| `fail-when-jira-issue-not-found` | false   | Enabled to enforce a Jira key in the branch name              |
| `description-character-limit`    | -       | Limit the description from Jira to a specific character count |

## FAQ

#### Do images get copied over?

No, there is code to strip images from Jira, images require authentication to
view and thus cannot be shown in the Pull Request description.

#### Will sensitive data be copied over?

Everything in the Jira description will be copied over with the exception of
images. Just edit your description once it gets populated and remove the
sensitive bits.

Some may be concerned about sensitive data making to Github in the first place,
my response is twofold.

1. It doesn't go into the git history of your repository
2. If a bad actor can get into your organization's private repository you've got
   bigger problems.

#### Can I modify how the title or description is formatted?

Not right now, I've put in what I believe are smart defaults. If I get enough
issues raised about it or someone wants to donate $$ to make it happen then I'll
do a simple version of title formatting.
