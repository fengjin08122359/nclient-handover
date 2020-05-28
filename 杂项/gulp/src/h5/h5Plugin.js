/*http://www.9client.com/ 021-4008837939*/
/**
 * ucc手机端对话窗口管理以及界面操作 Created by stone on 2014/5/07
 * rewrite by mike on 2017/6/26
 */
 /*mobileInput.js H5点击输入框修正*/ ;
(function(window, $, undefined) {
   var path = [];

   var OS = (function (navigator, userAgent, platform, appVersion) {
     var detect = {}
     detect.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false
     detect.ipod = /iPod/i.test(platform) || userAgent.match(/(iPod).*OS\s([\d_]+)/) ? true : false
     detect.ipad = /iPad/i.test(navigator.userAgent) || userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
     detect.iphone = /iPhone/i.test(platform) || !detect.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false
     detect.mac = /Mac/i.test(platform)
     detect.ios = detect.ipod || detect.ipad || detect.iphone
     detect.safari = userAgent.match(/Safari/) && !detect.chrome ? true : false
     detect.mobileSafari = detect.ios && !!appVersion.match(/(?:Version\/)([\w\._]+)/)
     if (detect.ios) detect.iosVersion = parseFloat(appVersion.slice(appVersion.indexOf("Version/") + 8)) || -1
     return detect
   })(navigator, navigator.userAgent, navigator.platform, navigator.appVersion || navigator.userAgent);
   $("html").css({
     position: "absolute",
     top: 0,
     left: 0,
     width: "100%",
     height: "100%"
   });
   var width = $("html").width();
   var height = $("html").height();

   var scrollTop = function (top) {
     if (typeof top === "undefined") {
       return document.documentElement.scrollTop + document.body.scrollTop
     } else {
       $(window).scrollTop(top)
       return $(window).scrollTop()
     }
   }

   var adHeight = (function () {
     var adjustHeight = 0;
     var special = 0;
     if (OS.ios && OS.iosVersion <= 12) {
       adjustHeight = 40;
       if (screen.height == 812 && screen.width == 375) {
         console.log("Æ»¹ûX");
       } else if (screen.height == 736 && screen.width == 414) {
         if (width > 365 && width < 385) {
           adjustHeight = 40;
           special = 288
         }
         if (width > 404 && width < 424) {
           adjustHeight = 40;
           special = 303
         }
       } else if (screen.height == 667 && screen.width == 375) {
         if (width > 365 && width < 385) {
           adjustHeight = 40;
           special = 288
         }
         if (width > 404 && width < 424) {
           adjustHeight = 40;
           special = 303
         }
       } else if (screen.height == 568 && screen.width == 320) {
         console.log("iPhone5");
       } else {
         console.log("iPhone4");
       }
     }
     return {
       adjustHeight: adjustHeight,
       special: special
     }
   })();
   var STATUS = {
     currentStatus:[],
     blurClick:0,
     focusClick:1,
     onScroll:2,
     onResize:3,
     checking:4,
     checkSuccess:5,
     blurSuccess:6,
     blurFail:7,
     focusAfterInsert:8,
     checkSuccessNormal:9,
     checkSuccessIphone:10,
     checkSuccessAndroid:11,
     changeStatus:function(num){
       if (this.blurFail == num) {
         this.currentStatus = []
       } else if (this.focusAfterInsert == num) {
         var index = this.currentStatus.indexOf(this.blurClick)
         if (index > -1) {
           this.currentStatus.splice(index,1);
         }
       } else if (this.blurSuccess == num) {
         this.currentStatus = []
       } else {
         this.currentStatus.push(num);
       }
       console.log('currentStatus:'+this.currentStatus)
     },
     has:function(num){
       if (this.currentStatus.length>0) {
         return  this.currentStatus.indexOf(num)>-1
       }
       return false;
     }
   }
   var inputCheck = {
     changeStatus: 1,
     changeCheckTimeout:null,
     init: function () {
       console.log(adHeight.adjustHeight,adHeight.special);
       var m = this;
       $(window).on("scroll", function () {
         if (m.startCheckTimeout) {
           clearTimeout(m.startCheckTimeout);
         }
         m.startCheckTimeout = null;
         if (!STATUS.has(STATUS.blurClick)) {
           STATUS.changeStatus(STATUS.onScroll);
           m.changeCheck()
         }
       })
       $(window).on("resize", function () {
         if (m.startCheckTimeout) {
           clearTimeout(m.startCheckTimeout);
         }
         m.startCheckTimeout = null;
         if (!STATUS.has(STATUS.blurClick)) {
           STATUS.changeStatus(STATUS.onResize);
           m.changeCheck()
         }
       })
     },
     changeCheck:function(){
       var m = this;
       if (this.changeCheckTimeout) {
         clearTimeout(this.changeCheckTimeout);
       }
       this.changeCheckTimeout = setTimeout(function(){
         if (!STATUS.has(STATUS.checking)) {
           m.checkFun();
         }
       },700);
     },
     startCheck: function () {
       var m = this;
       if(!navigator.userAgent.match(/.*iphone.*|.*Linux.*|.*AppleWebKit.*Mobile.*/)){
         return; 
       }
       STATUS.changeStatus(STATUS.focusClick);
       console.log("startCheckTime" + new Date().Format("hh:mm:ss"));
       $("body").height('auto');
       $("body").css("bottom", adHeight.adjustHeight);
       if (this.startCheckTimeout) {
         clearTimeout(this.startCheckTimeout);
       }
       
		 this.startCheckTimeout = setTimeout(function(){
		   if (!m.isWindowChange()) {
			m.options.blurInput(m.isDetectedError());
		   } else {
			  m.changeCheck(); 
		   }
		 },2000);
     },
     isWindowChange:function(){
       var htmlHeight = $("html").height();
       var isresize = htmlHeight != height
       var isscroll = scrollTop() != 0;
       console.log('scrollY:' + scrollTop());
       return  isresize || isscroll
     },
     isInReliableArea:function(){
       var htmlHeight = $("html").height();
       var isresize = htmlHeight !== height
       var scrollY = scrollTop();
       var reliableScroll = !(adHeight.special && adHeight.special>scrollY);
       var isscroll = (scrollY != 0 && scrollY < height) && reliableScroll;
       return  isresize || isscroll
     },
     isDetectedError:function(){
       var m = this;
       return !(STATUS.has(STATUS.onScroll) || STATUS.has(STATUS.onResize));
     },
     isScorll: false,
     checkFun:function(){
       var m = this;
       m.isScorll = false;
       console.warn('checkFun start')
       if (m.isWindowChange()) {  
         $("body").height('auto');
         $("body").css("bottom", adHeight.adjustHeight);
         STATUS.changeStatus(STATUS.checking);
         if (m.isInReliableArea()) {
           STATUS.changeStatus(STATUS.checkSuccessNormal);
           m.success();
         } else {
           scrollTop(adHeight.special || 99999); 
           m.isScorll = true;
           if (OS.ios) {
             path[0] = 1
             m.checkIphone();
             STATUS.changeStatus(STATUS.checkSuccessIphone);
           } else {
             path[0] = 2
             m.checkNotIphone();
             STATUS.changeStatus(STATUS.checkSuccessAndroid);
           }
         }
       } else {
         m.options.blurInput()
       }
     },
     success: function () {
       STATUS.changeStatus(STATUS.checkSuccess);
       this.savedHeight = $('html').height();
     },
     end: function () {
       var m = this;
       STATUS.changeStatus(STATUS.blurClick);
       setTimeout(function () {
         if (STATUS.has(STATUS.blurClick)) {
           if (m.checkTimeout) {
             clearTimeout(m.checkTimeout);
           }
           $("html").css({
             position: "absolute",
             top: "0px",
             left: "0px",
             width: "100%"
           });
           console.log('end');
           $("html").height('100%');
           $("body").css("bottom",0);
           scrollTop(0);
           STATUS.changeStatus(STATUS.blurSuccess);
         }else{
           STATUS.changeStatus(STATUS.blurFail);
         }
       }, 100);
     },
     checkIphone: function () {
       var m = this;
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.checkTimeout = setTimeout(function () {
         m.checkIphoneFun();
       }, 300)
     },
     checkNotIphone: function () {
       var m = this;
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.checkTimeout = setTimeout(function () {
         m.checkNotIphoneFun();
       }, 500);
     },
     samples: [],
     checkIphoneFun: function () {
       var m = this;
       if (m.isInReliableArea()) {
         m.success();
         return;
       }
       if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
         window.setTimeout(function () {
           document.activeElement.scrollIntoViewIfNeeded();
         }, 0);
       }
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.samples = [];
       m.getSample();
     },
     checkNotIphoneFun: function () {
       var m = this;
       if (scrollTop() < document.body.scrollHeight && document.documentElement.scrollTop != 0) {
         path[0] = 1
         this.checkIphone()
       } else if (!($("body").width() == 320)) { //iphone5ÀýÍâ
         if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
           window.setTimeout(function () {
             document.activeElement.scrollIntoViewIfNeeded();
           }, 0);
         }
         m.success();
       }
     },
     getSample: function () {
       var m = this;
       var scHeight = document.body.scrollHeight;
       var htmlHeight = $("html").height();
       var scrollY = scrollTop();
       m.samples.push({
         scHeight: scHeight,
         scrollY: scrollY,
         height: htmlHeight
       });
       m.changeHeight();
       if (m.isInReliableArea()) {
         m.success();
       }else if (m.samples.length == 1) {
         m.checkTimeout = setTimeout(function () {
           if ((scrollTop() < 100 && m.isScorll) || (scrollTop()==0 && document.body.scrollHeight == $("html").height())) {
             var keyboardHeight = scrollTop() || (height - window.innerHeight);
             var sheight = keyboardHeight || 99999;
             scrollTop(sheight)
           }
           m.getSample();
         }, 500);
       }
     },
     changeHeight: function () {
       var m = this;
       console.log(JSON.stringify(m.samples));
       if (m.samples.length == 1) {
         var w = m.checkHeight(m.samples[0])
         var a = w.a
         var b = w.b
         var c = w.c;
         var h = w.h;
         if (c < -100) {
           m.samples[0].type = 1;
         } else if (a < 10) {
           if (b > 0) {
             m.samples[0].type = 2;
             $("html").css({
               top: 0,
               width: "100%",
               height: h
             });
           } else {
             m.samples[0].type = 3;
             $("html").css({
               top: 0,
               width: "100%",
               height: (height)
             });
           }
         } else {
           m.samples[0].type = 4;
           $("html").css({
             top: 0,
             width: "100%",
             height: height
           });
           
         }
         path[1] = m.samples[0].type;
         return;
       } else if (m.samples.length >= 2) {
         var first = m.samples[0];
         var second = m.samples[1];
         path[2] = 3
         if (first.scrollY == second.scrollY && first.height == second.height && first.scHeight == second.scHeight) {
           path[2] = 0
           m.success();
           return;
         } else if (first.scrollY != second.scrollY) {
           var w = m.checkHeight(second);
           var b = w.b;
           var h = w.h;
           if (b > 0) {
             second.type = 2;
             $("html").css({
               top: 0,
               width: "100%",
               height: h
             });
           } else {
             $("html").css({
               top: 0,
               width: "100%",
               height: height
             })
           }
           path[2] = 1
           m.samples = [m.samples.pop()];
         } else if (first.height != second.height) {
           if (first.type == 3) {
             path[2] = 2
             $("html").css({
               top: 0,
               width: "100%",
               height: (second.height)
             });
           }
           m.success();
           return;
         } else {
           m.success();
           return;
         }
       }
     },
     checkHeight: function (sample) {
       var a = Math.abs(sample.scHeight - height);
       var b = sample.scrollY - height * 2;
       var c = sample.height - height;
       var d = sample.scHeight - sample.scrollY;
       var h = Math.min(d, height / 2);
       h = parseInt(Math.max(h, height / 2));
       return {
         a: a,
         b: b,
         c: c,
         h: h,
       }
     },
     focusAfterInsert: function () {
       var m = this;
       var continueInsert = (height != $("html").height() || scrollTop() != 0)
       if (continueInsert) {
         STATUS.changeStatus(STATUS.focusAfterInsert);
       }
       return continueInsert
     }
   }  
   var MOBILEINPUT = function (options) {
     this.defaults = {
         compantPk: "",
         codeKey: "",
         type: "",
       },
       this.options = $.extend({}, this.defaults, options);
   }
   MOBILEINPUT.prototype = inputCheck
   MOBILEINPUT.prototype.height = height
   MOBILEINPUT.prototype.scrollY = scrollTop
   $.mobileInput = function (options) {
     var mobileInput = new MOBILEINPUT(options);
     mobileInput.init();
     return mobileInput;
   }
 })(window, jQuery);


