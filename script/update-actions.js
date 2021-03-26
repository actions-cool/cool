require('dotenv').config();
const fs = require('fs');
const { Octokit } = require('@octokit/rest');
const { GITHUB_TOKEN: githubToken } = process.env;

const octokit = new Octokit({ auth: `token ${githubToken}` });

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const ACTIONS = [
  'issues-helper',
  'issues-similarity-analysis',
  'release-helper',
  'translation-helper',
  'pr-welcome',
  'pr-check-fill',
  'pr-extract-issues',
  'check-pr-ci',
  'check-user-permission',
  'maintain-one-comment',
  'verify-package-version',
  'verify-files-modify',
];

const TOOLS = [
  'labels-helper',
  'actions-util',
  'analyze-action',
  'github-action-branding',
];

const AIDES = [
  'action-tutorial',
  'octokit-rest',
  '.github',
  'action-ts-template',
  'action-js-template',
  'test-ci-version',
];

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const owner = 'actions-cool';

async function main() {
  let actions = [];
  for await (let action of ACTIONS) {
    const { data: repo } = await octokit.repos.get({
      owner,
      repo: action,
    });
    const { data: rele } = await octokit.repos.getLatestRelease({
      owner,
      repo: action,
    });

    actions.push({
      name: action,
      url: repo.html_url,
      desc: repo.description,
      star: repo.stargazers_count,
      tag: rele.tag_name,
      market: `https://github.com/marketplace/actions/${action}`,
    })
  }
  actions.sort((a, b) => b.star - a.star);

  let tools = [];
  for await (let tool of TOOLS) {
    const { data: repo } = await octokit.repos.get({
      owner,
      repo: tool,
    });

    tools.push({
      name: tool,
      url: repo.html_url,
      desc: repo.description,
      star: repo.stargazers_count,
    })
  }

  let aides = [];
  for await (let aide of AIDES) {
    const { data: repo } = await octokit.repos.get({
      owner,
      repo: aide,
    });

    aides.push({
      name: aide,
      url: repo.html_url,
      desc: dealDesc(repo.description),
      star: repo.stargazers_count,
    })
  }

  aides.sort((a, b) => a.name.length - b.name.length);

  const cool = {
    actions,
    tools,
    aides,
  };

  const write = `const cool = ${JSON.stringify(cool)};`;
  fs.writeFileSync('./assets/actions.js', write);
};

function dealDesc(desc) {
  const arr = desc.split('https');
  return arr[0];
}

main();
