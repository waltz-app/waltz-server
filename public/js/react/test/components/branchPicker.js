"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {BranchPickerComponent} from '../../components/branchPicker';

describe('components/branchPicker.js', function() {
  describe('bare component', function() {
    it('renders a branch picker', function() {
      let chooseBranchSpy = sinon.spy();
      assert.deepEqual(BranchPickerComponent({
        current_branch: "master",
        branches: ["master", "branch-a", "branch-b"],
        chooseBranch: chooseBranchSpy,
        repo: helpers.testRepo,
      }), <Select
        value="master"
        options={[
          {value: "master", label: "master"},
          {value: "branch-a", label: "branch-a"},
          {value: "branch-b", label: "branch-b"}
        ]}
        clearable={false}
      />);
      assert(chooseBranchSpy.calledOnce);
      assert(chooseBranchSpy.calledWith(helpers.testRepo));
    });
  });
});
