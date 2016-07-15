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
 * Save the Branch key for the account.
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called after the Branch key is saved.
 */
function saveKey(branch_key, callback) {
  chrome.storage.sync.set({BRANCH_KEY: branch_key}, function() {
    setStatus()
    callback();
  });
}

/**
 * Load the Branch key 
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called once the local storage is read.
 */
function readKey(branch_key, callback) {
  chrome.storage.sync.get(BRANCH_KEY, function(keyObj) {
    callback(keyObj[BRANCH_KEY]);
  });
}

/**
 * Create a Branch link
 *
 * @param key for the Branch key used to create the link.
 * @param {function(string)} callback - called once the local storage is read.
 */

 

/* network call example
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}*/

function renderUrl(url) {
  document.getElementById('link-text').textContent = url;
  new Clipboard('copy-button');
  document.getElementById('copy-button').setAttribute('data-clipboard-text', url);
}

function setStatus(status) {
  console.log("setting status " + status);
  if (status === 0) {
    // enter Branch key
    document.getElementById("loading-img").style.visibility = "hidden";
    document.getElementById("loading-img").style.width = "0px";
    document.getElementById("loading-img").style.height = "0px";
  } else if (status === 1) {
    // saving Branch key
    document.getElementById("loading-img").style.visibility = "visible";
    document.getElementById("loading-img").style.width = "25px";
    document.getElementById("loading-img").style.height = "25px";
  } else if (status === 2) {
    // loading Branch link
    document.getElementById("loading-img").style.visibility = "visible";
    document.getElementById("loading-img").style.width = "25px";
    document.getElementById("loading-img").style.height = "25px";
  } else {
    // link loaded
    document.getElementById("loading-img").style.visibility = "hidden";
    document.getElementById("loading-img").style.width = "0px";
    document.getElementById("loading-img").style.height = "0px";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("loaded!");
  setStatus(0);
  getCurrentTabUrl(function(url) {
    console.log("loaded!");
    renderUrl(url);
    setStatus(2);
  });
});
