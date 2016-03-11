
// initialize github repo import
export function openRepoImportDialog(state) {
  return {
    type: "REPO_IMPORT_DIALOG",
    provider: "github",
    state,
  }
};

// import a new repo from github
export function importFromGithubRepo(repo, createTimecard = false, timecardTempl) {
  return {
    type: "server/IMPORT_REPO",
    repo: repo,
    provider: "github",
    createtimecard: createTimecard,
    timecard: timecardTempl || null,
  };
};

// Select a new repo to be the active one.
export function selectRepo(repo) {
  return {
    type: "SELECT_REPO",
    index: [repo.user, repo.repo],
  }
};

export function requestAllUserRepos(page) {
  return {
    type: "server/DISCOVER_REPOS",
    page: page || 0,
  };
};

export function changeBranch(branch) {
  return {
    type: "CHANGE_BRANCH",
    branch,
  }
};

// query the backend for the branches of the current repo
export function getBranches(repo) {
  return {
    type: "server/GET_BRANCHES",
    user: repo.user,
    repo: repo.repo,
  };
}

// get the contents of a timecard
export function getTimecard(repo, branch, page=0) {
  return {
    type: "server/GET_TIMECARD",
    user: repo.user,
    repo: repo.repo,
    branch: branch || null,
    page: page,
  }
};

export function askUserToCreateNewTimecard(user, repo) {
  return {
    type: "NEW_TIMECARD_IN_DISCOVERED_REPO",
    user,
    repo,
  };
}

// update the staging timecard that is to be created in an existing repository
export function changeStagingTimecardData(name, value) {
  let data = {}; data[name] = value;
  return {
    type: "CHANGE_NEW_TIMECARD_DATA",
    data,
  };
};
