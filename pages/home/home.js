var app = getApp()
var inHomeTab = true
Page({
  data: {
    msg: 'test',
    imageSrc: '../../images/app_icon.png',
    bgImage: '../../images/bg.jpg',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    duringMatch:false,
    matchText:''
  },
  startKaraoke:function(){
    //点击开始匹配
    //UI显示正在匹配中
    this.setData({
      duringMatch:true,
      matchText:'正在匹配...'
    })

    wx.connectSocket({
      url: 'ws://192.168.1.127:8080/websocket'
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })

    wx.onSocketMessage(function (res) {
      if(inHomeTab){
        console.log(res.data)
        //服务端的消息接收处理
        var msg = JSON.parse(res.data);
        console.log(msg.music_name)
        console.log(msg.music_url)
        console.log(msg.status)
        console.log(msg.startTime)
        //音频的播放地址修改
        app.globalData.musicUrl = msg.music_url
        app.globalData.startTime = parseInt(msg.startTime)
        //如果收到了音频播放地址，则跳转K歌页面
        if (msg.music_url != null) {
          this.setData({
            duringMatch: false,
            matchText: '匹配成功'
          })
          wx.navigateTo({
            url: '../karaoke/karaoke',
          })
          
        } else {
          console.log('not ready!')
        }
      }
    })

    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
    })
    
  },
  onLoad: function () {

    //获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = res.userInfo
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  onHide:function(){
    inHomeTab=false
  },
  onShow:function(){
    inHomeTab = true
  }
})