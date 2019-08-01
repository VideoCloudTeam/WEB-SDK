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
        var vcReg = new VCRegister(); // register for receiving incoming call;
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


        var apiServer = 'vapi.myvmr.cn',
            mcuHost = 'mcu.myvmr.cn',
            alias = '1061',
            password = '123456',
            displayName = 'demo7';
        // rtc.pin = password; // conference password, if it has.
        vcReg.register(mcuHost, "sdkdemo@myvmr.cn", "sdkdemo1234");
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


        // 被动入会
        vcReg.onIncoming = function (msg) {
            setTimeout(function () {
                rtc.oneTimeToken = msg.token; // used to pass call token
                rtc.makeCall(mcuHost, msg.remote_alias + "@" + msg.owner, displayName, null, 'video');
            },);
        }

        // click enter to conference
        $scope.enterConference = function () {
            rtc.makeCall(mcuHost, alias, displayName, null, 'video');
        }
        $scope.exitConference = function () {
            rtc.disconnect();
        }

        rtc.onError = function (msg) {
            console.log('onError: ', msg);
        }
        window.onbeforeunload = function () {
            rtc.disconnect();
        }
    }]);