/*systemInfo.js 系统消息*/
;
(function(window, $, undefined) {
  "use strict";
  var SYSTEMINFO = function(el, options) {
    this.$el = el
    this.defaults = {}, this.options = $.extend({}, this.defaults, options)
  }
  SYSTEMINFO.prototype = {
    show: function(text) {
      if (!text || text == "undefined" || text == "null") return;
      var el = this.$el;
      el.find(".systemInfo").remove();
      el.append('<center class="systemInfromBox systemInfo"><span class="systemInfrom">' + text + '</span></center>')
      document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight; // 滚动条置底
    },
    hide: function() {
      var el = this.$el;
      el.find(".systemInfo").remove();
    }
  }
  $.fn.systemInfo = function(options) {
    var systemInfo = new SYSTEMINFO($(this), options);
    return systemInfo;
  }
})(window, jQuery);



/*uccH5Init.js UCCPC初始化*/
;
(function(window, $, undefined) {
  var UCCH5INIT = function(options) {
    this.defaults = {},
      this.options = $.extend({}, this.defaults, options)
  }
  UCCH5INIT.prototype = {
    init:function(){
      uccH5Init.initLang().done(function(){
        if (typeof custom !="undefined" && custom) {
          try{
            var c = JSON.parse(custom);
            var url = "./custom/"+(c.functionType||'')+"/pc.js";
            $.ajaxJs(url,false)
            .done(function() {
              $(".ucc").html("");
              $("#h5Impl").tmpl(lang).appendTo(".ucc");
            })
            langControl.addBtn();
          }catch(e){
            console.error(e);
          }
        };
        uccH5Event.resetInterval();
        uccH5Init.initBasic();
        uccH5Init.initData().done(function(){
          uccH5Init.initFunc();
          uccH5Logic.initFront();
          uccH5Logic.initFace(); // 设置输入框字体
          uccH5Event.binds();
          uccH5Logic.viewFunc(); // 添加事件
          uccH5Init.initSatifaction();
          uccH5Init.initLocalHistory();
          uccH5Event.scrollToBottom();
          $("img[defsrc]").each(function(index, el) {
              $(this).attr("src", $(this).attr("defsrc"));
          });
          $(".dialogue-footer-cover").hide();
        });
      })
    },
    initLang:function(){
      var defered = new $.Deferred();
      storage = $.storage({companyPk:ucc.companyPk});
      langControl = $.langControl({langList:ucc.langs,storage:storage,addBtn:function(){
        $(".dialogue-footer").append("<div class='langSwitch'><span>"+ (langControl.c=="en"?"中":'EN') +"</span></div>");
        langControl.insertStyle('.langSwitch{position: absolute; top: -60px;right: 11px;z-index: 99;border: 1px solid #5fbeee;padding: 0;border-radius: 50%;width: 46px;height: 46px;cursor: pointer;background: #5fbeee;}.langSwitch span{display: inline-block;font-size: 14px;text-align:center;line-height:46px;width:46px;color:#fff;s}');
      }})
      langControl.loadLangJs(langControl.c).done(function(){
        lang = langControl.langs[langControl.c];
        $("#h5Impl").tmpl(lang).appendTo(".ucc");
        langControl.addBtn();
        $(".dialogue-footer-cover").show(); 
        if (langControl.c) {
          var langPk = langControl.langList[langControl.c].pk;
          if (ucc.defaultLangPk!=langPk){
            pageLoad.getLangAndMessageSettings(langControl.langList[langControl.c].pk).done(function(){
              defered.resolve();
            })
          } else {
            return defered.resolve();
          }
        }
      });
      return defered.promise();
    },
    initBasic: function() {
      params = $.getParameter();
      Alert = $.Alert();
      showBigImgFun = $.showBigImg();
      showBigImgFun.init();
      msgdb = $.msgdb();
      datas = $.db({storage:storage});
      localHistory = $.localHistory({
        storage:storage,
        loadMore:function(items){
          for(var i=0,len=items.length;i<len;i++){
            if(items[i].type!="date"){
              dialogue.showMsg({
              date: items[i].time,
              from: items[i].from,
              content: items[i].content,
              status: 1
            })  
            }
        }
            if($("#getMore").length>0){
              $("#getMore").remove();
            }
        $("#leaveHistory").prepend('<span id="getMore"><span class="c">'+lang.history.btnStr+'</span><span class="l"></span></span>');
        if(localHistory.lastChat==-1){
          $("#getMore").hide();
        }
      }
    });
      localHistory.init();
      userDatas = $.userDatas({
        param: params,
        storage: storage,
        storageVisitor: "visitor",
        storageIpStr: "ipStr",
        storageChatNum: "chatNum",
        companyPk: ucc.companyPk,
        aDset: ucc.aDset,
        businessId: "",
        businessName: "",
		visitorPre:lang.userDatas.visitorPre
      });
      visitLimit = $.visitLimit({
        open: !!params["vl"] ? params["vl"] : 1,
        storage: storage
      })
      visitLimit.init();
      bList = $.businessList({
        businessList: ucc.businessList,
        aDset: ucc.aDset
      });
      workTime = $.workTime({
        BasicSetting: ucc.BasicSetting,
        ExtraSetting: ucc.ExtraSetting,
		'workStr': lang.workTime.server+"【$1】<br>"+lang.workTime.clickNotice+"<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>"+lang.workTime.btn+"</a><br>"+lang.workTime.notice,
		'holidayStr': lang.workTime.holiday+"【$1】<br>"+lang.workTime.clickNotice+"<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>"+lang.workTime.btn+"</a><br>"+lang.workTime.notice,
		lang:lang.workTime,
        show: function(msg) {
          if (!!msg) {
          $(".dialogue-footer-cover").show();  
            if ($('.pop_bg').length == 0) {
              var noticeHtml = '<div class="dialogue-in"><div class="dialogue-pic"><img src="style/images/mobileImages/newImages/server.png"></div><div class="dialogue-c"><span class="dialogue-dot1"><img src="style/images/mobileImages/newImages/dialogue_dot1.png"></span><p class="pop_bg"><p class = "pop_msg">' + msg + '</p></p></div></div><div class="clearboth"></div>'
              $('#message').html(noticeHtml);
              $(".fanke-liuyan").on('click', function(event) {
                leaveMessage.show();
              });
              datas.set("iswork", false);
              setTimeout(function() {
                $('.pop_msg').slideDown('slow');
              }, 3e2);
            }
          }
        }
      });
      sensitive = $.sensitive({
        vocabulary: ucc.vocabulary
      })
      changeFaceFun = $.changeFace({
        after: function() {
          var items = this.imgIco;
          var html = "";
          for (var i = 0, len = items.length; i < len; i++) {
            var img = items[i][0];
            html += "<span>" + img + "</span>";
          }
          $(".dialogue-footer-face .footer-face").html(html);
        }
      });
    },
    initData: function() {
      var defered = new $.Deferred();
      //生成chatId
      /*--工作时间显示--*/
      datas.set("iswork", true);
      $(".close").hide();
      datas.set("hasInQueue", false);
      $.ajax({
        type: "POST",
        url: "./echatManager.do",
        data: {
          method: "initChatId",
          companyPk: ucc.companyPk,
          vid: userDatas.getVisitorInfo().visitorId,
          hjUserData: params["hjUserData"],
          visitorInfo: params["visitorInfo"]
        },
        dataType: "json",
        async: false,
        cache:false
      }).done(function(e) {
        ucc.chatID = e.chatID;
        ucc.browserId = new Date().getTime();
        if(storage.get("oldChatId")!=e.chatID){
          if(storage.get("msgObjCurrentChat")){
            $.ajax({
                    type: 'POST',
                    url: './echat.do',
                    async: "false",
                    data: {
                      method: 'closeEchat',
                      chatID: storage.get("oldChatId"),
                      url: storage.get("msgObjCurrentChat").url,
                      opname: datas.get("opName")?datas.get("opName"):""
                    },
                    success: function(result) {
                    },
                    dataType: "json"
                  });
          }
            uccH5Logic.addmonitorJs();
          localHistory.saveCurrent();
          storage.set("oldChatId",e.chatID);
          //在关闭对话,并且用户有过一次以上留言打开满意度
          datas.set("openSatisfactionAfterCloseChat", false);
          //已打开满意度将不再打开
          datas.set("hasSatisfaction", false);
          //保存坐席账号
          datas.set("_workGroupName", "");
          // 取得连接远程服务器的地址.
          datas.set("remoteUrl", "");
          datas.set("opShow", "");
          datas.set("opName", "");
          datas.set("operatorId", "");
        }else if(e.state=="connnected"){
          storage.set("offChat", ucc.browserId);
          storage.set("browserId", ucc.browserId);
    }
      });
      webSocket = $.webSocket({
      path: "/any800/UccWebSocket/",
      isWs:ucc.isWs,
      visitorId: userDatas.getVisitorInfo().visitorId,
      message: function(chatId, content,messageId) {
        if (chatId == ucc.chatID) {
          if(typeof content =="object"){
            content = JSON.stringify(content);
          }
          if(!msgdb.get(messageId)){
            dialogue.showMsg({
              msgid: messageId,
              date: new Date().getTime(),
              content: content,
              from: "client"
            });
            detectWeb.msgPush('customer', content);
            TimeoutList.startALLTimeout();
          }
        }
      },
      deal: function(type, chatId, json) {
        if (chatId != ucc.chatID) return;
        if (type == "CUTOMER_IS_INVITED") {
          if (dialogue.islive()){
            dialogue.toolFun(true);
            dialogue.showMsg({
              msgid: "",
              date: new Date().getTime(),
              content: json,
              from: "client",
              saveIn: 1
            });
            if (detectWeb.getIsReconnection()) {
              var txt = '[' + detectWeb.getMsgs(5).join(',') + ']'; // 取5条数据
              dialogue.sendMessage(txt, 'offLineMessage');
            }
            TimeoutList.startALLTimeout();
          }else{
            dialogue.setAttr("CUTOMER_IS_INVITED",json);
          }
        } else if (type == "CLOSE") {
          if (detectWeb.getIsInitiate()) {
            dialogue.end(6);
          } else {
            dialogue.end(2);
          }
        } else if (type == "CLOSE_CUSTOMER") {
          dialogue.end(3);
        } else if (type == "CLOSE_VISITOR") {
          if(dialogue.islive()){
            langTip.show(langTip.type.system, langTip.key.no_answer_close);
            dialogue.end(2);
          }
        } else if (type == "OPERATION_TIPS") {
          if (json.params.opType == "pushsatisfaction") {
            if(satisfaction.hasSat){
              satisfaction.show();
            }
          }  else if (json.params.opType == "getinfo") {
            visitorInformation.show();
          } else if (json.params.opType == "uploadfile") {
            dialogue.showMsg({
              msgid: "",
              date: new Date().getTime(),
              content: json.content,
              from: "client",
              status: 0
            });
          }
        } else if (type == "CUSTOMER_NETWORK_INTERRUPT") {
          dialogue.end(7);
        } else if (type == "CUTOMER_ISNOT_INVITED") {
          dialogue.showMsg({
            msgid: "",
            date: new Date().getTime(),
            content: json,
            from: "client",
            status: 0
          });
          dialogue.end(0);
        } else if (type == "CUTOMER_REVOKE") {
          msgdb.set(json, "isRevoke", true);
          if ( !! changeWindow) changeWindow.change();
          localHistory.setCurrent(msgdb.db);
          var $messageHide = $("div[name=" + json + "]")
          if ($messageHide.css("display") != "none") {
            $messageHide.hide();
            if ($messageHide.prev().hasClass("time")) {
              $messageHide.prev().hide();
            }
            $messageHide.after("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") +lang.dialogue.revoke +"</div>");
            //$("#message").append("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + "已撤回一条消息</div>")
          }
        }else if (type == "RECEIPT") {
          msgdb.set(json, "checkSend", 1);
          $("div[name="+json+"] .msg_sending").hide()
          $("div[name="+json+"] .msg_repeat").hide()
          if ( !! changeWindow) changeWindow.change();
          localHistory.setCurrent(msgdb.db);
        }
      },connect:function(isConnect){
        if(dialogue.islive()){
          if(isConnect){
            if (detectWeb.getIsInitiate()) {
              systemInfo.show(dialogue.options.msgList.reconnectSuc);
            }
            if (detectWeb.getIsInitiate()) {
              dialogue.toolFun(true);
              detectWeb.checkedSuccess();
            }
          }else{
            if (!detectWeb.getIsInitiate()) {
              dialogue.toolFun(false);
              systemInfo.show(dialogue.options.msgList.reconnectFail);
              detectWeb.checkedFail();
            }
          }  
        }
      },confirmSend:function(messageId){
        setTimeout(function(){
          var msg = msgdb.get(messageId);
          if(msg && msg.checkSend==0){
            $("div[name="+messageId+"] .msg_sending").show()
          }
        },600)
        setTimeout(function(){
          var msg = msgdb.get(messageId);
          if(msg && msg.checkSend==0){
            $("div[name="+messageId+"] .msg_sending").hide()
            $("div[name="+messageId+"] .msg_repeat").show()
            msgdb.set(messageId, "checkSend", 2);
            if ( !! changeWindow) changeWindow.change();
            localHistory.setCurrent(msgdb.db);
          }
        },3000)
      },leaveCover:function(){
        if(dialogue.islive()){
          uccH5Event.leaveCover();
        }
      },open:function(){
        uccH5Event.openCover();
      }
    });
        $("#message").delegate(".msg_repeat","click",function(){
      var item = $(this).parents(".contentMessage");
      if(item.attr("name") && dialogue.islive()){
        var msgid = item.attr("name");
        if (item.prev().hasClass("time")) {
          item.prev().hide();
        }
        item.hide();
        var msg = uccH5Event.getMsgStr(item.find("span.content"));
        dialogue.sendMessage(msg)
      }
    })
    webSocket.init().done(function(){
      return defered.resolve();
    });
      confirmBox = $.confirm({
    	  cancel:lang.cancel,
		  submit:lang.submit
      });
      return defered.promise();
    },
    initFunc: function() {
      systemInfo = $("#message").systemInfo();
      mobileInput = $.mobileInput({
        blurInput:function(isError){
//          if (isError) {
//            Alert.show('输入框显示问题,建议更换浏览器');
//          }
//          $("#dialogue-footer-text").blur();
        }
      });
      mobileInput.init();
//      heartBeat = $.heartBeat({detectWeb:function(){
//      if (!detectWeb.getIsInitiate()) {
//        dialogue.toolFun(false);
//        dialogue.showSysMsg(dialogue.options.msgList.reconnectFail);
//        detectWeb.checkedFail();
//      }
//    }});
      detectWeb = $.detectWeb({
        period: 30,
        after: function() {
          dialogue.end(6);
        }
      });
      TimeoutList = $.TimeoutList({
        msgdb: msgdb,
        ops: ucc.OperatorBasicSettings,
        startFun: function() {
          if (!!dialogue.islive()) {
            if (TimeoutList.isVisitorHalfTimeout()) {
              langTip.show(
                langTip.type.system,
                langTip.key.no_answer_hint
              );
              if(!!changeWindow)changeWindow.change();
            }
            if (TimeoutList.isVisitorTimeout()) {
              langTip.show(
                langTip.type.system,
                langTip.key.no_answer_close
              );
              dialogue.end(2);
            }
            if (TimeoutList.isClientBusy()) {
              langTip.show(
                langTip.type.system,
                langTip.key.cs_busy
              );
              if(!!changeWindow)changeWindow.change();
            }
          }
        }
      });

      userDatas.options.chatID = ucc.chatID;
      userDatas.options.businessId = "";
      userDatas.options.businessName = "";
      
      queue = $.queueManager({
        companyPk: ucc.companyPk,
        chatID: ucc.chatID,
        langPk: ucc.defaultLangPk,
        message: JSON.stringify(userDatas.getJsonStr()),
        IpStr: JSON.stringify(userDatas.getIpStr()),
		netError:lang.queue.netError,
        success: function(result) {
          msgdb.clear();
          changeWindow.clear();
          datas.set("remoteUrl", result.url);
          datas.set("opShow", result.opShow);
          datas.set("opName", result.workgroupName);
          datas.set("_workGroupName", result.workgroupName);
          var wname = result.workgroupName.split("-");
          dialogue.setAttr("operatorName", result.opShow ? result.opShow : wname[1]);
          dialogue.setAttr("_workGroupName", result.workgroupName);
          dialogue.setAttr("remoteUrl", result.url);
          changeWindow.setMsgObj(result);
          datas.set("hasInQueue", false);
          //queue.reqStartChat(result);
          systemInfo.hide();
          langTip.show("1", "7");
          langTip.show("1", "9");

          var  welcome = dialogue.getAttr("CUTOMER_IS_INVITED");
          if (welcome){
            dialogue.toolFun(true);
            dialogue.showMsg({
              msgid: "",
              date: new Date().getTime(),
              content: welcome,
              from: "client",
              saveIn: 1
            });
            if (detectWeb.getIsReconnection()) {
              var txt = '[' + detectWeb.getMsgs(5).join(',') + ']'; // 取5条数据
              dialogue.sendMessage(txt, 'offLineMessage');
            }
            TimeoutList.startALLTimeout();
          }
          dialogue.setAttr("CUTOMER_IS_INVITED","");
          if (result.success == true) {
            // 请求对话成功，开始对话.
            storage.set("chatNum", (!!storage.get("chatNum") ? storage.get("chatNum") : 0) + 1);
            dialogue.start();
            if (JSON.stringify(userDatas.getJsonStr())) {
              if (ucc.BasicSetting.need == 1) {
                dialogue.sendMessage(JSON.stringify(userDatas.getJsonStr()), "getinfoSubmit");
              }
            }
            return true; // 增加返回值 john
            // 20150804
          } else {
            langTip.show(data.langType, data.langKey);
            // 请求对话失败，服务器返回无法接通客服.
            return false; // 添加返回值 john
            // 20150804
          }
        },
        fail: function(result) {
          systemInfo.show(decodeURIComponent(decodeURIComponent(result.msg)));
          $(".systemInfromBox #liveMessageId").click(function() {
              leaveMessage.show(); // 提示留言;
          });
          $(".systemInfromBox #continueId").click(function() {
            $.ajax({
              type: 'POST',
              url: './queue.do',
              dataType: 'json',
              data: {
                method: 'continueBusinessQueue',
                chatID: ucc.chatID,
                companyPk: ucc.companyPk,
                langPk: ucc.defaultLangPk,
                businessId: userDatas.getJsonStr().businessId
              }
            }).done(function(data) {
              if (data.success == false) {
                systemInfo.show(data.msg);
                $("#liveMessageId").click(function() {
                  leaveMessage.show(); // 提示留言;
                });
              } else {
                queue.index = -1;
                queue.isTimeOut = false;
                queue.getInfo(userDatas.getJsonStr().businessId, 1, false);
              }
            }).fail(function(e) {
              dialogue.showSysMsg(lang.errorNetWork);
              return;
            })
            var $this = $(this);
            $this.unbind("click");
          });
        },
        leave: function(result) {
          systemInfo.show(result.msg);
          $("#liveMessageId").click(function() {
            leaveMessage.show();
          });
        },
        continueque: function(result) {
          systemInfo.show(result.msg);
        },
        always: function(result) {
          systemInfo.show(result.msg);
        }
      });

      queue.reqStartQueue = function(businessId, businessName) { // 排队开始
          if (datas.get("hasInQueue")) return;
          datas.set("hasInQueue", true);
          pageLoad.getDepartment().done(function() {
        bList = $.businessList({
          businessList: ucc.businessList,
          aDset: ucc.aDset
        });
        if(bList.getItemOnline(businessId)){
                userDatas.options.businessId = businessId;
                userDatas.options.businessName = businessName;
                userDatas.options.storageOldService = storage.get("oldService");
                var json = userDatas.getJsonStr();
            json.isWs = webSocket.isWork;
            queue.options.message = JSON.stringify(json);
                queue.options.IpStr = JSON.stringify(userDatas.getIpStr());
                queue.start(businessId, businessName);
                storage.set("businessId", businessId);
                storage.set("businessName", businessName);
        }else{
          datas.set("hasInQueue", false);
          if($(".onlineCls[data-num]").length==0){
            var b = uccH5Logic.showBusinessList(bList.getParentPk(businessId));
            dialogue.showMsg({
              from: "client",
              content: b,
              saveIn:1
            })
          }
          $(".onlineCls[data-pk='"+ businessId +"']").last().click();
          leaveMessage.show();
        }
      })
        };
        webSocket.connect();
      dialogue = $.dialogue({
      webSocket:webSocket,
        TimeoutList: TimeoutList,
        timeStr: '<div class="time">$1</div>',
        callbackStr: '<div class="msg_repeat" ><img style="vertical-align: bottom;margin-right:5px;" src="style/images/repeat.png"></div>',
        msgEle: '#message',
        visitorId: userDatas.getVisitorInfo().visitorId,
        historyEle: '#leaveHistory',
        textEle: '.dialogue-footer-text',
        storage: storage,
        browserId: ucc.browserId,
        changeFaceFun: changeFaceFun,
        limitReceiveTime: 60,
        chatId: ucc.chatID,
        detectWeb: detectWeb,
        userDatas: userDatas,
		lang:lang.dialogue,
		msgList: {
			reconnectSuc: lang.dialogue.reconnectSuc,
			reconnectFail: lang.dialogue.reconnectFail
		},
		closeStrList: lang.dialogue.closeChat,
        showSysMsgFun: function(html) {
          var msgstr = '<center class="systemInfromBox"><span class="systemInfrom">' + html + '</span></center>'
          $('#message').append(msgstr);
          uccH5Event.scrollToBottom();
          msgdb.add({
            type: "system",
            content: html
          });
          if(!!changeWindow)changeWindow.change();
        },
        getReceivedFun: function(msgId) {
          /*TimeoutList.addDiaList(msgId, "visitor", new Date().getTime());
          TimeoutList.startALLTimeout();*/
        },
        msgReplace: function(type) {
          var str = '<div class="$1 contentMessage" name="$msgid"><div class="dialogue-pic"><img src="$2"></div>'
          if (type != "visitor") {
            str += '<div class="dialogue-name">$name</div>';
          }
          str += '<div class="dialogue-c"><span class="$4"><img src="$3"></span><span class="content">$content</span>$msgResend</div></div><div class="clearboth"></div>';
          var typelist = {
            "client": {
              $1: "dialogue-in",
              $2: "./style/images/mobileImages/newImages/server.png",
              $3: "./style/images/mobileImages/newImages/dialogue_dot1.png",
              $4: "dialogue-dot1"
            },
            "visitor": {
              $1: "dialogue-me",
              $2: "./style/images/mobileImages/newImages/victors.png",
              $3: "./style/images/mobileImages/newImages/dialogue_dot2.png",
              $4: "dialogue-dot2"
            },
            "robot": {
              $1: "dialogue-in",
              $2: "./style/images/mobileImages/newImages/server.png",
              $3: "./style/images/mobileImages/newImages/dialogue_dot1.png",
              $4: "dialogue-dot1"
            }
          }
          var i = typelist[type];
          return str.replace(/\$1/g, i.$1).replace(/\$2/g, i.$2).replace(/\$3/g, i.$3).replace(/\$4/g, i.$4);
        },
        startChat: function() {
          uccH5Init.initSatifaction();
          $(".satisfied").show();
          webSocket.startTimeout();
          storage.set("browserId", ucc.browserId)
//          heartBeat.init({
//            businessId: storage.get("businessId"),
//            chatId: ucc.chatID
//          });
          $(".close").show();
          $(".langSwitch").hide();
        },
        endChat: function() {
          datas.set("hasInQueue", false);
          localHistory.saveCurrent();
          $(".langSwitch").show();
          $.ajax({
            type: 'POST',
            url: './echat.do',
            data: {
              method: 'closeEchat',
              chatID: ucc.chatID,
              url: dialogue.getAttr("remoteUrl"),
              opname: dialogue.getAttr("operatorName")
            },
            success: function(result) {},
            dataType: "json",
            async: false
          });
          var dia = this;
		  $(".dialogue-footer-cover").show();
          if (ucc.BasicSetting.jump == 1) {
            if (satisfaction.hasSat && datas.get("openSatisfactionAfterCloseChat") && !datas.get("hasSatisfaction")) {
              var _time = new Date().getTime();
              dialogue.showMsg({
                from: "client",
                content: lang.satisfaction.msg + "<span class = 'spans v_info satisfaction' id = 'satisfaction" + _time + "'>"+lang.satisfaction.btn+"</span><br>",
                saveIn:1
              })
            }
          };
          $(".onlineCls[data-num]").removeClass("onlineCls");
          uccH5Logic.blistNum = 1;
          $.ajax({
            url: "./echatManager.do",
            data: {
              method: "initChatId",
              companyPk: ucc.companyPk,
              vid: userDatas.getVisitorInfo().visitorId,
              hjUserData: params["hjUserData"]
            },
            dataType: "json",
            async: false,
            cache:false
          }).done(function(e) {
            try {
            ucc.chatID = e.chatID;
            storage.set("oldChatId",e.chatID);
            ucc.browserId = new Date().getTime();
          storage.set("oldChatId",e.chatID);
          //在关闭对话,并且用户有过一次以上留言打开满意度
              datas.set("openSatisfactionAfterCloseChat", false);
              //已打开满意度将不再打开
              datas.set("hasSatisfaction", false);
              var jsonStr = userDatas.getJsonStr();
              uccH5Init.initFunc();
              uccH5Logic.addmonitorJs();
            } catch (e) {
              // console.log(e);
            }
          });
        },
        endChatFun:function(){
          webSocket.endTimeout();
//            heartBeat.end();
            changeWindow.stopCheck();
        },
        msgFun: function(json) {
          if(json.from=="visitor"||json.from=="client"){
            TimeoutList.reset();
          }
          msgdb.add({
          date:json.date,
            msgId: json.msgid,
            type: json.from,
            content: json.content,
            saveIn: json.saveIn?json.saveIn:0,
      hasChecked:json.hasChecked
          });
          uccH5Event.showAudio();
          if (json.status == 1) {
          uccH5Event.scrollToTop();
          } else {
            uccH5Event.scrollToBottom();
          }
          if(!!changeWindow)changeWindow.change();
          if(dialogue.islive())localHistory.setCurrent(msgdb.db);
        },
        sendMessageFun: function(id, txt) {
          TimeoutList.startALLTimeout();
          datas.set("openSatisfactionAfterCloseChat", true);
        },
        closeTool: function() {
          $(".close").hide();
          $("#dialogue-footer-text").blur();
          $(".dialogue-footer-text").html('');
//          $(".dialogue-footer-text").attr("contenteditable", "false");
          $("#dialogue-send").attr("disabled", "disabled");
          $(".onlineCls").attr("disabled", "disabled");
          uccH5Event.checkHeight(4);
          $("#dialogue-biaoqing").attr("disabled", "disabled");
          $(".dialogue-footer-face").hide();
          $(".fileup input").attr("disabled",true);
        },
        openTool: function() {
          $(".close").show();
          $("#dialogue-send").removeAttr("disabled");
          $(".onlineCls").removeAttr("disabled");
          $("#dialogue-biaoqing").removeAttr("disabled");
          $(".dialogue-footer-text").attr('contenteditable', 'true');
          $(".fileup input").attr("disabled",false);
        },
        confirmSend: function(id, flag) {
          if (flag == 'add' && id) {
            $(".contentMessage[name='']:last").attr("name", id);
          } else if (id) {
            $(".contentMessage[name=" + id + "] ._msg").hide();
          }
        },
        specialFun: function(type, arg) {
          switch (type) {
            case "200":
              TimeoutList.startALLTimeout();
              break;
            case "700":
              if (arg.code == "pushsatisfaction") {
                if (satisfaction.hasSat) {
                  var _time = new Date().getTime();
                  dialogue.showMsg({
                    from: "client",
                    content: lang.satisfaction.msg+"<span class = 'spans v_info satisfaction' id = 'satisfaction" + _time + "'>"+lang.satisfaction.btn+"</span><br>",
                    saveIn:1
                  });
                }
              } else if (arg.code == "getinfo") {
                visitorInformation.show();
              } else if (arg.code == "uploadfile") {
                dialogue.showMsg({
                  from: "client",
                  content: JSON.parse(arg.text).content
                })
              }
              break;
            case "900": // 对话出现异常，对话结束.
              break;
            case "901": // 对话结束，客服退出对话.
              break;
            case "110": // 坐席网络终端
              break;
            case "111": // 真正的接通了一个客服的标识 @Elijah
              TimeoutList.startALLTimeout();
              break;
            case "112": // 坐席已经邀请不进来了 @Elijah
              break;
            case "113":
              var json = JSON.parse(arg);
              msgdb.set(json.messageId, "isRevoke", true);
              if(!!changeWindow)changeWindow.change();
              localHistory.setCurrent(msgdb.db);
              var $messageHide = $("div[name=" + json.messageId + "]")
              if ($messageHide.css("display") != "none") {
                $messageHide.hide();
                if ($messageHide.prev().hasClass("dialogue-date")) {
                  $messageHide.prev().hide();
                }
                $messageHide.after("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + lang.dialogue.revoke+"</div>");
                //$("#message").append("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + "已撤回一条消息</div>")
              }
              break;
            case "114": //切换窗口
              var json = JSON.parse(arg);
              //storage.set("browserId", json.browserId);
              break;
            case "902": // 对话超时，对话结束.
              langTip.show(
                langTip.type.system,
                langTip.key.no_answer_close
              );
              break;
            default:
              break;
          }
        }
      });
      robot = $.robot({
          visitorId: storage.get("visitor").visitorId,
      visitorName: storage.get("visitor").visitorName,
      dialogue: dialogue,
      robotSetting: ucc.BasicSetting.robotSetting,
      companyPk: ucc.companyPk,
      chatId: ucc.chatID,
      ecselfList: ucc.ecselfList,
      langPk: ucc.defaultLangPk,
		lang: lang.robot,
      changeToNormal: function(argument) {
        $.ajax({
          type: "POST",
          url: "./echatManager.do",
          data: {
            method: "keepTenQA",
            chatId: ucc.chatID
          },
          dataType: "json"
        }).done(function(e) {})
        robot.isUse = false;
        workTime.iswork();
        if (workTime.type == 0) {
          uccH5Logic.loadScheme(); // 加载样式方案
        } else {
          workTime.show();
        }
        dialogue.toolFun(false);
      }
    });
        $("body").delegate(".robotResp","click",function(){
      if(robot.isUse && !dialogue.islive()){
        robot.options.changeToNormal();
      }
    })
    $("body").delegate(".robotSuggsetion","click",function(){
      if(robot.isUse && !dialogue.islive()){
        robot.check($(this).text());
      }
    })
    robot.check();
    if (robot.isUse) {
      
    };
      langTip = $.langTip({
        companyPk: ucc.companyPk,
        langMap:ucc.langMap,
        defaultLangPk: ucc.defaultLangPk,
        show: function(json) {
          var reg = new RegExp("&quot;", "g");
          switch (json.langKey) {
            case 1:
              {
                var LS = uccH5Logic.showBusinessList(-1);
                if (!!LS && !!datas.get("iswork")) {
                  dialogue.showMsg({
                    from: "robot",
                    content: json.content.replace(reg, '"') + lang.businessList.list + LS,
                    saveIn:1
                  })
                }
              }
              break;
            case 2:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 3:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 4:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 5:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 6:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 7:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            case 9:
              dialogue.showMsg({
                from: "robot",
                content: json.content.replace(reg, '"'),
                saveIn:1
              })
              break;
            default:
              dialogue.showMsg({
                    from: "robot",
                    content: !! json.content ? json.content.replace(reg, '"') : json.conntent.replace(reg, '"'),
                    saveIn:1
                  })
        break;
          }
        }
      });
      
      leaveMessage = $.leaveMessage({
          Alert: Alert,
          warn: ".warning",
          messageDisplay: ucc.messageDisplay,
          messageContent: ucc.messageContent,
          messageTypeList: ucc.messageTypeList,
          companyPk:ucc.companyPk,
			title: lang.leaveMessage.boxTitle,
			bottom: "<div class='bottom'><div class='cancel'>"+lang.cancel+"</div><div class='submit'>"+lang.submit+"</div></div>",
			lang:lang.leaveMessage,
          generate: function(combo) {
            $(".leaveMessageView .title .cross img,.leaveMessageView .bottom .cancel").on("click", function() {
              leaveMessage.cancel();
            })
            $(".leaveMessageView .col").each(function(index, el) {
              var $this = $(this);
              if($this.data("type") == "textarea"){
                $this.append('<textarea  placeholder="' + $this.data("markedwords") + '" ></textarea>')
                return;
              }
              $this.append('<div class="colBack"><span class="name">' + $this.data("name")  + '</span><span class="input"></span><span class="warning"></span></div>');
              if ($this.data("type") == "combox") {
                $this.find(".input").append('<span class="names">'+lang.leaveMessage.choose+'</span><span class="option"><img class="link" src="style/images/mobileImages/newImages/link.png"></span><div class="radiocover">'+lang.leaveMessage.type+'</div>');
                for (var i in combo) {
                  if(combo[i] && combo[i].pk ){
                    var name = combo[i].name
                    if (langControl.c == "en" && combo[i].nameEN) {
                      name = combo[i].nameEN
                    }
                    $this.find(".radiocover").append('<div class="sel" data-key="' + combo[i].pk + '"><span class="name">' + name + '</span><span class="option"><img class="ok" src="style/images/mobileImages/newImages/ok.png"></span></div>')
                  }
                  }
                var item = $this.find(".radiocover .sel").first();
                item.addClass("selected");
                $this.find(".input>.names").html(item.text());
                $this.find(".input>.names").data("key",item.data("key"));

              } else {
                $this.find(".input").append('<input type="text" placeholder="' + $this.data("markedwords") + '" >')
              }
            });
            $(".leaveMessageView [data-type='combox'] .colBack>.input>.names,.leaveMessageView [data-type='combox'] .colBack>.input>.option").on("click", function(event) {
              $(".leaveMessageView .radiocover").show()
            })
            $(".leaveMessageView .radiocover .sel").on("click", function(event) {
              var item = $(this);
              $(".leaveMessageView .radiocover .sel").removeClass("selected");
              item.addClass("selected");
                $(".leaveMessageView [data-type='combox'] .input>.names").html(item.text());
                $(".leaveMessageView [data-type='combox'] .input>.names").data("key",item.data("key"));
              $(".radiocover").hide();
            })
            $(".leaveMessageView .bottom .submit").on("click", function() {
              leaveMessage.submit({
                messageTypePk: $(".leaveMessageView [data-type='combox'] .input>.names").data("key"),
                name: $(".leaveMessageView .board [data-displayname='name']").length > 0 ? $(".leaveMessageView .board [data-displayname='name'] input").val() : "",
                telephone: $(".leaveMessageView .board [data-displayname='telephone']").length > 0 ? $(".leaveMessageView .board [data-displayname='telephone'] input").val() : "",
                email: $(".leaveMessageView .board [data-displayname='email']").length > 0 ? $(".leaveMessageView .board [data-displayname='email'] input").val() : "",
                title: $(".leaveMessageView .board [data-displayname='title']").length > 0 ? $(".leaveMessageView .board [data-displayname='title'] input").val() : "",
                content: $(".leaveMessageView .board [data-displayname='content']").length > 0 ? $(".leaveMessageView .board [data-displayname='content'] textarea").val() : "",
                company: $(".leaveMessageView .board [data-displayname='company']").length > 0 ? $(".leaveMessageView .board [data-displayname='company'] input").val() : "",
                brand: $(".leaveMessageView .board [data-displayname='brand']").length > 0 ? $(".leaveMessageView .board [data-displayname='brand'] input").val() : ""
              })
            });
          },
          reset: function(arg) {
            $(".leaveMessageView .board [data-displayname='messageTypePk'] select").val();
            $(".leaveMessageView .board [data-displayname='name'] input").val("");
            $(".leaveMessageView .board [data-displayname='telephone'] input").val("");
            $(".leaveMessageView .board [data-displayname='email'] input").val("");
            $(".leaveMessageView .board [data-displayname='title'] input").val("");
            $(".leaveMessageView .board [data-displayname='content'] textarea").val("");
            $(".leaveMessageView .board [data-displayname='company'] input").val("");
            $(".leaveMessageView .board [data-displayname='brand'] input").val("");
          },
          warn: function(el, text) {
            Alert.show(text)
            //el.find(".warning").html(text);
          }
        })
      visitorInformation = $.visitorInformation({
          storage: storage,
          Alert: Alert,
          storageVisitor: "visitor",
			title: lang.visitorInformation.title,
			bottom: "<div class='bottom'><div class='cancel'>"+lang.cancel+"</div><div class='submit'>"+lang.submit+"</div></div>",
			lang: lang.visitorInformation,
          generate: function(combo) {
            $(".visitorInformationView .body .col").each(function(index, el) {
              var $this = $(this);
              $this.append('<div class="colBack"><span class="name">' + $this.data("name") + '</span><span class="input"></span><span class="warning"></span></div>');
              if ($this.data("type") == "radio") {
                $this.find(".input").append('<span class="name"></span><span class="option"><img class="link" src="style/images/mobileImages/newImages/link.png"></span><div class="radiocover">'+lang.visitorInformation.choose+'<div class="sel" data-key="1"><span class="name">'+lang.visitorInformation.male+'</span><span class="option"><img class="ok" src="style/images/mobileImages/newImages/ok.png"></span></div><div class="sel" data-key="2"><span class="name">'+lang.visitorInformation.female+'</span><span class="option"><img class="ok" src="style/images/mobileImages/newImages/ok.png"></span></div><div class="sel" data-key="0"><span class="name">'+lang.visitorInformation.unknow+'</span><span class="option"><img class="ok" src="style/images/mobileImages/newImages/ok.png"></span></div></div>');
                var value = $this.data("markedwords")?$this.data("markedwords"):"2";
                var item = $this.find(".input .radiocover .sel[data-key='"+value+"']");
                item.addClass("selected");
                $this.find(".input>.name").html(item.text());
                $this.find(".input>.name").data("key",item.data("key"));
              } else {
                $this.find(".input").append('<input type="text" placeholder="' + (!!$this.data("placeholder") ? $this.data("placeholder") : "") + '" value="' + (!!$this.data("markedwords") ? $this.data("markedwords") : "") + '" >');
              }
            });
            $(".visitorInformationView [data-type='radio'] .colBack>.input>.name,.visitorInformationView [data-type='radio'] .colBack>.input>.option").on("click", function(event) {
              $(".visitorInformationView .radiocover").show()
            })
            $(".visitorInformationView .radiocover .sel").on("click", function(event) {
              var item = $(this);
              $(".visitorInformationView .radiocover .sel").removeClass("selected");
              item.addClass("selected");
                $(".visitorInformationView [data-type='radio'] .input>.name").html(item.text());
                $(".visitorInformationView [data-type='radio'] .input>.name").data("key",item.data("key"));
              $(".radiocover").hide();
            })
          $(".visitorInformationView .title .cross img,.visitorInformationView .bottom .cancel").on("click", function() {
              visitorInformation.cancel();
            })
            $(".visitorInformationView .board .input").focus(function(event) {
              visitorInformation.check();
            });
            $(".visitorInformationView .bottom .submit").on("click", function(event) {
              visitorInformation.submit({
                visitorName: $(".visitorInformationView .board [data-displayname='visitorName'] input").val(),
                sex:$(".visitorInformationView [data-type='radio'] .input>.name").data("key"),
                realName: $(".visitorInformationView .board [data-displayname='realName'] input").val(),
                mobile: $(".visitorInformationView .board [data-displayname='phone'] input").val(),
                email: $(".visitorInformationView .board [data-displayname='email'] input").val(),
                QQ: $(".visitorInformationView .board [data-displayname='QQ'] input").val(),
                address: $(".visitorInformationView .board [data-displayname='address'] input").val(),
                company: $(".visitorInformationView .board [data-displayname='company'] input").val()
              });
            });
          },
          warn: function(el, text) {
            Alert.show(text);
          },
          submitFun: function() {
            //if (dialogue.islive()) {
              dialogue.sendMessage(JSON.stringify(userDatas.getJsonStr()), "getinfoSubmit");
              dialogue.showSysMsg(lang.visitorInformation.submit);
            //}
          },
          cancelFun: function() {
            if (dialogue.islive()) {
              dialogue.sendMessage(lang.visitorInformation.cancel, "cancelVisitorInformation");
            }
          }
        });
      if(changeWindow){
        clearInterval(changeWindow.browserInterval);
      }
      changeWindow = $.changeWindow({
        msgdb: msgdb,
        open: true,
        storage: storage,
        chatId: ucc.chatID,
        browserId: ucc.browserId,
        dialogue: dialogue,
        TimeoutList: TimeoutList,
        data: datas,
        start: function() {
          $(".satisfied").show();
          $("#message").html('');
          $(".leaveMessage").remove();
          $("#fangkexinxi").hide();
          ucc.BasicSetting.need = 0;
        },
        end: function() {
          $(".satisfied").hide();
          $('.reminder').hide();
          uccH5Event.leaveCover();
        }
      });
      changeWindow.init();
    },initSatifaction:function(){
      satisfaction = $.satisfaction({
            dialogue: dialogue,
            companyPk: ucc.companyPk,
            langPk: ucc.defaultLangPk,
            chatId: ucc.chatID,
			title: lang.satisfaction.title,
			bottom: "<div class='bottom'><div class='cancel'>"+lang.cancel+"</div><div class='submit'>"+lang.submit+"</div></div>",
			lang: lang.satisfaction,
            generate: function() {
              $("#message").delegate(".satisfaction", "click", function() {
                if(satisfaction.hasSat){
                  satisfaction.show();
                }
              });
              if(satisfaction.hasSat){
                $(".dialogue-footer").append("<div class='satisfied'><img src='./style/images/echat/satisfied.png'></div>");
                  $(".satisfied").css({
                    position: 'absolute',
                    top: -60,
                    right: 11,
                    "z-index": 99
                  }).on('click', function() {
                    satisfaction.show();
                  });;
              }
              $(".satisfied img").css('width', '46px');
              $(".satisfied").hide();
              $("#satisfactionid").hide();
              $(".satisfactionView .fr").each(function(index, el) {
                var $this = $(this);
                var btn = "";
                if (satisfaction.getElementByParent($this.data("pk")).length <= 0) {
                  btn = '<img class="ok" src="style/images/mobileImages/newImages/ok.png">';
                } else {
                  btn = '<img class="link" src="style/images/mobileImages/newImages/link.png">';
                }
                $this.append('<div class="sel"><span class="name">' + $this.data("name") + '</span><span  class="option">' + btn + '</span></div>');
              });
              $(".satisfactionView .sr").each(function(index, el) {
                var $this = $(this);
                $this.append('<div class="sel"><span class="name">' + $this.data("name") + '</span><span  class="option"><img class="ok" src="style/images/mobileImages/newImages/ok.png"></span></div>');
              });
              $(".satisfactionView .sr").hide();
              $('.satisfactionView .fr').click(function() {
                var $this = $(this);
                $('.satisfactionView .fr').removeClass("selected");
                $this.addClass("selected");
                if ($this.find(".link").length > 0) {
                  $('.satisfactionView .fr ').hide();
                  $('.satisfactionView .sr ').hide();
                  $('.satisfactionView .sr[data-parent ="' + $this.data("pk") + '"]').show();
                }
              });
              $(".satisfactionView .sr").click(function() {
                var $this = $(this);
                $this.toggleClass("selected");
              });
              $(".satisfactionView .bottom .cancel").on("click", function() {
                if ($(".satisfactionView .fr").css("display") == "none") {
                  $(".satisfactionView .fr").show();
                  $(".satisfactionView .sr").hide().removeClass("selected");
                } else {
                  satisfaction.cancel();
                }
              })
              $(".satisfactionView .title .cross img").on("click", function() {
                satisfaction.cancel();
                $(".satisfactionView .fr").show();
                $(".satisfactionView .sr").hide().removeClass("selected");
              })
              $(".satisfactionView .bottom .submit").on("click", function() {
                if ($(".satisfactionView .fr.selected").length == 0) {
                  Alert.show(lang.satisfaction.chooseSatisfaction);
                  return;
                }
                var pk = $(".satisfactionView .fr.selected").data("pk");
                var opPk = $(".satisfactionView .fr.selected").data("parent");
                var nextSat = "";
                if (satisfaction.getElementByParent(pk).length > 0) {
                  if ($(".satisfactionView .sr.selected").length == 0) {
                    Alert.show(lang.satisfaction.chooseReason);
                    return;
                  } else {
                    $(".satisfactionView .sr.selected").each(function() {
                      var $this = $(this);
                      nextSat += $this.data("pk") + ",";
                    })
                  }
                }
                datas.set("hasSatisfaction", true);
                satisfaction.submit({
                  satisfactionPk: opPk,
                  optionPk: pk,
                  satisfactionMemo: !!$(".satisfactionView .mome textarea").val() ? $(".satisfactionView .mome textarea").val() : "",
                  nextSatisfactionPk: nextSat
                })
              })
            }
          });
          satisfaction.init();
    },
    initHistory:function(){
      History = $.history({
            visitorId: userDatas.getVisitorInfo().visitorId,
            companyPk: ucc.companyPk,
            dialogue: dialogue,
			leavePre: lang.history.leavePre,
            generation: function() {
              if(dialogue.islive())return;
              History.getLeaveChat();
              History.showLeaveChat();
              History.check();
             $("#leaveHistory").delegate("#getMore .c", 'click', function(event) {
                History.check();
              });
            },
            checkFun: function(argument) {
              $("#leaveHistory #getMore").remove();
              $("#leaveHistory").prepend('<span id="getMore"><span class="c">'+lang.history.btnStr+'</span><span class="l"></span></span>');
              $("#leaveHistory #getMore").toggle(History.more);
            }
          });
        History.init();
    },initLocalHistory:function(){
    History = $.history({
      show: false,
      visitorId: userDatas.getVisitorInfo().visitorId,
      companyPk: ucc.companyPk,
      dialogue: dialogue,
      generation: function() {
        if (dialogue.islive()) return;
        History.getLeaveChat();
              History.showLeaveChat();
        if(localHistory.history.length>0){
          localHistory.loadMore();
          $('body').delegate('#getMore','click', function() {
            localHistory.loadMore();
          })
        }
      },
      checkFun: function() {}
    });
        History.init();
  }
  }
  $.uccH5Init = function(options) {
    var uccH5Init = new UCCH5INIT(options);
    return uccH5Init;
  }
})(window, jQuery);


