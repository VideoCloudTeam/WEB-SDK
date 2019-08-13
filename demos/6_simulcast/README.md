# DEMO 6
主要是多流模式（视频的合成和解码是有端上处理）的方式加入会议；
且专属云只能使用多流模式
切换专属云：
```javascript 1.8
    rtc.isShiTong=true; //切换为专属云
    //更换 apiService 对接专属云地址 alias会议号 password 入会密码
    var apiServer = "vapi.myvmr.cn",
              mcuHost = '',
              alias = '1061',
              password = '123456',
              displayName = 'demo6';
    
```
1、rtc.isShiTong=true;
# 使用
 参见[Web sdk API](https://dev.myvmr.cn/doc/03_webrtc_video_sdk?t=cn&f=3_API_DOCUMENT)文档
 
# 问题反馈
* 任何关于SDK DEMO 6的问题，您可以在[Issues](https://github.com/VideoCloudTeam/WEB-SDK/issues/new)中反馈。




