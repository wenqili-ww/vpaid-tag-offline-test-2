/*
 * This implements the VPAID spec so that we can be embedded in other players
 * - Based on source: ww4Player/node/public/javascripts/wirewax-vpaid.js
 * - Based on version commit: 47b43ce on Jul 8, 2019
 */

var WIREWAX_URL_PARAMS_ALLOWED = [
    'lang',
    'locale',
    'country',
    'debug',
    'muted',
    'password',
    'noShare',
    'fullBleed',
    'allow360Portrait',
    'devCustoms',
    'autoStart',
    'retailer'
];

var TRIGGERS = {
    PLAY: 'videoPlay',
    PAUSE: 'videoPause',
    SEEK: 'videoSeek',
    IS_PLAYER_READY: 'isPlayerReady',
    GET_CURRENT_TIME: 'getCurrentTime',
    GO_TO_TAG: 'goToTag',
    OPEN_TAG: 'openTag',
    CHANGE_VOLUME: 'changeVolume',
    MUTE_VOLUME: 'muteVolume',
    UNMUTE_VOLUME: 'unMuteVolume',
    CLOSE_WIDGET: 'closeWidget',
    DEVICE_ORIENTATION: 'deviceOrientation',
    DEVICE_MOTION: 'deviceMotion',
    DEVICE_SCREEN_ORIENTATION: 'deviceScreenOrientation',
    CLIENT_CUSTOM_TRIGGER: 'clientCustomTrigger'
};

var LISTENERS = {
    PLAYER_READY: 'playerReady',
    HAS_PLAYED: 'hasPlayed',
    HAS_PAUSED: 'hasPaused',
    HAS_SEEKED: 'hasSeeked',
    ADD_TO_CART: 'addToCart',
    VIDEO_END: 'videoEnd',
    STOP_AD: 'stopAd',
    VOLUME_CHANGE: 'volumeChange',
    TAG_CLICK: 'tagClick',
    WIDGET_CLICKOUT: 'widgetClickout',
    RETURN_CURRENT_TIME: 'returnCurrentTime',
    CLIENT_CUSTOM_EVENT: 'clientCustomEvent',
    WIDGET_SHOWN: 'widgetShown',
    WIDGET_CLOSED: 'widgetClosed',
    VIDEO_FIRST_QUARTILE: 'videoFirstQuartile',
    VIDEO_MIDPOINT: 'videoMidpoint',
    VIDEO_THIRD_QUARTILE: 'videoThirdQuartile',
    DURATION_CHANGE: 'durationChange',
    ERROR: 'error'
};

var VPAID_CALLBACKS = {
    AdImpression: 'AdImpression',
    AdVideoComplete: 'AdVideoComplete',
    AdInteraction: 'AdInteraction',
    AdVideoStart: 'AdVideoStart',
    AdClickThru: 'AdClickThru',
    AdVideoFirstQuartile: 'AdVideoFirstQuartile',
    AdVideoMidpoint: 'AdVideoMidpoint',
    AdVideoThirdQuartile: 'AdVideoThirdQuartile',
    AdLoaded: 'AdLoaded',
    AdVolumeChange: 'AdVolumeChange',
    AdRemainingTimeChange: 'AdRemainingTimeChange',
    AdDurationChange: 'AdDurationChange',
    AdError: 'AdError',
    AdStarted: 'AdStarted',
    AdStopped: 'AdStopped',
    AdSkipped: 'AdSkipped',
    AdSizeChange: 'AdSizeChange',
    AdPaused: 'AdPaused',
    AdExpandedChange: 'AdExpandedChange',
    AdResumed: 'AdResumed',
    AdPlaying: 'AdPlaying'
};

