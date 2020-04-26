'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
    .controller('MainCtrl', ['Meet', '$timeout', '$q', '$log', '$rootScope', '$sce', '$scope', '$interval', function (Meet, $timeout, $q, $log, $rootScope, $sce, $scope, $interval) {
        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var _this = this;
        var rtc = new ZjRTC(); //
        rtc.clayout = "4:4";
        rtc.onSetup = function (stream, pinStatus, conferenceExtension) {
            $timeout(function () {
                $log.debug('ZjRTC.onSetup', stream, pinStatus, conferenceExtension);
                if (stream) {
                    $('#lvideo')[0].srcObject = stream;
                }

                if (!stream && conferenceExtension) {
                    $rootScope.$broadcast('call::extensionRequested', conferenceExtension);
                } else if (pinStatus !== 'none') {
                    $rootScope.$broadcast('call::pinRequested', pinStatus === 'required');
                } else {
                    _this.connect();
                }
            });
        };

        this.connect = function (pin, extension) {
            rtc.connect(pin, extension);
        };

        rtc.onConnect = function (stream) {
            if (rtc.call_type === 'video' || rtc.call_type == 'recvonly') {
                $('#rvideo')[0].srcObject = stream;
                $('#raudio')[0].srcObject = stream;
            }
        };


        var apiServer = 'bss.lalonline.cn',
            mcuHost = '',
            alias = '1866',
            password = '123456',
            displayName = 'demo1';
        var data = {
            joinAccount: alias,
            joinPwd: password,
            participantName: displayName
        }

        // get conference information
        Meet.getAuth(apiServer, data).$promise.then(function (res) {
            if (res.code === '200') {
                mcuHost = res.results.mcuHost;
                rtc.pin = password
            }
            else
                alert(res.results);
        })
            .catch(function (err) {
                alert(`接口异常，请确认您有权访问该接口:${err.config.url}。`);
            })
        $scope.submit = function (){
            var temp = $("#ipaddr").val();
            // rtc.tpnode = "192168000138.51vmr.com:8887";
            rtc.tpnode = temp;
        }
        // click enter to conference
        $scope.enterConference = function () {
            rtc.makeCall(mcuHost, alias, displayName, null, 'video');
        }
        $scope.exitConference = function () {
            rtc.disconnect();
        }

        //屏幕共享
        $scope.screenShare = function () {
            rtc.throwingScreenOn(1);
        }
        $scope.videoShare = function () {
            var file = $('#videoFile')[0].captureStream();
            rtc.throwingScreenOn(3,file);
        }
        $scope.exitScreenShare = function () {
            rtc.throwingScreenOff();
        }

        $scope.setClearallhand = function(){
            rtc.setClearallhand();
        }
        $scope.setParticipantRaisehand = function(){
            rtc.setParticipantRaisehand();
        }
        $scope.setParticipantClearhand = function(){
            rtc.setParticipantClearhand();
        }
        rtc.onScreenshareStopped = function (msg) {
            console.log('onScreenshareStopped: ', msg);
        }
        $scope.test = function () {
            getWebsocket();
        }
        rtc.onScreenshareMissing = function (msg) {
            var message = '使用屏幕共享网站需要支持 "https".\n 未检查到屏幕分享插件，请安装:\n https://cs.zijingcloud.com/static/extension/browser.html';
            alert(message);
            console.log(message);
        }
        rtc.onWebSocketClose = function(msg){
            console.log(msg);
        };

        //sdk 异常消息捕获
        rtc.onError = function (msg) {

            console.log('onError: ', msg);
        }
        window.onbeforeunload = function () {
            rtc.disconnect();
        }
    }]);