/*uccH5Logic.js UCCPC逻辑事件*/
;
(function(window, $, undefined) {
  var UCCH5LOGIC = function(options) {
    this.defaults = {},
      this.options = $.extend({}, this.defaults, options);
  }
  UCCH5LOGIC.prototype = {
  blistNum:1,
  initFront:function(){
    if (!dialogue.islive()) {
      if (!robot.isUse) {
        workTime.iswork();
            if (workTime.type == 0) {
              uccH5Logic.loadScheme(); // 加载样式方案
            } else {
              workTime.show();
            }
        }else{
          langTip.show("2", "1");
        }
    }
  },
    showBusinessList: function(businessPk) {
      var ev = this;
      if (dialogue.islive()) return;
      var bs = "";
      if (!datas.get("iswork")) return;
      var result = bList.generate(businessPk);
      if(result){
        if(result.access){
          if(result.online){
          bList.setSelect(result.pk, result.name);
          storage.set("businessId", result.pk);
          storage.set("businessName", result.name);
          queue.reqStartQueue(result.pk, result.name);
            return;
          }else{
            
              if(result.name){
          var type =  lang.businessList.offline;
          bs += '<span><a class="onlineCls" data-online="'+type+'" data-num="' + ev.blistNum + '" name="' + result.name + '" data-pk="' + result.pk + '">' + ev.blistNum + '.' + result.name + '【' + type + '】' + '</a></span><br>';
        }else{
          //$("#message").html("<div style='margin-left:10px;margin-top:10px;line-height:18px;'>您好!欢迎使用在线客服系统,很高兴为您服务!<br/>如果客服忙或者客服不在线,请选择在线<span style='color:#1e93c6;text-decoration: underline;' id='fangke-liuyan'>留言</span></div>");
          langTip.show("1", "1"); // 欢迎语1
          langTip.show("1", "2"); // 欢迎语2
          $("#fangke-liuyan").click(function() {
                    leaveMessage.show();
                  });
          return;
        }
          }
        }else{
          var list = result.list;
          for (var i = 0; i < list.length; i++) {
            var l = list[i]
                  var type = l.type == "online" ? lang.businessList.online : lang.businessList.offline;
              bs += '<span><a class="onlineCls" data-online="'+type+'" data-num="' + ev.blistNum + '" name="' + l.item.name + '" data-pk="' + l.item.pk + '">' + ev.blistNum + '.' + l.item.name + '【' + type + '】' + '</a></span><br>';
              ev.blistNum++;
          }
        }
      }
      return bs;
    },
    loadScheme: function() {
      uccH5Event.showVisitorInfo();
      //收集访客信息判断
       if(ucc.BasicSetting.need == '1'){
         $(".show-visitor-info").parents(".contentMessage").prev(".time").show()
           $(".show-visitor-info").parents(".contentMessage").show();
         }else{
           $(".show-visitor-info").parents(".contentMessage").prev(".time").hide()
           $(".show-visitor-info").parents(".contentMessage").hide();
         }
      pageLoad.getDepartment().done(function() {
        bList = $.businessList({
          businessList: ucc.businessList,
          aDset: ucc.aDset
        });
        langTip.show(1, 1);
      })
    },
    viewFunc: function() {
      if ($('.leaveMessageView').length > 0) {
        document.querySelector('.leaveMessageView').addEventListener('touchmove', function(evt) {
          evt._isScroller = true;
        });
        $('.leaveMessageView textarea').on('focus', function() {
          document.querySelector('.leaveMessageView .body').scrollTop = document.querySelector('.leaveMessageView .body').scrollHeight;
        });
      }
      if ($('.satisfactionView').length > 0) {
        document.querySelector('.satisfactionView').addEventListener('touchmove', function(evt) {
          evt._isScroller = true;
        });
        $('.satisfactionView textarea').on('focus', function() {
          document.querySelector('.satisfactionView .body').scrollTop = document.querySelector('.satisfactionView .body').scrollHeight;
        });
      }
      if ($('.visitorInformationView').length > 0) {
        document.querySelector('.visitorInformationView').addEventListener('touchmove', function(evt) {
          evt._isScroller = true;
        });
        $('.visitorInformationView textarea').on('focus', function() {
          document.querySelector('.visitorInformationView .body').scrollTop = document.querySelector('.visitorInformationView .body').scrollHeight;
        });
      }
    },
    initFace: function() {
      $(".footer-face span img").click(function() {
        $("#dialogue-footer-text").append($.clone(this));
        $("#dialogue-send").show();
        $("#dialogue-add").hide();
        uccH5Event.checkHeight(4);
      });
    },
    addmonitorJs: function() {
      setTimeout(function(){
        if(!dialogue.islive()){
          monitor = $.monitor({storage: storage, companyPk: ucc.companyPk,userDatas:userDatas});
        }
      //$.ajaxJs(baseUrl + '/minor/monitor1.js?t=' + new Date().getTime())
      },3000)
    }
  }
  $.uccH5Logic = function(options) {
    var uccH5Logic = new UCCH5LOGIC(options);
    return uccH5Logic;
  }
})(window, jQuery);


