"use strict";
import assert from "assert";
import helpers from "../helpers";
import moment from "moment";
import {
  calculateAverageWorkPeriodLength,
  calculateAverageCommitTime,
  calculateAverageCommitsPerWorkPeriod,
  calculateContributors,
  calculateAverageCommitsPerContributorPerWorkPeriod,
  formatTime,
} from '../../helpers/stats';

const HOUR_IN_MS = 60 * 60 * 1000;
const MIN_IN_MS = 60 * 1000;

let sampleTimecard = {
  "reportFormat": "default",
  "hourlyRate": 30,
  "name": "My Project",
  "tagline": "Project description here",
  "primaryColor": "#d45500",
  "card": [
    {
      "date": "Sun Jan 17 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
    {
      "date": "Tue Jan 19 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
    {
      "date": "Sat Jan 23 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
  ]
}

describe("calculateAverageWorkPeriodLength", function() {
  it("should work with empty timecard", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": []
      }]}),
      0
    );
  });
  it("should not work with invalid timecard", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({iAm: "invalid"}),
      null
    );
  });
  it("should calculate average work period length when all times are even", function() {
    assert.equal(
      calculateAverageWorkPeriodLength(sampleTimecard),
      9 * HOUR_IN_MS // 9 hours
    );
  });
  it("should calculate average work period length when times are all different", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": [
          {start: "1:00:00", end: "5:00:00"},
          {start: "6:00:00", end: "6:30:00"},
        ]
      }]}),
      2.25 * HOUR_IN_MS // 2.25 hours
    );
  });
  it("should not take into account non-ending times", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": [
          {start: "1:00:00", end: "5:00:00"},
          {start: "6:00:00"},
        ]
      }]}),
      4 * HOUR_IN_MS // 4 hours
    );
  });
});
describe("calculateAverageCommitTime", function() {
  it("should work with equal length commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:55:00Z"
        },
      ]),
      5 * MIN_IN_MS // 5 minutes
    );
  });
  it("should work with unequal length commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T11:00:00Z"
        },
      ]),
      7.5 * MIN_IN_MS // 7.5 minutes
    );
  });
  it("should not work with one commit", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
      ]),
      null
    );
  });
  it("should not count commits with a bad 'when' date in them, one commit", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "i'm invalid"
        },
      ]),
      null
    );
  });
  it("should not count commits with a bad 'when' date in them, many commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "i'm invalid"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:50:00Z"
        },
      ]),
      5 * MIN_IN_MS // 5 minutes
    );
  });
  it("should not work when given bad arguments", function() {
    assert.equal(calculateAverageCommitTime(null), null);
    assert.equal(calculateAverageCommitTime([]), null);
    assert.equal(calculateAverageCommitTime(123), null);
    assert.equal(calculateAverageCommitTime("a string"), null);
  });
});
describe("calculateAverageCommitsPerWorkPeriod", function() {
  it("should calculate the average", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00"},
              {start: "3:00:00", end: "8:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average using data that calculates to the same totals", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00"},
              {start: "3:00:00", end: "8:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:00:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T02:15:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average, with one time", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/6.4 // 6.4 "average" commits per "average" work period
            // went down from the previous test (7.2) because there is less time
            // on average per work period
    );
  });
  it("should calculate the average, with one commit range (2 commits)", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/3.6 // 3.6 "average" commits per "average" work period
            // again, this is lower, because fewer, longer commits increase the
            // average commit time substantially (less to divide by).
    );
  });
  it("should not work with bad timecard", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        iAm: "a bad timecard",
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      null
    );
  });
  it("should not work with bad commits", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, "bad commits"),
      null
    );
  });
  it("should not work with bad timecard/commits", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod("bad timecard", "bad commits"),
      null
    );
  });
});
describe("calculateContributors", function() {
  it("should calculate contributors with zero contributors", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [],
          },
        ]
      }),
      {}
    );
  });
  it("should calculate contributors with only one", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {user: 2}
    );
  });
  it("should calculate contributors with two", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user two"},
            ],
          },
        ]
      }),
      {user: 1, "user two": 1}
    );
  });
  it("should calculate contributors with greater than two", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user two"},
              {start: "5:00:00", end: "7:00:00", by: "user three"},
            ],
          },
        ]
      }),
      {user: 1, "user two": 1, "user three": 1}
    );
  });
  it("should not calculate contributors with a bad timecard", function() {
    assert.deepEqual(
      calculateContributors({ i_am: "malformed"}),
      false
    );
  });
});
describe("calculateAverageCommitsPerContributorPerWorkPeriod", function() {
  it("should calculate the average with one user only", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average with two users", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user2"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/16 // "average" commits per "average" work period / 2 users
    );
  });
  it("should not calculate the average with a bad timecard", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({i_am: "malformed"}, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      false
    );
  });
  it("should not calculate average with no commits", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user2"},
            ],
          },
        ]
      }, []),
      false
    );
  });
});
describe("formatTime", function() {
  it("should format a time given an epoch", function() {
    assert.equal(formatTime(new Date(0, 0, 0, 1, 0).getTime()), "1 hours and 0 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 1, 30).getTime()), "1 hours and 30 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 1, 40).getTime()), "1 hours and 40 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 0).getTime()), "10 hours and 0 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 30).getTime()), "10 hours and 30 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 40).getTime()), "10 hours and 40 minutes");
  });
  it("should format a time given a date", function() {
    assert.equal(formatTime(new Date(0, 0, 0, 1, 0)), "1 hours and 0 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 1, 30)), "1 hours and 30 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 1, 40)), "1 hours and 40 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 0)), "10 hours and 0 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 30)), "10 hours and 30 minutes");
    assert.equal(formatTime(new Date(0, 0, 0, 10, 40)), "10 hours and 40 minutes");
  });
});
