/*http://www.9client.com/ 021-4008837939*/
/**
 * 2015-11-10 新版 rewrite by mike on 2016/12/12
 */
/*tab.js 右侧分栏*/
;
(function(window, $, undefined) {
	"use strict";
	var titleSpan = "<span data-index='$index' data-tab='$tab' >$title<i></i></span>";
	var iframeSpan = "<div data-index='$index' class='iframe'><iframe src='$url' frameborder='0' scrolling='scroll'></iframe></div>";
	var TAB = function(el, options) {
			this.$el = el
			this.defaults = {
				relatedEl: null,
			}, this.options = $.extend({}, this.defaults, options)
		}
	TAB.prototype = {
		current: 0,
		data: [],
		init: function() {
			var t = this;
			t.resize();
			t.$el.find(".tab_title").delegate("span", "click", function() {
				t.current = $(this).data("index");
				$(this).addClass("active");
				$(this).siblings().removeClass("active");
				var iframe = t.$el.find(".tab_main .iframe[data-index='" + t.current + "']");
				iframe.addClass("active");
				iframe.siblings().removeClass("active");
			})
			t.$el.find(".tab_title").delegate("span i", "click", function() {
				var index = $(this).parent().data("index");
				t.remove(index);
			})
			$(window).resize(function(event) {
				t.resize();
			});
		},
		add: function(tab, text, url) {
			var t = this;
			var index = t.data.length;
			if (t.$el.find(".tab_title span[data-tab='" + tab + "']").length == 0) {

				t.data[index] = tab;
				t.$el.find(".tab_title").append(titleSpan.replace(/\$title/g, text).replace(/\$index/g, index).replace(/\$tab/g, tab));
				t.$el.find(".tab_main").append(iframeSpan.replace(/\$url/g, url).replace(/\$index/g, index));

				if (tab == 1 || tab == 2) {
					t.$el.find(".tab_title span").last().find("i").remove();
				}
				t.current = index;
				t.$el.find(".tab_title span[data-index='" + index + "']").click();
			}else{
				t.$el.find(".tab_title span[data-tab='" + tab + "']").click();
			}
			t.resize();
		},
		resize: function() {
			var t = this;
			if (t.$el.find(".tab_title span").length == 0) {
				t.$el.css("width", 0);
				t.options.relatedEl.css("right", 0);
			} else if ($("body").width() > 900) {
				t.$el.css("width", "486px");
				t.options.relatedEl.css("right", "486px");
			} else if ($("body").width() > 768) {
				t.$el.css("width", "430px");
				t.options.relatedEl.css("right", "430px");
			} else {
				t.$el.css("width", 0);
				t.options.relatedEl.css("right", 0);
			}
		},
		remove: function(index) {
			var t = this;
			var $this = t.$el.find(".tab_title span[data-index='" + index + "']");
			var next = $this.prev().length > 0 ? $this.prev() : $this.next();
			$this.remove();
			t.$el.find(".tab_main .iframe[data-index='" + index + "']").remove();
			if (next && next.length > 0) {
				next.click();
			}
			t.resize();
		}
	}
	$.fn.tab = function(options) {
		var tab = new TAB($(this), options);
		tab.init();
		return tab;
	}
})(window, jQuery); /*systemInfo.js 系统消息*/
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
			el.html("");
			el.find(".systemInfo").remove();
			el.append('<div class="systemInfromBox systemInfo">' + text + '</div>');
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
})(window, jQuery); /*showLabel.js*/
(function(window, $, undefined) {
	var SHOWLABEL = function($this, options) {
			this.$el = $this
			this.defaults = {}, this.options = $.extend({}, this.defaults, options)
		}
	SHOWLABEL.prototype = {
		init: function() {
			var sl = this;
			sl.$el.each(function(index, el) {
				sl.show($(this));
			});
		},
		show: function(el) {
			if ( !! el.data("label")) {
				if (el.css("position") == "static") {
					el.css("position", "relative");
				}
				el.append('<div class="label">' + el.data("label") + '</div>');
				el.find('.label').width(12 * el.find('.label').text().length);
				el.hover(function() {
					el.find('.label').show()
				}, function() {
					el.find('.label').hide()
				});
			}
		}
	}
	$.fn.showLabel = function(options) {
		var showLabel = new SHOWLABEL($(this), options);
		showLabel.init();
		return showLabel;
	}
})(window, jQuery); /*visitorRobot.js 智能推荐*/
;
(function(window, $, undefined) {
	var VISITORROBOT = function(options) {
			this.defaults = {
				companyPk: "",
				after: function(json) {},
				init: function() {},
				hide: function() {}
			}, this.options = $.extend({}, this.defaults, options);
		}
	VISITORROBOT.prototype = {
		msg: "",
		ok: true,
		init: function() {
			this.options.init();
		},
		check: function(msg) {
			this.checkNew(msg)
		},
		checkNew: function(msg) {
			var VR = this;
			if(!VR.ok || !msg){
				VR.options.hide();
			}
			if (msg == VR.msg || !VR.ok || !msg) return;
			VR.msg = msg;
			$.ajax({
				type: "POST",
				url: "echatManager.do",
				data: {
					method: "getSimilarQuestions",
					companyPk: VR.options.companyPk,
					visitorId:VR.options.visitorId,
					chatId:VR.options.chatId,
					channel:"web",
					question:msg,
					top:3
				},
				dataType: "json",
				async: false
			}).done(function(e) {
				if (e) {
					VR.options.newAfter(e,msg);
				} else {
					//VR.ok = false;
				}
			}).fail(function() {
				VR.ok = false;
			})
		},
		checkOld:function(msg){
			var VR = this;
			if(!VR.ok || !msg){
				VR.options.hide();
			}
			if (msg == VR.msg || !VR.ok || !msg) return;
			VR.msg = msg;
			$.ajax({
				type: "post",
				url: "./qaInterface.do",
				data: {
					method: "searchForQuestionByKeywords",
					companyPk: VR.options.companyPk,
					question: msg
				},
				dataType: "json",
				async: false
			}).done(function(e) {
				if (e.success != false) {
					VR.options.after(e);
				} else {
					VR.ok = false;
				}
			}).fail(function() {
				VR.ok = false;
			})
		},
		hide: function() {
			this.options.hide();
		}
	}
	$.visitorRobot = function(options) {
		var visitorRobot = new VISITORROBOT(options);
		return visitorRobot;
	}
})(window, jQuery);
(function(window, $, undefined) {
	var FONTSTYLE = function(options) {
			this.defaults = {
				fs: {
					fontSize: "14px",
					color: "#000",
					fontWeight: "normal",
					fontStyle: "normal",
					textDecoration: "none",
					lineHeight: "14px",
					fontFamily: lang.front.fonts[0],
				},
				storage: null,
				initFun: function(fs) {

				}
			};
			this.options = $.extend({}, this.defaults, options);
		}
	FONTSTYLE.prototype = {
		fs: {
			fontSize: "14px",
			color: "#000",
			fontWeight: "normal",
			fontStyle: "normal",
			textDecoration: "none",
			lineHeight: "14px",
			fontFamily: lang.front.fonts[0],
		},
		init: function() {
			var storage = this.options.storage;
			var fs = storage.get("fs");
			if ( !! fs) {
				this.fs = fs;
			}
			this.options.initFun(fs);
		},
		isShow: function() {
			if (this.options.fs == this.fs) {
				return false;
			}
			return true;
		},
		set: function(key, value) {
			var storage = this.options.storage;
			this.fs[key] = value;
			storage.set("fs", this.fs);
		},
		get: function(key) {
			var storage = this.options.storage;
			return typeof key != "undefined" ? this.fs[key] : "";
		}
	}
	$.fontStyle = function(options) {
		var fontStyle = new FONTSTYLE(options);
		fontStyle.init();
		return fontStyle;
	}
})(window, jQuery);;
(function(window, $, undefined) {
	var SETSKIN = function(options) {
			this.defaults = {
				aDset: {
					vcwTitleZhcn: lang.vcwTitleZhcn,
					vcwLftAdZhcn: "./style/images/echat/ad.html",
					vcwLogoZhcn: "./style/css/images/ucc-logo.png",
				}
			};
			this.options = {
				aDset: {
					vcwTitleZhcn: !! options.aDset.vcwTitleZhcn ? options.aDset.vcwTitleZhcn : this.defaults.aDset.vcwTitleZhcn,
					vcwLftAdZhcn: !! options.aDset.vcwLftAdZhcn ? options.aDset.vcwLftAdZhcn : this.defaults.aDset.vcwLftAdZhcn,
					vcwLogoZhcn: !! options.aDset.vcwLogoZhcn ? options.aDset.vcwLogoZhcn : this.defaults.aDset.vcwLogoZhcn,
				}
			}
		}
	SETSKIN.prototype = {
		setTitle: function() {},
		setTab: function() {
			tab.add('2', lang.profile, this.options.aDset.vcwLftAdZhcn);
			$(".ucc-logo").attr("src",this.options.aDset.vcwLogoZhcn);
		}
	}
	$.setSkin = function(options) {
		var setSkin = new SETSKIN(options);
		return setSkin;
	}
})(window, jQuery); /* colorPicker */
(function($) {
	/**
	 * Return true if color is dark, false otherwise. (C) 2008
	 * Syronex / J.M. Rosengard
	 */

	function isdark(color) {
		var colr = parseInt(color.substr(1), 16);
		return (colr >>> 16) // R
		+ ((colr >>> 8) & 0x00ff) // G
		+ (colr & 0x0000ff) // B
		< 500;
	}
	$.fn.colorPicker = function($$options) {
		var $defaults = {
			color: new Array("#FFFFFF", "#EEEEEE", "#FFFF88", "#FF7400", "#CDEB8B", "#6BBA70", "#006E2E", "#C3D9FF", "#4096EE", "#356AA0", "#FF0096", "#B02B2C", "#702D86", "#000000"),
			defaultColor: 0,
			columns: 0,
			click: function($color, i) {}
		};
		var $settings = $.extend({}, $defaults, $$options);
		// Iterate and reformat each matched element
		return this.each(function() {
			var $this = $(this);
			// build element specific options
			var o = $.meta ? $.extend({}, $settings, $this.data()) : $settings;
			var $$oldIndex = typeof(o.defaultColor) == 'number' ? o.defaultColor : -1;

			var _html = "";
			for (var i = 0; i < o.color.length; i++) {
				_html += '<div style="background-color:' + o.color[i] + ';"></div>';
				if ($$oldIndex == -1 && o.defaultColor == o.color[i]) $$oldIndex = i;
			}

			$this.html('<div class="jColorSelect">' + _html + '</div>');
			var $color = $this.children('.jColorSelect').children('div');
			// Set container width
			var w = ($color.width() + 2 + 2) * (o.columns > 0 ? o.columns : o.color.length);
			$this.children('.jColorSelect').css('width', w);

			// Subscribe to click event of each color box
			$color.each(function(i) {
				$(this).click(function() {
					if ($$oldIndex == i) return;
					if ($$oldIndex > -1) {
						var cell = $color.eq($$oldIndex);
						if (cell.hasClass('check')) cell.removeClass('check').removeClass('checkwht').removeClass('checkblk');
					}
					// Keep index
					$$oldIndex = i;
					$(this).addClass('check').addClass(isdark(o.color[i]) ? 'checkwht' : 'checkblk');
					// Trigger user event
					o.click(o.color[i], i);
				});
			});
			// Simulate click for defaultColor
			var _tmp = $$oldIndex;
			$$oldIndex = -1;
			$color.eq(_tmp).trigger('click');
		});
		return this;
	};
})(jQuery);
;(function(window, $, undefined) {
    var SCREENCAPTURE = function(options) {
        this.defaults = {
        	os:{},
            draw:function(data){

            },
            download:function(){

            }
        },this.options = $.extend({}, this.defaults, options)
    };
    SCREENCAPTURE.prototype = {
        outTime:1000*60,
        startTime:0,
        using:false,
        failOp:0,
        scinterval:null,
        os:null,
        title:"",
        type:1,
        http:"http://local.any800.com:20201/",
        https:"https://local.any800.com:20202/",
        url:"",
        onClick:false,
        init:function(){
            this.title = $("title").html();
            this.os= this.options.os;
            var ishttps = 'https:' == document.location.protocol ? true: false;  
            if(ishttps){
            	this.url = this.https; 
            }else{
            	this.url = this.http;
            }
            $(".screenCaptureCheckBox .checked").toggleClass("active",!!datas.get("screenCapture"));
            this.getBrowserName();
        },
        use:function(){
          if(this.onClick)return;
          this.onClick = true;
        	this.type = !datas.get("screenCapture");
        	var isshown = Number(!!this.type);
        	var browserName = this.browserName;
        	$("title").html(this.title+"-"+lang.screenCapturing);
            $('iframe.screenCapture').remove();
            $("html").append("<iframe class='screenCapture' style='position:absolute;visibility:hidden;top: 0;left: 0;'  src='"+("hfxyz:\\\\"+(isshown?"show":("hidden?pn="+browserName+"&title="+encodeURIComponent(this.title))))+"' frameborder='0'></iframe>");
            this.startTime = new Date().getTime();
            this.using = false;
            this.failOp=0;
            this.startCheck();
        },
        getBrowserName:function(){
            var browserName = this.os.browserName;
            switch (browserName){
	            case "msie":
	            	browserName =  "iexplore";
	            	break;
	            case "metasr":
	            	browserName = "SogouExplorer";
	            	break;
	            case "qqbrowser":
	            	browserName = "QQBrowser";
	            	break;
	            case "firefox":
	            	browserName = "firefox";
	            	break;
	            case "chrome":
	            	browserName = "chrome";
	            	break;
	            case "msie":
	            	browserName = "iexplore";
	            	break;
            }
            if(browserName=="chrome"){
            	var desc = navigator.mimeTypes['application/vnd.chromium.remoting-viewer'];
            	if (desc) {  
                	browserName = "360se"      
                }  
            }
            this.browserName = browserName;
        },
        startCheck:function(){
            var sc = this;
//            if(sc.os.browserName=="msie"){
//            	sc.checkIE();
//            }
            if(this.scinterval){
                clearInterval(this.scinterval);
            }
            if(new Date().getTime()-this.startTime>this.outTime){
                return;
            }
            this.scinterval = setInterval(function(){
                $.ajax({url:sc.url+"index.html",dataType:"jsonp",jsonpCallback: "success_jsonpCallback",})
                    .done(function(e){
                    	console.log("time"+new Date().getTime())
                        sc.failOp = 0;
                        if(e.test==true && !!e.data){
                            sc.using = true;
                            sc.options.draw(e.data);
                            sc.close();
                        }else if(e.test==false){
                            sc.close();
                        }
                    })
                if(sc.failOp>10){
                  sc.download()
                }
                sc.failOp++;
            },500)
        },
        close:function(){
            if(this.scinterval){
                clearInterval(this.scinterval);
            }
            this.onClick = false;
            $("title").html(this.title);
            $('iframe.screenCapture').remove();
            $("html").append("<iframe class='screenCapture' style='position:absolute;visibility:hidden'  src='"+this.url+"close.html' frameborder='0'></iframe>");
        },
        download:function(){
          if (this.scinterval) {
            clearInterval(this.scinterval)
          }
          this.onClick = false;
          if (window.ScreenCapture) {
            return
          }
          if (this.hasDownload) {
            return
          }
          this.hasDownload = true
          this.options.download()
        },
		checkIE:function(){
			var obj = $('.screenCaptureIframe');
		    if(obj.length < 1)
		    {
		        $("body").append('<div class="screenCaptureIframe" style="height:0px;width:0px;"></div>');
		        obj = $('.screenCaptureIframe');
		    }        
		    obj.html('');
		    obj.html('<object id="capture" type="application/x-hfxyz2" width="0" height="0"><param name="onerror" value="onerrorHandler" /><param name="onload" value="onloadHandler" /></object>');
		}
    }
    $.screenCapture = function(options) {
        var screenCapture = new SCREENCAPTURE(options);
        screenCapture.init();
        return screenCapture;
    }
})(window, $);
/*uccPcEvent.js UCCPC事件*/
;
(function(window, $, undefined) {
	var UCCPCEVENT = function(options) {
			this.defaults = {}, this.options = $.extend({}, this.defaults, options);
		}
	UCCPCEVENT.prototype = {
		screenCapture:function(){
			screenCapture = $.screenCapture({
				os:userDatas.getOperatingSystem(),
				draw:function(data){
					uccPcEvent.uploadImgFromPaste("data:image\/.png;base64,"+data,"paste",false);
				},
				download:function(){
					Alert.show(lang.screenCaptureDownload);
					window.open("/any800/Any800Capture.html", "Any800Capture");
				}
			});
		},
		leaveCover:function(){
			if($(".leaveMessage").length==0){
				$(".dialogue-area").append("<div class='leaveMessage'>"+lang.offlineMessage+"</div>");
				$(".leaveMessage").css({
					position: 'absolute',
					bottom: "130px",
					left: "13px"
				});
//			$(".leaveMessageCover").css({
//				position: 'fixed',
//				bottom: "0",
//				left: "0",
//				right:"0",
//				top:"0",
//				zIndex:1003
//			});
				setInterval(function() {
					$(".leaveMessage").fadeIn(500).fadeOut(500)
				}, 1000);
			}
		},
		openCover:function(){
			$(".leaveMessage").remove();
		},
		repaceImg:function(){
			var origin = $(".contentMessage").last().find("img[originsrc]");
			if(origin.length>0){
				origin.attr("src",origin.attr("originsrc"));
			}
		},
		rightClickOnImg:function(){
			$(".dialogue-record").delegate(".contentMessage .content img","mousedown",function(e){
				if(!$(this).attr("emotions")){
					if(e.which==3){
						uccPcEvent.rightClick(e.clientX,e.clientY,$(this).attr("originsrc")||$(this).attr("src"));
						e.preventDefault();
						return false;
					}
				}
			})
			$(".dialogue-record").delegate(".contentMessage .content img","mouseup",function(e){
				if(!$(this).attr("emotions")){
					e.preventDefault();
					return false;
				}
			})
			$(".dialogue-record-c").on("scroll",function(){
				$(".rightClick").remove();
			})
			$(window).resize(function(event) {
				$(".rightClick").remove();
			});
		},
		rightClick:function(x,y,url){
			if($(".rightClick").length==0){
				$("body").append("<div class='rightClick'>"+lang.downloadImg+"</div>");
				$(".rightClick")[0].oncontextmenu= function(){ 
					return false;
				}  
			}
			$(".rightClick").css("top",y-2);
			$(".rightClick").css("left",x-2);
			$(".rightClick").unbind().on("click",function(){
				uccPcEvent.downloadOrigin(url).done(function(src){
					window.open(src);
				})
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
		cacheImg:function(symbol,url,callback){
			var img = new Image();
			img.src = url;
			if (img.complete) {
				callback.call(img); 
				return; 
			} 
			img.onload = function () {
				callback.call(img);
			}; 
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
		addEvent: function() {
			var ev = this;
			//点击图片放大显示
			$('body').delegate(".fanke-liuyan", "click", function() {
				leaveMessage.show(); // 提示留言
			});
			$('#message').delegate('.dialogue-me .dialogue-in-c .content img,.dialogue-in .dialogue-in-c .content img', 'click', function() {
				if ($(this).attr("emotions") != "true") {
					showBigImgFun.showPic($(this).attr("originsrc") || $(this).attr("src"));
				}
			});
			ev.toolsEvnt(ucc.buttonList);
			ev.rightClickOnImg();
			$(".send").click(function() {
				if (dialogue.islive() || !! robot.isUse) {
					ev.sendMsg();
				}
			});
			$("#close").click(function() {
				if (dialogue.islive()) {
					var cf = confirm(lang.closeChat);
					if (cf == true) {
						ev.closeChat();
						$("#close").css("cursor", '');
					}
				}
			});
			$(".ucc-logo-cancel").click(function() {
				if (dialogue.islive()) {
					var cf = confirm(lang.closeChat);
					if (cf == true) {
						ev.closeChat();
						$("#close").css("cursor", '');
					}
				} else {
					var cf = confirm(lang.closeWindow);
					if (cf == true) {
						window.close();
					}
				}
			});
			$(document).keydown(function(event) {
				ev.glint.clear();
				if (dialogue.islive() || !! robot.isUse) { // 机器人允许回车键
					ev.sendKeyDown(event);
				}
			});
			$('body').click(function() {
				ev.glint.clear();
			});
		},
		toolsEvnt: function(_p) {
			var pEventM = this;
			for (var i = 0; i < _p.length; i++) {
				switch (_p[i].type) {
				case 1:
					// FAQ
					$(".tool1").show();
					var a_Dset = ucc.aDset;
					var faq_url = "echatManager.do?method=showFaq&companyPk=" + ucc.companyPk + "&langPk=" + ucc.defaultLangPk + "&codeKey=" + a_Dset.vcwColor;
					tab.add('1', lang.problem, faq_url);
					$(".tool1").click(function() { // 添加点击事件
						tab.add('1', lang.problem, faq_url);
					});
					break;
				case 2:
					// FONF
					$(".tool2").show();
					break;
				case 3:
					// FACE
					$(".tool3").show();
					break;
				case 4:
					// SCREEN
					$(".tool4").show()
					$(".tool4 .screenCapture").click(function() { // 截屏显示，添加点击事件
						screenCapture.use();
						$(".screenCaptureCheckBox").hide();
					});
					$(".tool4 .screenCaptureCheck").click(function() { // 截屏显示，添加点击事件
						$(".screenCaptureCheckBox").toggle();
					});
					$(".screenCaptureCheckBox").click(function(event) { // 截屏显示，添加点击事件
						$(".screenCaptureCheckBox .checked").toggleClass("active");
						datas.set("screenCapture",$(".screenCaptureCheckBox .checked").hasClass("active"));
						$(".screenCaptureCheckBox").hide();
					});
					$(window).click(function(e){
            var _target = $(e.target);
            if (_target.closest($(".screenCaptureCheckBox")[0]).length == 0) {
              $(".screenCaptureCheckBox").hide();
            }
					})
					break;
				case 5:
					// SAVE
					$(".tool9").show().click(function() { // 保存对话显示，添加点击事件
						pEventM.saveDialog();
					});
					break;
				case 6:
					// LOVE
					$(".tool6").show().click(function() { // 满意度显示，添加点击事件
						satisfaction.show();
					});
					break;
				case 7:
					// FILE
					$(".tool5").click(function() { // 上传文件显示，添加点击事件
						pEventM.createSendFile();
					});
					break;
				case 8:
					// audio
					$(".tool7").show().click(function() { // 语音显示，添加点击事件
						pEventM.sendAudioRq();
					});
					break;
				case 12:
					// 发送图片
					$(".tool10").show();
					pEventM.sendPicture();
					$("#picUpload>div").width(26).height(21);
					break;
				}
			}
		},
		sendScreen: function() {
			screenCapture.use();
		},
		saveDialog: function() {
			var htmlChatContent = this.getChatContent();
			htmlChatContent = encodeURIComponent(htmlChatContent);
			var iframe; // 生成iframe.
			if (window.frames && window.frames['downloadFrame']) {} else {
				try {
					iframe = document.createElement('<iframe name="downloadFrame" style="display:none;">');
				} catch (ex) {
					iframe = document.createElement('iframe');
					iframe.style = 'display:none;';
					iframe.setAttribute("style", "display:none;");
				}
				iframe.id = 'downloadFrame';
				iframe.name = 'downloadFrame';
				iframe.width = 0;
				iframe.height = 0;
				iframe.marginHeight = 0;
				iframe.marginWidth = 0;

				var objBody = document.getElementsByTagName("body").item(0);
				objBody.insertBefore(iframe, objBody.firstChild);
			}
			var formObj;
			if ($("#downloadForm").length > 0) {
				formObj = $("#downloadForm")[0];
			} else {
				formObj = document.createElement("form");
				var formMethod = "post";
				formObj.setAttribute("method", formMethod);
				formObj.setAttribute("name", "downloadForm");
				formObj.setAttribute("id", "downloadForm");
				formObj.setAttribute("action", 'echat/downloadChat.jsp');
				formObj.setAttribute("target", "downloadFrame");
			}
			var inputHiddenObj;
			if ($("#htmlContent").length > 0) {
				inputHiddenObj = $("#htmlContent")[0];
			} else {
				inputHiddenObj = document.createElement("input");
				inputHiddenObj.setAttribute("type", "hidden");
				inputHiddenObj.setAttribute("name", 'htmlContent');
				inputHiddenObj.setAttribute("id", 'htmlContent');
			}
			inputHiddenObj.setAttribute("value", htmlChatContent);
			formObj.appendChild(inputHiddenObj);
			var tmpObjBody = document.getElementsByTagName("body").item(0);
			tmpObjBody.insertBefore(formObj, tmpObjBody.firstChild);
			formObj.submit();
		},
		getChatContent: function() {
			var htmlChat = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>'+lang.recored+'</title>';
			htmlChat += "<link type='text/css' rel='stylesheet' href='" + baseUrl + "/style/css/echat/ucc.css'/></head><body style='overflow:auto;visibility: visible;'>";
			var clone = $('#message').clone()
			clone.children("#historyChat,#moreHistory").remove();
			htmlChat += clone.html().replace(/\/any800\/style\/images/g, baseUrl + "/style/images");
			htmlChat += "</body></html>";
			return htmlChat;
		},
		createSendFile: function() {
			var uccevent = this;
			var sendFile = $(".label-pop .sendFile");
			if (sendFile.length == 0) {
				var sendHtml = "<div class='sendFile'><div class='name'></div><div class='ok'>"+lang.upload.searchFile+"</div><div class='submit'>"+lang.upload.sendFile+"</div></div>";
				$(".label-pop").append(sendHtml);
				uccevent.uploader = $(".label-pop .sendFile .ok").uploadFile({
					size: 10 * 1024 * 1024,
					uploadType: "all",
					other: function(up, name, time) {
					  $(".label-pop .sendFile .ok").find(".fileup").attr("action","/any800/echatManager.do?method=uploadFile&fromType=visitor&chatId="+ucc.chatID);
						//$(".sendFile .fileup").hide();
						$(".label-pop .sendFile .name").html(name);
					},
					callback: function(url, time,key,originPath) {
						var fileUrl = url;
						var txt = lang.upload.sendedFile+'<a class = "download" target="_blank" href="' + fileUrl + '">'+lang.upload.downloadFile+'</a>';
						var imags = ["jpg", "jpeg", "bmp", "gif", "png"];
						if (fileUrl.indexOf(".jpg") > -1 || fileUrl.indexOf(".bmp") > -1 || fileUrl.indexOf(".jpeg") > -1 || fileUrl.indexOf(".gif") > -1 || fileUrl.indexOf(".png") > -1) {
							txt = "<img id='img' "+(originPath?"originsrc='"+originPath+"'":"")+" data-symbol='"+time+"' src='"+fileUrl+"'>";
						}
						dialogue.sendMessage(txt, "");
						$(".label-pop .sendFile .name").html("");
						$(".sendFile").hide();
						$(".tool5").removeClass("click");
					},
					error: function(type,time,errorMsg,key) {
					  if (errorMsg) {
					    Alert.show(errorMsg)
	          }
						if (type == "type") {
							Alert.show(lang.upload.uploadFileError_1);
						} else if (type == "size") {
							Alert.show(lang.upload.uploadFileError_2);
						} else {
							Alert.show(lang.upload.uploadFileError_3);
						}
					}
				})
				$(".label-pop .sendFile .submit").on("click", function() {
					if ($(".label-pop .sendFile .name").html() != "") {
						uccevent.uploader.submit("");
					}else{
						Alert.show(lang.upload.uploadFileMsg);
					}
				})
			} else {
				$(".sendFile").toggle();
				$(".label-pop .sendFile .name").html("");
				if(uccevent.uploader){
					uccevent.uploader.create();
				}
			}
		},
		sendAudioRq: function() {
			//      showMediaChat("vistorSendRq");
			dialogue.sendMessage("vistorSendRq", "vistorSendRq");
		},
		sendPicture: function() {
			$("#picUpload").uploadFile({
				size: 5 * 1024 * 1024,
				uploadType: "image",
				other: function(up, name, time) {
				  $("#picUpload").find(".fileup").attr("action","/any800/echatManager.do?method=uploadFile&fromType=visitor&chatId="+ucc.chatID);
					up.submit(time);
				},
				callback: function(url, time,key,originPath) {
					setTimeout(function() { /** 将图片发送至客服**/
						var imgstr = "<img "+(originPath?"originsrc='"+originPath+"'":"")+" src='" + url + "'>";
//						dialogue.sendMessage(imgstr, "");
						$(".dialogue-area-write").append(imgstr);
/*$("#" + file.id).attr("src", msgs[1]);
		            dialogue.sendMessage(imgstr, "", true);*/
					}, 5e2);
				},
				error: function(type,time,errorMsg,key) {
				  if (errorMsg) {
				    Alert.show(errorMsg)
          }
					if (type == "type") {
						Alert.show(lang.upload.uploadFileError_4);
					} else if (type == "size") {
						Alert.show(lang.upload.uploadFileError_5);
					} else {
						Alert.show(lang.upload.uploadFileError_3);
					}
				}
			})
		},
		sendMsg: function() {
			var ev = this;
			if (!datas.get("canSend")) return;
			datas.set("canSend", false);
			var msgStr = ev.getMsgStr($(".dialogue-area-write"));
			if (msgStr == "unable" || msgStr == "") {
				datas.set("canSend", true);
				return;
			}

			var reg = new RegExp("<br>", "g");
			if (msgStr.replace(reg, '')) {
				var regBase64 = /<img\s*src="data:image\/.{0,5};base64,/i;
				if (dialogue.islive()) {
					if (regBase64.test(msgStr)) {
						$.ajax({
							type: "POST",
							async: "false",
							url: 'echatManager.do?method=getScreenshotSrc&chatId='+ucc.chatID,
							data: {
								"sendMsg": msgStr
							},
							dataType: "json",
						}).done(function(msgs) {
						  if (msgs.success) {
				        var src = msgs.content
				        uccPcEvent.storeImg(src).done(function (url) {
				          msgStr = '<img id="img" src="' + url + '">'
				          dialogue.sendMessage(msgStr);
		              detectWeb.msgPush('visitor', msgStr); // 将发送的消息存放起来@Elijah
				        })
				      } else {
				        if (msgs.errorMsg) {
				          Alert.show(msgs.errorMsg)
				        }
				      }
						});
					} else {
						dialogue.sendMessage(msgStr);
						detectWeb.msgPush('visitor', msgStr); // 将发送的消息存放起来@Elijah
					}
					datas.set("openSatisfactionAfterCloseChat", true);
				} else if (robot.isUse) {
					robot.check(msgStr.replace(/\&nbsp;/g, "").replace(/\s+/g, "").replace(/\<p><\/p>/g, "").replace(/\<br>/g, ""));
				} else {

				}
			}
			setTimeout(function() {
				ev.clearSend()
				datas.set("canSend", true);
			}, 1e1);
		},
		getMsgStr: function($el) {
			var sendMsgclone = $el.clone();
			var sendMsg = $el.html();

			sendMsg = changeFaceFun.imgToIco(sendMsgclone.html());
			//sendMsg = $("<div>" + sendMsg + "</div>").text();
			var regHref = /<a[^>]*href=['"]([^"]*)['"].*?[^>]*>(.*?)<\/a>/g;
			var arrs = sendMsg.match(regHref);
			if (arrs) {
				for (i = 0; i < arrs.length; i++) {
					sendMsg = sendMsg.replace(arrs[i], RegExp.$2)
				}
			}
			sendMsg = sensitive.get(sendMsg);
			try {
				var tsm = sendMsg.replace(/\&nbsp;/g, "").replace(/\<p><\/p>/g, "")
				if (tsm.length == 0) {
					sendMsg = tsm;
				}
			} catch (e) {}
			var regBase64 = /<img\s*src="data:image\/.{0,5};base64,/i; // 判断是否有截图
			// 如有截图
			// 先吥显示访客的话
			sendMsg = sendMsg.replace(/\r\n/g,"<br>").replace(/\n/g,"<br>");
			var reg = new RegExp("<br>", "g");
			sendMsg = sendMsg.replace(/<div\s*>|<\/div>|<span\s*>|<\/span>|<p\s*>|<\/p>/g, "").replace(/<\/?[p|P][^>]*>/g, "");
			if (!regBase64.test(sendMsg)) {
				if (sendMsg.replace(reg, '')) { // 输入栏没有内容则不操作
					if (sendMsg.length > 1000 ) {
						Alert.show(lang.dialogue.maxLength);
						return "unable";
					}
					sendMsg = sendMsg.replace(/<\/?[p|P][^>]*>/g, "");
				}
			}

			if (sendMsg.replace(reg, '')) { // 输入栏没有内容则不操作
				sendMsgclone.find("p").each(function() {
					$(this).replaceWith($(this).html() + "<br/>")
					sendMsg = sendMsgclone.html();
				});
				sendMsgclone.find("img").each(function() {
					if ($(this).attr("name") == "faceIco") {
						var imgFlg = this.id; //"<img  src=\"" + this.src + "\" \>";
						$(this).replaceWith(imgFlg);
						sendMsg = sendMsgclone.html();
					}
				});
			}
			var ma = sendMsg.match(/<img.*?>/g);
			var msg
			if (ma && ma.length > 0) {
				for (var i in ma) {
					if (ma[i] && !isNaN(Number(i))) {
						sendMsg = sendMsg.replace(ma[i], "</span>" + ma[i] + "<span>")
					}
				}
				sendMsg = "<span>" + sendMsg + "</span>"
			}
			sendMsgclone = $("<div>"+sendMsg+"</div>");
			sendMsgclone.find("span").each(function() {
				$(this).replaceWith($(this).html().replace(/ /ig,"&nbsp;").replace(/\n/ig,"<br>"));
				sendMsg = sendMsgclone.html();
			});

			return sendMsgclone.html();

		},
		clearSend: function() {
			var ua = window.navigator.userAgent;
			if (/MSIE 8/g.test(ua)) {
				$('.dialogue-area-write')[0].innerHTML = "&nbsp;";
			} else {
				$('.dialogue-area-write').html("");
			}
			$('.dialogue-area-write').focus();
		},
		closeChat: function() {
			if ( !! dialogue.islive()) {
				if (ucc.BasicSetting.jump == 1) {
					if (datas.get("openSatisfactionAfterCloseChat") && !datas.get("hasSatisfaction")) {
						satisfaction.show();
					}
				}
				dialogue.end(5);
				$("#face_08").css("display", "none");
				$('.sendFile').hide(); // 上传按钮
			}
		},
		sendKeyDown: function(event) {
			var pEventM = this;
			var event = arguments[0] || window.event || event;
			var srcElement = event.target || window.event.srcElement;
			if (event.keyCode == 88) { // 88是X键
				if (event.ctrlKey && event.shiftKey) {
					return false;
				}
			}
			if (event.keyCode == 13 && ucc.sendKey == 0) { // 13是enter键，enter键发送
				if (event.ctrlKey || event.shiftKey) {
					try {
						var tR;
						if (document.createRange) {
							tR = document.createRange();
						} else {
							tR = document.selection.createRange();
						}
						tR.text = "\r\n";
						tR.collapse(false);
						tR.select();
						return false;
					} catch (e) {}
				} else {
					pEventM.sendMsg();
					return false;
				}
			} else {
				if (event.keyCode == 13 && ucc.sendKey == 1) { // Ctrl+enter键发送
					if (event.ctrlKey || event.shiftKey) {
						pEventM.sendMsg();
						return false;
					} else {
						try {
							var tR;
							if (document.createRange) {
								tR = document.createRange();
							} else {
								tR = document.selection.createRange();
							}
							tR.text = "\r\n";
							tR.collapse(false);
							tR.select();
							return false;
						} catch (e) {}
					}
				}
			}
		},
		glint: { // 标题闪烁
			time: 0,
			title: document.title,
			timer: null,
			titleGlitterFlag: 0,
			// 显示新消息提示
			show: function() {
				var glint = this;
				var title = this.title.replace("【　　　】", "").replace("【新消息】", "");
				// 定时器，设置消息切换频率闪烁效果就此产生
				this.timer = setTimeout(function() {
					glint.time++;
					glint.show();
					if (glint.time % 2 == 0) {
						document.title = "【"+ lang.newMessage +"】" + title
					} else {
						document.title = "【　　　】" + title
					};
				}, 600);
				return [this.timer, this.title];
			},
			// 取消新消息提示
			clear: function() {
				clearTimeout(this.timer);
				document.title = this.title;
				this.titleGlitterFlag = 0;
			}
		},
		titleGlitter: function() {
			if (this.glint.titleGlitterFlag == 0) {
				this.glint.show();
			}
			this.glint.titleGlitterFlag = 1;
		},
		closeChatSatisfaction: function() {
			if (ucc.BasicSetting.jump == 1) {
				if (datas.get("openSatisfactionAfterCloseChat") && !datas.get("hasSatisfaction")) {
					satisfaction.show();
				}
			}
		},
		scrollTop: function() {
			if ($('.dialogue-record-c')[0]) {
				$('.dialogue-record-c')[0].scrollTop = $('.dialogue-record-c')[0].scrollHeight;
			}
		},
		showAdvertisement: function() { // 有插播时间限制 .
			var isVisable = parseInt(ucc.advertisement.isVisable);
			var accessDisplay = parseInt(ucc.advertisement.accessDisplay);
			var visitorWaiting = parseInt(ucc.advertisement.visitorWaiting);
			var beforeDisplayTime = parseInt(ucc.advertisement.beforeDisplayTime);
			if (isVisable == 1 && (accessDisplay == 2 || accessDisplay == 1)) {
				if (ucc.advertisement.startTime && ucc.advertisement.endTime) {
					var startTime = ucc.advertisement.startTime;
					if (startTime.indexOf(":") > -1) {
						startTime = startTime.replace(":", "");
					}
					var endTime = ucc.advertisement.endTime;
					if (endTime.indexOf(":") > -1) {
						endTime = endTime.replace(":", "");
					}
					var objDate = new Date();
					var currentHour = (objDate.getHours() < 10) ? ("0" + objDate.getHours()) : objDate.getHours();
					var currentMinutes = (objDate.getMinutes() < 10) ? ("0" + objDate.getMinutes()) : objDate.getMinutes();
					var currentTime = currentHour + "" + currentMinutes;
				}
				var reg = new RegExp("&quot;", "g");
				if (parseInt(startTime) <= parseInt(currentTime) && parseInt(currentTime) <= parseInt(endTime)) {
					if (visitorWaiting == 2) {
						setTimeout(function() {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: ucc.advertisement.content.replace(reg, '"'),
								from: "client",
								status: 0,
								saveIn: 1
							});

						}, beforeDisplayTime * 1e3);
					} else {
						dialogue.showMsg({
							msgid: "",
							date: new Date().getTime(),
							content: ucc.advertisement.content.replace(reg, '"'),
							from: "client",
							status: 0
						});
					}
				}
			}
		},
		showFile: function(flag) { // 打开发送文件功能
			var file = $('.tool5');
			if (file.length != 0) {
				if (flag == "on") {
					$('.tool5').show();
					storage.set("canSendFile", true);
					var _ms = lang.upload.openUploadFile;
				} else {
					$('.tool5').hide();
					$('.sendFile').hide();
					var _ms = lang.upload.closeUploadFile;
					storage.set("canSendFile", false);
				}
				dialogue.showSysMsg(_ms);
			}
		},
		openWin: function(message) {
			$('<div>' + message + '</div>').find("a").each(function() {
				var url = $(this).attr('href');
				var title = $(this).text();
				var isOpen = lang.openNewWindow.test(title);
				if (url && !isOpen) {
					tab.add(title, title, url, '1');
				}
			})
		},
		saveTopicType: function(type) {
			$.ajax({
				type: "POST",
				url: 'echatManager.do',
				data: {
					method: "saveTopicType",
					topicType: type,
					chatId: ucc.chatID,
					companyPk: ucc.companyPk
				},
				dataType: "json"
			});
		},
		showAudio: function() {
			$("audio").each(function(index, el) {
				if (!$(el).parent().hasClass('audiojs')) {
					var $this = $(this);
					audiojs.helpers.whenError = function() {
						var placeholder = $(".dialogue-in-c").find("a[placeholder]")
						placeholder.html(lang.downloadAudio);
					}
					audiojs.create($this);
				}
			});
		},
		reconnectClick:false,
		initFaceJs: function() {
			$(".area-top-p span").showLabel();
			$("#font1").click(function() {
				if ($("#font1-c").is(":hidden")) {
					$("#font1-c").show();
				} else {
					$("#font1-c").hide();
				}
			});
			$("#font2").click(function() {
				if ($("#font2-c").is(":hidden")) {
					$("#font2-c").show();
				} else {
					$("#font2-c").hide();
				}
			});
			$("#font1-c span").click(function() {
				var font_text = $(this).text();
				$("#font1").text(font_text);
				$("#font1-c").hide();
				// 字体样式，宋体
				$('.dialogue-area-write').css('font-family', font_text);
				fontStyle.set("fontFamily", font_text);
			});
			$("#font2-c span").click(function() {
				var font_text2 = $(this).text();
				$("#font2").text(font_text2);
				$("#font2-c").hide();
				// 字体大小
				$('.dialogue-area-write').css('font-size', font_text2 + "px");
				$('.dialogue-area-write').css('line-height', font_text2 + "px");
				fontStyle.set("fontSize", font_text2 + "px");
				fontStyle.set("lineHeight", font_text2 + "px");
			});
			// 字体选择，粗体、斜体
			$(".dialogue-area-top .font").toggle(function() {
				$(this).addClass("font-current-click");
				var font = $(this).attr("id");
				updateCss(1, font);
			}, function() {
				$(this).removeClass("font-current-click");
				var font = $(this).attr("id");
				updateCss(2, font);
			});
			// 添加去掉样式

			function updateCss(type, value) {
				var fs = fontStyle;
				if (type == 1) { // 添加
					if (value == 'weight') {
						$('.dialogue-area-write').css("fontWeight", "bold");
						fontStyle.set("fontWeight", "bold");
					} else if (value == 'em') {
						$('.dialogue-area-write').css('font-style', 'italic');
						fontStyle.set("fontStyle", "italic");
					} else if (value == 'decoration') {
						$('.dialogue-area-write').css('text-decoration', 'underline');
						fontStyle.set("textDecoration", "underline");
					}
				} else if (type == 2) { // 去掉
					if (value == 'weight') {
						$('.dialogue-area-write').css("fontWeight", "normal");
						fontStyle.set("fontWeight", "normal");
					} else if (value == 'em') {
						$('.dialogue-area-write').css('font-style', 'normal');
						fontStyle.set("fontStyle", "normal");
					} else if (value == 'decoration') {
						$('.dialogue-area-write').css('text-decoration', 'none');
						fontStyle.set("textDecoration", "none");
					}
				}
			}

			// 点击颜色应用
			$('#font-color').click(function() {
				var fs = fontStyle;
				$('#color_picker').colorPicker({
					defaultColor: fontStyle.get("defaultColor")?fontStyle.get("defaultColor"):13,
					// index of the default
					// color
					columns: 14,
					// number of columns
					click: function(c, i) {
						$('.dialogue-area-write').css('color', c); // 输入框字体颜色
						$('#font-color').css('background-color', c);
						fontStyle.set("color", c);
						fontStyle.set("defaultColor", i);
					}
				}).toggle();
			});
			$('#font-color').click(); // 加载后点击
			$('#color_picker').hide(); // 加载后点击


			$(".tool4").toggle(function() {
				$(this).addClass("click");
			}, function() {
				$(this).removeClass("click");
			});
			$(".tool5").toggle(function() {
				$(this).addClass("click");
			}, function() {
				$(this).removeClass("click");
			});
			$(".tool7").toggle(function() {
				$(this).addClass("click");
			}, function() {
				$(this).removeClass("click");
			});


			// 发送的切换效果
			$(".send-key-c p").click(function() {
				$(this).children(".send-ok").addClass("send-ok-ok");
				// 获取发送键的值赋给ucc.sendkey
				ucc.sendKey = $(this).children(".send-ok").attr("data-send");
				storage.set("sendKey",ucc.sendKey);
				$(this).siblings(".send-key-c p").children(".send-ok").removeClass("send-ok-ok");
				$(".send-key").hide();
			});
			$(".send-key-c p .send-ok[data-send='"+storage.get("sendKey") +"']").click();
			// 弹出层，点击空白处，弹出层消失
			// 发送按钮
			$(".send-select").click(function(event) {
				var e = window.event || event;
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
				$(".send-key").show();
			});
			$(".send-key").click(function(event) {
				var e = window.event || event;
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
			});

			// 表情
			$(".tool3").click(function(event) {
				$(".tool2-c").hide();
				$(".tool2").removeClass("click");
				var e = window.event || event;
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
				if ($(".face-c").is(":hidden")) {
					$(".face-c").show();
					$(this).addClass("click");
				} else {
					$(".face-c").hide();
					$(this).removeClass("click");
				}
				$(".lable3").hide();
			});
			// 字体
			$(".tool2").click(function(event) {
				$(".face-c").hide();
				$(".tool3").removeClass("click");
				var e = window.event || event;
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
				if ($(".tool2-c").is(":hidden")) {
					$(".tool2-c").show();
					$(this).addClass("click");
				} else {
					$(".tool2-c").hide();
					$(this).removeClass("click");
				}

				$(".lable2").hide();
			});

			$(".face-c").click(function(event) {
				var e = window.event || event;
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
			});

			// 点击空白处弹框消失
			$(document).click(function() {
				$(".send-key").hide();
				$(".face-c").hide();
				$(".tool3").removeClass("click");
			});
			$(".messagerecord").click(function() {
				var url = "historyOperator.do?method=moreHistoryDialogue&visitorId=" + userDatas.getVisitorInfo().visitorId + "&companyPk=" + ucc.companyPk;
				var title = "消息记录";
				tab.add(title, title, url);
			})
			$("#tab_title li[index=1] a,#tab_title li[index=2] a").remove(); //隐藏前2个页签的关闭按钮
			var ev = this;
			$("#message").delegate(".reconnectID", "click", function() {
				if (!dialogue.islive() && !datas.get("hasInQueue")&& !ev.reconnectClick) {
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
							storage.set("oldChatId", e.chatID);
							ucc.browserId = new Date().getTime();
							localHistory.saveCurrent();
							//在关闭对话,并且用户有过一次以上留言打开满意度
							datas.set("openSatisfactionAfterCloseChat", false);
							//已打开满意度将不再打开
							datas.set("hasSatisfaction", false);
							//是否已经发送广告
							datas.set("adv", false);
							var jsonStr = userDatas.getJsonStr();
							uccPcInit.initFunc();
							uccPcLogic.addmonitorJs(); // 浏览轨迹
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

			//图片缓加载
			$("img[defsrc]").each(function(index, el) {
				$(this).attr("src", $(this).attr("defsrc"));
			});
		},
		initPaste: function() {
			var pc = this;
			$.fn.pasteFun = function() {
				var obj1 = $(this);
				//if (navigator.appVersion.indexOf("MSIE") == -1) {
				try {
					obj1.designMode = "On";
				} catch (e) {}
				obj1.bind({
					paste: function(e) {
						if(!dialogue.islive())return;
						var isChrome = false;
						if (e.clipboardData || e.originalEvent) {
							var clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
							if (clipboardData && clipboardData.items) {
								var items = clipboardData.items,
									len = items.length,
									blob = null;
								isChrome = true;
								for (var i = 0; i < len; i++) {
									if (items[i].type.indexOf("image") !== -1) {
										blob = items[i].getAsFile();
									}
								}
								if (blob !== null) {
									e.preventDefault();
									var reader = new FileReader();
									reader.onload = function(event) {
										// event.target.result 即为图片的Base64编码字符串
										var base64_str = event.target.result
										//可以在这里写上传逻辑 直接将base64编码的字符串上传（可以尝试传入blob对象，看看后台程序能否解析）
										pc.uploadImgFromPaste(base64_str, 'paste', isChrome);
									}
									reader.readAsDataURL(blob);
								}
							} else {
								//for firefox
								setTimeout(function() {
									//设置setTimeout的原因是为了保证图片先插入到div里，然后去获取值
									var imgList = obj1.find("img"),
										len = imgList.length,
										src_str = '',
										i;
									for (i = 0; i < len; i++) {
										if (imgList[i].id !== 'img' && imgList[i].src.length > 100) {
											//如果是截图那么src_str就是base64 如果是复制的其他网页图片那么src_str就是此图片在别人服务器的地址
											src_str = imgList[i].src;
											$(imgList[i]).remove();
										}
									}
									pc.uploadImgFromPaste(src_str, 'paste', isChrome);
								}, 1);
							}

						} else {
							//for ie11
							setTimeout(function() {
								var imgList = obj1.find("img"),
									len = imgList.length,
									src_str = '',
									i;
								for (i = 0; i < len; i++) {
									if (imgList[i].id !== 'img' && imgList[i].src.length > 100) {
										src_str = imgList[i].src;
										$(imgList[i]).remove();
									}
								}
								pc.uploadImgFromPaste(src_str, 'paste', isChrome);
							}, 1);
						};
						setTimeout(function() {
							var sendMsg = $(".dialogue-area-write").html();
							sendMsg = changeFaceFun.imgToIco(sendMsg);
							sendMsg = $("<div>" + sendMsg + "</div>").text();
							var arrEntities = {
								'<': '&lt;',
								'>': '&gt;',
								' ': '&nbsp;',
								'&': '&amp;',
								'"': '&quot;'
							};
							sendMsg = sendMsg.replace(/(<|>| |&|")/ig, function(all, t) {
							return arrEntities[t];
							});
							sendMsg = changeFaceFun.icoToImg(sendMsg);
							$(".dialogue-area-write").html(sendMsg);
							moveToLast($(".dialogue-area-write")[0]);
						}, 1);
					}
				});
				//}
			};
			var moveToLast = function(obj) {
					if (window.getSelection) { //ie11 10 9 ff safari
						obj.focus(); //解决ff不获取焦点无法定位问题
						var range = window.getSelection(); //创建range
						range.selectAllChildren(obj); //range 选择obj下所有子内容
						range.collapseToEnd(); //光标移至最后
					} else if (document.selection) { //ie10 9 8 7 6 5
						var range = document.selection.createRange(); //创建选择对象
						//var range = document.body.createTextRange();
						range.moveToElementText(obj); //range定位到obj
						range.collapse(false); //光标移至最后
						range.select();
					}
				}
			if (!(navigator.appVersion.split(";")[1] && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0")) {
				$(".dialogue-area-write").pasteFun();
			}
		},
		uploadImgFromPaste:function(file, type, isChrome) {
			var pc = this;
			var regBase64 = /data:image\/.{0,5};base64,/i;
			if (regBase64.test(file)) {
				$.ajax({
					type: "POST",
					async: "false",
					url: './echatManager.do?method=getScreenshotSrc&fromType=visitor&chatId='+ucc.chatID,
					data: {
						"sendMsg": file
					},
					dataType: "json"
				}).done(function(msgs) {
				  if (msgs.success) {
				    var img = $("<div>"+msgs.content+"</div>").find("img");
			      var src = img.attr('src')
			      var originsrc =  img.attr('originsrc') || img.attr('src')
            pc.storeImg(src).done(function (url) {
              var i = '<img id="img" src="'+url+'" '+(originsrc?"originsrc='"+originsrc+"'":"")+'>';
              $(".dialogue-area-write").append(i);
            })
          } else {
            if (msgs.errorMessage) {
              Alert.show(msgs.errorMessage)
            }
          }
				});
			}
		},
		storeImg:function(src){
			var defered = new $.Deferred();
			var img = new Image();
			img.src = src;
			if (img.complete) {
				return defered.resolve(src);
			} 
			img.onload = function () {
				return defered.resolve(src);
			}; 
			img.onerror = function(){
				return defered.resolve(src);
			}
			return defered.promise();
		}
	}
	$.uccPcEvent = function(options) {
		var uccPcEvent = new UCCPCEVENT(options);
		return uccPcEvent;
	}
})(window, jQuery);

/*uccPcLogic.js UCCPC逻辑事件*/
;
(function(window, $, undefined) {
	var UCCPCLOGIC = function(options) {
			this.defaults = {}, this.options = $.extend({}, this.defaults, options);
		}
	UCCPCLOGIC.prototype = {
    initFront:function(){
      if (!dialogue.islive()) {
        if (!robot.isUse) {
          workTime.show()
          uccPcLogic.loadScheme(); // 加载样式方案
        } else {
          uccPcLogic.checkRobot();
        }
        uccPcLogic.initWelcome(); // 加载欢迎语
      }
    },
	  showBusinessList: function(businessPk) {
			var ev = this;
			if (dialogue.islive()) return;
			var bs = "";
			// 2015-11-4新增过滤掉有上级的分类
			$("#bl").html("");
			if (!datas.get("iswork")) {
				return;
			}
			var result = bList.generate(businessPk);
			if (result) {
				if (result.access) {
					if (result.online) {
						bList.setSelect(result.pk, result.name);
						storage.set("businessId", result.pk);
						storage.set("businessName", result.name);
						queue.reqStartQueue(result.pk, result.name);
						return;
					} else {
						
						$("#message").html("<div class='service-info'><div style='line-height:18px;'>"+langTip.langMap[1].content+"<br/><p id='bl'></p>"+langTip.langMap[2].content+"<span class='dialogue-a' id='fangke-liuyan'>"+lang.leaveMessageStr +"</span></div></div>");
						$("#fangke-liuyan").click(function() {
							leaveMessage.show();
						});
						if(result.name){
							var type =  lang.businessList.offline;
							bs += '<p><a data-online="'+ lang.businessList.offline +'" name="' + result.name + '" data-pk="' + result.pk + '">' + result.name + '【'+lang.businessList.offline+'】' + '</a></p>';
						}else{
							return;
						}
					}
				} else {
					if (!result.root) {
						bs += '<p><a class="back" >'+lang.businessList.backTo+'</a></p>';
					}
					var list = result.list;
					for (var i = 0; i < list.length; i++) {
						var l = list[i]
						var type = l.type == "online" ? lang.businessList.online : lang.businessList.offline;
						bs += '<p><a data-online="' + type + '" name="' + l.item.name + '" data-pk="' + l.item.pk + '">' + l.item.name + '【' + type + '】' + '</a></p>';

					}
				}
			}
			$("#bl").html(bs);
			// 业务点击进入对话
			$(".service-info").find(".back").unbind().click(function() {
				ev.showBusinessList(bList.getParentPk(businessPk));
			});
			$(".service-info").find("a[name]").unbind().click(function() {
				var pk = $(this).data("pk");
				var name = $(this).attr("name");
				if (bList.hasList(pk).length > 0) {
					ev.showBusinessList(pk);
					return;
				}
				workTime.show()
				var text = $(this).html();
				if ($(this).data("online") == lang.businessList.online) {
					bList.setSelect(pk, name);
					queue.reqStartQueue(pk, name);
				} else { // 的业务类型跳留言
					leaveMessage.show(); // 提示留言
				}
			});
			// 留言点击
			$(".service-info").find("a[class='dialogue-a']").click(function() {
				leaveMessage.show(); // 提示留言
			})
		},
		loadScheme: function() {
			var ev = this;
			pageLoad.getDepartment().done(function() {
				bList = $.businessList({
					businessList: ucc.businessList,
					aDset: ucc.aDset
				});
				ev.showBusinessList('-1');
			})
		},
		checkRobot: function() {
			$(".send").removeAttr("disabled"); // 起开发送开关
			$('.dialogue-area-write').attr('contentEditable', 'true'); // 开启编辑窗口
		},
		initWelcome: function() {
			if(!dialogue.islive()){
				if ( !! robot.isUse) {
					langTip.show("2", "1"); // 自动应答欢迎语
				} else {
					langTip.show("1", "1"); // 欢迎语1
					langTip.show("1", "2"); // 欢迎语2
				}
			}
		},
		toggleV: function() {
			if (ucc.BasicSetting.need == 1) {
				var isSave = storage.get("isSave");
				if (isSave != 0) {
					visitorInformation.show();
				}
			}
		},
		initFont: function() {
			$('.dialogue-area-write').css('color', fontStyle.get("color"));
			$('.dialogue-area-write').css('font-weight', fontStyle.get("fontWeight"));
			$('.dialogue-area-write').css('font-style', fontStyle.get("fontStyle"));
			$('.dialogue-area-write').css('text-decoration', fontStyle.get("textDecoration"));
			$('.dialogue-area-write').css('font-size', fontStyle.get("fontSize"));
			$('.dialogue-area-write').css('line-height', fontStyle.get("lineHeight"));
			$('.dialogue-area-write').css('font-family', fontStyle.get("fontFamily"));
			$(".tool2-c #font1-c span").each(function(index,el){
				if($(this).text()==fontStyle.get("fontFamily")){
					$(this).click();
				}
			})
			$(".tool2-c #font2-c span").each(function(index,el){
				if($(this).text()==fontStyle.get("fontSize")){
					$(this).click();
				}
			})
			if(fontStyle.get("fontWeight")!="normal"){
				$(".tool2-c .tool-font3 #weight").click();
			}
			if(fontStyle.get("fontStyle")!="normal"){
				$(".tool2-c .tool-font3 #em").click();
			}
			if(fontStyle.get("textDecoration")!="none"){
				$(".tool2-c .tool-font3 #decoration").click();
			}
			if(fontStyle.get("textDecoration")!="none"){
				$(".tool2-c .tool-font3 #decoration").click();
			}
			if(fontStyle.get("color")!="#000000"){
				$('#font-color').css('background-color', fontStyle.get("color"));
			}
		},
		addmonitorJs: function() {
			setTimeout(function(){
			  if(!dialogue.islive()){
			    monitor = $.monitor({
	          storage: storage,
	          companyPk: ucc.companyPk,
	          userDatas: userDatas
	        });
			  }
			},3000)
		}
	}
	$.uccPcLogic = function(options) {
		var uccPcLogic = new UCCPCLOGIC(options);
		return uccPcLogic;
	}
})(window, jQuery);

/*uccPcInit.js UCCPC初始化*/
;
(function(window, $, undefined) {
	var UCCPCINIT = function(options) {
			this.defaults = {}, this.options = $.extend({}, this.defaults, options)
		}
	UCCPCINIT.prototype = {
		init:function(){
		  uccPcInit.initLang().done(function(){
        if (typeof custom !="undefined" && custom) {
          try{
            var c = JSON.parse(custom);
            var url = "./custom/"+(c.functionType||'')+"/pc.js";
            $.ajaxJs(url,false)
            .done(function() {
              $(".ucc").html("");
              $("#pcImpl").tmpl(lang).appendTo(".ucc");
            })
            langControl.addBtn();
          }catch(e){
            console.error(e);
          }
        };
        uccPcInit.initBasic();
        uccPcInit.initData().done(function(){
          uccPcInit.initFunc();
          uccPcLogic.initFront(); 
          uccPcEvent.addEvent(); // 添加事件
          uccPcEvent.unload();
          uccPcEvent.messageChange();
          uccPcLogic.toggleV(); // 弹出收集访客信息
          skin.setTab();
          uccPcEvent.initFaceJs();
          uccPcEvent.initPaste();
          uccPcEvent.screenCapture();
          uccPcLogic.initFont(); // 设置输入框字体
          uccPcInit.initSatifaction();
          uccPcInit.initLocalHistory();
          $('input, textarea').placeholder();
        });
      })
		},
		initLang:function(){
		  var defered = new $.Deferred();
		  storage = $.storage({companyPk:ucc.companyPk});
      langControl = $.langControl({langList:ucc.langs,storage:storage,addBtn:function(){
        $(".dialogue-area .dialogue-area-top").append("<div class='langSwitch'><span>"+ (langControl.c=="en"?"中":'EN') +"</span></div>");
        langControl.insertStyle('.langSwitch{float: left;margin-top: 4px;margin-left: 8px;border: 1px solid #bbafaf;padding: 0;border-radius: 50%;width: 20px;height: 20px;cursor: pointer;}.langSwitch span{display: inline-block;font-size: 12px;width: 20px;text-align: center;color:#bbafaf;line-height: 18px;}');
      }})
      langControl.loadLangJs(langControl.c).done(function(){
        lang = langControl.langs[langControl.c];
        $("#pcImpl").tmpl(lang).appendTo(".ucc");
        langControl.addBtn();
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
      })
      return defered.promise();
		},
    initBasic: function() {
			params = $.getParameter();
			Alert = $.Alert();
			showBigImgFun = $.showBigImg();
			showBigImgFun.init();
			msgdb = $.msgdb();
			datas = $.db({
				storage: storage
			});
			localHistory = $.localHistory({
				storage: storage
			});
			localHistory.init();
			tab = $(".tab_info").tab({
				relatedEl: $(".dialogue")
			});
			systemInfo = $("#sysmsg").systemInfo();
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
			skin = $.setSkin({
				aDset: ucc.aDset
			});
			visitLimit = $.visitLimit({
				open: !! params["vl"] ? params["vl"] : 1,
				storage: storage
			})
			visitLimit.init();
			fontStyle = $.fontStyle({
				storage: storage
			});
			workTime = $.workTime({
				BasicSetting: ucc.BasicSetting,
				ExtraSetting: ucc.ExtraSetting,
				'workStr': lang.workTime.server+"【$1】<br>"+lang.workTime.clickNotice+"<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>"+lang.workTime.btn+"</a><br>"+lang.workTime.notice,
				'holidayStr': lang.workTime.holiday+"【$1】<br>"+lang.workTime.clickNotice+"<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>"+lang.workTime.btn+"</a><br>"+lang.workTime.notice,
				lang:lang.workTime,
				show: function(msg) {
					if ( !! msg) {
						if ($('.pop_bg').length == 0) {
							var noticeHtml = '<div class="dialogue-in"><p class="dialogue-pic"><img src="./style/css/images/service.png"></p><div class="dialogue-in-r"><p class="in-name">'+lang.operator+'</p><div class="dialogue-in-c"><span class="d-dot1"><img src="./style/css/images/d-dot1.png"></span><p><span>' + msg + '</span></p></div></div></div>';
							$('#message').html(noticeHtml);
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
						html += "<p><span class='face-pic'>" + img + "</span></p>";
					}
					$(".face-c").html(html);
					// 表情弹出
					$(".face-pic").hover(function() {
						$(this).addClass("hover");
						$(this).siblings(".face-text").show();
					}, function() {
						$(this).removeClass("hover");
						$(this).siblings(".face-text").hide();
					});
					// 点击表情，将表情放到输入框
					$(".face-pic").click(function() {
						$(".tool3").removeClass("click");
						$(".face-c").hide();
						var img = $(this).find("img").clone();
						//$(img).css({'max-width':'28px','max-height':'28px'});
						$(".dialogue-area-write").append(img);
					});
				}
			});
		},
		initData: function() {
			var defered = new $.Deferred();
			datas.set("canSend", true);
			//是否在工作时间内
			datas.set("iswork", true);
			datas.set("hasInQueue", false);
		    ucc.sendKey = storage.get("sendKey")?storage.get("sendKey"):0;
			//生成chatId
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
				cache: false
			}).done(function(e) {
				ucc.chatID = e.chatID;
				ucc.browserId = new Date().getTime();
				if (storage.get("oldChatId") != e.chatID) {
					if (storage.get("msgObjCurrentChat")) {
						$.ajax({
							type: 'POST',
							url: './echat.do',
							async: "false",
							data: {
								method: 'closeEchat',
								chatID: storage.get("oldChatId"),
								url: storage.get("msgObjCurrentChat").url,
								opname: datas.get("opName") ? datas.get("opName") : ""
							},
							success: function(result) {},
							dataType: "json"
						});
					}
					uccPcLogic.addmonitorJs(); // 浏览轨迹
					localHistory.saveCurrent();
					storage.set("oldChatId", e.chatID);
					//在关闭对话,并且用户有过一次以上留言打开满意度
					datas.set("openSatisfactionAfterCloseChat", false);
					//已打开满意度将不再打开
					datas.set("hasSatisfaction", false);
					//是否已经发送广告
					datas.set("adv", false);
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
	            uccPcEvent.titleGlitter(); // 消息闪烁
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
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					} else if (type == "CLOSE_CUSTOMER") {
						dialogue.end(3);
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					} else if (type == "CLOSE_VISITOR") {
						if(dialogue.islive()){
							langTip.show(langTip.type.system, langTip.key.no_answer_close);
							$("#face_08").css("display", "none");
							$('.sendFile').hide();
						}
					} else if (type == "OPERATION_TIPS") {
						if (json.params.opType == "pushsatisfaction") {
							satisfaction.show();
						} else if (json.params.opType == "sendFileEntry") {
							uccPcEvent.showFile(json.params.flag);
						} else if (json.params.opType == "getinfo") {
							visitorInformation.show();
						} else if (json.params.opType == "foreknowledge") {
							var rd = $('.reminder').length;
							if (rd != 0) {
								if (json.content == "1") {
									$('.reminder').show();
								} else {
									$('.reminder').hide();
								}
							} else {
								var reminder = '<div class= "reminder"><div class="rp"></div>'+lang.reminder+'</div>'
								$("body").append(reminder);
								$('.reminder').css({
									position: 'absolute',
									bottom: '164px',
									left: '5px'
								});
							}
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
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
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
//							if ($messageHide.prev().hasClass("dialogue-date")) {
//								$messageHide.prev().hide();
//							}
	             $messageHide.after("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + lang.dialogue.revoke +"</div>");
							//$("#message").append('<p class="dialogue-date">' + new Date().Format("hh:mm:ss") + '</p>' + "<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + "已撤回一条消息</div>")
						}
					}else if (type == "RECEIPT") {
						msgdb.set(json, "checkSend", 1);
						$("div[name="+json+"] .msg_sending").hide()
						$("div[name="+json+"] .msg_repeat").hide()
						if ( !! changeWindow) changeWindow.change();
						localHistory.setCurrent(msgdb.db);
					}else if (type == "VS_QUEUE_INDEX"){
						var result = json;
						if (result) {
							if (result.success == true) {
								//que.options.always(result);
								queue.options.success(result);
							} else {
								if (result.inqueue == true) {
									queue.options.always(result);
								} else if (result.errorCode == false) {
									queue.options.fail(result);
								} else if (result.server == false) {
									queue.options.fail(result);
								} else if (result.inqueue == true) {
									queue.options.always(json);
								} else {
									queue.options.leave(result);
								}
							}
						}
					}
				},connect:function(isConnect){
					if(dialogue.islive()){
						if(isConnect){
							if (detectWeb.getIsInitiate()) {
								dialogue.showSysMsg(dialogue.options.msgList.reconnectSuc,true);
							}
							if (detectWeb.getIsInitiate()) {
								dialogue.toolFun(true);
								detectWeb.checkedSuccess();
							}
						}else{
							if (!detectWeb.getIsInitiate()) {
								dialogue.toolFun(false);
								dialogue.showSysMsg(dialogue.options.msgList.reconnectFail,true);
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
					uccPcEvent.leaveCover();
				},open:function(){
					uccPcEvent.openCover();
				}
			});
			$("#message").delegate(".msg_repeat","click",function(){
				var item = $(this).parents(".contentMessage");
				if(item.attr("name") && dialogue.islive()){
					var msgid = item.attr("name");
					if (item.prev().hasClass("dialogue-date")) {
						item.prev().hide();
					}
					item.hide();
					var msg = uccPcEvent.getMsgStr(item.find("span.content"));
					dialogue.sendMessage(msg);
				}
			})
			webSocket.init().done(function(){
				return defered.resolve();
			});
			return defered.promise();
		},
		initSatifaction:function(){
			satisfaction = $.satisfaction({
				dialogue: dialogue,
				companyPk: ucc.companyPk,
				langPk: ucc.defaultLangPk,
				chatId: ucc.chatID,
				title: lang.satisfaction.title,
				bottom: "<div class='bottom'><div class='cancel'>"+lang.cancel+"</div><div class='submit'>"+lang.submit+"</div></div>",
				lang: lang.satisfaction,
				top: lang.satisfaction.top,
				generate: function() {
					$(".satisfactionView .fr").each(function(index, el) {
						var $this = $(this);
						$this.append('<input type="radio" name="fr"><span>' + $this.attr("data-name") + '</span>')
					});
					$(".satisfactionView .sr").each(function(index, el) {
						var $this = $(this);
						$this.append('<input type="checkbox" class="srCheck" name="' + $this.data("parent") + '"><span>' + $this.attr("data-name") + '</span>')
					});
					$(".satisfactionView .sr").hide();
					$('.satisfactionView .fr input[name = "fr"]').click(function() {
						var $this = $(this);
						$('.satisfactionView .sr ').hide();
						$('.satisfactionView .sr input[name ="' + $this.parents(".fr").data("pk") + '"]').parents(".sr").css("display", "inline");
					});
					$(".satisfactionView .fr input[type=radio]").first().click();
					$(".satisfactionView .title .cross img,.satisfactionView .bottom .cancel").on("click", function() {
						satisfaction.cancel();
					})
					$(".satisfactionView .bottom .submit").on("click", function() {
						var selected = $('.satisfactionView .fr input[name = "fr"]').filter(":checked")
						if (selected.length == 0) {
							Alert.show(lang.satisfaction.chooseSatisfaction);
							return;
						}
						var pk = selected.parents(".fr").data("pk");
						var nextSat = "";
						if (satisfaction.getElementByParent(pk).length > 0) {
							if ($('.satisfactionView .sr input[name = "' + pk + '"]').filter(":checked").length == 0) {
								Alert.show(lang.satisfaction.chooseReason);
								return;
							} else {
								$('.satisfactionView .sr input[name = "' + pk + '"]').filter(":checked").each(function() {
									var $this = $(this);
									nextSat += $this.parents(".sr").data("pk") + ",";
								})
							}
						}
						datas.set("hasSatisfaction", true);
						satisfaction.submit({
							satisfactionPk: selected.parents(".fr").data("parent"),
							optionPk: selected.parents(".fr").data("pk"),
							satisfactionMemo: !! $(".satisfactionView .mome textarea").val() ? $(".satisfactionView .mome textarea").val() : "",
							nextSatisfactionPk: nextSat
						})
					});

				}
			});
			satisfaction.init();
			if(!satisfaction.hasSat){
				$(".tool6").hide();
			};
		},
		initFunc: function() {
			visitorRobot = $.visitorRobot({
				companyPk: ucc.companyPk,
				visitorId: storage.get("visitor").visitorId,
				chatId: ucc.chatID,
				newAfter:function(json,msg){
					var html = '';
					var msgsplit = msg.split("");
					
					var splitMerge = function(text){
					  var atext = text;
					  var atextsplit = atext.split("");
					  var msgArray = []
					  for (var i=0,len = msgsplit.length;i<len;i++) {
					    if (msgsplit[i]!='') {
					      msgArray.push(msgsplit[i].toLowerCase());
					      msgArray.push(msgsplit[i].toUpperCase());
					    }
					  }
					  msgArray = $.unique(msgArray)
					  for (var i=0,len = atextsplit.length;i<len;i++) {
					    var item = atextsplit[i];
					    if (msgArray.indexOf(item)>-1) {
					      atextsplit[i] = "<span>"+item+"</span>"
					    }
					  }
					  return atextsplit.join("");
					};
					for (var i in json) {
						if (!isNaN(Number(i))) {
							var j = json[i];
							
							html += '<div class="item" data-question="' + j + '">' + splitMerge(j) + '</div>';
						}
					}
					html = '<div class="visitorRobot">' + html + '</div>';
					$(".visitorRobot").remove();
					$(".dialogue-area").append(html);
					$(".visitorRobot .item").on("click", function() {
						robot.click = true;
						$(".dialogue-area-write").html($(this).data("question"));
						$(".send").click();
						$(".visitorRobot").hide();
					})
				},
				after: function(json) {
					var html = "";
					for (var i in json) {
						if (!isNaN(Number(i))) {
							var j = json[i];
							var str = j.question;
							var hl = j.highlightedArray;
							hl = hl.insertSort(function(a, b) {
								return a < b
							});
							for (var p = 0, len = hl.length; p < len; p++) {
								str = str.substring(0, hl[p], len) + "<div class='red'>" + str.charAt(hl[p]) + "</div>" + str.substring(hl[p] + 1, str.length);
							}
							html += '<div class="item" data-question="' + j.question + '">' + str + '</div>';
						}
					}
					html = '<div class="visitorRobot">' + html + '</div>';
					$(".visitorRobot").remove();
					$(".dialogue-area").append(html);
					$(".visitorRobot .item").on("click", function() {
						robot.click = true;
						$(".dialogue-area-write").html($(this).data("question"));
						$(".send").click();
						$(".visitorRobot").hide();
					})
				},
				init: function() {
					var DOMCheck = null;
					$(".dialogue-area-write").on('focus', function() {
						if(visitorRobot.ok){
							if(DOMCheck){
								window.clearInterval(DOMCheck);
								DOMCheck = null;
							}
							DOMCheck = setInterval(function() {
								if(visitorRobot.ok){
									visitorRobot.check($(".dialogue-area-write").text());
								}else{
									if(DOMCheck){
										window.clearInterval(DOMCheck);
										DOMCheck = null;
									}
								}
							}, 1000);
						}
					}).on('blur', function() {
						if(DOMCheck){
							window.clearInterval(DOMCheck);
							DOMCheck = null;
						}
					});
				},
				hide: function() {
					$(".visitorRobot").remove();
				}
			});
			visitorRobot.init();
//			heartBeat = $.heartBeat({detectWeb:function(){
//				if (!detectWeb.getIsInitiate()) {
//					dialogue.toolFun(false);
//					dialogue.showSysMsg(dialogue.options.msgList.reconnectFail);
//					detectWeb.checkedFail();
//				}
//			}});

			detectWeb = $.detectWeb({
				period: 30,
				after: function() {
					dialogue.end(6);
					//          closeMediaChat();
					$("#face_08").css("display", "none");
					$('.sendFile').hide(); // 上传按钮
				}
			});

			TimeoutList = $.TimeoutList({
				msgdb: msgdb,
				ops: ucc.OperatorBasicSettings,
				startFun: function() {
					if ( !! dialogue.islive()) {
						if (TimeoutList.isVisitorHalfTimeout()) {
							langTip.show(
							langTip.type.system, langTip.key.no_answer_hint);
							if ( !! changeWindow) changeWindow.change();
						}
						if (TimeoutList.isVisitorTimeout()) {
							langTip.show(
							langTip.type.system, langTip.key.no_answer_close);
						}
						if (TimeoutList.isClientBusy()) {
							langTip.show(
							langTip.type.system, langTip.key.cs_busy);
							if ( !! changeWindow) changeWindow.change();
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
					$(".service-info p:gt(1)").remove();
					$("#sysmsg").html("");
					datas.set("reconnectData", result);
					datas.set("opName", result.workgroupName);
					datas.set("_workGroupName", result.workgroupName);
					dialogue.setAttr("_workGroupName", result.workgroupName);
					dialogue.setAttr("remoteUrl", result.url);
					var wname = result.workgroupName.split("-");
					dialogue.setAttr("operatorName", result.opShow ? result.opShow : wname[1]);
					datas.set("hasInQueue", false);

					var recored = robot.recored;
					var recoreds = "";
					if (recored.length > 0) {
//						recored = recored.slice(recored.length > 10 ? recored.length - 10 : 0, recored.length);
						for (var i in recored) {
							dialogue.showMsg(recored[i]);
							if (recored[i].from == "visitor") {
								recoreds += "<div class='robotmsg' data-time='" + recored[i].date + "' data-from='" + recored[i].from + "'  data-content='" + recored[i].content + "'  >访客问:<div>" + recored[i].content + "</div></div>";
							} else if (recored[i].from == "robot") {
								recoreds += "<div class='robotmsg' data-time='" + recored[i].date + "' data-from='" + recored[i].from + "'  data-content='" + recored[i].content + "' >机器人答:<div>" + recored[i].content + "</div></div>";
							}
						}
					}
					robot.recored = [];
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
					storage.set("canSendFile", false);
					storage.set("oldService", result.workgroupName); // 保存当前接入的坐席名称
					//queue.reqStartChat(result); // 对话开始，邀请客服
					changeWindow.setMsgObj(result);
					// 将这里的逻辑移动到真正邀请了客服再开始做
					if (result.success == true) {
						// 请求对话成功，开始对话.
						dialogue.start();
						// 对话次数
						storage.set("chatNum", Number(userDatas.getJsonStr().chatNum) + 1);
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
					systemInfo.show(decodeURIComponent(decodeURIComponent(result.msg)).replace(/\+/g, " "));
					$("#liveMessageId").click(function() {
						leaveMessage.show(); // 提示留言;
					});
					$("#continueId").click(function() {
						$.ajax({
							type: 'POST',
							url: './queue.do',
							dataType: "json",
							data: {
								method: 'continueBusinessQueue',
								chatID: ucc.chatID,
								companyPk: ucc.companyPk,
								langPk: ucc.defaultLangPk,
								businessId: userDatas.getJsonStr().businessId
							},
							async: false
						}).done(function(data) {
							if (data.success == false) {
								systemInfo.show(data.msg);
								$("#bl").remove();
								$("#liveMessageId").click(function() {
									leaveMessage.show(); // 提示留言;
								});
							} else {
								queue.index = -1;
								systemInfo.show(data.msg);
								queue.isTimeOut = false;
								queue.getInfo(userDatas.getJsonStr().businessId, 1, false);
							}
						}).fail(function(e) {
							systemInfo.show(lang.errorNetWork);
							return;
						})
					});
				},
				leave: function(result) {
					systemInfo.show(result.msg);
					$("#bl").remove();
					$("#liveMessageId").click(function() {
						leaveMessage.show(); // 提示留言;
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
						storage.set("businessId", businessId);
						storage.set("businessName", businessName);
						$(".service-info p:gt(1)").remove();
						$("#sysmsg").html("");
						queue.start(businessId, businessName);
					}else{
						datas.set("hasInQueue", false);
						uccPcLogic.showBusinessList(bList.getParentPk(businessId));
						$(".service-info a[data-pk='"+ businessId +"']").click();
            leaveMessage.show();
					}
				})
			};
			webSocket.connect();
			dialogue = $.dialogue({
				webSocket: webSocket,
				TimeoutList: TimeoutList,
				timeStr: '<p class="dialogue-date">$1</p>',
				msgEle: '#message',
				visitorId: userDatas.getVisitorInfo().visitorId,
				historyEle: '#historyChat',
				textEle: '.dialogue-area-write',
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
				showSysMsgFun: function(html,hidden) {
					var msgstr = '<div style="margin:15px 20px"><span class="font">' + html + '</span></div>';
					$('#message').append(msgstr);

					if(!hidden){
						msgdb.add({
							type: "system",
							content: html
						});
					}
					uccPcEvent.scrollTop();
					if ( !! changeWindow) changeWindow.change();
					localHistory.setCurrent(msgdb.db);
				},
				getReceivedFun: function(msgId) { /*TimeoutList.startALLTimeout();*/
				},
				msgReplace: function(type) {
					//预留$content,$msgid,$name,$msgResend
					var str = '<div class="$1 contentMessage" name="$msgid"><p class="dialogue-pic"><img src="$2"></p><div class="dialogue-in-r"><p class="in-name">$name</p><div class="dialogue-in-c"><span class="$4"><img src="$3"></span><span class="content">$content</span>$msgResend</div></div></div><div class="clearboth"></div>';
					var typelist = {
						"client": {
							$1: "dialogue-in",
							$2: baseUrl + "/style/css/images/service.png",
							$3: baseUrl + "/style/css/images/d-dot1.png",
							$4: "d-dot1"
						},
						"visitor": {
							$1: "dialogue-me",
							$2: baseUrl + "/style/css/images/me.png",
							$3: baseUrl + "/style/css/images/d-dot2.png",
							$4: "d-dot2"
						},
						"robot": {
							$1: "dialogue-in",
							$2: baseUrl + "/style/css/images/robot.png",
							$3: baseUrl + "/style/css/images/d-dot1.png",
							$4: "d-dot1"
						}
					}
					if (fontStyle.isShow() && type == "visitor") {
						var msgStr = '<span style="font-size:' + fontStyle.get("fontSize") + ';color:' + fontStyle.get("color") + ';font-weight:' + fontStyle.get("fontWeight") + ';font-style:' + fontStyle.get("fontStyle") + ';text-decoration:' + fontStyle.get("textDecoration") + ';line-height:' + fontStyle.get("lineHeight") + ';font-family:' + fontStyle.get("fontFamily") + '">$content</span>';
						str = str.replace(/\$content/g, msgStr);
					}
					var i = typelist[type];
					return str.replace(/\$1/g, i.$1).replace(/\$2/g, i.$2).replace(/\$3/g, i.$3).replace(/\$4/g, i.$4);
				},
				startChat: function() {
					visitorRobot.ok=false;
					uccPcInit.initSatifaction();
					storage.set("offChat",ucc.browserId);
					datas.set("canSend", true);
					storage.set("browserId", ucc.browserId);
					$(".langSwitch").hide();
//					heartBeat.init({
//						businessId: storage.get("businessId"),
//						chatId: ucc.chatID
//					});
					$('.tool5').toggle(storage.get("canSendFile") == true);
					var content = ucc.advertisement.content.replace(/<[^<]+>/g, "");
					if (!datas.get("adv") && (parseInt(ucc.advertisement.accessDisplay) == 2 || parseInt(ucc.advertisement.accessDisplay) == 1) && ucc.advertisement.isVisable == 1 && ucc.advertisement.content != "null" && content != "") {
						uccPcEvent.showAdvertisement();
						datas.set("adv", true);
					}
				},
				endChat: function() {
					datas.set("hasInQueue", false);
					localHistory.saveCurrent();
					uccPcEvent.closeChatSatisfaction();
					$(".langSwitch").show();
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
						dataType: "json"
					});
					dialogue.sendMessage(" ", "foreknowledge");
				},
				endChatFun:function(){
					visitorRobot.ok=true;
					storage.set("offChat",true);
					//heartBeat.end();
					changeWindow.stopCheck();
					$(".tool2-c").hide();
					$(".face-c").hide();
					$("#face_08").css("display", "none");
					$('.sendFile').hide(); // 上传按钮
					$('.reminder').hide();
				},
				msgFun: function(json) {
					if (json.from == "visitor" || json.from == "client") {
						TimeoutList.reset();
					}
					msgdb.add({
						date:json.date,
						msgId: json.msgid,
						type: json.from,
						content: json.content,
						saveIn: json.saveIn ? json.saveIn : 0,
						hasChecked:json.hasChecked
					});
					if ( !! changeWindow) changeWindow.change();
					if ( !! visitorRobot) visitorRobot.hide();
					localHistory.setCurrent(msgdb.db);
					uccPcEvent.showAudio();
					uccPcEvent.scrollTop();
//					uccPcEvent.repaceImg();
				},
				sendMessageFun: function(id, txt) {
					datas.set("openSatisfactionAfterCloseChat", true);
					TimeoutList.startALLTimeout();
				},
				closeTool: function() {
					$(".send").attr("disabled", "disabled"); // 关闭发送开关
					$('.dialogue-area-write').attr('contentEditable', 'false'); // 关闭编辑窗口
					$('.dialogue-area-write').hide();
					$("#face_08").hide(); // 工具栏关闭
					$('.sendFile').hide(); // 上传按钮
					$("#close").hide();
					$(".ucc-logo-cancel").hide();
				},
				openTool: function() {
					$(".send").removeAttr("disabled"); // 起开发送开关
					$('.dialogue-area-write').attr('contentEditable', 'true'); // 开启编辑窗口
					$('.dialogue-area-write').show();
					$('.dialogue-area-write').focus();
					$("#face_08").show(); // 工具栏开启
					$("#close").show();
					$(".ucc-logo-cancel").show();
					$('.tool5').toggle(storage.get("canSendFile") == true);
				},
				confirmSend: function(id, flag) {
					if (flag == 'add' && id) {
						$(".contentMessage[name='']:last").attr("name", id);
					} else if (id) {
						$(".contentMessage[name=" + id + "] ._msg").hide();
					}
				},
				specialFun: function(type, arg) {
					if (type == "openWin") {
						uccPcEvent.openWin(arg);
					} else if (type == "200") {
						uccPcEvent.titleGlitter(); // 消息闪烁
						TimeoutList.startALLTimeout();
					} else if (type == "700") {
						if (arg.code == "pushsatisfaction") {
							satisfaction.show();
						} else if (arg.code == "sendFile") {
							var alljson = JSON.parse(arg.text);
							uccPcEvent.showFile(alljson.content);
						} else if (arg.code == "getinfo") {
							visitorInformation.show();
						} else if (arg.code == "foreknowledge") {
							var rd = $('.reminder').length;
							if (rd != 0) {
								if (JSON.parse(arg.text).content == "1") {
									$('.reminder').show();
								} else {
									$('.reminder').hide();
								}
							} else {
								var reminder = '<div class= "reminder"><div class="rp"></div>'+lang.reminder+'</div>'
								$("body").append(reminder);
								$('.reminder').css({
									position: 'absolute',
									bottom: '164px',
									left: '5px'
								});
							}
						} else if (arg.code == "uploadfile") {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: JSON.parse(arg.text).content,
								from: "client",
								status: 0
							});

						} else if (arg.code == "audio") {
							//              showMediaChat("clientSendRq");
						} else if (arg.code == "rqAccept") {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: JSON.parse(arg.text).content,
								from: "client",
								status: 0
							});
							clientAccept();
						} else if (arg.code == "ringOff") {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: JSON.parse(arg.text).content + "<img src='assets/right.png'/>",
								from: "client",
								status: 0
							});
							// add by john 20150821
							dialogue.sendMessage("ringOff", "ringOff");
							//              closeMediaChat();
							uccPcEvent.saveTopicType("audio");
						} else if (arg.code == "rqCancel" || arg.code == "rqReject" || arg.code == "rqTimeOut") {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: JSON.parse(arg.text).content,
								from: "client",
								status: 0
							});
							//              closeMediaChat();
						} else if (arg.code == "micIsOccupy") {
							dialogue.showMsg({
								msgid: "",
								date: new Date().getTime(),
								content: JSON.parse(arg.text).content,
								from: "client",
								status: 0
							});
							//              closeMediaChat();
						}
					} else if (type == "900") {
						//            closeMediaChat();
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					} else if (type == "901") {
						//            closeMediaChat();
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					} else if (type == "110") {
						//            closeMediaChat();
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					} else if (type == "111") {
						TimeoutList.startALLTimeout();
					} else if (type == "112") {
						//            closeMediaChat();
					} else if (type == "113") {
						var json = JSON.parse(arg);
						msgdb.set(json.messageId, "isRevoke", true);
						if ( !! changeWindow) changeWindow.change();
						localHistory.setCurrent(msgdb.db);
						var $messageHide = $("div[name=" + json.messageId + "]")
						if ($messageHide.css("display") != "none") {
							$messageHide.hide();
							if ($messageHide.prev().hasClass("dialogue-date")) {
								$messageHide.prev().hide();
							}
							$messageHide.after("<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + lang.dialogue.revoke +"</div>");
							//$("#message").append('<p class="dialogue-date">' + new Date().Format("hh:mm:ss") + '</p>' + "<div class='msg_back_success'>" + dialogue.getAttr("operatorName") + "已撤回一条消息</div>")
						}
					} else if (type == "114") {
						var json = JSON.parse(arg);
					} else if (type == "902") {
						langTip.show(
						langTip.type.system, langTip.key.no_answer_close);
						//            closeMediaChat();
						$("#face_08").css("display", "none");
						$('.sendFile').hide(); // 上传按钮
					}
				}
			});


			leaveMessage = $.leaveMessage({
				Alert: Alert,
				warn: ".warning",
				messageDisplay: ucc.messageDisplay,
				messageContent: ucc.messageContent,
				messageTypeList: ucc.messageTypeList,
				companyPk: ucc.companyPk,
				title: lang.leaveMessage.boxTitle,
				bottom: "<div class='bottom'><div class='cancel'>"+lang.cancel+"</div><div class='submit'>"+lang.submit+"</div></div>",
				lang:lang.leaveMessage,
				generate: function(combo) {
					$(".leaveMessageView .title .cross img,.leaveMessageView .bottom .cancel").on("click", function() {
						leaveMessage.cancel();
					})
					$(".leaveMessageView .col").each(function(index, el) {
						var $this = $(this);
						var btn = $this.data("require") == 1 ? '<div class="ico">*</div>' : '';
						$this.append('<span class="name">' + $this.data("name") + btn + '</span><span class="input"></span><span class="warning"></span>');
						if ($this.data("type") == "combox") {
							var html = '<select >';
							for (var i in combo) {
								if ( !! combo[i].name) {
								  var name = combo[i].name
                  if (langControl.c == "en" && combo[i].nameEN) {
                    name = combo[i].nameEN
                  }
									html += '<option value="' + combo[i].pk + '" >' + name + '</option>'
								}
							}
							html += '</select>';
							$this.find(".input").append(html);
							$this.find(".input select option").first().attr("selected", "selected");
						} else if ($this.data("type") == "textarea") {
							$this.find(".input").append('<textarea  placeholder="' + $this.data("markedwords") + '" ></textarea>')
						} else {
							$this.find(".input").append('<input type="text" placeholder="' + $this.data("markedwords") + '" >')
						}
					});
					$(".leaveMessageView .board [data-displayname='content'] textarea").val("");
					$(".leaveMessageView .board .input,.leaveMessageView .board .textarea").focusin(function(event) {
						leaveMessage.check($(this).parents(".col").data("displayname"));
					});
					$(".leaveMessageView .bottom .submit").on("click", function() {
						leaveMessage.submit({
							messageTypePk: $(".leaveMessageView .board [data-displayname='messageTypePk']").length > 0 ? $(".leaveMessageView .board [data-displayname='messageTypePk'] select").val() : "",
							name: $(".leaveMessageView .board [data-displayname='name']").length > 0 ? $(".leaveMessageView .board [data-displayname='name'] input").val() : "",
							telephone: $(".leaveMessageView .board [data-displayname='telephone']").length > 0 ? $(".leaveMessageView .board [data-displayname='telephone'] input").val() : "",
							email: $(".leaveMessageView .board [data-displayname='email']").length > 0 ? $(".leaveMessageView .board [data-displayname='email'] input").val() : "",
							title: $(".leaveMessageView .board [data-displayname='title']").length > 0 ? $(".leaveMessageView .board [data-displayname='title'] input").val() : "",
							content: $(".leaveMessageView .board [data-displayname='content']").length > 0 ? $(".leaveMessageView .board [data-displayname='content'] textarea").val() : "",
							company: $(".leaveMessageView .board [data-displayname='company']").length > 0 ? $(".leaveMessageView .board [data-displayname='company'] input").val() : "",
							brand: $(".leaveMessageView .board [data-displayname='brand']").length > 0 ? $(".leaveMessageView .board [data-displayname='brand'] input").val() : ""
						})
					});
					$('input, textarea').placeholder();
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
					el.find(".warning").html(text);
				}
			})
			leaveMessage.init();
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
						var btn = $this.data("require") == 1 ? '<div class="ico">*</div>' : '';
						$this.append('<span class="name">' + $this.data("name") + btn + '</span><span class="input"></span><span class="warning"></span>');
						if ($this.data("type") == "radio") {
							var html = '<span class="radio"><input type="radio" name="sex" value="1" >'+lang.visitorInformation.male+'</span><span class="radio"><input type="radio" name="sex" value="2" checked="checked">'+lang.visitorInformation.female+'</span>';
							$this.find(".input").append(html);
						} else {
							$this.find(".input").append('<input type="text" placeholder="' + ( !! $this.data("placeholder") ? $this.data("placeholder") : "") + '" value="' + ( !! $this.data("markedwords") ? $this.data("markedwords") : "") + '" >');
						}
					});
					$(".visitorInformationView .title .cross img,.visitorInformationView .bottom .cancel").on("click", function() {
						visitorInformation.cancel();
					})
					$(".visitorInformationView .board .input").focus(function(event) {
						visitorInformation.check();
					});
					$(".visitorInformationView .bottom .submit").on("click", function(event) {
						visitorInformation.submit({
							visitorName: $(".visitorInformationView .board [data-displayname='visitorName'] input").val(),
							sex: $(".visitorInformationView input[name=sex]").filter(":checked").val(),
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
					el.find(".warning").html(text);
				},
				submitFun: function(visitor) {
					//sara说在接入对话之前也要收集访客信息，所以注释掉以下判断, bulin, 2017-4-10
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
			robot = $.robot({
				visitorId: storage.get("visitor").visitorId,
				visitorName: storage.get("visitor").visitorName,
				dialogue: dialogue,
				robotSetting: ucc.BasicSetting.robotSetting,
				lang:lang.robot,
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
					$("#message>*").not("#historyChat,#moreHistory,.service-info").remove();
					langTip.show("1", "1"); // 欢迎语1
					langTip.show("1", "2"); // 欢迎语2
					visitorRobot.ok = false;
					robot.isUse = false;
					workTime.iswork();
					if (workTime.type == 0) {
						uccPcLogic.loadScheme(); // 加载样式方案
					} else {
						workTime.show();
					}
					dialogue.toolFun(false);
					$(".accept").css('display', 'block');
					$("#autoReply").css('display', 'none');
					$(".centerTime").remove();
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
				$(".send").removeAttr("disabled"); // 起开发送开关
				$('.dialogue-area-write').attr('contentEditable', 'true'); // 开启编辑窗口
				$('.dialogue-area-write').show();
			} else {
				visitorRobot.ok = false;
			};
			langTip = $.langTip({
				companyPk: ucc.companyPk,
				defaultLangPk: ucc.defaultLangPk,
				langMap:ucc.langMap,
				show: function(json) {
					var reg = new RegExp("&quot;", "g");
					switch (json.langKey) {
					case 1:
						$("#sysmsg").html( !! json.content ? json.content.replace(reg, '"') : "");
						break;
					case 2:
						$("#welcome").html( !! json.content ? json.content.replace(lang.leaveMessageStr, '<a href="javascript:void(0)" class="dialogue-a fanke-liuyan" >'+lang.leaveMessageStr+'</a>').replace(reg, '"') : "");
						break;
					case 3:
						dialogue.showMsg({
							content: !! json.content ? json.content.replace(reg, '"') : "",
							from: "robot",
					        saveIn:1
						});
						break;
					case 4:
						dialogue.showMsg({
							content: !! json.content ? json.content.replace(reg, '"') : "",
							from: "robot",
					        saveIn:1
						});
						break;
					case 5:
						dialogue.showMsg({
							content: !! json.content ? json.content.replace(reg, '"') : "",
							from: "robot",
					        saveIn:1
						});
						dialogue.end(4);
						//              closeMediaChat();
						break;
					case 6:
						// 访客超时提醒
						dialogue.showMsg({
							content: !! json.content ? json.content.replace(reg, '"') : "",
							from: "robot",
					        saveIn:1
						});
						break;
					case 7:
						dialogue.showSysMsg( !! json.content ? json.content.replace(reg, '"') : "",true);
						break;
					case 9:
						dialogue.showMsg({
							content: !! json.content ? json.content.replace(reg, '"') : "",
							from: "robot",
							saveIn: 1
						});
						break;
					default:
						dialogue.showSysMsg( !! json.content ? json.content.replace(reg, '"') : json.conntent.replace(reg, '"'),true);
						break;
					}
				}
			})
			if (changeWindow) {
				clearInterval(changeWindow.browserInterval);
			}
			changeWindow = $.changeWindow({
				msgdb: msgdb,
				open: true,
				storage: storage,
				chatId: ucc.chatID,
				browserId: ucc.browserId,
				TimeoutList: TimeoutList,
				dialogue: dialogue,
				data: datas,
				start: function() {
					$("#message").html('');
					$(".leaveMessage").remove();
					visitorInformation.hide();
					ucc.BasicSetting.need = 0;
				},
				end: function() {
					$('.visitorRobot').hide();
					$('.reminder').hide();
					uccPcEvent.leaveCover();
				}
			});
			changeWindow.init();
		},
		initHistory:function(){
			History = $.history({
				show: false,
				leavePre: lang.history.leavePre,
				visitorId: userDatas.getVisitorInfo().visitorId,
				companyPk: ucc.companyPk,
				dialogue: dialogue,
				generation: function() {
					if (dialogue.islive()) return;
					History.getLeaveChat();
					History.showLeaveChat();
					History.check();
					if (History.getSum() > 0) {
						if ($("#moreHistory").length <= 0) $('#message').prepend("<div style='cursor:pointer;text-align:center;color:#666;margin-top:10px;' id='moreHistory'>"+lang.history.btnStr+"</div>");
						$('#moreHistory').on('click', function() {
							var url = "historyOperator.do?method=moreHistoryDialogue&visitorId=" + userDatas.getVisitorInfo().visitorId + "&companyPk=" + ucc.companyPk;
							var title = lang.histroyRecords;
							tab.add(title, title, url);
						})
					}
				},
				checkFun: function() {}
			});
	        History.init();
		},
		initLocalHistory:function(){
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
						if ($("#moreHistory").length <= 0) $('#message').prepend("<div style='cursor:pointer;text-align:center;color:#666;margin-top:10px;' id='moreHistory'>"+lang.history.btnStr+"</div>");
						$('#moreHistory').on('click', function() {
							var url = "historyOperator.do?method=moreHistoryDialogue&visitorId=" + userDatas.getVisitorInfo().visitorId + "&companyPk=" + ucc.companyPk;
							var title = lang.histroyRecords;
							tab.add(title, title, url);
						})
					}
				},
				checkFun: function() {}
			});
	        History.init();
		}
	}
	$.uccPcInit = function(options) {
		var uccPcInit = new UCCPCINIT(options);
		return uccPcInit;
	}
})(window, jQuery);