/*uccH5Event.js UCCH5事件*/
;
(function(window, $, undefined) {
  var UCCH5EVENT = function(options) {
    this.defaults = {},
      this.options = $.extend({}, this.defaults, options);
  }
  UCCH5EVENT.prototype = {
    DOMCheck: null,
    binds: function() {
      this.businessListBind();
      this.inputCheck();
      this.viewFix();
      this.bigImgBind();
      this.inputClickBind();
      this.faceBind();
      this.closeBind();
      this.uploadInit();
      this.initReconnect();
      this.unload();
      this.enterBind();
      this.messageChange();
        if(!dialogue.islive()){
            $(".fileup input").attr("disabled",true);
        }
    },enterBind:function(){
          $(document).keydown(function(event) {
              var event = arguments[0] || window.event || event;
              if (event.keyCode == 13) {
                  setTimeout(function(){
                      $("#dialogue-send").click();
                  },0);
                  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
              }
          });
      },
      leaveCover:function(){if($(".leaveMessage").length>0){
        return
    }
    var str = webSocket.isWork?lang.websocketInterrupt:lang.boshInterrupt;
    $(".dialogue-footer-search").append("<div class='leaveMessage'>"+str+"</div><div class='leaveMessageCover'></div>");
      $(".leaveMessage").css({
      position: 'absolute',
      bottom: "50px",
      left: "13px"
      });
      setInterval(function() {
      $(".leaveMessage").fadeIn(500).fadeOut(500)
      }, 1000)
      $(".dialogue-footer-search .leaveMessage").unbind().click(function(){
        if(webSocket.isWork){
          webSocket.connect();
        }
      })
  },
  openCover:function(){
    $(".leaveMessage").remove();
  },
    showVisitorInfo: function() {
      dialogue.showMsg({
        from: "client",
        content: "<div class='show-visitor-info'> "+lang.satisfaction.msg+"<span class = 'spans visitor_info' id = 'v_info'>"+lang.satisfaction.complete+"</span><br></div>",
        saveIn:1
      })
      $(".visitor_info").click(function() {
        visitorInformation.show();
      });
    },
    showAudio: function() {
      $("audio").each(function(index, el) {
        if (!$(el).parent().hasClass('audiojs')) {
          var $this = $(this);
          audiojs.helpers.whenError = function() {
            var placeholder = $(".dialogue-c").find("a[placeholder]")
            placeholder.html(lang.downloadAudio);
          }
          audiojs.create($this);
        }
      });
    },
    scrollToBottom: function() {
      document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight; // 滚动条置底
    },
    scrollToTop: function() {
      document.getElementById('message').scrollTop = 0;
    },
    businessListBind: function() {
      $("#message").delegate('.onlineCls', 'click', function() {
        if (!dialogue.islive()) {
          var num = $(this).data("num");
          storage.set("businessId", $(this).data("pk"));
          storage.set("businessName", $(this).attr("name"));
          var businessId = $(this).data("pk");
          var businessName = $(this).attr("name");
          if (bList.hasList(businessId).length > 0) {
            var b = uccH5Logic.showBusinessList(businessId);
            dialogue.showMsg({
              from: "client",
              content: b,
              saveIn:1
            })
            return;
          }
          var isLea = $(this).data("online") != lang.businessList.online; //true代表离线
          if (isLea) { //如果业务类型离线
            leaveMessage.show();
            setTimeout(function(){
              if (document.activeElement.id && document.activeElement.id == "dialogue-footer-text") {
                $('#dialogue-footer-text').blur();
                $(".leaveMessageView input:visible").first().focus().blur();
              }
            },500)
          } else {
            queue.reqStartQueue(businessId, businessName);
          }
        }
      });
    },
    viewFix: function() {
      //微信下拉查看网址修复
      var overscroll = function(el) {
        el.addEventListener('touchstart', function() {
          var top = el.scrollTop,
            totalScroll = el.scrollHeight,
            currentScroll = top + el.offsetHeight;
          if (top <= 0) {
            el.scrollTop = 1;
          } else if (currentScroll >= totalScroll) {
            el.scrollTop = top - 1;
          }
        });
        el.addEventListener('touchmove', function(evt) {
          if (el.offsetHeight < el.scrollHeight)
            evt._isScroller = true;
        });
      }
      overscroll(document.querySelector('.dialogue'));
      document.querySelector('.dialogue-footer-text').addEventListener('touchmove', function(evt) {
        evt._isScroller = true;
      });
      document.body.addEventListener('touchmove', function(evt) {
        if (!evt._isScroller) {
          console.log("warn",evt._isScroller)
          evt.preventDefault();
        }
      });
    },
    inputCheck: function() {
      var ev = this;
      $(".dialogue-footer-text").css("overflowY", "auto");
      $("#dialogue-footer-text").on('focus', function() {
        $(".dialogue-footer-face").hide();
        $(".dialogue-footer").css({
          "position": "absolute",
        });
        mobileInput.startCheck();
        console.warn("focus")
        if (ev.DOMCheck) {
          ev.DOMCheck = window.clearInterval(ev.DOMCheck);
        }
        ev.DOMCheck = setInterval(function() {
          if ($("#dialogue-footer-text").html().length > 0 && $("#dialogue-footer-text").html() != "<br>") {
            $("#dialogue-send").show();
            $("#dialogue-add").hide();
            $("#dialogue-footer-face").hide();
            $(".dialogue").removeClass("dialogue-short");
            $(".dialogue-footer-select").hide();
          } else {
            $("#dialogue-send").hide();
            $("#dialogue-add").show();
            $("#dialogue-footer-text").empty();
          }
          setTimeout(function() {
            ev.checkHeight(4);
          }, 300);
        }, 700);
      }).on('blur', function() {
        console.warn("blur")
        $(".dialogue-footer").css({
          "position": "absolute"
        });
        ev.DOMCheck = window.clearInterval(ev.DOMCheck);
        setTimeout(function() {
          ev.checkHeight(4);
        }, 333);
      mobileInput.end();
      $('body').click()
      });
    },
    checkHeight: function(num) {
      var lineHeight = 24;
      $(".dialogue-footer-text").css("line-height", lineHeight + "px");
      var marginHeight = parseInt($(".dialogue-footer-text").css("marginBottom")) + parseInt($(".dialogue-footer-text").css("marginTop"));
      for (var i = 1; i <= num; i++) {
        if ($(".dialogue-footer-text")[0].scrollHeight >= i * lineHeight) {
          $(".dialogue-footer-search").height(i * lineHeight + marginHeight);
          $(".talk-btn").css("top", (i * lineHeight + marginHeight - $("#dialogue-send").height()) / 2);
        }
      }
      if ($(".dialogue-footer-text")[0].scrollHeight < 2 * lineHeight) {
        $(".dialogue-footer-search").height(34 + marginHeight)
        $(".dialogue-footer-text").css("line-height", "34px");
        $(".talk-btn").css("top", 0);
      }
      $("#message").css("bottom", $(".dialogue-footer").height());
    },
    bigImgBind: function() {
      $('#message').delegate('.dialogue-me .dialogue-c .content img,.dialogue-in .dialogue-c .content img', 'click', function() {
        if ($(this).attr("emotions") != "true"){
          uccH5Event.downloadOrigin($(this).attr("src")).done(function(src){
            showBigImgFun.showPic(src);
      })
        }
      });
    },
    getMsgStr:function($el){
      var sendMsg = $el.html()
      sendMsg = sendMsg.replace(/\r|<br>|<div\s*>|<\/div>|<span\s*>|<\/span>|<p\s*>|<\/p>/g, ""); //去掉enter键换行
      sendMsg = sendMsg.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ''); //去除输入法自带的表情
      sendMsg = changeFaceFun.imgToIco(sendMsg);
      return sendMsg;
    },
    inputClickBind: function() {
      var ev = this;
      $("#dialogue-send").unbind().click(function() {
        var sendMsg = ev.getMsgStr($("#dialogue-footer-text"))
        if (sendMsg) { // 输入栏没有内容则不操作
          sendMsg = sensitive.get(sendMsg);
          if (sendMsg.length > 1000) {
            Alert.show(lang.dialogue.maxLength);
            return "";
          }
          detectWeb.msgPush('visitor', sendMsg);
          sendMsg = sendMsg.replace(/ /ig,"&nbsp;").replace(/\n/ig,"<br>")
          if (!dialogue.islive()) {
            if(robot.isUse){
              robot.check(sendMsg.replace(/\&nbsp;/g, "").replace(/\s+/g, "").replace(/\<p><\/p>/g, "").replace(/\<br>/g, ""));
            }else if (datas.get("hasInQueue")) {
              dialogue.showMsg({
                from: "visitor",
                content: sendMsg,
                saveIn:1
              });
            }else {
              var numberSendMsg = Number($("<div>"+sendMsg+"</div>").text());
              if($(".onlineCls[data-num]").length==0){
                pageLoad.getDepartment().done(function() {
                    bList = $.businessList({
                      businessList: ucc.businessList,
                      aDset: ucc.aDset
                    });
                    var b = uccH5Logic.showBusinessList(-1);
                    dialogue.showMsg({
                      from: "client",
                      content: b,
                      saveIn:1
                    })
                  });
              }
              if (numberSendMsg) {
                dialogue.showMsg({
                    from: "visitor",
                    content: sendMsg,
                    saveIn:1
                  });
              
                var it = $(".onlineCls[data-num='" + numberSendMsg + "']");
                if (it.length > 0) {
                $(it).click();
              } else {
                dialogue.showMsg({
                  from: "robot",
                  content: lang.businessList.select,
                  saveIn:1
                });
              }
            } else {
              dialogue.showMsg({
                    from: "visitor",
                    content: sendMsg,
                    saveIn:1
                  });
              dialogue.showMsg({
                from: "robot",
                content: lang.businessList.select,
                saveIn:1
              });
            }
            }
              
          } else {
            dialogue.sendMessage(sendMsg);
          }
        }

        
        $('#dialogue-footer-text').text('')
        // 清空并聚焦输入框
        if (mobileInput.focusAfterInsert()) {
          $('#dialogue-footer-text').focus();
        }
        uccH5Event.scrollToBottom();
        setTimeout(function() {
          if ($("#dialogue-footer-text").html().length > 0 && $("#dialogue-footer-text").html() != "<br>") {
              $("#dialogue-send").show();
              $("#dialogue-add").hide();
              $("#dialogue-footer-face").hide();
              $(".dialogue").removeClass("dialogue-short");
              $(".dialogue-footer-select").hide();
          }else {
              $("#dialogue-send").hide();
              $("#dialogue-add").show();
              $('#dialogue-footer-text').empty()
            }
        }, 1000);
      });
    },
    faceBind: function() {
      $("#dialogue-biaoqing").unbind().click(function() {
        if (!dialogue.islive()) return;
        var isHidden = $(".dialogue-footer-face").is(":hidden") //是否隐藏
        if (isHidden) {
          $(".dialogue-footer-face").show();
        } else {
          $(".dialogue-footer-face").hide();
        }
        $(".dialogue").css("bottom", $(".dialogue-footer").height());
      });
    },
    closeBind: function() {
      $(".close").click(function() {
        if (!dialogue.islive()) {
          confirmBox.create(lang.closeWindow).done(function(click){
            if(click){
              window.close();
                    if (!!(typeof WeixinJSBridge)) {
                      WeixinJSBridge.call('closeWindow');
                    }
            }
          })
        } else {
          confirmBox.create(lang.closeChat).done(function(click){
            if(click){
              dialogue.end(5);
                $(".close").hide();
            }
          })
        }
      });
    },
    uploadInit: function() {
      $("#dialogue-add").uploadFile({
        size:5 * 1024 * 1024,
        uploadType:"image",
        inputImage:true,
        other:function(up,name,time){
          if (!dialogue.islive()) return;
          $("#dialogue-add").find(".fileup").attr("action","/any800/echatManager.do?method=uploadFile&fromType=visitor&chatId="+ucc.chatID);
              dialogue.showMsg({
                
                from: "visitor",
                content: '<img id="' + time + '" src="./pagesJs/echatJs/webuploader/loading.gif">'
              });
              var key = msgdb.last();
              up.submit(time,key);
        },
        callback:function(url,time,key){
            var imgstr = '<img  src="' + url + '">';
            $("#" + time).attr("src", url);
            dialogue.sendMessage(imgstr, "", true);
            msgdb.setKey(key,"content",imgstr);
            if(!!changeWindow)changeWindow.change();
            mobileInput.end();
        },
        error:function(type,time,errorMsg,key){
          if (errorMsg) {
            Alert.show(errorMsg);
            $("#" + time).parents(".dialogue-me.contentMessage").hide();
            $("#" + time).parents(".dialogue-me.contentMessage").prev(".time").hide()
            msgdb.setKey(key, "isRevoke", true);
            if ( !! changeWindow) changeWindow.change();
            localHistory.setCurrent(msgdb.db);
          }
          if (type == "type") {
            Alert.show(lang.upload.uploadFileError_4);
          } else if (type == "size") {
            Alert.show(lang.upload.uploadFileError_5);
          } else {
            Alert.show(lang.upload.uploadFileError_3);
            $("#" + time).parents(".dialogue-me.contentMessage").hide();
            $("#" + time).parents(".dialogue-me.contentMessage").prev(".time").hide()
            msgdb.setKey(key, "isRevoke", true);
            if ( !! changeWindow) changeWindow.change();
            localHistory.setCurrent(msgdb.db);
          }
          mobileInput.end();
        }
      })
    },
    reconnectClick:false,
    initReconnect:function(){
      var ev = this;
      $("#message").delegate(".reconnectID","click",function() {
          if(!dialogue.islive() && !datas.get("hasInQueue") && !ev.reconnectClick){
          ev.reconnectClick = true;    
          $.ajax({
        type: 'POST',
        url: './echat.do',
        data: {
          method: 'closeEchat',
          chatID: ucc.chatID,
          url: dialogue.getAttr("remoteUrl"),
          opname: dialogue.getAttr("operatroName") ? dialogue.getAttr("operatroName") : ""
        },
        success: function(result) {},
        dataType: "json",
        async: false,
        cache: false
      });
      $.ajax({
        url: "./echatManager.do",
        data: {
          method: "initChatId",
          companyPk: ucc.companyPk,
          vid: userDatas.getVisitorInfo().visitorId,
          hjUserData: params["hjUserData"]
        },
        dataType: "json",
        async: false,
        cache: false
      }).done(function(e) {
        try {
          ucc.chatID = e.chatID;
                storage.set("oldChatId",e.chatID);
                ucc.browserId = new Date().getTime();
              storage.set("oldChatId",e.chatID);
              //在关闭对话,并且用户有过一次以上留言打开满意度
                  datas.set("openSatisfactionAfterCloseChat", false);
                  //已打开满意度将不再打开
                  datas.set("hasSatisfaction", false);
                  var jsonStr = userDatas.getJsonStr();
                  uccH5Init.initFunc();
                  uccH5Logic.addmonitorJs();
          detectWeb.setIsReconnection(true);
                    queue.reqStartQueue(storage.get("businessId"), storage.get("businessName"), detectWeb.getIsReconnection()); // @Elijah
                  ev.reconnectClick = false;
        } catch (e) {
          // console.log(e);
        }
      }).fail(function(e) {
        ev.reconnectClick = false;
        dialogue.showSysMsg(lang.errorNetWork);
        return;
      })
          }
      });
    },
    unload:function(){
    $(window).unload(function(){
      if(storage.get("offChat")==ucc.browserId){
        storage.set("offChat",true);
      }
      if(webSocket.isWork){
        webSocket.websocket.close();
      }
    });
  },
  messageChange:function(){
    $("#message").delegate(".message_news","click",function(){
      if($(this).data("url")){
        window.open($(this).data("url"));
      }
    })
  },  
  downloadOrigin:function(src){
    var defered = new $.Deferred();
    var ext = src.substring(src.lastIndexOf("."));
    var extName = ext.toLowerCase();
    var pre = src.substring(0,src.lastIndexOf("."))
    if(pre.indexOf("origin")>-1){
      return defered.resolve(src);
      return;
    }
    if(".jpg"==(extName)||".jpeg"==(extName)||".png"==(extName)||".bmp"==(extName)){
      var url = pre+"origin"+ext;
      var img = new Image();
      img.src = url;
      if (img.complete) {
        return defered.resolve(url);
      } 
      img.onload = function () {
        return defered.resolve(url);
      }; 
      img.onerror = function(){
        return defered.resolve(src);
      }
    }
    return defered.promise();
  },
  resetInterval:function(){
    window.requestAnimFrame = (function () {
           return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               function (callback) {
                   window.setTimeout(callback, 6000 / 60);
               };
    })();
    window.setTimeout=function(callback,delay){
     var dateNow=Date.now,
         requestAnimation=window.requestAnimFrame,
         start=dateNow(),
         stop,
         timeoutFunc=function(){
          dateNow()-start<delay?stop||requestAnimation(timeoutFunc):callback()
         };
     requestAnimation(timeoutFunc);
     return{
      clear:function(){stop=1}
     }
    }
    window.setInterval=function(callback,delay){
       var dateNow=Date.now,
           requestAnimation=window.requestAnimFrame,
           start=dateNow(),
           stop,
           intervalFunc=function(){
            dateNow()-start<delay||(start+=delay,callback());
            stop||requestAnimation(intervalFunc)
           }
       requestAnimation(intervalFunc);
       return{
        clear:function(){stop=1}
       }
      }
    window.clearTimeout = function(el){
      if(el){
        el.clear();
      }
    }
    window.clearInterval = function(el){
      if(el && el.clear){
        el.clear();
      }
    }
  }
  }
  $.uccH5Event = function(options) {
    var uccH5Event = new UCCH5EVENT(options);
    return uccH5Event;
  }
})(window, jQuery);