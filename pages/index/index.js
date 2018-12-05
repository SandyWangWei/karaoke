//share.js
//分享页

var app = getApp()

const recorderManager = wx.getRecorderManager()

Page({
  data:{
    msg:'test'
  },
  testSocket: function() {
    console.log('WebSocket连接！')
    wx.connectSocket({
      // url: 'ws://192.168.1.108:8090'
      url: 'ws://192.168.1.108:8080/websocket'
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })

    wx.onSocketMessage(function (res) {
      console.log(res)
    })

    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
    })
  },
  beginRecord:function(){

    console.log('开始录音')
    const options = {
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 5,//指定帧大小，单位 KB
    }
    this.setData({
      msg: '开始录音'
    })
    recorderManager.onStart(function(){
      console.log('开始录音')
    })

    recorderManager.onError(function () {
      console.log('录音出现错误')


    })
    recorderManager.onStop(function (res) {
      console.log('录音已停止')
     
    })
    
    recorderManager.onFrameRecorded(function (res){
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)

      //发送语音数据
      wx.sendSocketMessage({
        data: frameBuffer
      })
    })
    
    recorderManager.start(options);
  },
  stopRecord: function () {
    recorderManager.stop()

    this.setData({
      msg: '停止录音'
    })
  }
})

