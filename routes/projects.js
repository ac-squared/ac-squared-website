// projects.js

// import the express package to create the web server
import express from "express"

// import the path package to help navigate the file system
import path from "path"

// import the fetch library for reading from urls
import { graphql } from "@octokit/graphql"

// import the fetch library for reading from urls
import fetch from "node-fetch"

// create a new express route
const router = express.Router()

// get the ICAL url from environment variables
const organizationName = process.env.ORG_NAME
const organizationProject = process.env.ORG_PROJECT_NUMBER
const organizationFeatured = process.env.ORG_PROJECT_FEATURED
const githubAuth = process.env.GITHUB_AUTH

const projectsQuery = `
query ($organization: String!, $number: Int!) {
  organization(login: $organization) {
    projectV2(number: $number) {
      items(first: 50, orderBy: {direction: DESC, field: POSITION}) {
        nodes {
          fieldValues(first: 20) {
            nodes {
              __typename
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                item {
                  content {
                    ... on DraftIssue {
                      title
                    }
                    ... on Issue {
                      title
                    }
                    ... on PullRequest {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

// when the router recieves a request at the root, send the homepage file
router.get('/featured', async (request, response) => {
  try {
    // fetch the projects using github graphql api
    const data = await graphql({
      query: projectsQuery,
      organization: organizationName,
      number: parseInt(organizationProject),
      headers: {
        authorization: `token ${githubAuth}`
      }
    })

    const items = data.organization.projectV2.items.nodes

    // urls of featured projects
    const featuredNames = []

    // read the featured urls
    for(const item of items) {
      for(const field of item.fieldValues.nodes) {
        if(field.__typename != "ProjectV2ItemFieldSingleSelectValue") continue;
        if(field.name != organizationFeatured) continue;
        featuredNames.push(field.item.content.title)
      }
    }

    // data of featured projects
    const featured = []

    for(const repoName of featuredNames) {  
      // downloaded the repository information
      const repoRequest = await fetch(`https://api.github.com/repos/${repoName}`, {
        headers: {
          authorization: `token ${githubAuth}`
        }
      })
      const repoResponse = await repoRequest.json()

      // extra the required data
      const { name, description, stargazers_count: stars } = repoResponse

      // add the featured data
      featured.push({ name, description, stars, url: `https://github.com/${repoName}` })
    }

    // send the response to the client
    response.status(200).json({ featured })
  } catch (e) {
    console.error(e)
    response.status(500).json({ error: "An unknown error occurred!" })
  }
})

// export the router
export { router as projects }