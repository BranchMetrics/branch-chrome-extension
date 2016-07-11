// Copyright (c) 2016 Branch Metrics, Inc. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

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
  document.getElementById('link-text').textContent = statusText;
}

function setStatus(status) {
  if (status === 0) {
    // init
    document.getElementById("loading-img").style.visibility = "hidden";

  } else if (status === 1) {
    // loading
    document.getElementById("loading-img").style.visibility = "visible";

  } else {
    // loaded
    document.getElementById("loading-img").style.visibility = "hidden";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setStatus(1);
  getCurrentTabUrl(function(url) {
    renderUrl(url);
  });
});
