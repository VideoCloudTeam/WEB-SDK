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
        rtc.clayout = "1:7";
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
            displayName = 'demo8';
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

        // click enter to conference
        $scope.enterConference = function () {
            rtc.makeCall(mcuHost, alias, displayName, null, 'video');
        }
        $scope.exitConference = function () {
            rtc.disconnect();
        }

        //开启白板
        $scope.startWiteBoard = function () {
            if(_this.base64){
                //预上传图片白板操作 png
                //fileName 文件名 xxx.png
                //base64 文件的base64
                rtc.startWhiteboard(_this.fileName,_this.base64);
            }else{
                rtc.startWhiteboard();
            }

        }
        // 关闭白板
        $scope.closeWhiteBoard = function () {
            rtc.stopWhiteboard();
            delete _this.base64;
        }
        rtc.onConferenceUpdate = function (data) {
            $timeout(function () {
                $log.debug('onConferenceUpdate', data);
                _this.locked = data.locked;
                _this.guestsMuted = data.guests_muted;
                _this.liveStatus = data.live_status;
                _this.recordStatus = data.record_status;
                $scope.whiteBoard = data.whiteboard;
                if ($scope.whiteBoard && data.wb_url) {
                    //_this.screenShareMode = 'screen_http';  //add by zhy
                    delete _this.presentationImgSrc;
                    $scope.wb_url = $sce.trustAsResourceUrl(data.wb_url);
                } else {
                    delete $scope.wb_url;
                }
            });
        }
        //sdk 异常消息捕获
        rtc.onError = function (msg) {

            console.log('onError: ', msg);
        }
        window.onbeforeunload = function () {
            rtc.disconnect();
        }
        $scope.check = function () {
            var objFile = document.getElementById("fileId");
            if(objFile.value == "") {
                alert("不能为空空");
                return false;
            }
            var files = $('#fileId').prop('files');//获取到文件列表
            if(files.length == 0){
                alert('请选择文件');
            }else{
                var reader = new FileReader();//新建一个FileReader
                reader.readAsDataURL(files[0]);
                reader.onload = function(evt){ //读取完文件之后会回来这里
                    var fileString = evt.target.result; // 读取文件内容
                    _this.base64 = fileString.split(",")[1];
                    _this.fileName = "123.png";
                }
            }
        }
    }]);

