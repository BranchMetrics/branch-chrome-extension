// Copyright (c) 2016 Branch Metrics, Inc. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

var BRANCH_KEY = "branch_key";
var link_data = {
    type: 2,
    auto_fetch: true,
    feature: 'Link Creator',
    data: {
    }
  };

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
  var x = new XMLHttpRequest();
  x.open('GET', api_endpoint);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 403) {
      return callback(true);
    }
    else if (x.readyState == 4 && x.status == 400) {
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

  // fill in remainder of link data
  link_data.branch_key = branch_key;
  link_data.data.$marketing_title = marketing_title;
  link_data.data.$fallback_url = web_url;
  link_data.data.$desktop_url = web_url;
  link_data.data.$android_url = web_url;
  link_data.data.$ios_url = web_url;

  x.send(JSON.stringify(link_data));
}

function renderUrl(url) {
  document.getElementById('link-text').textContent = url;

  // domain for edit screen
  var l = document.createElement('a');
  l.href = url;
  var domain = l.hostname + '/';
  document.getElementById('domain-text').textContent = domain;

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
    document.getElementById("error-text").style.display = "none";
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
    document.getElementById("error-text").style.display = "none";
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
    // editing link
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

// Show edit screen
function handleEditClick() {
  setStatus(5);
  document.getElementById('edit-cancel-button').onclick = handleCancelClick;
  document.getElementById('edit-save-button').onclick = handleSaveClick;
}

// clear out unsaved link data
function handleCancelClick() {
  if (link_data.alias != null) {
    document.getElementById('alias-input').value = link_data.alias;
  }
  else {
    document.getElementById('alias-input').value = "";
  }
  if (link_data.channel != null) {
    document.getElementById('channel-input').value = link_data.channel;
  }
  else {
    document.getElementById('channel-input').value = "";
  }
  if (link_data.campaign != null) {
    document.getElementById('campaign-input').value = link_data.campaign;
  }
  else {
    document.getElementById('campaign-input').value = "";
  }
  if (link_data.tags != null) {
    document.getElementById('tags-input').value = link_data.tags.join(' ');
  }
  else {
    document.getElementById('tags-input').value = "";
  }
  if (link_data.data.$web_only != null) {
    document.getElementById('web-only-input').checked = link_data.data.web_only;
  }
  handleClick();
}

// Save valid link data
function handleSaveClick() {
  if (document.getElementById('alias-input').value != "") {
    link_data.alias = document.getElementById('alias-input').value;
  }
  else {
    delete link_data.alias;
  }
  if (document.getElementById('channel-input').value != "") {
    link_data.channel = document.getElementById('channel-input').value;
  }
  else {
    delete link_data.channel;
  }
  if (document.getElementById('campaign-input').value != "") {
    link_data.campaign = document.getElementById('campaign-input').value;
  }
  else {
    delete link_data.campaign;
  }
  if (document.getElementById('tags-input').value != "") {
    link_data.tags = document.getElementById('tags-input').value.split(' ');
  }
  else {
    delete link_data.tags;
  }
  if (document.getElementById('web-only-input').checked != false) {
    link_data.data.$web_only = document.getElementById('web-only-input').checked;
  }
  else {
    delete link_data.data.$web_only;
  }
  handleClick();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('copy-button').onclick = handleClick;
  document.getElementById('change-text').onclick = handleChangeClick;
  document.getElementById('edit-button').onclick = handleEditClick;
  document.getElementById('save-button').onclick = handleClick;
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