var LinearAd = function () {
    var self = this;

    //private vars
    var scriptUrl = "";
    var subscriptions = {};
    var timeUpdateInterval = window.setInterval(function () {
        triggerEvent(TRIGGERS.GET_CURRENT_TIME);
    }, 1000);

    //private functions
    function init() {
        getScriptUrl();
        self.videoContainer = null;
        self.callbacks = {};
        self.vidId = getUrlParameter(scriptUrl, 'wwVidId') || getUrlParameter(scriptUrl, 'vidId');
        self.embedLoc = getUrlParameter(scriptUrl, 'embedLoc');
        self.enableGyro = getUrlParameter(scriptUrl, 'enableGyro');
        self.wakeOnReturn = getUrlParameter(scriptUrl, 'wakeOnReturn');
        self.wirewaxEmbedUrlParams = '';
        for (var i = 0; i < WIREWAX_URL_PARAMS_ALLOWED.length; i++) {
            var override = WIREWAX_URL_PARAMS_ALLOWED[i];
            var paramValue = getUrlParameter(scriptUrl, override);
            if (paramValue && paramValue != '') {
                self.wirewaxEmbedUrlParams += '&' + override + '=' + paramValue;
            }
        }
        self.wirewaxIframe = null;
        self.currentTime = 0;
        self.duration = parseInt(getUrlParameter(scriptUrl, 'duration')) || 30;
        self.volume = 1;

        self.height = 0;
        self.width = 0;
        setVpaidGetAndSetFunctions();
        var IS_MOBILE_USERAGENT = navigator.userAgent.match(/Mobile/i) !== null;
        var IS_IPAD = navigator.userAgent.match(/iPad/i) !== null;
        var IS_IPHONE = (navigator.userAgent.match(/iPhone/i) !== null) || (navigator.userAgent.match(/iPod/i) !== null);
        var IS_ANDROID = navigator.userAgent.match(/Android/i) !== null;
        var IS_KINDLE = navigator.userAgent.match(/Silk/i) !== null;
        var IS_BLACKBERRY = navigator.userAgent.match(/Blackberry/i) !== null || navigator.userAgent.match(/RIM/i) !== null;
        var IS_WINDOWS_PHONE = navigator.userAgent.match(/Windows Phone/i) !== null || navigator.userAgent.match(/IEMobile/i) !== null || navigator.userAgent.match(/WPDesktop/i) !== null || (navigator.userAgent.match(/Windows NT/i) !== null && navigator.userAgent.match(/Touch/i) !== null && navigator.userAgent.match(/Windows Phone/i) !== null);
        var IS_DESKTOP = !(IS_MOBILE_USERAGENT || IS_IPAD || IS_KINDLE || IS_ANDROID || IS_IPHONE || IS_BLACKBERRY || IS_WINDOWS_PHONE);

        self.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
            self.videoContainer = environmentVars.slot;
            self.document = environmentVars.slot.ownerDocument;
            if (self.vidId) {
                var iframe = self.document.createElement('iframe');
                iframe.id = "wirewax-ad-iframe";
                var embedLocation = "https://edge-assets.wirewax.com/creativeData/Taboola/Test/";
                if (scriptUrl.indexOf('wirewax.tv') !== -1) {
                    embedLocation = "https://edge-assets.wirewax.com/creativeData/Taboola/Test/";
                }
                var src = embedLocation + self.vidId + "/index.html?embedLoc=" + self.embedLoc + "&skin=SkinBarebonesSlick"+ self.wirewaxEmbedUrlParams + "&preload=true";

                if(self.wakeOnReturn) {
                    src += '&wakeOnReturn=true';
                }

                iframe.src = src;
                iframe.width = width;
                iframe.height = height;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay');

                self.width = width;
                self.height = height;

                self.videoContainer.appendChild(iframe);

                self.wirewaxIframeEl = self.document.getElementById('wirewax-ad-iframe');
                self.wirewaxIframe = self.wirewaxIframeEl.contentWindow;
                addWirewaxEventListeners();
                startListeningWirewaxMessages();
                if (self.enableGyro) {
                    enableGyro();
                }
            }
        };

        self.startAd = function (e) {
            triggerEvent(TRIGGERS.PLAY);
            callVpaidCallback(VPAID_CALLBACKS.AdStarted);
            callVpaidCallback(VPAID_CALLBACKS.AdImpression);
        };

        self.stopAd = function () {
            callVpaidCallback(VPAID_CALLBACKS.AdStopped);
        };

        self.skipAd = function () {
            callVpaidCallback(VPAID_CALLBACKS.AdSkipped);
        };

        self.resizeAd = function (width, height) {
            if (self.wirewaxIframeEl) {
                self.wirewaxIframeEl.height = height;
                self.wirewaxIframeEl.width = width;
            }
            callVpaidCallback(VPAID_CALLBACKS.AdSizeChange);
        };

        self.pauseAd = function () {
            triggerEvent(TRIGGERS.PAUSE);
            // callVpaidCallback(VPAID_CALLBACKS.AdPaused);
        };

        self.resumeAd = function () {
            triggerEvent(TRIGGERS.PLAY);
            // callVpaidCallback(VPAID_CALLBACKS.AdResumed);
        };

        self.expandAd = function () {
            callVpaidCallback(VPAID_CALLBACKS.AdExpandedChange);
        };

        self.collapseAd = function () {
            callVpaidCallback(VPAID_CALLBACKS.AdExpandedChange);
        };

        self.subscribe = function (callback, event) {
            self.callbacks[event] = callback;
        };

        self.unsubscribe = function (event) {
            self.callbacks[event] = null;
        };
    }

    function startListeningWirewaxMessages() {
        window.addEventListener("message", function (event) {
            var data = event.data;

            if (typeof event.data == 'string') {
                try {
                    data = JSON.parse(event.data);
                }
                catch (err) {
                    if (data.indexOf('{') != -1) {
                        console.error('Error parsing JSON string');
                    }
                }
            }

            for (var listener in LISTENERS) {
                var listenerName = LISTENERS[listener];
                if (data.name === listenerName) {
                    if (subscriptions[listenerName]) {
                        for (var i = 0; i < subscriptions[listenerName].length; i++) {
                            subscriptions[listenerName][i](event.data);
                        }
                    }
                }
            }
        }, false);
    }

    function getScriptUrl() {
        for (var scriptIndex = 0; scriptIndex < document.getElementsByTagName('script').length; scriptIndex++) {
            if (document.getElementsByTagName('script')[scriptIndex].getAttribute('src') && document.getElementsByTagName('script')[scriptIndex].getAttribute('src').indexOf('wirewax') !== -1) {
                scriptUrl = document.getElementsByTagName('script')[scriptIndex].getAttribute('src');
            }
        }
    }

    function callVpaidCallback(callbackName, callback) {
        if (self.callbacks[callbackName] && typeof self.callbacks[callbackName] === 'function') {
            self.callbacks[callbackName]();
            if (callback && typeof self.callbacks[callbackName] === 'function') {
                callback();
            }
        }
    }

    function triggerEvent(eventName, data) {
        if (self.wirewaxIframe) {
            if (data === undefined || data === null) {
                self.wirewaxIframe.postMessage(eventName, "*");
            }
            else {
                self.wirewaxIframe.postMessage({name: eventName, data: data}, "*");
            }
        }
    }

    function addEventListener(eventName, callback) {
        if (!subscriptions[eventName]) {
            subscriptions[eventName] = [];
        }

        var subscriptionId = subscriptions[eventName].length;
        subscriptions[eventName].push(callback);

        return function () {
            subscriptions[eventName].splice(subscriptionId, 1);
        }
    }

    function getUrlParameter(url, name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    function setVpaidGetAndSetFunctions() {
        self.getAdRemainingTime = function () {
            return self.duration - self.currentTime;
        };

        self.getAdExpanded = function () {
            return true;
        };

        self.getAdDuration = function () {
            return self.duration;
        };

        self.getAdVolume = function () {
            return self.volume;
        };

        self.setAdVolume = function (volume) {
            self.volume = volume;
            triggerEvent(TRIGGERS.CHANGE_VOLUME, volume);
        };

        self.getAdSkippableState = function () {
            return false;
        };

        self.getAdLinear = function () {
            return true;
        };

        self.handshakeVersion = function () {
            return '2.0';
        };

        self.getAdIcons = function () {
            return false;
        };

        self.getAdCompanions = function () {
            return "";
        };

        self.getAdHeight = function () {
            return self.height;
        };

        self.getAdWidth = function () {
            return self.width;
        };
    }

    function addWirewaxEventListeners() {

        addEventListener(LISTENERS.VIDEO_END, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdVideoComplete);
        });

        addEventListener(LISTENERS.STOP_AD, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdStopped);
        });

        addEventListener(LISTENERS.TAG_CLICK, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdInteraction);
        });

        addEventListener(LISTENERS.HAS_PLAYED, function () {
            if (!self.playerStarted) {
                callVpaidCallback(VPAID_CALLBACKS.AdVideoStart);
                self.playerStarted = true;
            } else {
                // VPAID v 2.0
                callVpaidCallback(VPAID_CALLBACKS.AdPlaying);
                // VPAID v 1.0
                callVpaidCallback(VPAID_CALLBACKS.AdResumed);
            }
        });

        addEventListener(LISTENERS.HAS_PAUSED, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdPaused);
        });

        addEventListener(LISTENERS.WIDGET_CLICKOUT, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdClickThru);
        });

        addEventListener(LISTENERS.VIDEO_FIRST_QUARTILE, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdVideoFirstQuartile);
        });

        addEventListener(LISTENERS.VIDEO_MIDPOINT, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdVideoMidpoint);
        });

        addEventListener(LISTENERS.VIDEO_THIRD_QUARTILE, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdVideoThirdQuartile);
        });

        addEventListener(LISTENERS.PLAYER_READY, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdLoaded);
        });

        addEventListener("volumeChange", function (data) {
            self.volume = data.data.volume;
            callVpaidCallback(VPAID_CALLBACKS.AdVolumeChange);
        });

        addEventListener(LISTENERS.RETURN_CURRENT_TIME, function (eventData) {
            self.currentTime = eventData.data.currentTime;
            callVpaidCallback(VPAID_CALLBACKS.AdRemainingTimeChange);
        });

        addEventListener(LISTENERS.DURATION_CHANGE, function (eventData) {
            self.duration = eventData.data.duration;
            callVpaidCallback(VPAID_CALLBACKS.AdDurationChange);
        });

        addEventListener(LISTENERS.ERROR, function () {
            callVpaidCallback(VPAID_CALLBACKS.AdError);
        });
    }

    function enableGyro() {
        var mainWindow = null;
        if(!inIframe()){
            mainWindow = window.self;
        } else if (inSameDomainIframe()) {
            mainWindow = window.top;
        }

        if(mainWindow){
            addEventListener(LISTENERS.HAS_PLAYED, function () {
                triggerEvent(TRIGGERS.DEVICE_SCREEN_ORIENTATION, window.orientation);
            });
            mainWindow.addEventListener("orientationchange", function () {
                triggerEvent(TRIGGERS.DEVICE_SCREEN_ORIENTATION, window.orientation);
            }, false);
            mainWindow.addEventListener("devicemotion", function (event) {
                var data = {
                    accelerationIncludingGravity: {
                        z: event.accelerationIncludingGravity.z
                    }
                };
                triggerEvent(TRIGGERS.DEVICE_MOTION, data);
            }, false);
            mainWindow.addEventListener("deviceorientation", function (event) {
                var data = {
                    gamma: event.gamma,
                    alpha: event.alpha,
                    beta: event.beta,
                    webkitCompassHeading: event.webkitCompassHeading
                };
                triggerEvent(TRIGGERS.DEVICE_ORIENTATION, data);
            }, false);
            self.gyroEnabled = true;
        }

    }

    function inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function inSameDomainIframe() {
        try{
            var doc = parent.document;
            if(!doc){
                throw new Error('Unaccessible');
            } else{
                return true;
            }
            // accessible
        }catch(e){
            return false;
        }
    }

    function killWirewax() {
        window.clearInterval(timeUpdateInterval);
        self.videoContainer.removeChild(self.document.getElementById('wirewax-ad-iframe'));
    }

    // init
    init();
};

getVPAIDAd = function () {
    return new LinearAd();
};