# Create PR Action

This action creates a pull request from staged changes, handles duplicate PRs, and manages temporary branches.

## Features

- Creates a temporary branch with staged changes
- Automatically generates a pull request against a target branch
- Detects and closes duplicate PRs to avoid redundancy
- Cleans up orphaned branches on failure
- Uses Powertools for AWS Lambda bot identity for commits

## Usage

```yaml
name: Update Documentation

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Mondays

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      # Steps to generate or update files
      - name: Update documentation
        run: ./scripts/update-docs.sh
        
      # Stage the changes
      - name: Stage changes
        run: git add docs/README.md docs/CHANGELOG.md
        
      # Create PR with the changes
      - name: Create PR
        id: create-pr
        uses: your-org/actions/.github/actions/create-pr@main
        with:
          files: "docs/README.md docs/CHANGELOG.md"
          temp_branch_prefix: "ci-docs"
          pull_request_title: "chore(docs): update documentation"
          github_token: ${{ secrets.GITHUB_TOKEN }}
          
      # Optional: Use the outputs
      - name: Show PR details
        run: |
          echo "PR created: #${{ steps.create-pr.outputs.pull_request_id }}"
          echo "Branch: ${{ steps.create-pr.outputs.temp_branch }}"
```

## Prerequisites

- Enable "Allow GitHub Actions to create and approve pull requests" in your repository settings
- Create a "skip-changelog" label in your repository if you want to use that functionality

## Inputs

| Input                | Description                                   | Required | Default |
| -------------------- | --------------------------------------------- | -------- | ------- |
| `temp_branch_prefix` | Prefix for temporary git branch to be created | Yes      |         |
| `pull_request_title` | Pull Request title to use                     | Yes      |         |
| `github_token`       | GitHub token for GitHub CLI                   | Yes      |         |
| `target_branch`      | Branch to target when creating a PR against   | No       | `main`  |

## Outputs

| Output            | Description                                   |
| ----------------- | --------------------------------------------- |
| `pull_request_id` | ID of the pull request that was created       |
| `temp_branch`     | Name of the temporary branch that was created |

## How It Works

1. Sets up git client using Powertools for AWS Lambda bot identity
2. Pushes staged files to a temporary branch with the specified prefix
3. Creates a PR from the temporary branch against the target branch
4. Searches for duplicate PRs with the same title
5. If duplicates are found, links to the most recent one and closes others
6. Cleans up by deleting orphaned branches in case of failure
