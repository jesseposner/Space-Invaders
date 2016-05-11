var resourceCache = {};
var loading = [];
var readyCallbacks = [];

function _load(url) {
  if (resourceCache[url]) {
   return resourceCache[url];
  } else {
   var img = new Image();
   img.onload = function() {
     resourceCache[url] = img;

     if(Resources.isReady()) {
       readyCallbacks.forEach(function(func) { func(); });
     }
   };
   resourceCache[url] = false;
   img.src = url;
  }
}

var Resources = {
  // Load an image url or an array of image urls
  load: function(urlOrArr) {
    if (urlOrArr instanceof Array) {
      urlOrArr.forEach(function(url) {
        _load(url);
      });
    } else {
      _load(urlOrArr);
    }
  },

  get: function(url) {
    return resourceCache[url];
  },

  isReady: function() {
    var ready = true;
    for (var k in resourceCache) {
      if(resourceCache.hasOwnProperty(k) &&
         !resourceCache[k]) {
          ready = false;
      }
    }
    return ready;
  },

  onReady: function(func) {
    readyCallbacks.push(func);
  }
};

module.exports = Resources;
