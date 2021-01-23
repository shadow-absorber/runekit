// https://github.com/skillbert/alt1/blob/master/alt1/base/alt1api.ts
// https://runeapps.org/apps/alt1/helpoutput.html

(function () {
    'use strict';

    // The RPC token is set to ensure that web content cannot call API directly
    // (even though if discovered, still cannot bypass profiles restriction)
    const RPC_TOKEN = '%%RPC_TOKEN%%'; // replaced in profile.py

    // FIXME: Even though RPC is secure, this is not...
    let syncChan;
    let api;
    let channel = new Promise(function (resolve) {
        let setup = function(){
            new QWebChannel(qt.webChannelTransport, function (chan) {
                syncChan = chan;
                api = chan.objects.alt1;
                resolve(chan);
            });
        };
        if (typeof window.qt !== 'undefined') {
            setup()
        } else {
            document.addEventListener('DOMContentLoaded', setup);
        }
    });

    function syncRpc(msg, json) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'rk:' + JSON.stringify(msg), false); // sync xhr
        xhr.setRequestHeader('token', RPC_TOKEN);
        xhr.send(null);

        if (json) {
            return JSON.parse(xhr.responseText);
        }
        return xhr.responseText;
    }

    function emit(param){
        let listeners = alt1.events[param.eventName];
        for(let i = 0; i < listeners.length; i++){
            try {
                listeners[i](param);
            }catch(e){
                console.error(e);
            }
        }
    }

    let lastGameActivity = window.performance.now();

    window.alt1 = {
        overlay: {},
        version: '1.1.1',
        versionint: 1001001,
        maxtransfer: 4000000, // also hardcoded in lib...
        skinName: '',
        captureMethod: '',
        permissionInstalled: true,
        permissionGameState: true,
        permissionOverlay: true,
        permissionPixel: true,
        lastWorldHop: 0,
        currentWorld: -1,
        rsPing: 0,
        rsFps: 60,
        openInfo: '{}',
        events: {
            alt1pressed: [],
            menudetected: [],
            rslinked: [],
            rsunlinked: [],
            permissionchanged: [],
            daemonrun: [],
            userevent: [],
            rsfocus: [],
            rsblur: [],
        },

        get screenX() {
            if(!syncChan) return 0;
            return api.screenInfoX;
        },

        get screenY() {
            if(!syncChan) return 0;
            return api.screenInfoY;
        },

        get screenWidth() {
            if(!syncChan) return 0;
            return api.screenInfoWidth;
        },

        get screenHeight() {
            if(!syncChan) return 0;
            return api.screenInfoHeight;
        },

        get captureInterval() {
            if(!syncChan) return 300;
            return api.captureInterval;
        },

        get mousePosition() {
            if(!syncChan) return 0;
            return api.mousePosition;
        },

        get rsLinked() {
            return !!api;
        },

        get rsX() {
            if(!syncChan) return 0;
            return api.gamePositionX;
        },

        get rsY() {
            if(!syncChan) return 0;
            return api.gamePositionY;
        },

        get rsWidth() {
            if(!syncChan) return 0;
            return api.gamePositionWidth;
        },

        get rsHeight() {
            if(!syncChan) return 0;
            return api.gamePositionHeight;
        },

        get rsScaling() {
            if(!syncChan) return 0;
            return api.gameScaling;
        },

        get rsActive() {
            if(!syncChan) return 0;
            return api.gameActive;
        },

        get rsLastActive() {
            return window.performance.now() - lastGameActivity;
        },

        userResize(left, top, right, bottom) {
            window.resizeTo(right-left, bottom-top);
        },

        /**
         * Tells Alt1 to fetch identification information from the given url. The file should contain a json encoded object to be passed to the identifyApp function.
         */
        identifyAppUrl(url) {
            channel.then(function(chan){
                chan.objects.alt1.identifyAppUrl(url);
            });
        },

        // openBrowser(url) {
        // },

        // clearBinds() {
        // },

        // registerStatusDaemon(serverUrl, state) {
        // },
        // getStatusDaemonState() {
        //     return '';
        // },

        // showNotification() {
        // },

        closeApp() {
            window.close()
        },

        setTooltip(tooltip) {
            channel.then(function(chan){
                chan.objects.alt1.setTooltip(tooltip);
            });
            return true;
        },

        clearTooltip() {
            this.setTooltip('');
        },

        setTaskbarProgress(type, progress) {
            channel.then(function(chan){
               chan.objects.alt1.setTaskbarProgress(type, progress);
            });
        },

        setTitleBarText(text) {
            document.title = text;
        },

        overLayRect(color, x, y, w, h, time, lineWidth) {
            console.trace('overLayRect');
            return false;
        },
        overLayTextEx(str, color, size, x, y, time, fontname, centered, shadow) {
            console.trace('overLayTextEx');
            return false;
        },
        overLayLine(color, width, x1, y1, x2, y2, time) {
            console.trace('overLayLine');
            return false;
        },
        overLayImage(x, y, imgstr, imgwidth, time) {
            console.trace('overLayImage');
            return false;
        },
        overLayClearGroup(group) {
            console.trace('overLayClearGroup');
        },
        overLaySetGroup(group) {
            console.trace('overLaySetGroup');
        },
        overLayFreezeGroup(group) {
            console.trace('overLayFreezeGroup');
        },
        overLayContinueGroup(group) {
            console.trace('overLayContinueGroup');
        },
        overLayRefreshGroup(group) {
            console.trace('overLayRefreshGroup');
        },
        overLaySetGroupZIndex(groupname, zIndex) {
            console.trace('overLaySetGroupZIndex');
        },

        getRegion(x, y, w, h) {
            return syncRpc({func: 'getRegion', x: x, y: y, w: w, h: h});
        },
        // getRegionMulti(rectsjson) {
        //     return '';
        // },
        bindRegion(x, y, w, h) {
            return syncRpc({func: 'bindRegion', x: x, y: y, w: w, h: h}, true);
        },
        // bindScreenRegion(x, y, w, h) {
        //     return -1;
        // },
        bindGetRegion(id, x, y, w, h) {
            return syncRpc({func: 'bindGetRegion', id: id, x: x, y: y, w: w, h: h});
        },
        // bindReadString(id, fontname, x, y) {
        //     return '';
        // },
        // bindReadColorString(id, fontname, color, x, y) {
        //     return '';
        // },
        // // TODO: Used in AfkScape
        // bindReadStringEx(id, x, y, args) {
        //     return '';
        // },
        // bindReadRightClickString(id, x, y) {
        //     return '';
        // },
        // bindGetPixel(id, x, y) {
        //     return -1;
        // },
        // bindFindSubImg(id, imgstr, imgwidth, x, y, w, h) {
        //     return '';
        // }
    };

    channel.then(function(chan){
        let instance = chan.objects.alt1;
        instance.game_active_change_signal.connect(function(){
            let active = instance.gameActive;

            if(active){
                emit({eventName: 'rsfocus'});
            }else{
                emit({eventName: 'rsblur'});
            }
        });

        instance.game_activity_signal.connect(function(){
           lastGameActivity = window.performance.now();
        });

        instance.alt1Signal.connect(function (pos){
            let mouseX = pos >> 16;
            let mouseY = pos & 0xFFFF;
            let mouseRsX = mouseX - instance.gamePositionX;
            let mouseRsY = mouseY - instance.gamePositionY;
            let event = {
                eventName: 'alt1pressed',
                text: '',
                mouseAbs: {
                    x: mouseX,
                    y: mouseY,
                },
                mouseRs: {
                    x: mouseRsX,
                    y: mouseRsY,
                },
                x: mouseRsX,
                y: mouseRsY,
                rsLinked: true,
            };
            emit(event);

            if (typeof window.alt1onrightclick !== 'undefined') {
                try{
                    window.alt1onrightclick(event);
                }catch(e){
                    console.error(e);
                }
            }
        })
    });

})();
