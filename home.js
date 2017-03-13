// Copyright (c) 2016 Branch Metrics, Inc. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

var BRANCH_KEY = "branch_key";

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    if (typeof url != 'string') { url = null; }

    callback(url);
  });
}

/**
 * Validate Branch key
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called after the Branch key is saved.
 */
function validateKey(branch_key, callback) {
  var api_endpoint = "https://api.branch.io/v1/app/" + branch_key;
  //var api_endpoint = "https://api.branch.io/v1/app/" + branch_key + "?branch_secret=secret_live_IwNCZ9FYVJ436EV8t3q1PVFMSelAtNi1";
  var x = new XMLHttpRequest();
  x.open('GET', api_endpoint);
  x.onreadystatechange = function() {
    console.log(x.readyState);
    console.log(x.status);
    if (x.readyState == 4 && x.status == 403) {
      return callback(true);
    }
    return callback(false);
  };
  x.send();
}

/**
 * Save the Branch key for the account.
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called after the Branch key is saved.
 */
function saveKey(branch_key, callback) {
  var jsonfile = {};
  jsonfile[BRANCH_KEY] = branch_key;
  chrome.storage.sync.set(jsonfile, function() {
    if (callback) { callback(); }
  });
}

/**
 * Load the Branch key 
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called once the local storage is read.
 */
function readKey(callback) {
  chrome.storage.sync.get(BRANCH_KEY, function(keyObj) {
    callback(keyObj[BRANCH_KEY]);
  });
}

/**
 * Create a Branch link
 *
 * @param branch_key the Branch key used to create the link.
 * @param web_url the current tab url for creating a link
 * @param {function(string)} callback - called once the local storage is read.
 */
function createLink(branch_key, web_url, callback) {
  var api_endpoint = "https://api.branch.io/v1/url";

  var x = new XMLHttpRequest();
  x.open('POST', api_endpoint);
  x.setRequestHeader("Content-type", "application/json", true);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      var response = x.response;
      if (response && response.url) {
        return callback(response.url);
      }
    }

    return callback("Could not create link.");
  };
  var marketing_title = "Link to: " + web_url.substring(web_url.indexOf('://') + 3, Math.min(web_url.length, 50));
  if (web_url.length > 50) { marketing_title = marketing_title + "..."; }
  x.send(JSON.stringify({
    branch_key: branch_key,
    type: 2,
    auto_fetch: true,
    data: {
      '$fallback_url': web_url,
      '$marketing_title': marketing_title
    }
  }));
}

function renderUrl(url) {
  document.getElementById('link-text').textContent = url;
  document.getElementById('copy-button').setAttribute('data-clipboard-text', url);
  var clipboard = new Clipboard('#copy-button');
  clipboard.on('success', function(e) {
    document.getElementById('copy-text').style.display = "block";
    setTimeout(function() {
      document.getElementById('copy-text').style.display = "none";
    }, 5000);

    e.clearSelection();
  });
}

function setStatus(status) {
  console.log("setting status " + status);
  if (status === -1) {
    document.getElementById('status-text').textContent = "Checking for Branch key...";
    document.getElementById("status-text").style.display = "inline-block";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
  } else if (status === 0) {
    // enter Branch key
    document.getElementById('status-text').textContent = "";
    document.getElementById("status-text").style.display = "none";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="block";
    }
    elements = document.getElementsByClassName("edit-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
  } else if (status === 1) {
    // saving Branch key
    document.getElementById('status-text').textContent = "saving Branch key locally...";
    document.getElementById("status-text").style.display = "inline-block";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("edit-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
  } else if (status === 2) {
    // key error
    document.getElementById('error-text').textContent = "Key is invalid. Please try again.";
    document.getElementById("error-text").style.display = "block";
  } else if (status === 3) {
    // loading Branch link
    document.getElementById('status-text').textContent = "Creating your Branch link...";
    document.getElementById('status-text').style.display = "block";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("edit-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
  } else if (status === 4) {
    // link loaded
    document.getElementById("status-text").style.display = "none";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="block";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("edit-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
  } else if (status === 5) {
    // link loaded
    document.getElementById("status-text").style.display = "none";
    elements = document.getElementsByClassName("link-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("key-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="none";
    }
    elements = document.getElementsByClassName("edit-screen");
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display="block";
    }
  }
}

function proceedToBranchify(branch_key) {
  setStatus(3);
  document.getElementById('copy-button').onclick = null;
  getCurrentTabUrl(function(url) {
    createLink(branch_key, url, function(url) {
      renderUrl(url);
      setStatus(4);
    });
  });
}

function handleClick() {
  var branch_key = document.getElementById('branch-key-input').value;
  validateKey(branch_key, function(valid) {
    console.log("valid");
    console.log(valid);
    valid = true;
    if (valid) {
      saveKey(branch_key);
      proceedToBranchify(branch_key);
    } else {
      setStatus(2);
    }
  });
}

function handleChangeClick() {
  setStatus(0);
  document.getElementById('save-button').onclick = handleClick;
  document.getElementById("branch-key-input").setSelectionRange(0, document.getElementById("branch-key-input").value.length);
}

function textClick() {
  var range = document.createRange();
  var selection = window.getSelection();
  range.selectNodeContents(document.getElementById('link-text'));

  selection.removeAllRanges();
  selection.addRange(range);
}

function handleEditClick() {
  setStatus(5);
  document.getElementById('edit-save-button').onclick = handleClick;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('copy-button').onclick = handleClick;
  document.getElementById('change-text').onclick = handleChangeClick;
  document.getElementById('save-button').onclick = handleClick;
  document.getElementById('edit-button').onclick = handleEditClick;
  document.getElementById('link-text').onclick = textClick;
  setStatus(-1);
  readKey(function(key) {
    if (key) {
      proceedToBranchify(key);
      document.getElementById("branch-key-input").value = key;
    } else {
      setStatus(0);
    }
  });
});
