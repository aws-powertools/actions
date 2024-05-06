export const projectIssues = `query projectIssues($org: String!, $repo: String!, $fromDate: DateTime) {
  organization(login: $org) {
    repository(name: $repo) {
      issues(
        first: 30
        states: [OPEN]
        orderBy: { field: CREATED_AT, direction: DESC }
        filterBy: { since: $fromDate }
      ) {
        items: nodes {
          title
          html_url: url
          created_at: createdAt
          updated_at: updatedAt
          labels(first: 10, orderBy: { field: NAME, direction: ASC }) {
            items: nodes {
              name
            }
          }
          projects: projectItems(first: 1) {
            items: nodes {
              projectStatus: fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  status: name
                }
              }
              
              area: fieldValueByName(name: "Area") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  area: name
                }
              }

              iteration: fieldValueByName(name: "Iteration") {
                ... on ProjectV2ItemFieldIterationValue {
                  startDate
                }
              }
            }
          }
        }
      }
    }
  }
}`