var app = getApp()

var audioCtx = {}
const backgroundAudioManager = wx.getBackgroundAudioManager()
const recorderManager = wx.getRecorderManager()
var inKaraokeTab = true;

Page({
  data: {
    imageSrc: '../../images/app_icon.png',
    bgImage: '../../images/bg.jpg',
    scoreImage: '../../images/score.png',
    userInfo: {},
    //歌词内容
    lrcDir: '[00:00.00]张紫豪 - 可不可以\n[00:02.00]词：刘伟锋\n[00:03.00]曲：刘伟锋\n[00:04.00]编曲：刘伟锋\n[00:05.00]录制混缩：巨人先生\n[00:07.00]出品：西亚斯音频工作室\n[00:16.01]说好带你流浪\n[00:19.59]而我却半路返航\n[00:23.10]坠落自责的海洋\n[00:33.10]坠落自责的海洋\n[00:43.10]坠落自责的海洋\n[00:53.10]坠落自责的海洋\n[01:03.10]坠落自责的海洋\n[01:13.10]坠落自责的海洋\n[01:23.10]坠落自责的海洋\n[01:33.10]坠落自责的海洋\n[01:43.10]坠落自责的海洋\n[01:53.10]坠落自责的海洋\n[02:03.10]坠落自责的海洋\n[02:13.10]坠落自责的海洋\n[02:23.10]坠落自责的海洋\n[02:33.10]坠落自责的海洋\n[02:43.10]坠落自责的海洋\n[02:53.10]坠落自责的海洋',
    //歌词数组，转化完成用来在wxml中使用
    storyContent: [],
    //歌词滚动距离
    marginTop: 0,
    //当前正在第几行
    currentIndex222: 0,
    currentPlayProgress:0
  },
  playFun: function() {
    this.setData({
      storyContent: this.sliceNull(this.parseLyric(this.data.lrcDir))
    })
  },
  parseLyric: function(text) {
    var result = [];
    var lines = text.split('\n');//切割每一行
    var pattern = /\[\d{2}:\d{2}.\d{2}\]/g;//用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
    //去掉不含时间的行
    while (!pattern.test(lines[0])) {
      lines = lines.slice(1);
    };
    //上面用'\n'生成数组时，结果中最后一个为空元素，这里将去掉
    lines[lines.length - 1].length === 0 && lines.pop();
    lines.forEach(function(v /*数组元素值*/ , i /*元素索引*/ , a /*数组本身*/ ) {
      //提取出时间[xx:xx.xx]
      var time = v.match(pattern),
        //提取歌词
        value = v.replace(pattern, '');
      // 因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
      time.forEach(function(v1, i1, a1) {
        //去掉时间里的中括号得到xx:xx.xx
        var t = v1.slice(1, -1).split(':');
        //将结果压入最终数组
        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
      });
    });
    //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
    result.sort(function(a, b) {
      return a[0] - b[0];
    });
    return result;
  },
  sliceNull: function(lrc) {
    var result = []
    for (var i = 0; i < lrc.length; i++) {
      if (lrc[i][1] == "") {} else {
        result.push(lrc[i]);
      }
    }
    return result
  },
  onLoad: function () {
    console.log('onload')
    this.setData({
      userInfo: app.globalData.userInfo
    })
    console.log(app.globalData.userInfo)
    this.playFun()
    wx.onSocketMessage(function (res) {
      if (inKaraokeTab){
        //处理接收到的数据
        console.log(res.data)
        //服务端的消息接收处理
        var msg = JSON.parse(res.data);
        console.log(msg.score)
        console.log(msg.rivalSocre)
      }
    })
  },
  onReady(e){
    //播放音乐
    backgroundAudioManager.title = '此时此刻'
    backgroundAudioManager.epname = '此时此刻'
    backgroundAudioManager.singer = '许巍'
    backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'
    // 设置了 src 之后会自动播放
    backgroundAudioManager.src = app.globalData.musicUrl
    console.log('音乐地址：' + backgroundAudioManager.src)
    backgroundAudioManager.play
    backgroundAudioManager.onPlay(()=>{
      console.log('开始播放音乐')
      this.beginRecord()
    })
    backgroundAudioManager.onStop(() => {
      console.log('停止播放音乐')
      this.stopRecord()
    })
    //设置播放进度变化
    backgroundAudioManager.onTimeUpdate(() => {
      this.setData({
        currentPlayProgress: (backgroundAudioManager.currentTime) / (backgroundAudioManager.duration)*100,
        currentIndex222:7
      })
      // console.log('时间变化' + backgroundAudioManager.currentTime)
    })
  },
  beginRecord: function () {

    console.log('开始录音')
    const options = {
      sampleRate: 44100,//采样率
      numberOfChannels: 2,//录音通道数
      encodeBitRate: 192000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 6,//指定帧大小，单位 KB
    }
    this.setData({
      msg: '开始录音'
    })
    recorderManager.onStart(function () {
      console.log('开始录音')
    })

    recorderManager.onError(function () {
      console.log('录音出现错误')


    })
    recorderManager.onStop(function (res) {
      console.log('录音已停止')

    })

    recorderManager.onFrameRecorded(function (res) {
      const { frameBuffer } = res
      app.globalData.startTime += 28
      
      var view = new DataView(frameBuffer);
      view.setInt32(0,app.globalData.startTime);

      //发送语音数据
      wx.sendSocketMessage({
        data: frameBuffer
      })
    })

    recorderManager.start(options);
  },
  stopRecord: function () {
    recorderManager.stop()
  },
  onHide: function () {
    inKaraokeTab = false
  },
  onShow: function () {
    inKaraokeTab = true
  }

})