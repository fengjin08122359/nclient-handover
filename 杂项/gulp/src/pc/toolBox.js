/*http://www.9client.com/ 021-4008837939*/
/**
 * js工具箱 create by mike on 2016/11/01
 */
/*detectWeb.js 断网检测*/
(function(window, $, undefined) {
	String.prototype.trim = function()  
    {  
        return this.replace(/(^\s*)|(\s*$)/g, "");  
    }  
	var WEB = function(options) {
			this.defaults = {
				'period': 30,
				after: function() {}
			}, this.options = $.extend({}, this.defaults, options);
		}
	WEB.prototype = {
		isInitiate: false,
		isReconnection: false,
		checkeTimeout: null,
		msgs: [],
		period: 0,
		getIsInitiate: function() {
			return this.isInitiate;
		},
		getIsReconnection: function() {
			return this.isReconnection;
		},
		getMsgs: function(lastIndexOf) {
			if (this.msgs.length > lastIndexOf) {
				return this.msgs.slice(this.msgs.length - lastIndexOf, this.msgs.length);
			}
			return this.msgs;
		},
		check: function() {
			this.period--;
			if (this.period <= 0) {
				this.options.after();
				clearInterval(this.checkeTimeout);
				this.checkeTimeout = null;
				this.isInitiate = false;
				this.period = this.options.period;
			}
		},
		checkedSuccess: function() {
			clearInterval(this.checkeTimeout);
			this.checkeTimeout = null;
			this.period = this.options.period;
			this.isInitiate = false;
		},
		setInitiate: function(value) {
			this.isInitiate = value;
		},
		setIsReconnection: function(value) {
			this.isReconnection = value;
		},
		checkedFail: function() {
			var item = this;
			item.checkeTimeout = setInterval(function() {
				item.check();
			}, 1e3);
			this.isInitiate = true;
		},
		msgPush: function(op, resultStr) {
			this.msgs.push('{"' + op + '":\"' + resultStr + '\"}');
		}
	}
	$.detectWeb = function(options) {
		var web = new WEB(options);
		web.period = web.options.period;
		return web;
	}
})(window, jQuery); /*workTime.js 工作时间判断*/
;
(function(window, $, undefined) {
	var WORKTIME = function(options) {
			this.defaults = {
				'BasicSetting': {},
				'ExtraSetting': {},
				'workStr': "温馨提示：尊敬的客户，我们的服务时间是【$1】<br>如果有重要的事情，请点击<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>在线留言</a><br>给您带来的不便，敬请谅解.",
				'holidayStr': "温馨提示：尊敬的客户，我们的节假日时间是【$1】<br>如果有重要的事情，请点击<a href='javascript:void(0)' class='dialogue-a fanke-liuyan'>在线留言</a><br>给您带来的不便，敬请谅解.",
				show: function(msg) {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	WORKTIME.prototype = {
		timeZone: "",
		type: 0,
		//type返回的类型节假日2或者是服务时间1或者不返回0
		init: function() {
			var t = this;
			var bs = this.options.BasicSetting;
			var es = this.options.ExtraSetting;
			if ( !! bs && bs.open == 1) {
				var bsStart = bs.startTime.split(":");
				var bsEnd = bs.endTime.split(":");
				if (bsStart.length < 2 || bsEnd.length < 2) {
					return false;
				}
				var startTime = new Date(),
					endTime = new Date(),
					currentDate = new Date();
				startTime.setHours(bsStart[0]);
				startTime.setMinutes(bsStart[1]);
				startTime.setSeconds("00");
				endTime.setHours(bsEnd[0]);
				endTime.setMinutes(bsEnd[1]);
				endTime.setSeconds("00");
				var MonthStr = (currentDate.getMonth() + 1) < 10 ? "0" + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1),
					DayStr = currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate();
				var currentDateStr = currentDate.getFullYear() + '-' + MonthStr + '-' + DayStr;
				var exceStartTime, exceEndTime; // 例外开始,结束时间
				var dateweek = "",
					week = bs.week,
					day = currentDate.getDay();
				var weeks = week.split(",");
				var isEx = false; //是否是例外情况
				for (var i = 0; i <= weeks.length; i++) {
					switch (weeks[i]) {
					case '0':
						dateweek += "星期日&nbsp";
						break;
					case '1':
						dateweek += "星期一&nbsp";
						break;
					case '2':
						dateweek += "星期二&nbsp";
						break;
					case '3':
						dateweek += "星期三&nbsp";
						break;
					case '4':
						dateweek += "星期四&nbsp";
						break;
					case '5':
						dateweek += "星期五&nbsp";
						break;
					case '6':
						dateweek += "星期六&nbsp";
						break;
					}
				}
				if (week.length == 13) {
					dateweek = "";
				};
				if (week.indexOf(day) >= 0) {
					if (currentDate.getTime() > endTime.getTime() || currentDate.getTime() < startTime.getTime()) {
						//不在当前的时间工作时间内
						t.type = 1;
						t.timeZone = dateweek + bs.startTime + "-" + bs.endTime;
						return false;
					}
					//判断添加了额外的节假时间
					for (var i = 0; i < es.length; i++) {
						if (es[i].exceType == 1 && es[i].exceStartTime <= currentDateStr && es[i].exceEndTime >= currentDateStr) {
							exceStartTime = es[i].exceStartTime;
							exceEndTime = es[i].exceEndTime;
							isEx = true;
							break;
						}
					}
					if (isEx) {
						t.type = 2;
						t.timeZone = exceStartTime + "-" + exceEndTime;
						return false;
					}
				} else {
					if (week != "null") {
						//判断添加了额外的服务时间
						for (var i = 0; i < es.length; i++) {
							if (es[i].exceType == 0 && (es[i].exceStartTime <= currentDateStr && es[i].exceEndTime >= currentDateStr)) { // 工作日
								exceStartTime = es[i].exceStartTime;
								exceEndTime = es[i].exceEndTime;
								isEx = true;
								break;
							}
						}
						if (!isEx) {
							t.type = 1;
							t.timeZone = dateweek + bs.startTime + "-" + bs.endTime;
							return false;
						}
					}
				}
			}
		},
		iswork:function(){
			var workTime = this;
			workTime.type = 0;
			var bs = workTime.options.BasicSetting;
			var es = workTime.options.ExtraSetting;
			if ( !! bs && bs.open == 1) {
				var bsStart = bs.startTime.split(":");
				var bsEnd = bs.endTime.split(":");
				if (bsStart.length != 2 || bsEnd.length != 2) {
					return false;
				}
				var startTime = new Date(),
					endTime = new Date(),
					currentDate = new Date(nowtime);
				startTime.setHours(bsStart[0]);
				startTime.setMinutes(bsStart[1]);
				startTime.setSeconds("00");
				endTime.setHours(bsEnd[0]);
				endTime.setMinutes(bsEnd[1]);
				endTime.setSeconds("00");
				var MonthStr = (currentDate.getMonth() + 1) < 10 ? "0" + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1),
					DayStr = currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate();
				var currentDateStr = currentDate.getFullYear() + '-' + MonthStr + '-' + DayStr;
				var exceStartTime, exceEndTime; // 例外开始,结束时间
				var dateweek = "",
					week = bs.week,
					day = currentDate.getDay();
				var weeks = week.split(",");
				var isEx = false; //是否是例外情况
				for (var i = 0; i <= weeks.length; i++) {
					switch (weeks[i]) {
					case '0':
						dateweek += "星期日&nbsp";
						break;
					case '1':
						dateweek += "星期一&nbsp";
						break;
					case '2':
						dateweek += "星期二&nbsp";
						break;
					case '3':
						dateweek += "星期三&nbsp";
						break;
					case '4':
						dateweek += "星期四&nbsp";
						break;
					case '5':
						dateweek += "星期五&nbsp";
						break;
					case '6':
						dateweek += "星期六&nbsp";
						break;
					}
				}
				if (week.length == 13) {
					dateweek = "";
				};
				if (week.indexOf(day) >= 0) {
					if (currentDate.getTime() > endTime.getTime() || currentDate.getTime() < startTime.getTime()) {
						//不在当前的时间工作时间内
						workTime.type = 1;
						workTime.timeZone = dateweek + bs.startTime + "-" + bs.endTime;
						return false;
					}
					//判断添加了额外的节假时间
					for (var i = 0; i < es.length; i++) {
						if (es[i].exceType == 1 && es[i].exceStartTime <= currentDateStr && es[i].exceEndTime >= currentDateStr) {
							exceStartTime = es[i].exceStartTime;
							exceEndTime = es[i].exceEndTime;
							isEx = true;
							break;
						}
					}
					if (isEx) {
						workTime.type = 2;
						workTime.timeZone = exceStartTime + "-" + exceEndTime;
						return false;
					}
				} else {
					if (week != "null") {
						//判断添加了额外的服务时间
						for (var i = 0; i < es.length; i++) {
							if (es[i].exceType == 0 && (es[i].exceStartTime <= currentDateStr && es[i].exceEndTime >= currentDateStr)) { // 工作日
								exceStartTime = es[i].exceStartTime;
								exceEndTime = es[i].exceEndTime;
								isEx = true;
								break;
							}
						}
						if (!isEx) {
							workTime.type = 1;
							workTime.timeZone = dateweek + bs.startTime + "-" + bs.endTime;
							return false;
						}
					}
				}
			}
		},
		getMsg: function() {
			if (this.type == 1) {
				return this.options.workStr.replace(/\$1/g, this.timeZone);
			} else if (this.type == 2) {
				return this.options.holidayStr.replace(/\$1/g, this.timeZone);
			}
			return false;
		},
		show: function() {
			var msg = this.getMsg();
			this.options.show(msg);
		}
	}
	$.workTime = function(options) {
		var workTime = new WORKTIME(options);
		workTime.init();
		return workTime;
	}
})(window, jQuery); /*businessList.js 业务类型选择项*/
;
(function(window, $, undefined) {
	var BUSINESSLIST = function(options) {
			this.defaults = {
				'businessList': [],
				aDset: [],
				root: "-1"
			}, this.options = $.extend({}, this.defaults, options);
		}
	BUSINESSLIST.prototype = {
		num: 1,
		//mobile版本的数字号
		basePk: -1,
		init: function() {
			var aDset = this.options.aDset;
			if (!aDset) return;
			var businessList = this.options.businessList;
			if (aDset.joinUpType == "0" || !aDset.joinUpType) {} else if (aDset.joinUpType == "1") { // 指定坐席
				// TODO 指定坐席接入对话
			} else if (aDset.joinUpType == "2") { // 方案指定业务类型
			}
			this.reset("-1");
		},
		reset:function(pk){
			var blist = this;
			var businessList = this.options.businessList;
			var hasonline = false;
			for (var i = 0; i < businessList.length; i++) {
				if(businessList[i].parentPk == pk){
					var next = blist.getList(businessList[i].pk);
					if(next.length==0){
						if(businessList[i].operators.length > 0){
							hasonline = true;
						}
					}else{
						var nexthasOnline = blist.reset(businessList[i].pk);
						if(nexthasOnline==false){
							businessList[i].operators = [];
						}else if(nexthasOnline==true){
							hasonline = true;
						}
					}
				}
			}
			return hasonline;
		},
		hasList: function(pk) {
			var btns = []; //标签组
			var businessList = this.options.businessList;
			for (var i = 0; i < businessList.length; i++) {
				if (businessList[i].parentPk == pk) {
					if (businessList[i].operators.length > 0) {
						btns.push({
							item: businessList[i],
							type: "online"
						});
					} else {
						btns.push({
							item: businessList[i],
							type: "offline"
						});
					}
				}
			}
			return btns;
		},
		getList: function(pk) {
			var num = this.num
			var btns = []; //标签组
			var businessList = this.options.businessList;
			for (var i = 0; i < businessList.length; i++) {
				if (businessList[i].parentPk == pk) {
					if (businessList[i].operators.length > 0) {
						btns.push({
							num: this.num,
							item: businessList[i],
							type: "online"
						});
						this.num++;
					} else {
						btns.push({
							num: this.num,
							item: businessList[i],
							type: "offline"
						});
						this.num++;
					}
				}
			}
			return btns;
		},
		getAllLength: function() {
			var bList = this
			var businessList = this.options.businessList;
			return {
				listLength: businessList.length,
				operatorLength: businessList.length > 0 ? businessList[0].operators.length : 0,
				firstItem: businessList.length > 0 ? businessList[0] : null
			}
		},
		getParentPk: function(pk) {
			var businessList = this.options.businessList;
			for (var i = 0; i < businessList.length; i++) {
				if (businessList[i].pk == pk) {
					return businessList[i].parentPk;
				}
			}
			return null;
		},
		setSelect: function(pk, name) {
			this.select = {
				pk: pk,
				name: name
			}
		},
		getSelect: function() {
			return this.select
		},
		generate: function(pk) {
			//当前节点只有一个子节点
			var list = this.getList(pk);
			var parentPk = this.getParentPk(pk);
			var root = false;
			if (pk == -1 && list.length == 0) {
				return {
					access: true,
					online: false
				};
			} else if (pk == this.basePk && list.length == 1) {
				this.basePk = list[0].item.pk;
				if (this.getList(list[0].item.pk).length > 0) {
					return this.generate(list[0].item.pk);
				} else if (list[0].item.operators.length > 0) {
					return {
						access: true,
						online: true,
						pk: list[0].item.pk,
						name: list[0].item.name
					}
				} else {
					return {
						access: true,
						online: false,
						pk: list[0].item.pk,
						name: list[0].item.name
					}
				}
			} else {
				if (this.basePk == pk) {
					root = true;
				}
				return {
					access: false,
					list: list,
					root: root
				}
			}
		},getItemOnline:function(pk){
			var blist = this;
			var businessList = this.options.businessList;
			var hasonline = false;
			for (var i = 0; i < businessList.length; i++) {
				if(businessList[i].pk == pk){
					if(businessList[i].operators.length>0){
						hasonline = true;
					}
				}
			}
			return hasonline;
		}
	}
	$.businessList = function(options) {
		var businessList = new BUSINESSLIST(options);
		businessList.init();
		return businessList;
	}
})(window, jQuery); /*showBigImg.js 大图展示*/
;
(function(window, $, undefined) {
	var pictureRatio = 0,
		screenRatio = 0;
	var SHOWBIGIMG = function(options) {
			this.defaults = {
				picStr: "<img id='showpic' src='$1'/>",
				bgColor: 'rgba(0,0,0,0.5)'
			}, this.options = $.extend({}, this.defaults, options)
		}
	SHOWBIGIMG.prototype = {
		init: function() {
			var picItem = this;
			picItem.getScreenRatio();
			if ($(".showPicture").length > 0) {
				return;
			} else {
				$("body").append('<div class="showPicture"></div>');
				$(".showPicture").css({
					position: 'fixed',
					top: '0',
					bottom: '0',
					left: '0',
					right: '0',
					background: picItem.options.bgColor,
					display: 'none',
					zIndex: '1001'
				});
			}
		},
		showPic: function(imgUrl) {
			var picItem = this;
			picItem.init();
			$('.showPicture').html("").append(this.options.picStr.replace(/\$1/g, imgUrl));
			$(".showPicture").show();
			var showpic = document.getElementById('showpic');
			if (showpic.complete) {
				pictureRatio = $(".showPicture img").width() / $(".showPicture img").height();
				picItem.getShowPic();
			} else {
				showpic.onload = function() {
					pictureRatio = $(".showPicture img").width() / $(".showPicture img").height();
					picItem.getShowPic();
				}
			}
			$(".showPicture").unbind().on('click', function(event) {
				$(".showPicture").hide();
			});
		},
		getShowPic: function() {
			if ( !! screenRatio && !! pictureRatio) {
				if (screenRatio > pictureRatio) {
					if ($(".showPicture img").height() >= $(window).height()) {
						$(".showPicture img").css({
							width: 'auto',
							height: '98%',
							padding:" 1% 0",
							display: 'block',
							margin: '0 auto',
							position: 'initial',
							top: '0'
						});
					} else {
						$(".showPicture img").css({
							display: 'block',
							margin: '0 auto',
							position: 'relative',
							top: ($(window).height() - $(".showPicture img").height()) / 2 + 'px'
						});
					}
				} else {
					if ($(".showPicture img").width() >= $(window).width()) {
						$(".showPicture img").css({
							display: 'initial',
							width: '98%',
							padding:"0 1%",
							height: 'auto',
							position: 'fixed',
							top: '50%'
						});
						$(".showPicture img").css({
							marginTop: -$(".showPicture img").height() / 2,
						});
					} else {
						$(".showPicture img").css({
							display: 'initial',
							left: '50%',
							position: 'fixed',
							top: '50%',
							padding:"1% 1%",
						});
						$(".showPicture img").css({
							marginTop: -$(".showPicture img").height() / 2,
							marginLeft: -$(".showPicture img").width() / 2
						});
					}
				}
			}
		},
		getScreenRatio: function() {
			screenRatio = ($(window).width()) / ($(window).height());
		}
	}
	$.showBigImg = function(options) {
		var showBigImg = new SHOWBIGIMG(options);
		showBigImg.init();
		return showBigImg;
	}
})(window, jQuery); /*TimeoutList.js 超时判断*/
;
(function(window, $, undefined) {
	var TIMEOUTLIST = function(options) {
			this.defaults = {
				msgdb: null,
				clientEndtime: 480,
				clientBusytime: 240,
				visitorEndTime: 240,
				visitorHalfTime: 120,
				ops: {},
				//OperatorBasicSettings包括customerFroVisitors,customerBusy,customerFroVisitors
				startFun: function() {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	TIMEOUTLIST.prototype = {
		diaList: new Object(),
		timeout: null,
		hasVisitorHalfTimeout: false,
		hasVisitorTimeout: false,
		hasClientBusy: false,
		hasClientEnd: false,
		init: function() {
			this.setTime();
		},
		setTime: function() {
			var ops = this.options.ops;
			this.options.clientEndtime = ops.customerFroVisitors ? ops.customerFroVisitors : this.options.clientEndtime;
			this.options.clientBusytime = ops.customerBusy ? ops.customerBusy : this.options.clientBusytime;
			//this.options.clientBusytime = this.options.clientBusytime<240?this.options.clientBusytime/2:this.options.clientBusytime-120;
			this.options.visitorEndTime = ops.customerFroVisitors ? ops.customerFroVisitors : this.options.visitorEndTime;
			this.options.visitorHalfTime = this.options.visitorEndTime <= this.options.visitorHalfTime * 2 ? this.options.visitorEndTime / 2 : this.options.visitorEndTime - this.options.visitorHalfTime;
		},
		startALLTimeout: function() {
			var t = this;
			clearInterval(this.timeout);
			this.timeout = setInterval(function() {
				t.options.startFun();
			}, 1000);
		},
		endChat: function() {
			this.hasVisitorHalfTimeout = true;
			this.hasVisitorTimeout = true;
			this.hasClientBusy = true;
			this.hasClientEnd = true;
		},
		reset: function() {
			//this.diaList[name] = [user, time];
			this.hasVisitorHalfTimeout = false;
			this.hasVisitorTimeout = false;
			this.hasClientBusy = false;
			this.hasClientEnd = false;
		},
		removeDiaList: function(name) {
			delete this.diaList[name]
		},
		diaListLast: function() {
			var msgdb = this.options.msgdb;
			var last
			for (var i in msgdb.db) {
				if (msgdb.db[i] && (msgdb.db[i].type != "robot" && msgdb.db[i].type != "system" && !msgdb.db[i].isRevoke)) {
					if (!last || !((msgdb.db[i].type == "visitor" && msgdb.db[last].type == "visitor") || (msgdb.db[i].type == "client" && msgdb.db[last].type == "client"))) { //第一个
						last = i;
					}
				}
			}
			return last
		},
		isVisitorHalfTimeout: function() {
			var msgdb = this.options.msgdb;
			var t = this;
			var dlast = msgdb.db[t.diaListLast()];
			if (!t.hasVisitorHalfTimeout && !! dlast && dlast.type == "client") {
				var now = new Date().getTime();
				if (now - dlast.time >= t.options.visitorHalfTime * 1000 && !dlast.hasChecked) {
					msgdb.db[t.diaListLast()].hasChecked = true;
					t.hasVisitorHalfTimeout = true;
					return true
				}
			}
			return false;
		},
		isVisitorTimeout: function() {
			var msgdb = this.options.msgdb;
			var t = this;
			var dlast = msgdb.db[t.diaListLast()];
			if (!t.hasVisitorTimeout && !! dlast && dlast.type == "client") {
				var now = new Date().getTime();
				if (now - dlast.time >= t.options.visitorEndTime * 1000) {
					t.hasVisitorTimeout = true;
					return true
				}
			}
			return false;
		},
		isClientBusy: function() {
			var msgdb = this.options.msgdb;
			var t = this;
			var ops = this.options.ops;
			var dlast = msgdb.db[t.diaListLast()];
			if (ops.customerBusy == 0) return false;
			if (!t.hasClientBusy && !! dlast && dlast.type == "visitor") {
				var now = new Date().getTime();
				if (now - dlast.time >= t.options.clientBusytime * 1000 && !dlast.hasChecked) {
					msgdb.db[t.diaListLast()].hasChecked = true;
					t.hasClientBusy = true;
					return true
				}
			}
//			//检查相邻访客与坐席的时间大于坐席等待时间的显示提示
//			var fkNoTip = {};
//			for (var i in msgdb.db) {
//				var d = msgdb.db[i];
//				if (fkNoTip.length != 0) {
//					if (!d.isRevoke) {
//
//						if (d.type == "client") {
//							if (d.time - fkNoTip.time >= t.options.clientBusytime * 1000 && !fkNoTip.hasChecked) {
//								fkNoTip.hasChecked = true;
//								return true;
//							} else {
//								fkNoTip = {};
//							}
//						}
//					}
//				}
//				if (d.type == "visitor") {
//					fkNoTip = d;
//				}
//			}
			return false;
		},
		isClientEnd: function() {
			var msgdb = this.options.msgdb;
			var t = this;
			var dlast = msgdb.db[t.diaListLast()];
			var now = new Date().getTime();
			if (now - dlast.time >= t.options.clientEndtime * 1000 && !t.hasClientEnd && dlast.hasChecked) {
				msgdb.db[t.diaListLast()].hasChecked = true;
				t.hasClientEnd = true;
				return true
			}
			return false;
		}
	}
	$.TimeoutList = function(options) {
		var TimeoutList = new TIMEOUTLIST(options);
		TimeoutList.init();
		return TimeoutList;
	}
})(window, jQuery); /*changeFace.js 转换表情*/
;
(function(window, $, undefined) {
	var arrEntities = {
		'lt': '<',
		'gt': '>',
		'nbsp': ' ',
		'amp': '&',
		'quot': '"'
	};
	var imgIco = [
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face01.png" data-name="/::)" id="/::)">', '/::)', '/::\\)'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face02.png" id="/::P" data-name="/::P">', '/::P', '/::P'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face03.png" id="/::$" data-name="/::$">', '/::$', '/::\\$'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face04.png" id="/::D" data-name="/::D">', '/::D', '/::D'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face05.png" id="/::-|" data-name="/::-|">', '/::-|', '/::\\-\\|'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face06.png" id="/::+" data-name="/::+">', '/::+', '/::\\+'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face07.png" id="/:,@-D"  data-name="/:,@-D">', '/:,@-D', '/:,@\\-D'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face08.png" id="/::>" data-name="/::&gt;">', '/::&gt;', '/::&gt;', '/::>'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face09.png" id="/:,@f" data-name="/:,@f">', '/:,@f', '/:,@f'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face10.png" id="/:?" data-name="/:?">', '/:?', '/:\\?'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face11.png" id="/:bye" data-name="/:bye">', '/:bye', '/:bye'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face12.png" id="/:handclap" data-name="/:handclap">', '/:handclap', '/:handclap'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face13.png" id="/::*" data-name="/::*">', '/::*', '/::\\*'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face14.png" id="/:strong" data-name="/:strong">', '/:strong', '/:strong'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face15.png" id="/:P-(" data-name="/:P-(">', '/:P-(', '/:P\\-\\('],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face16.png" id="/:rose" data-name="/:rose">', '/:rose', '/:rose'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face17.png" id="/:share" data-name="/:share">', '/:share', '/:share'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face18.png" id="/:ok" data-name="/:ok">', '/:ok', '/:ok'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face19.png" id="/:sun"  data-name="/:sun">', '/:sun', '/:sun'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face20.png" id="/:heart" data-name="/:heart">', '/:heart', '/:heart'],
		['<img emotions="true" name="faceIco" src="/any800/style/images/mobileImages/newImages/face21.png" id="/:hug" data-name="/:hug">', '/:hug', '/:hug']
	]
	var CHANGEFACE = function(options) {
			this.defaults = {
				imgIco: [],
				after: function() {

				}
			}, this.options = $.extend({}, this.defaults, options)
		}
	CHANGEFACE.prototype = {
		init: function() {
			this.options.imgIco = imgIco;
			this.options.after();
		},
		getItems: function() {
			return imgIco;
		},
		imgToIco: function(html) {
			var ht = html;
			if (!ht || typeof html!="string") {
				return ht;
			}
			// ht = ht.replace(/&(lt|gt|amp|quot);/ig, function(all, t) {
			// 	return arrEntities[t];
			// });
			var $h = $("<div>" + html + "</div>");
			for (var i in imgIco) {
				$h.find("img[data-name='" + imgIco[i][1] + "']").each(function(e) {
					$(this).replaceWith(imgIco[i][1]);
				})
			}
			ht = $h.html();
			return ht;
		},
		icoToImg: function(html) {
			var ht = html;
			if (!ht || typeof html!="string") {
				return ht;
			}
			// ht = ht.replace(/&(lt|gt|amp|quot);/ig, function(all, t) {
			// 	return arrEntities[t];
			// });
			for (var i in imgIco) {
				if (ht.indexOf(imgIco[i][1]) != -1) {
					//					undefined 修复
					if (ht.indexOf(imgIco[i][1]) != -1) {
						ht = ht.replace(new RegExp(imgIco[i][2], 'gm'), imgIco[i][0])
					} else if (!!imgIco[i][3] && ht.indexOf(imgIco[i][3]) != -1) {
						ht = ht.replace(new RegExp(imgIco[i][3], 'gm'), imgIco[i][0])
					}
				}
			}
			return ht;
		}
	}
	$.changeFace = function(options) {
		var changeFace = new CHANGEFACE(options);
		changeFace.init();
		return changeFace;
	}
})(window, jQuery); /*storage.js 缓存机制*/
;
(function(window, $, undefined) {
	var ls;
	var STORAGE = function(options) {
		this.defaults = {
			companyPk:"",
		}, this.options = $.extend({}, this.defaults, options)
	};
	STORAGE.prototype = {
		init: function() {
			if (window.localStorage) {
				ls = window.localStorage;
			}
			this.setVersion();
		},
		setVersion: function() {
			var l = this;
			var version = l.get("version");
			//保留jsonStr,visitor,localHis
			var jsonStr = l.get("jsonStr");
			var visitor = l.get("visitor");
			var localhis = l.get("localHis");
			if (!version || version != "8.0.1") {
			  if (ls) {
			    ls.clear();
			  }
				if (jsonStr) l.set("jsonStr", jsonStr);
				if (visitor) l.set("visitor", visitor);
				if (localhis) l.set("localHis", localhis);
				l.set("version", "8.0.1");
			}
		},
		get: function(key) {
			var value = null;
			if(key!="version"){
				key = "c"+this.options.companyPk+"-"+key;
			}
			if (ls) {
				value = ls[key];
				if (value) {
					value = decodeURIComponent(ls[key]);
				}
			} else if ($.cookie) {
				value = decodeURIComponent($.cookie(key));
			}
			try {
				value = JSON.parse(value)
			} catch (e) {}
			return value
		},
		set: function(key, value) {
			if(key!="version"){
				key = "c"+this.options.companyPk+"-"+key;
			}
			if (ls) {
				if (typeof(value) == "object") {
					value = JSON.stringify(value);
				}
				ls[key] = encodeURIComponent(value);
			} else if ($.cookie) {
				$.cookie(key, encodeURIComponent(value));
			}
		},
		clear: function(key) {
			if(key!="version"){
				key = "c"+this.options.companyPk+"-"+key;
			}
			if (ls) {
				ls.removeItem(key)
			} else if ($.cookie) {
        $.cookie(key, null);
      }
		}
	}
	$.storage = function(options) {
		var storage = new STORAGE(options);
		storage.init();
		return storage;
	}
})(window, jQuery); /*sensitive.js 敏感词过滤*/
;
(function(window, $, undefined) {
	var SENSITIVE = function(options) {
			this.defaults = {
				vocabulary: {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	SENSITIVE.prototype = {
		get: function(msg) {
			var word = msg;
			var vocabulary = this.options.vocabulary;
			if ( !! vocabulary && !! vocabulary.content) {
				if (vocabulary.isVisable == 1) {
					var aTxtContent = vocabulary.content.split(":");
					for (var i = 0; i < aTxtContent.length; i++) {
						if ( !! aTxtContent[i]) {
							for (var a = 0; a <= word.length; a++) {
								word = word.replace(aTxtContent[i], "*");
							}
						}
					}
				}
			}
			return word;
		}
	}
	$.sensitive = function(options) {
		var sensitive = new SENSITIVE(options);
		return sensitive;
	}
})(window, jQuery); /*Alert.js 弹出框*/
;
(function(window, $, undefined) {
	var ALERT = function(options) {
			this.defaults = {
				bgColor: 'rgba(0,0,0,0.3)',
				time: 2
			}, this.options = $.extend({}, this.defaults, options)
		}
	ALERT.prototype = {
		isUse: false,
		init: function() {
			var alertItem = this;
			$("body").append("<div class='alert'><div class='col'></div></div>");
			$(".alert").on('click', function(event) {
				alertItem.isUse = false;
				$(".alert").hide();
			});
		},
		show: function(msg, type) {
			var alertItem = this;
			if (alertItem.isUse == false) {
				alertItem.isUse = true;
				if ( !! type && type == "error") {
					$(".alert .col").addClass('error');
				}
				$(".alert .col").html(msg);
				$(".alert").show();
				$(".alert .col").css({
					marginLeft: -$(".alert .col").width() / 2 - 20,
					marginTop: -$(".alert .col").height() - 10
				});
				setTimeout(function() {
					alertItem.isUse = false;
					$(".alert").hide();
					$(".alert .col").removeClass('error');
				}, alertItem.options.time * 1000)
			}

		}
	}
	$.Alert = function(options) {
		var Alert = new ALERT(options);
		Alert.init();
		return Alert;
	}
})(window, jQuery); /*userDatas.js 数据信息*/
(function(window, $, undefined) {
	var mobile_type_arr = ["ipad", "ipod", "iphone", "ios", "ios", "android", "backerry", "webos", "symbian", "windows phone", "phone", "blackberry"],
		mobile_pc_browser_json = {
			micromessenger: "微信浏览器",
			ucbrowser: "UC浏览器",
			qqbrowser: "QQ浏览器",
			opera: "Opera浏览器",
			baidubrowser: "百度浏览器",
			firefox: "火狐浏览器",
			maxthon: "傲游浏览器",
			xiaomi: "小米手机浏览器",
			chrome: "Chrome浏览器",
			android: "android内置浏览器",
			iphone: "iphone内置浏览器",
			ipod: "opod内置浏览器",
			ipad: "ipad内置浏览器"
		},
		pc_browser_json = {
			qqbrowser: "QQ浏览器",
			opera: "Opera浏览器",
			maxthon: "傲游浏览器",
			tencenttraveler: "TT浏览器",
			theworld: "天天浏览器",
			lbbrowser: "猎豹浏览器",
			chrome: "Chrome浏览器",
			firefox: "Firefox浏览器",
			msie: "IE浏览器",
			safari: "Safari浏览器",
			metasr:"搜狗浏览器"
		};
	var DATAS = function(options) {
			this.defaults = {
				param: null,
				storage: null,
				storageVisitor: "visitor",
				storageIpStr: "ipStr",
				storageChatNum: "chatNum",
				companyPk: "",
				aDset: null,
				chatID: "",
				businessId: "",
				businessName: "",
				storageOldService: "",
				opShow: ""
			}, this.options = $.extend({}, this.defaults, options)
		}
	DATAS.prototype = {
		hasGetJson: false,
		hasGetVisitor: false,
		hasIpStr: false,
		getJsonStr: function() {
			var v = this;
			var item = {};
			if (v.hasGetJson) v.options.param["mn"] = "";
			var visitorInfo = this.getVisitorInfo();
			var aDset = this.options.aDset;
			var ipStr = this.getIpStr();
			if ( !! v.options.param && !! v.options.param["mn"]) {
				var param = JSON.parse(decodeURIComponent(v.options.param["mn"]));
				item = {
					companyPk: v.options.companyPk,
					visitorId: visitorInfo.visitorId,
					visitorName: visitorInfo.visitorName,
					businessId: v.options.businessId,
					businessName: v.options.businessName,
					chatID: v.options.chatID,
					browsingNum: param.browsingNum,
					fromPage: param.fromPage?param.fromPage:!!document.referrer.replace(/[&]/g, "%26")?document.referrer.replace(/[&]/g, "%26"):"",
					title:"",
					ip: ipStr.cip,
					ipName: ipStr.cname,
					usersource: !! aDset ? aDset.scheme_Name : "",
					codeKey: !! this.options ? this.options.param.codeKey : "",
					opShow: v.options.opShow,
					oldService: v.options.storageOldService,
					keyword: param.keyword,
					searchEngine: param.searchEngine,
					lastTime: Number(param.lastTime) ? param.lastTime : new Date(param.lastTime) == "Invalid Date" ? "" : new Date(param.lastTime),
					firstTime: Number(param.firstTime) ? param.firstTime : new Date(param.firstTime) == "Invalid Date" ? "" : new Date(param.firstTime),
					chatNum: v.getChatNum(),
					operatingSystem: v.getOperatingSystem(),
					visitor: visitorInfo,
					commodity: {
						"shopImgUrl": "",
						"shopName": "",
						"shopNum": "",
						"shopPrice": "",
						"shopUrl": ""
					}
				};
			} else {
				var old = v.options.storage.get("jsonStr");
				item = {
					visitorId: visitorInfo.visitorId,
					companyPk: v.options.companyPk,
					visitorName: visitorInfo.visitorName,
					businessId: v.options.businessId,
					businessName: v.options.businessName,
					chatID: v.options.chatID,
					browsingNum: old && old.browsingNum ? old.browsingNum : "",
					fromPage: old && old.fromPage ? old.fromPage : !!document.referrer.replace(/[&]/g, "%26")?document.referrer.replace(/[&]/g, "%26"):"",
					title:old && old.title ? old.title:"",
					usersource: !! aDset ? aDset.scheme_Name : "",
					codeKey: !! this.options ? this.options.param.codeKey : "",
					opShow: v.options.opShow,
					oldService: v.options.storageOldService,
					ip: ipStr.cip,
					ipName: ipStr.cname,
					keyword: old && old.keyword ? old.keyword : "",
					searchEngine: old && old.searchEngine ? old.searchEngine : "",
					lastTime: old && old.lastTime ? old.lastTime : "",
					firstTime: old && old.firstTime ? old.firstTime : "",
					chatNum: v.getChatNum(),
					operatingSystem: v.getOperatingSystem(),
					visitor: visitorInfo,
					commodity: {
						"shopImgUrl": "",
						"shopName": "",
						"shopNum": "",
						"shopPrice": "",
						"shopUrl": ""
					}
				};
			}
			
			if( !!v.options.param["pageInfo"] && !!v.options.param["isuse"] && v.options.param["isuse"]=="true" ){
				var pageInfo =decodeURIComponent(v.options.param["pageInfo"]);
				var page = pageInfo.split("|");
				var fromPage="";
				var title="";
				if(page.length==1){
					title = page[0].trim();
					if(title=="null"){
						title="";
					}
				}else if(page.length>=2){
					title = page[0].trim();
					fromPage = page[1].trim();
					if(title=="null"){
						title="";
					}
					if(fromPage=="null"){
						fromPage="";
					}
				}
				item.title=encodeURIComponent(title);
				item.fromPage=encodeURIComponent(fromPage);
			}else{
				item.title="";
				item.fromPage="";
			}
      if(v.options.param['defineParamsJson']){
        var defineParamsJson = decodeURIComponent(v.options.param['defineParamsJson']);
        item["defineParamsJson"] = defineParamsJson ? defineParamsJson : "";
      }
			v.hasGetJson = true;
			v.options.storage.set("jsonStr", item);
			return item;
		},
		getChatNum: function() {
			if (!this.options.storage.get(this.options.storageChatNum)) {
				return 0;
			}
			return this.options.storage.get(this.options.storageChatNum);
		},
		getOperatingSystem: function() {
			var p = this.options.param; // 获取URL参数
			var s = "pc";
			var userAgent = navigator.userAgent.toLowerCase();
			var reg_Exp = /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone|BlackBerry)/i;
			if (userAgent.match(reg_Exp) != null) {
				s = "mb";
			}
			if ( !! p && !! p['qr']) {
				s = "ma"
			}

			var sysResolution = window.screen.width + "×" + window.screen.height;
			var language = !! navigator.systemLanguage ? navigator.systemLanguage : !! navigator.language ? navigator.language : "";
			var operatingSystem = {
				sysInfo: s,
				// 区分渠道
				browserName: this.getUserAgent().browser_name,
				browser: this.getUserAgent().browser_type,
				operatorSystem: this.getUserAgent().terminal_system,
				sysResolution: sysResolution,
				language: language
			};
			return operatingSystem;
		},
		getUserAgent: function() {
			var userAgent_Data = {};
			var userAgent = navigator.userAgent.toLowerCase();
			var reg_Exp = /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone|BlackBerry)/i;
			if (userAgent.match(reg_Exp) != null) {
				userAgent_Data["terminal_Type"] = "移动终端";
				for (var i = 0; i < mobile_type_arr.length; i++) {
					if (userAgent.indexOf(mobile_type_arr[i]) > -1) {
						userAgent_Data["terminal_system"] = mobile_type_arr[i];
						break;
					}
				}
				if (null == userAgent_Data["terminal_system"] || "" == userAgent_Data["terminal_system"]) {
					userAgent_Data["terminal_system"] = "未知";
				}
				for (var i in mobile_pc_browser_json) {
					if (userAgent.indexOf(i) > -1) {
						userAgent_Data["browser_type"] = mobile_pc_browser_json[i];
						userAgent_Data["browser_name"] = i;
						break;
					}
				}
				if (null == userAgent_Data["browser_type"] || "" == userAgent_Data["browser_type"]) {
					userAgent_Data["browser_type"] = "未知";
					userAgent_Data["browser_name"] = "未知";
				}
			} else {
				userAgent_Data["terminal_Type"] = "PC终端";
				var terminal_system = "未知";
				var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
				var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
				if (isMac) terminal_system = "Mac";
				var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
				if (isUnix) terminal_system = "Unix";
				var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
				if (isLinux) terminal_system = "Linux";
				if (isWin) {
					var isWin2K = userAgent.indexOf("windows nt 5.0") > -1 || userAgent.indexOf("windows 2000") > -1;
					if (isWin2K) terminal_system = "Win2000";
					var isWinXP = userAgent.indexOf("windows nt 5.1") > -1 || userAgent.indexOf("windows xp") > -1;
					if (isWinXP) terminal_system = "WinXP";
					var isWin2003 = userAgent.indexOf("windows nt 5.2") > -1 || userAgent.indexOf("windows 2003") > -1;
					if (isWin2003) terminal_system = "Win2003";
					var isWinVista = userAgent.indexOf("windows nt 6.0") > -1 || userAgent.indexOf("windows vista") > -1;
					if (isWinVista) terminal_system = "WinVista";
					var isWin7 = userAgent.indexOf("windows nt 6.1") > -1 || userAgent.indexOf("windows 7") > -1;
					if (isWin7) terminal_system = "Win7";
					var isWin8 = userAgent.indexOf("windows nt 6.2") > -1 || userAgent.indexOf("windows 7") > -1;
					if (isWin8) terminal_system = "Win8";
					var isWin10 = userAgent.indexOf("windows nt 10.0") > -1 || userAgent.indexOf("windows 10") > -1;
                    if (isWin10) terminal_system = "Win10";
                    var isEdge = userAgent.indexOf("Edge") > -1;
                    if (isEdge) terminal_system = "WinEdge";
				}
				userAgent_Data["terminal_system"] = terminal_system;
				for (var i in pc_browser_json) {
					if (userAgent.indexOf(i) > -1) {
						userAgent_Data["browser_type"] = pc_browser_json[i];
						userAgent_Data["browser_name"] = i;
						break;
					}
				}
				if (null == userAgent_Data["browser_type"] || "" == userAgent_Data["browser_type"]) {
					var isIE11 = terminal_system=="Win10";
					var isEdge = terminal_system=="WinEdge";
					if(isIE11||isEdge){
                		userAgent_Data["browser_type"] = pc_browser_json["msie"];
                		userAgent_Data["browser_name"] = "msie"
                	}else{
                		userAgent_Data["browser_type"] = "未知";
                		userAgent_Data["browser_name"] = "未知";
                	}
				}
			}
			userAgent_Data["flash_version"] = this.getFlash_version();
			return userAgent_Data;
		},
		getFlash_version: function() {
			var f = "-",
				n = navigator;
			if (n.plugins && n.plugins.length) {
				for (var ii = 0; ii < n.plugins.length; ii++) {
					if (n.plugins[ii].name.indexOf('Shockwave Flash') != -1) {
						f = n.plugins[ii].description.split('Shockwave Flash ')[1];
						break;
					}
				}
			} else if (window.ActiveXObject) {
				for (var ii = 10; ii >= 2; ii--) {
					try {
						var fl = eval("new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + ii + "');");
						if (fl) {
							f = ii + '.0';
							break;
						}
					} catch (e) {}
				}
			}
			return f;
		},
		getIpStr: function() {
			var v = this;
			if (v.hasGetIpStr) return v.options.storage.get(v.options.storageIpStr);
			var ipStr = null;
			if (v.options.storage.get(v.options.storageIpStr)) ipStr = v.options.storage.get(v.options.storageIpStr);
			else {
				$.ajax({
					url: "./echatManager.do?method=getIp",
					dataType: "jsonp",
					async: false,
					complete: function() {
						ipStr = (typeof returnCitySN == "object") ? returnCitySN : {
							"cip": "0.0.0.0",
							"cid": "0",
							"cname": "未知地区"
						};
					}
				});
			}
			v.hasGetIpStr = true;
			v.options.storage.set(v.options.storageIpStr, ipStr);
			return ipStr;
		},
		getVisitorInfo: function() {
			var v = this;
			var item = {};
			if (!v.hasGetVisitor && !! v.options.param && !! v.options.param["mn"]) {
				var param = JSON.parse(decodeURIComponent(v.options.param["mn"]));
				item["visitorId"] = param.visitorId;
				item["visitorName"] = param.visitorName;

				if (v.options.param['hjUserData']) {
					// 姓名|性别|固定电话|手机|邮箱|地址|公司名|MSN|QQ|会员ID|
					// 会员等级|会员积分|会员订单（所有历史信息）
					var pDatas = decodeURIComponent(v.options.param['hjUserData']);
					var pData = pDatas.split("|");
					try {
						item["sex"] = pData[1];
						item["realName"] = pData[0];
						item["phone"] = pData[2];
						item["mobile"] = pData[3];
						item["email"] = pData[4];
						item["QQ"] = pData[8];
						item["MSN"] = pData[7];
						item["address"] = pData[5];
						item["company"] = pData[6];
						item["visitorId"] = pData[9];
						item["visitorName"] = pData[0];
					} catch (e) {}
				}
			} else if (!v.hasGetVisitor && !! v.options.param && !! v.options.param["memberPk"]){
				item["visitorId"] = v.options.param["memberPk"];
			}else if ( !! v.options.storage.get(v.options.storageVisitor)) {
				var data = v.options.storage.get(v.options.storageVisitor);
				item["visitorId"] = data.visitorId ? data.visitorId : "";
				if (item["visitorId"] == "") {
					$.ajax({
						type: "POST",
						url: 'echatManager.do?method=generationVisitorsID',
						async: false,
						//先获得
						data: {
							companyPk: v.options.companyPk
						},
						dataType: "json"
					}).done(function(dataObj) {
						if (dataObj) {
							item["visitorId"] = dataObj.visitorId;
						}
					})
				}
				item["company"] = data.company ? data.company : "";
				item["visitorName"] = data.visitorName ? data.visitorName : "访客" + Number(item["visitorId"].substring(1));
				item["sex"] = !isNaN(Number(data.sex)) ? data.sex : 0;
				item["degree"] = data.degree ? data.degree : "";
				item["realName"] = data.realName ? data.realName : "";
				item["phone"] = data.phone ? data.phone : "";
				item["mobile"] = data.mobile ? data.mobile : "";
				item["email"] = data.email ? data.email : "";
				item["QQ"] = data.QQ ? data.QQ : "";
				item["MSN"] = data.MSN ? data.MSN : "";
				item["address"] = data.address ? data.address : "";
				item["extension"] = data.extension ? data.extension : "";
				item["memberId"] = data.memberId ? data.memberId : "";
			}
			if (!item["visitorId"]) {
				$.ajax({
					type: "POST",
					url: 'echatManager.do?method=generationVisitorsID',
					async: false,
					//先获得
					data: {
						companyPk: v.options.companyPk
					},
					dataType: "json",async:false
				}).done(function(dataObj) {
					if (dataObj) {
						item["visitorId"] = dataObj.visitorId;
						item["visitorName"] = "访客" + dataObj.showId;
					}
				})
			}
			var vname = v.updateVisitorName(item,item["visitorId"]);
			v.hasGetVisitor = true;
			v.options.storage.set(v.options.storageVisitor, item);
			return item;
		},
		updateVisitorName: function(item,vid) {
			var v = this;
			if (!v.hasGetVisitor) {
				$.ajax({
					type: "POST",
					url: 'echatManager.do?method=getVisitorsName',
					async: false,
					//先获得
					data: {
						visitorId: vid
					},
					dataType: "json"
				}).done(function(dataObj) {
					if (dataObj.success) {
						item["company"] = dataObj.company || item["company"] || "";
						item["visitorName"] = dataObj.name || item["visitorName"] || "";
						item["sex"] = !isNaN(Number(dataObj.sex)) ? dataObj.sex : item["sex"]?item["sex"]:0;
						item["degree"] = dataObj.degree || item["degree"] || "";
						item["realName"] = dataObj.realName || item["realName"] || "";
						item["phone"] = dataObj.phone || item["phone"] || "";
						item["mobile"] = dataObj.mobile || item["mobile"] || "";
						item["email"] = dataObj.email || item["email"] || "";
						item["QQ"] = dataObj.QQ || item["QQ"] || "";
						item["MSN"] = dataObj.MSN || item["MSN"] || "";
						item["address"] = dataObj.address || item["address"] || "";
						item["extension"] = dataObj.extension || item["extension"] || "";
						item["memberId"] = dataObj.memberId || item["memberId"] || "";
					}
					
				})
			}
			return item;
		}
	}
	$.userDatas = function(options) {
		var datas = new DATAS(options);
		return datas;
	}
})(window, jQuery); /*getParameter.js 参数信息*/
;
(function(window, $, undefined) {
	var getParameter = function() {
			var src = location.href;
			// 解析参数并存储到 settings 变量中
			var arg = src.indexOf('?') !== -1 ? src.split('?').pop() : '';
			var settings = {};
			arg.replace(/(\w+)(?:=([^&]*))?/g, function(a, key, value) {
				settings[key] = value;
			});
			return settings;
		}
	$.getParameter = getParameter;
})(window, jQuery);;
(function(window, $, undefined) {
	var CHANGEWINDOW = function(options) {
			this.defaults = {
				open: false,
				msgdb: null,
				storage: null,
				chatId: "",
				browserId: "",
				dialogue: null,
				data: null,
				TimeoutList: null,
				start: function() {},
				end: function() {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	CHANGEWINDOW.prototype = {
		isChanged: false,
		browserInterval: null,
		db: {},
		change: function() {
			var storage = this.options.storage;
			var chatId = this.options.chatId;
			var items = storage.get("currentChat") ? storage.get("currentChat") : [];
			items = this.options.msgdb.getAll();
			if (!storage.get("currentChatId") || this.options.chatId != storage.get("currentChatId")) {
				items = [];
			}
			storage.set("currentChatId", chatId);
			storage.set("currentChat", items);
		},
		clear: function() {
			var chatId = this.options.chatId;
			//this.options.storage.clear("currentChat");
			//this.options.storage.clear("currentChatId");
		},
		check: function() {
			var chatId = this.options.chatId;
			var storage = this.options.storage;
			if ( !! storage.get("currentChat") && !! storage.get("currentChatId") && storage.get("currentChatId") == chatId) {
				return storage.get("currentChat");
			}
			return false;
		},
		setMsgObj: function(msgObj) {
			var chatId = this.options.chatId;
			var storage = this.options.storage;
			storage.set("msgObjCurrentChat", msgObj);
		},
		getMsgObj: function() {
			var storage = this.options.storage;
			return storage.get("msgObjCurrentChat");
		},
		init: function() {
			var storage = this.options.storage;
			var CW = this;
			CW.db = this.options.storage.get("currentChat");
			if (!CW.options.open) return;
			if ( !! storage.get("browserId") && !! storage.get("currentChatId") && CW.options.chatId == storage.get("currentChatId")) {
				storage.set("browserId", CW.options.browserId);
			}
			CW.startcheck();
			if (CW.browserInterval != "over") {
				CW.browserInterval = setInterval(function() {
					CW.startcheck();
				}, 1000)
			}
		},
		startcheck: function() {
			var CW = this;
			var storage = this.options.storage;
			var dialogue = this.options.dialogue;
			var data = this.options.data;
			var msgdb = this.options.msgdb;
			if (!storage.get("browserId") || CW.options.chatId != storage.get("currentChatId")) {
				return;
			} else if (storage.get("offChat")!=true && CW.options.browserId != storage.get("browserId")) {
				if (dialogue.islive() == true) {

					dialogue.end();
					//显示离开
					CW.options.end();
				}
			} else if (CW.options.browserId == storage.get("browserId") && CW.getMsgObj()) {
				if (dialogue.islive() == false) {
					CW.isChanged = true;
					storage.set("browserId",CW.options.browserId);
					storage.set("offChat",CW.options.browserId);
					msgdb.clear();
					CW.options.start();
					var msgObj = CW.getMsgObj();
					data.set("reconnectData", msgObj);
					dialogue.setAttr("remoteUrl", msgObj.url);
					dialogue.setAttr("_workGroupName", msgObj.workgroupName);
					dialogue.setAttr("operatorName", msgObj.opShow);
					data.set("opName", msgObj.workgroupName);
					data.set("_workGroupName", msgObj.workgroupName);
					dialogue.start();
					if ( !! CW.db) {
						var items = CW.db;
						for (var i in items) {
							var item = items[i];
							if (item && (item.type == "visitor" || item.type == "client" || item.type == "robot")) {
								if ( !! item.content && !item.isRevoke && item.status == 0 && item.checkSend != 2) {
									dialogue.showMsg({
										msgid: item.msgId,
										date: item.time,
										content: item.content,
										from: item.type,
										status: item.status,
										hasChecked:item.hasChecked
									});
								}
							} else if (item && item.type == "system") {
								if ( !! item.content) {
									dialogue.showSysMsg(item.content);
								}
							}
							msgdb.id = parseInt(i) + 1;
						}
						CW.options.TimeoutList.startALLTimeout();
						msgdb.db = CW.db;
					}
				}

			}
		},
		stopCheck: function() {
			var CW = this;
			clearInterval(CW.browserInterval);
			CW.browserInterval = "over";
			CW.clear();
		}
	}
	$.changeWindow = function(options) {
		var changeWindow = new CHANGEWINDOW(options);
		return changeWindow;
	}
})(window, jQuery); /*queue.js 队列*/
;
(function(window, $, undefined) {
	var QUEUE = function(options) {
			this.defaults = {
				chatID: "",
				companyPk: "",
				langPk: 0,
				message: {},
				IpStr: "",
				always: function(result) {

				},
				success: function(result) {

				},
				fail: function(result) {

				},
				leave: function() {

				},
				continueque: function() {

				}
			}, this.options = $.extend({}, this.defaults, options)
		}
	QUEUE.prototype = {
		businessId: "",
		businessName: "",
		isTimeOut: false,
		index: 1,
		start: function(businessId, businessName) {
			var que = this;
			$.ajax({
				type: 'POST',
				url: "./queue.do",
				dataType: "json",
				data: {
					method: 'inQueue',
					chatID: que.options.chatID,
					companyPk: que.options.companyPk,
					langPk: que.options.langPk,
					message: que.options.message,
					IpStr: que.options.IpStr
				}
			}).done(function(result) {
				if (result) {
					if (result.success == true) {
						//que.options.always(result);
						que.options.success(result);
					} else {
						if (result.locked == true) {
						  que.start(businessId,businessName);
						}else if (result.inqueue == true) {
							que.getInfo(businessId, 0, false);
							que.options.always(result);
						} else if (result.errorCode == false) {
							que.getInfo(businessId, 0, false);
						} else if (result.server == false) {
							que.options.fail(result);
						} else {
							que.options.leave(result);
						}
					}
				}
				que.failTime = 0;
			}).fail(function() {
        que.failTime = que.failTime || new Date().getTime();
        if(new Date().getTime() - que.failTime > 9*1000){
          que.options.fail({msg:'网络问题,您已离开'});
        }else{
          setTimeout(function() {
            que.start(businessId, businessName)
          }, 1000);
        }
			})
		},
		getInfo: function(businessId, index, isTimeOut) {
			var que = this;
			$.ajax({
				type: 'POST',
				url: "./queue.do",
				dataType: "json",
				data: {
					method: 'getBusinessQueue',
					chatID: que.options.chatID,
					companyPk: que.options.companyPk,
					langPk: que.options.langPk,
					message: que.options.message,
					businessId: businessId,
					index: index,
					isouttimes: isTimeOut
				}
			}).done(function(result) {
				if (result) {
					if (result.success == true) {
						if (que.index != result.index) {
							que.index = result.index;
							que.options.always(result);
						}
						if (result.workgroupName) {
							if (result.url) {
								que.options.success(result);
							}
						} else if (result.inqueue == true) {
							setTimeout(function() {
								que.options.always(result);
								que.getInfo(businessId, result.index, false);
							}, 1000);
						} else {
							setTimeout(function() {
								que.getInfo(businessId, result.index, false)
							}, 2000);
						}
					} else {
					  if (result.locked == true) {
					    que.getInfo(businessId, que.index, false);
            }else if (result.over == false) {
							que.isTimeOut = true;
							que.options.fail(result);
							setTimeout(function() {
								if (que.isTimeOut == true) {
									que.getInfo(businessId, result.index, true);
								}
							}, 10000);
						} else if (result.server == false) {
							que.options.fail(result);
						} else {
							que.options.fail(result);
						}
					}
				}
				que.failTime = 0;
			}).fail(function() {
			  que.failTime = que.failTime || new Date().getTime();
				if(new Date().getTime() - que.failTime > 9*1000){
				  que.options.fail({msg:'网络问题,您已离开'});
				}else{
				  setTimeout(function() {
            que.getInfo(businessId, que.index, false)
          }, 1000);
				}
			})
		},
		continueque: function(companyPk, langPk, businessId) {
			var que = this;
			$.ajax({
				type: 'POST',
				url: './queue.do',
				dataType: "json",
				data: {
					method: 'continueBusinessQueue',
					chatID: que.options.chatID,
					companyPk: companyPk,
					langPk: langPk,
					businessId: businessId
				}
			}).done(function(result) {
				que.istimeout = false;
				que.getInfo(businessId, 0, false);
				que.options.continueque(result);
			})
		},
	}
	$.queueManager = function(options) {
		var queueManager = new QUEUE(options);
		return queueManager;
	}
})(window, jQuery); /*data.js 数据初始化*/
;
(function(window, $, undefined) {
	var DATA = function(options) {
			this.defaults = {
				chatId: "",
				storage: null,
			}, this.options = $.extend({}, this.defaults, options)
		}
	DATA.prototype = {
		list: {},
		get: function(k) {
			var storage = this.options.storage;
			if (storage) {
				var data = storage.get("data");
				return data ? data[k] : data;
			} else {
				var key = this.options.chatId + k;
				return !!this.list[key] ? this.list[key] : null;
			}
		},
		set: function(k, value) {
			var storage = this.options.storage;
			if (storage) {
				var data = storage.get("data");
				data = data ? data : {};
				data[k] = value;
				storage.set("data", data);
			} else {
				var key = this.options.chatId + k;
				this.list[key] = value;
			}
		}
	}
	$.db = function(options) {
		var datas = new DATA(options);
		return datas;
	}
})(window, jQuery); /*dialogue.js 对话主进程*/
;
(function(window, $, undefined) {
	var DIALOGUE = function(options) {
			this.defaults = {
				webSocket: null,
				timeStr: '<p class="dialogue-date">$1</p>',
				resendStr: '<div class="msg_sending" ><img src="style/images/sending.gif"></div>',
				callbackStr: '<div class="msg_repeat" ><img style="vertical-align: bottom;margin-right:5px;" src="style/images/repeat.png"></div>',
				msgEle: '#message',
				visitorId: "",
				historyEle: '#historyChat',
				textEle: '.dialogue-area-write',
				storage: null,
				browserId: "",
				limitReceiveTime: 60,
				changeFaceFun: null,
				chatId: "",
				detectWeb: null,
				userDatas:null,
				msgList: {
					reconnectSuc: "重连服务器成功！",
					reconnectFail: "网络异常，系统正尝试重连服务器！"
				},
				closeStrList: [
					["对话出现异常，对话结束.", "對話出現異常，對話結束.", "Dialogue is abnormal, the dialogue."],
					["对话结束，客服离开对话.", "對話結束，客服離開對話。", "End of the conversation, customer service left the conversation."],
					["对话超时，对话结束。", "對話超時，對話結束。", "Dialogue timeout, the end of the conversation.Dialogue timeout, the end of the conversation."],
					["您好，为了保证服务质量，我们已经结束了对话，期待再次为您服务。", "對話關閉，客服結束對話", "dialog closes, end customer dialogue."],
					["响应超时，对话结束。", "響應超時，對話結束。", "Response timeout, end of the conversation."],
					["您结束了对话。", "您結束了對話。", "You end the conversation."],
					["网络中断，如需继续对话，请<a href='javascript:void(0)' class='reconnectID'>点击此处</a>重新发起对话", "網絡斷開，對話結束。", "Network disconnection,end of the conversation."],
					["客服网络中断，当前对话结束，如需继续对话，请<a href='javascript:void(0)' onclick=''  class='reconnectID'>点击此处</a>重新接入。", "客服网络中断，当前对话结束，如需继续对话，请重新接入。", "Customer's Network has bean interrupted ,end of the conversation."],
					["网络异常，当前对话结束，如需继续对话，<a href='javascript:void(0)' onclick=''  class='reconnectID'>请重新接入</a>。", "客服网络中断，当前对话结束，如需继续对话，请重新接入。", "Network has bean interrupted ,end of the conversation."]
				],
				showSysMsgFun: function(html) {},
				getReceivedFun: function(msgId) {},
				msgReplace: function(type) {},
				startChat: function() {},
				endChat: function() {},
				sendMessageFun: function(id, txt) {},
				msgFun: function(json) {},
				closeTool: function() {},
				openTool: function() {},
				confirmSend: function(id, flag) {},
				specialFun: function(type, arg) {},
				endChatFun: function() {}
			};
			this.options = $.extend({}, this.defaults, options);
		}
	DIALOGUE.prototype = {
		msgPair: {},
		diaCount: 0,
		isSpeech: false,
		lastSend: "",
		diaList: new Object(),
		readMessageTimeout: null,
		readMessageInterval: null,
		prevTextInterval: null,
		time:new Date().getTime(),
		attr: {
			langType: 0,
			islive: false,
			operatorName: "",
			remoteUrl: "",
			_workGroupName: ""
		},
		getAttr: function(key) {
			return typeof key != "undefined" ? this.attr[key] : "";
		},
		setAttr: function(key, value) {
			this.attr[key] = value;
		},
		islive: function() {
			return this.getAttr("islive");
		},
		showMsg: function(json) {
			var msgid = !! json.msgid ? json.msgid : "",
				date = !! json.date ? json.date : "",
				content = json.content,
				from = !! json.from ? json.from : "client",
				status = !! json.status ? json.status : 0;
			var userDatas = this.options.userDatas;
			var str = this.options.msgReplace(from);
			var isClient = (from == "client");
			var name = !! isClient ? this.getAttr("operatorName") : (from == "robot") ? (this.islive()?this.getAttr("operatorName"):"客服") : userDatas.getJsonStr().visitorName?userDatas.getJsonStr().visitorName:"访客";

			if (!content || content == "null") return;
			var reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
			var httpUrl = $("<div>" + content + "</div>").text();
			if (from == "client" && reg.test(httpUrl) && content.indexOf("audio") < 0) {
				var open = "<a href=" + httpUrl + " target='_blank'>" + httpUrl + "</a>";
				content = open;
				this.options.specialFun("openWin", open);
			}
			content = this.messageChange(content);
			content = this.options.changeFaceFun.imgToIco(content);
			content = this.options.changeFaceFun.icoToImg(content);
			str = str.replace(/\$name/g, name).replace(/\$content/g, content).replace(/\$msgid/g, msgid).replace(/\$msgResend/g, (from == "visitor") ? (this.options.resendStr + this.options.callbackStr) : "");

			if (status == 0 || !status) {
				if (!date) {
					date = new Date().getTime();
				};
				var timeStr = this.options.timeStr.replace(/\$1/g, new Date(date).Format("hh:mm:ss"));
				$(this.options.msgEle).append(timeStr);
				$(this.options.msgEle).append(str);
			} else {
				if (!date) {
					date = new Date().getTime();
				};
				var timeStr = this.options.timeStr.replace(/\$1/g, new Date(date).Format("yyyy-MM-dd hh:mm:ss"));
				
				$(this.options.historyEle).prepend(str);
				$(this.options.historyEle).prepend(timeStr);
			}
			this.options.msgFun(json);
		},
		messageChange:function(content){
			var contentText = content;
			try{
				contentText = JSON.parse($("<div>"+ content +"</div>").text());
				if(contentText.msgType == "news"){
					var json = {
						title:contentText.articles[0].title,
						summary:contentText.articles[0].summary,
						url:contentText.articles[0].url,
						img:contentText.articles[0].picUrl
					}
					contentText = '<div class="message_news" data-url="'+json.url+'" ><div class="title">'+json.title+'</div><div class="content"><div class="summary">'+json.summary+'</div><div class="img"><img src="'+json.img+'"/></div></div></div>';
				}else if(contentText.type=="IDCard"){
					//{"summaryStr":"个人名片","operatorPK":"ff8080815fe3e1d6015ffb77dcaa0011","headURL":"","nickname":"Bulin","companyPk":"ff8080815faad965015fb3541ef6008c","type":"IDCard","detailURL":"http:\/\/ronghe.any800.com \/scrm\/app\/namecard\/detail?staffId=ff8080815fe3e1d6015ffb77dcaa0011"}
					var json = {
						title:contentText.nickname,
						summary:contentText.summaryStr,
						url:contentText.detailURL,
						img:contentText.headURL?contentText.headURL:"./bootstrapUI/any800/images/client.png"
					}
					contentText = '<div class="message_news IDCard" data-url="'+json.url+'" ><div class="img"><img src="'+json.img+'"/></div><div class="content"><div class="title">'+json.title+'</div><div class="summary">'+json.summary+'</div></div></div>';
				}else if(contentText.type=="knowledgeCard"){
					//{"coverUrl":"","title":"测试插件","companyPk":"ff8080815faad965015fb3541ef6008c","type":"knowledgeCard","description":"随便写","url":"https:\/\/www.baidu.com "}
					var json = {
						title:contentText.title,
						summary:contentText.description,
						url:contentText.url,
						img:contentText.coverUrl?contentText.coverUrl:"./bootstrapUI/any800/images/client.png"
					}
					contentText = '<div class="message_news knowledgeCard" data-url="'+json.url+'" ><div class="content"><div class="title">'+json.title+'</div><div class="summary">'+json.summary+'</div><div class="img"><img src="'+json.img+'"/></div></div></div>';
				}else{
					contentText = content;
				}
			}catch(e){}	
			return contentText;
		},
		showSysMsg: function(html,hidden) {
			if (!html || html == "undefined" || html == "null") return;
			this.options.showSysMsgFun(html,hidden);
		},
		start: function() {
			var dia = this;
			dia.setAttr("islive", true);
			dia.options.storage.set("browserId", dia.options.browserId);
			if ( !! dia.options.webSocket && dia.options.webSocket.isWork) {
				//dia.options.webSocket.connect();
				dia.prevTextInterval = window.setInterval(function() {
					dia.preVstText()
				}, 2000);
			} else {
				dia.startReadMessageTimeout();
				clearInterval(dia.prevTextInterval);
		        clearInterval(dia.readMessageInterval);
		        dia.readMessageInterval = window.setInterval(function() {
		        	if(new Date().getTime()-dia.time>10*1000){
		        		dia.startReadMessageTimeout();
		        	}
		        }, 10*1000);
				dia.prevTextInterval = window.setInterval(function() {
					dia.preVstText()
				}, 2000);
			}
			dia.toolFun(true);
			dia.options.startChat();
		},
		startReadMessageTimeout: function() {
			var dia = this;
			dia.time = new Date().getTime();
			if (dia.readMessageTimeout) {
				clearTimeout(dia.readMessageTimeout);
			}
			dia.readMessageTimeout = window.setTimeout(function() {
				dia.readMessage();
			}, 1000);
		},
		end: function(type) {
			var dia = this;
			if (!dia.islive()) return;
			dia.setAttr("islive", false);
			if ( !! dia.options.webSocket && dia.options.webSocket.isWork) {
				//dia.options.webSocket.close();
			} else {
				if (dia.readMessageTimeout) {
					clearTimeout(dia.readMessageTimeout);
				}
				dia.readMessageTimeout = null;
				clearInterval(dia.readMessageInterval);
				dia.readMessageInterval = null;
				clearInterval(dia.prevTextInterval);
				dia.prevTextInterval = null;
			}
			dia.toolFun(false);
			if (typeof type == "number") {
				dia.options.storage.set("browserId", "");
				dia.showSysMsg(this.options.closeStrList[type],true);
				dia.options.endChat();
			}
			dia.options.endChatFun();
		},
		readMessage: function() {
			var dia = this;
			var detectWeb = dia.options.detectWeb;
			if (!dia.getAttr("remoteUrl")) {
				return;
			}
			$.ajax({
				type: 'POST',
				url: './echat.do',
				dataType: 'json',
				async: false,
				cache: false,
				data: {
					method: 'readMessage',
					chatID: dia.options.chatId,
					url: dia.getAttr("remoteUrl")
				}
			}).done(function(data) {
				dia.startReadMessageTimeout();
				try {
					if (detectWeb.getIsInitiate()) {
						dia.showSysMsg(dia.options.msgList.reconnectSuc);
					}
					dia.messageDeal(data);
					if (detectWeb.getIsInitiate()) {
						dia.toolFun(true);
						detectWeb.checkedSuccess();
					}
				} catch (e) {}
			}).fail(function(data) {
				dia.startReadMessageTimeout();
				if (!detectWeb.getIsInitiate()) {
					dia.toolFun(false);
					dia.showSysMsg(dia.options.msgList.reconnectFail);
					detectWeb.checkedFail();
				}
			});
		},
		messageDeal: function(result) {
			var dia = this;
			var detectWeb = dia.options.detectWeb;
			if (result && result.root) {
				if (result.root.length == 0) {
					return false;
				}
				for (var i = 0; i < result.root.length; i++) {
					var textSW = result.root[i].type.text;
					if (textSW == "200") { //普通对话
						if (result.root[i].from && result.root[i].date != "") {
							if (result.root[i].langType > 0 && result.root[i].langKey > 0) {

							} else {
								var json = JSON.parse(result.root[i].text);
								dia.addDiaList(json.messageId, new Date().getTime(), json.content, 0, "client");
								if(typeof json.content =="object"){
									json.content = JSON.stringify(json.content);
								}
								json.content = json.content.replace(/\n/ig,"<br>")
								dia.showMsg({
									msgid: json.messageId,
									date: new Date().getTime(),
									content: json.content,
									from: "client",
									status: 0
								});
								dia.options.specialFun("200", {
									msgid: json.messageId,
									content: json.content,
									time: new Date().getTime()
								});
								detectWeb.msgPush('customer', json.content);
							}
						}
					} else if (textSW == "700") { // 满意度、发送文件等.
						dia.options.specialFun("700", result.root[i]);
					} else if (textSW == "900") { // 对话出现异常，对话结束.
						if (detectWeb.getIsInitiate()) {
							dia.end(6);
						} else {
							dia.end(2);
						}
						dia.options.specialFun("900", "");
					} else if (textSW == "901") { // 对话结束，客服退出对话.
						dia.end(3);
						dia.options.specialFun("901", "");
					} else if (textSW == "110") { // 坐席网络中断
						dia.end(7);
						dia.options.specialFun("110", "");
					} else if (textSW == "111") { // 真正的接通了一个客服的标识 @Elijah
						dia.toolFun(true);
						dia.showMsg({
							msgid: "",
							date: new Date().getTime(),
							content: JSON.parse(result.root[i].text).content,
							from: "client",
							status: 0,
							saveIn: 1
						});
						// TODO 如果是当前对话是重连的则这里调用发消息的接口将
						// 5通对话带入到新的坐席上 2015/06/24
						if (detectWeb.getIsReconnection()) {
							var txt = '[' + detectWeb.getMsgs(5).join(',') + ']'; // 取5条数据
							dia.sendMessage(txt, 'offLineMessage');
						}
						dia.options.specialFun("111", result.root[i]);
					} else if (textSW == "112") { // 坐席已经邀请不进来了 @Elijah
						dia.showMsg({
							msgid: "",
							date: new Date().getTime(),
							content: JSON.parse(result.root[i].text).content,
							from: "client",
							status: 0
						});

						dia.end(0); //
						dia.options.specialFun("112", result.root[i]);
					} else if (textSW == "113") {
						dia.options.specialFun("113", result.root[i].text);
					} else if (textSW == "114") { //切换窗口
						dia.options.specialFun("114", result.root[i].text);
					} else if (textSW == "902") { // 对话超时，对话结束.
						if (dia.islive()) {
							dia.options.specialFun("902", result.root[i].text);
							dia.end(2);
						}
					}
				}
			}
		},
		addDiaList: function(msgId, time, content, status, from) {
			if (!msgId) {
				msgId = "Other" + new Date().getTime();
				this.diaCount++;
			}
			this.diaList[msgId] = {
				time: time,
				from: from,
				content: content,
				status: status,
				isReceived: from == "client" ? 1 : 0,
				receivedTime: 0 //0未读,1已读,2未读超时
			}
			return msgId;
		},
		getReceived: function() {
			var dia = this;
			var diaList = this.diaList,
				box = [];
			for (var i in diaList) {
				if (diaList[i].isReceived == 0) {
					box.push(i);
				}
			}
			for (var k in box) {
				if (!isNaN(Number(k))) {
					$.ajax({
						type: 'post',
						url: 'echat.do?method=getReceivedMID',
						async: false,
						data: {
							"messageId": dia.msgPair[box[k]],
							"workGroupName": this.getAttr("_workGroupName")
						},
						dataType: 'json',
						success: function(data) {
							dia.options.getReceivedFun(box[k]);
							dia.diaList[box[k]].isReceived = 1;
							dia.options.confirmSend(box[k]);
							if (data.success) {


							} else {
								if (dia.diaList[box[k]].receivedTime >= dia.options.limitReceiveTime) {
									dia.diaList[box[k]].isReceived = 2;
								} else {
									dia.diaList[box[k]].receivedTime++;
								}
							}
						}
					})
				}

			}
		},
		preVstText: function() {
			var lastSend = this.lastSend;
			var txtContent = $(this.options.textEle).text().replace(/\s+/g, "");
			if (this.lastSend != txtContent) {
				this.lastSend = txtContent;
				if (txtContent) {
					this.sendMessage(txtContent, "foreknowledge");
				} else {
					this.sendMessage(" ", "foreknowledge");
				}
			}
		},
		sendMessage: function(txt, code, allowSend) {
			var dia = this;
			// var arrEntities = {
			// 	'lt': '<',
			// 	'gt': '>',
			// 	//'nbsp': ' ',
			// 	'amp': '&',
			// 	'quot': '"'
			// };
			// txt = txt.replace(/&(lt|gt|amp|quot);/ig, function(all, t) {
			// 	return arrEntities[t];
			// });

			if (code == "acceptRq") {
				this.isSpeech = true;
			}
			if (code == "offLineMessage") { // 将断线重连的离线消息带入到坐席
			} else if (code != "send_file") {} else {
				code = "";
			}
			txt = txt.replace(/<a/g, "<a target='_blank'"); // 给所有链接添加"<a
			// target='_blank'
			var msgId = dia.addDiaList("", new Date().getTime(), txt, 0, "visitor");
			var time = new Date().getTime();
			if (!code && !allowSend) {

				dia.showMsg({
					msgid: msgId,
					date: time,
					content: txt,
					from: "visitor",
					status: 0
				});

				dia.options.sendMessageFun(msgId, txt);
			}
			if ( !! dia.options.webSocket && dia.options.webSocket.isWork && !code) {
				dia.options.webSocket.send({
					date:time,
					message: txt,
					chatID: dia.options.chatId
				})
				return;
			}
			$.ajax({
				type: 'POST',
				url: './echat.do',
				dataType: "json",
				async: false,
				cache: false,
				data: {
					method: 'sendMessage',
					chatID: dia.options.chatId,
					// 一通对话的唯一标识，对话ID
					message: txt,
					// 对话内容
					code: code ? code : "",
					// 用来区分其他对话消息类型的入消息预知
					url: dia.getAttr("remoteUrl"),
					// remoteUrl，Jtalk服务器地址
					visitorId: dia.options.visitorId
				}
			}).done(function(data) {
				if (data.success == true) {
					var id = data.messageId;
					if (data.message == 'back') {
						dia.options.confirmSend(id); //ios,直接隐藏
					} else {
						dia.options.confirmSend(id, 'add');
					}
					dia.msgPair[msgId] = id;
					dia.callbackFun(msgId, id);
				}
			});
		},
		callbackFun: function(msgId, id) {
			var dia = this;
			setTimeout(function() {
				if (!dia.diaList[msgId].isReceived) {
					$("[name=" + msgId + "] .msg_").html(dia.options.callbackStr);
				}
			}, 60 * 1000);
		},
		toolFun: function(type) {
			if (type) { // 开启
				this.options.openTool();
			} else { // 关闭
				this.options.closeTool();
			}
		}
	}
	$.dialogue = function(options) {
		var dialogue = new DIALOGUE(options);
		return dialogue;
	}
})(window, jQuery); /*heartBeat.js 心跳机制*/
(function(window, $, undefined) {
	var HEARTBEAT = function(options) {
			this.defaults = {
					detectWeb:function(){}	
			}, this.options = $.extend({}, this.defaults, options)
		}
	HEARTBEAT.prototype = {
		beatInterval: null,
		beatTimeout: null,
		json: {},
		init: function(json) {
//			this.json = json;
//			this.startBeatTimeout(json);
			//      this.json = json;
			//      clearInterval(this.beatInterval);
			//      this.beatInterval = null;
			//      this.beatInterval = setInterval(function() {
			//        $.ajax({
			//          url: './echat.do',
			//          type: 'POST',
			//          dataType: 'html',
			//          data: {
			//            method: "beat",
			//            businessId: json.businessId,
			//            chatId: json.chatId
			//          },
			//        })
			//      }, 1000)

		},
		startBeatTimeout: function(json) {
//			var beat = this;
//			if (beat.beatTimeout) {
//				clearTimeout(beat.beatTimeout);
//			}
//			beat.beatTimeout = window.setTimeout(function() {
//				$.ajax({
//					url: './echat.do',
//					type: 'POST',
//					dataType: 'html',
//					data: {
//						method: "beat",
//						businessId: json.businessId,
//						chatId: json.chatId
//					},
//				}).always(function() {
//					if (beat.beatTimeout) {
//						beat.startBeatTimeout(json);
//					}
//				}).fail(function() {
//					beat.options.detectWeb();
//				})
//			}, 1000);
		},
		end: function() {
//			clearInterval(this.beatInterval);
//			this.beatInterval = null;
//			if (this.beatTimeout) {
//				clearTimeout(this.beatTimeout);
//			}
//			this.beatTimeout = null;
//			$.ajax({
//				url: './echat.do',
//				type: 'POST',
//				dataType: 'html',
//				data: {
//					method: "removeBeat",
//					businessId: this.json.businessId,
//					chatId: this.json.chatId
//				},
//			})
		}
	}
	$.heartBeat = function(options) {
		var heartBeat = new HEARTBEAT(options);
		return heartBeat;
	}
})(window, jQuery); /*satisfaction.js 满意度*/
(function(window, $, undefined) {
	var SATISFACTION = function(options) {
			this.defaults = {
				dialogue: null,
				companyPk: "",
				langPk: "",
				chatId: "",
				title: "满意度调查",
				top: "您对本次服务满意吗？",
				bottom: "<div class='bottom'><div class='cancel'>取消</div><div class='submit'>确定</div></div>",
				generate: function() {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	SATISFACTION.prototype = {
		hasSat: false,
		init: function() {
			var sat = this;
			$.ajax({
				type: 'POST',
				url: './echatManager.do',
				dataType: "json",
				async: false,
				data: {
					method: "getSatisfaction",
					companyPk: sat.options.companyPk,
					langPk: sat.options.langPk,
					chatID: sat.options.chatId
				}
			}).done(function(result) {
				if ( !! result) {
					sat.hasSat = true;
					sat.createView(result);
				}
			});
		},
		check: function(arg) {

		},
		cancel: function() {
			this.options.dialogue.sendMessage("访客取消了满意度评价", "cancelSatisfaction");
			this.hide();
		},
		createView: function(result) {
			if ($(".satisfactionView").length > 0) {
				$(".satisfactionView").remove();
			}
			var str = "<div class='satisfactionView view'><div class='board'></div></div>";
			var firstStr = "<div class='fr' data-pk='$1' data-parent='$2' data-name='$3'></div>";
			var secondStr = "<div class='sr' data-pk='$1' data-parent='$2' data-name='$3'></div>";

			$("body").append(str);
			var html = "<div class='title'>" + this.options.title + "<span class='cross'><img src='./style/css/images/shut.png'></span></div>";
			html += "<div class='body'><div class='top'>" + this.options.top + "</div>";
			for (var i = 0, len = result.length; i < len; i++) {
				var firstRank = result[i] //第一级
				html += firstStr.replace(/\$1/g, firstRank.pk).replace(/\$2/g, firstRank.parentPk).replace(/\$3/g, firstRank.name);
				if (firstRank.children.length > 0) {
					for (var s = 0, slen = firstRank.children.length; s < slen; s++) {
						var secondRank = firstRank.children[s]; //第二级
						html += secondStr.replace(/\$1/g, secondRank.pk).replace(/\$2/g, secondRank.parentPk).replace(/\$3/g, secondRank.name);
					}
				}
			}
			html += "<div class='mome'><textarea placeholder='请输入详情'></textarea></div></div>"
			html += this.options.bottom;
			$(".satisfactionView .board").html(html);
			this.hide();
			this.options.generate();
		},
		getElement: function(pk) {
			return $(".satisfactionView .board [data-pk='" + pk + "']");
		},
		getElementByParent: function(pk) {
			return $(".satisfactionView .board [data-parent='" + pk + "']");
		},
		submit: function(json) {
			//json{satisfactionPk,optionPk,satisfactionMemo,nextSatisfactionPk}
			var sat = this;
			var dialogue = this.options.dialogue;
			$.ajax({
				type: 'POST',
				url: './echatManager.do',
				dataType: "json",
				data: {
					method: "saveSatisfaction",
					companyPk: sat.options.companyPk,
					chatID: sat.options.chatId,
					satisfactionPk: json.satisfactionPk,
					optionPk: json.optionPk,
					satisfactionMemo: json.satisfactionMemo,
					nextSatisfactionPk: json.nextSatisfactionPk,
					rndVar: new Date().getTime()
				}
			}).done(function() {
				var reply = sat.getElement(json.optionPk).attr("data-name");
				var reasonStr = "，原因为：";
				var reason = "";
				if ( !! json.nextSatisfactionPk) {
					var reasons = json.nextSatisfactionPk.split(",");
					for (var i in reasons) {
						if ( !! reasons[i] && !! sat.getElement(reasons[i]).attr("data-name")) {
							reason += sat.getElement(reasons[i]).attr("data-name") + ",";
						}
					}
				}
				if (reason.lastIndexOf(",") == reason.length - 1) {
					reason = reason.substring(0, reason.length - 1);
				}
				if ( !! reason) {
					reason = reasonStr + reason;
				}
				var message = "访客给您的满意度评价是：" + reply + reason;
				dialogue.sendMessage(message, "", true);
				dialogue.showSysMsg("您给客服" + dialogue.getAttr("operatorName") + "的评价：" + reply + reason)
			})
			this.hide();
		},
		show: function() {
			if (this.hasSat) {
				$(".satisfactionView").show();
//				$('.satisfactionView input,.satisfactionView textarea').addClass("hasplaceholder");
				$(".satisfactionView .board").css({
					marginTop: "-220px",
				});
				$(".satisfactionView textarea").focus().blur();
				$('.satisfactionView input,.satisfactionView textarea').not(".hasplaceholder").placeholder();
			}
		},
		hide: function() {
			$(".satisfactionView").hide();
		}
	}
	$.satisfaction = function(options) {
		var satisfaction = new SATISFACTION(options);
		return satisfaction;
	}
})(window, jQuery); /*leaveMessage.js 留言*/
(function(window, $, undefined) {
	var LEAVEMESSAGE = function(options) {
			this.defaults = {
				Alert: null,
				messageDisplay: [],
				messageContent: "",
				messageTypeList: [],
				warn: '.warn',
				title: "请留言",
				bottom: "<div class='bottom'><div class='cancel'>取消</div><div class='submit'>确定</div></div>",
				generate: function(combo) {

				},
				reset: function(arg) {

				},
				warn: function(el, text) {

				}
			}, this.options = $.extend({}, this.defaults, options)
		};
	var keySort = function(arr, fn) {
			var array = arr;
			var fn = fn ||
			function(a, b) {
				return b > a;
			}
			for (var i = 1, len = array.length; i < len; i++) {
				var key = array[i];
				var j = i - 1;
				while (j >= 0 && fn(array[j], key)) {
					array[j + 1] = array[j];
					j--
				}
				array[j + 1] = key;
			}
			return array;
		};

	function keysrt(key, desc) {

		return function(a, b) {

			return desc ? ~~ (a[key] < b[key]) : ~~ (a[key] > b[key]);

		}
	};
	LEAVEMESSAGE.prototype = {
		hasCreate: false,
		init: function() {
			var LM = this;
			if (LM.options.messageDisplay.length > 0) {
				LM.options.messageDisplay = keySort(LM.options.messageDisplay, keysrt('sort', false));
				LM.createView();
				LM.hasCreate = true;
			}
		},
		check: function(displayname) {
			var LM = this;
			$(".leaveMessageView .col").removeClass('warn');
			var can = true;
			$(".leaveMessageView .col").each(function(index, el) {
				var $this = $(this);
				if (can == false) return;
				if ( !! displayname && $this.data("displayname") != displayname) return;
				if ($this.data("displayname") == "company") {
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						LM.options.warn($this, "公司名称不能为空");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 30) {
						LM.options.warn($this, "公司名称最大长度为30字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "name") {
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						LM.options.warn($this, "姓名不能为空");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 20) {
						LM.options.warn($this, "姓名最大长度为20字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "telephone") {
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						LM.options.warn($this, "电话不能为空");
						$this.addClass('warn');
						can = false;
						return;
					}
					if ($this.find("input").val() == "") return;
					var re = new RegExp(/^[1][0-9]{1}[0-9]{9}$/);
					if (!re.test($this.find("input").val()) ) {
						LM.options.warn($this, "请填写正确的电话");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "email") {
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						LM.options.warn($this, "电子邮件不能为空");
						$this.addClass('warn');
						can = false;
						return;
					}
					if ($this.find("input").val() == "") return;
					var reg = new RegExp(/^[\-\._A-Za-z0-9]+@([_A-Za-z0-9\-]+\.)+[A-Za-z0-9]{2,3}$/);
					if (!reg.test($this.find("input").val())) {
						LM.options.warn($this, "请填写正确的电子邮件");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 50) {
						LM.options.warn($this, "电子邮件最大长度为50字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "title") {
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						LM.options.warn($this, "主题不能为空");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 50) {
						LM.options.warn($this, "主题最大长度为50字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "content") {
					if ($this.data("require") == 1 && $this.find("textarea").val() == "") {
						LM.options.warn($this, "内容不能为空");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("textarea").val().length > 1000) {
						LM.options.warn($this, "内容最大长度为1000字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
			});
			return can;
		},
		cancel: function() {
			this.hide();
		},
		createView: function() {
			var LM = this;
			if ($(".leaveMessageView").length > 0) {
				$(".leaveMessageView").remove();
			}
			var str = "<div class='leaveMessageView view'><div class='board'></div></div>";
			$("body").append(str);
			var html = "<div class='title'>" + LM.options.title + "<span class='cross'><img src='./style/css/images/shut.png'></span></div>";
			html += "<div class='body'>";
			if ( !! LM.options.messageContent) {
				html += "<div class='top'>" + LM.options.messageContent + "</div>";
			}
			var colStr = "<div class='col' data-type='$0' data-require='$1' data-name='$2' data-markedwords='$3' data-displayname='$4' ></div>";
			for (var i in LM.options.messageDisplay) {
				var item = LM.options.messageDisplay[i];
				if (item.display == 1 && item.displayName == "messageTypePk") {
					html += colStr.replace(/\$0/g, item.judgeDisplay).replace(/\$1/g, item.required).replace(/\$2/g, item.name).replace(/\$3/g, item.markedWords).replace(/\$4/g, item.displayName);
				}
			}
			for (var i in LM.options.messageDisplay) {
				var item = LM.options.messageDisplay[i];
				if (item.display == 1 && item.displayName != "messageTypePk") {
					html += colStr.replace(/\$0/g, item.judgeDisplay).replace(/\$1/g, item.required).replace(/\$2/g, item.name).replace(/\$3/g, item.markedWords).replace(/\$4/g, item.displayName);
				}
			}
			html += "</div>"
			html += this.options.bottom;
			$(".leaveMessageView .board").html(html);
			this.hide();
			this.options.generate(LM.options.messageTypeList);
		},
		submit: function(json) {
			var LM = this;
			var Alert = LM.options.Alert;
			if (!LM.check()) return false;
			if(!json.messageTypePk){
				LM.options.warn($(".leaveMessageView [data-displayname='messageTypePk']"), "请选择留言分类");
				$(".leaveMessageView [data-displayname='messageTypePk']").addClass('warn');
				can = false;
				return;
			}
			var contentencode = json.content;
			try {
				contentencode = encodeURIComponent(encodeURIComponent(contentencode));
			} catch (e) {};
			$.ajax({
				type: 'POST',
				url: './echatManager.do',
				dataType: "json",
				data: {
					method: "saveMessageBox",
					messageTypePk: json.messageTypePk,
					companyPk: LM.options.companyPk,
					name: json.name,
					telephone: json.telephone,
					email: json.email,
					title: json.title,
					content: json.content,
					company: json.company,
					brand: json.brand,
					contentencode: contentencode
				}
			}).done(function(dataObj) {
				if (dataObj.success == true) {
					Alert.show(dataObj.msg);
					LM.reset();
					LM.hide();
				} else {
					Alert.show(dataObj.msg);
				}
			})
			LM.hide();
		},
		reset: function(argument) {
			this.options.reset;
		},
		show: function() {
			if (this.hasCreate) {
				$(".leaveMessageView").show();
//				$('.leaveMessageView input,.leaveMessageView textarea').addClass("hasplaceholder");
				$(".leaveMessageView .board").css({
					marginTop: -$(".leaveMessageView .board").height() / 2,
				});
				$('.leaveMessageView input,.leaveMessageView textarea').not(".hasplaceholder").placeholder();
			}
		},
		hide: function() {
			$(".leaveMessageView").hide();
		}
	}
	$.leaveMessage = function(options) {
		var leaveMessage = new LEAVEMESSAGE(options);
		leaveMessage.init();
		return leaveMessage;
	}
})(window, jQuery); /*visitorInformation.js 用户信息收集*/
(function(window, $, undefined) {
	var VISITORINFORMATION = function(options) {
			this.defaults = {
				storage: null,
				Alert: null,
				title: "请填写以下信息",
				storageVisitor: "visitor",
				bottom: "<div class='bottom'><div class='cancel'>取消</div><div class='submit'>确定</div></div>",
				generate: function(combo) {},
				warn: function(el, text) {},
				submitFun: function() {},
				cancelFun: function() {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	VISITORINFORMATION.prototype = {
		hasCreate: false,
		visitor: {
			"visitorId": "",
			"company": "",
			"visitorName": "",
			"sex": "0",
			"degree": "",
			"realName": "",
			"phone": "",
			"mobile": "",
			"email": "",
			"QQ": "",
			"MSN": "",
			"address": "",
			"extension": "",
			"memberId": ""
		},
		init: function() {
			var VI = this;
			var storage = VI.options.storage;
			if ( !! storage.get(VI.options.storageVisitor)) {
				VI.visitor = storage.get(VI.options.storageVisitor);
			}
			VI.createView();
			VI.hasCreate = true;
		},
		check: function() {
			var VI = this;
			$(".visitorInformationView .col").removeClass('warn');
			var can = true;
			$(".visitorInformationView .col").each(function(index, el) {
				var $this = $(this);
				if (can == false) return;
				if ($this.data("displayname") == "visitorName") {
					var reg = new RegExp((/^[a-zA-Z0-9\u4e00-\u9fa5]+(\s[a-zA-Z0-9\u4e00-\u9fa5]+|)$/));
					if ($this.data("require") == 1 && $this.find("input").val() == "") {
						VI.options.warn($this, "昵称不能为空");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 20) {
						VI.options.warn($this, "昵称最大长度为20字符");
						$this.addClass('warn');
						can = false;
						return;
					} else if (!reg.test($this.find("input").val())) {
						VI.options.warn($this, "请输入中文、英文和数字！");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "realName") {
					if ($this.find("input").val().length > 20) {
						VI.options.warn($this, "姓名最大长度为20字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "phone") {
					if ($this.find("input").val() == "") return;
					var re = new RegExp(/^[1][0-9]{1}[0-9]{9}$/);
					if (!re.test($this.find("input").val())) {
						VI.options.warn($this, "请填写正确的手机号码");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "phone") {
					if ($this.find("input").val() == "") return;
					var re = new RegExp(/^[1][0-9]{1}[0-9]{9}$/);
					if (!re.test($this.find("input").val())) {
						VI.options.warn($this, "请填写正确的手机号码");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "QQ") {
					if ($this.find("input").val().length > 20) {
						VI.options.warn($this, "QQ最大长度为20字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "email") {
					if ($this.find("input").val() == "") return;
					var reg = new RegExp(/^[\-\._A-Za-z0-9]+@([_A-Za-z0-9\-]+\.)+[A-Za-z0-9]{2,3}$/);
					if (!reg.test($this.find("input").val())) {
						VI.options.warn($this, "请填写正确的邮箱");
						$this.addClass('warn');
						can = false;
						return;
					} else if ($this.find("input").val().length > 50) {
						VI.options.warn($this, "邮箱最大长度为50字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "address") {
					if ($this.find("input").val().length > 50) {
						VI.options.warn($this, "地址最大长度为50字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
				if ($this.data("displayname") == "company") {
					if ($this.find("input").val().length > 50) {
						VI.options.warn($this, "公司名称最大长度为50字符");
						$this.addClass('warn');
						can = false;
						return;
					}
				}
			});
			return can;
		},
		cancel: function() {
			this.options.cancelFun();
			this.hide();
		},
		createView: function() {
			var VI = this;
			if ($(".visitorInformationView").length > 0) {
				$(".visitorInformationView").remove();
			}
			var str = "<div class='visitorInformationView view'><div class='board'></div></div>";
			$("body").append(str);
			var html = "<div class='title'>" + VI.options.title + "<span class='cross'><img src='./style/css/images/shut.png'></span></div>";
			html += "<div class='body'>";
			html += "<div class='col' data-type='input' data-require='1' data-name='昵称' data-placeholder='请输入昵称' data-displayname='visitorName' ></div>";
			html += "<div class='col' data-type='radio' data-require='0' data-name='性别'  data-markedwords='" + ( !! VI.visitor.sex ? VI.visitor.sex : "") + "' data-displayname='sex' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='姓名' data-placeholder='请输入姓名' data-markedwords='" + ( !! VI.visitor.realName ? VI.visitor.realName : "") + "' data-displayname='realName' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='手机' data-placeholder='请输入手机号码' data-markedwords='" + ( !! VI.visitor.phone ? VI.visitor.phone : "") + "' data-displayname='phone' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='QQ' data-placeholder='请输入QQ号码' data-markedwords='" + ( !! VI.visitor.QQ ? VI.visitor.QQ : "") + "' data-displayname='QQ' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='邮箱' data-placeholder='请输入邮箱地址' data-markedwords='" + ( !! VI.visitor.email ? VI.visitor.email : "") + "' data-displayname='email' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='地址' data-placeholder='请输入地址' data-markedwords='" + ( !! VI.visitor.address ? VI.visitor.address : "") + "' data-displayname='address' ></div>";
			html += "<div class='col' data-type='input' data-require='0' data-name='公司' data-placeholder='请输入公司名称' data-markedwords='" + ( !! VI.visitor.company ? VI.visitor.company : "") + "' data-displayname='company' ></div>";
			html += "</div>";
			html += this.options.bottom;
			$(".visitorInformationView .board").html(html);
			this.hide();
			this.options.generate();
		},
		submit: function(json) {
			var VI = this;
			var storage = VI.options.storage;
			if (!VI.check()) return;
			var visitor = storage.get(VI.options.storageVisitor);
			visitor = $.extend({}, visitor, json);
			storage.set(VI.options.storageVisitor, visitor);
			VI.visitor = visitor;
			storage.set("isSave", 0);
			VI.options.submitFun(VI.visitor);
			VI.hide();
		},
		show: function() {
			if (this.hasCreate) {
				$(".visitorInformationView").show();
				$(".visitorInformationView .board").css({
					marginTop: -$(".visitorInformationView .board").height() / 2,
				});
			}
		},
		hide: function() {
			$(".visitorInformationView").hide();
		}
	}
	$.visitorInformation = function(options) {
		var visitorInformation = new VISITORINFORMATION(options);
		visitorInformation.init();
		return visitorInformation;
	}
})(window, jQuery); /*history.js 历史纪录及离线留言*/
(function(window, $, undefined) {
	var HISTORY = function(options) {
			this.defaults = {
				show: true,
				visitorId: "",
				companyPk: "",
				leavePre: "离线消息:",
				maxDia: 5,
				dialogue: null,
				generation: function() {},
				checkFun: function(argument) {}
			};
			this.options = $.extend({}, this.defaults, options);
		};
	HISTORY.prototype = {
		page: 1,
		historyDias: [],
		leaveDias: [],
		over: false,
		cur: 1,
		num: 0,
		more:true,
		showHistoryDia: function() {
			if (this.options.show == false) return;
			var history = this;
			var dialogue = this.options.dialogue;
			for (var i in history.historyDias) {
				if (!isNaN(Number(i))) {
					for (var p in history.historyDias[i].content["dia"]) {
						if (!isNaN(Number(i))) {
							var item = history.historyDias[i].content["dia"][p];
							if (!item.hasShown && item.num < history.cur * history.options.maxDia) {
								history.historyDias[i].content["dia"][p].hasShown = true;
								dialogue.showMsg({
									date: Number(new Date(item.time.replace(/-/g,"/")).getTime()),
									from: item.from,
									content: item.content,
									status: 1
								})
							}
						};
					}
				}
			}
		},
		showLeaveChat: function(argument) {
			var history = this;
			var dialogue = this.options.dialogue;
			for (var i in history.leaveDias) {
				if (!isNaN(Number(i))) {
					dialogue.showMsg({
						from: history.leaveDias[i].from,
						content: history.leaveDias[i].content,
						status: 1,
						date: history.leaveDias[i].date
					})
				}
			}
		},
		init: function() {
			this.options.generation();
		},
		check: function(argument) {
			if (this.getSum() < this.cur * this.options.maxDia + 1 && !this.over) {
				this.getHistoryDialogue();
				this.check();
			} else {
				this.showHistoryDia();
				this.cur++;
			}
			this.more =!this.over?true:!(this.getSum() < this.cur * this.options.maxDia + 1);
			this.options.checkFun();
		},
		changeToContent: function(content) {
			var Hi = this;
			var sum = 0;
			var dia = [];
			var dias = $("<div>" + content + "</div>").find(".sevice_chat,.me_chat,.robot_chat");
			for (var i = dias.length-1; i>=0; i--) {
				if ($(dias[i]).find(".msg_back_success").length == 0) {
					dia.push({
						from: dias[i].className == 'sevice_chat' ? "client" : dias[i].className == 'robot_chat' ? "robot" : "visitor",
						content: $(dias[i]).find("content").html(),
						hasShown: false,
						num: Hi.num,
						time:$(dias[i]).find("time").html()
					});
					Hi.num++;
					sum++;
				}
			}
			return {
				sum: sum,
				dia: dia
			};
		},
		getSum: function() {
			var Hi = this;
			var sum = 0;
			for (var i in Hi.historyDias) {
				if (!isNaN(Number(i))) {
					sum += Hi.historyDias[i].content.sum;
				}
			}
			return sum;
		},
		getHistoryDialogue: function() {
			var Hi = this;
			$.ajax({
				url: './historyOperator.do',
				type: 'POST',
				async: false,
				dataType: 'json',
				data: {
					method: "getHistoryDialogue",
					page: Hi.page,
					visitorId: Hi.options.visitorId,
					companyPk: Hi.options.companyPk
				}
			}).done(function(data) {
				if (!data || data.length == 0) {
					Hi.over = true;
					return;
				} else {
					for (var i in data) {
						if (!isNaN(Number(i))) {
							var content = Hi.changeToContent(data[i].content, data[i].from);
							Hi.historyDias.push({
								time: new Date(data[i].leaveTime.replace(/-/g,"/")).getTime(),
								content: content
							});
						}
					}
					Hi.page++;
				}
			}).fail(function() {
				Hi.over = true;
			})
		},
		getLeaveChat: function() {
			var Hi = this;
			$.ajax({
				type: "post",
				async: false,
				url: 'historyOperator.do',
				dataType: "json",
				data: {
					method: "getLeaveChat",
					visitorId: Hi.options.visitorId
				}
			}).done(function(data) {
				if (data.length == 0) {
					return;
				} else {
					data = data.reverse();
					for (var i in data) {
						if (!isNaN(Number(i))) {
							var content = data[i].content;
							if (typeof content  !== 'string') {
								try{
									content = JSON.stringify(content);
								}catch(e){
									
								}
							}
							content = dialogue.messageChange(content);
							Hi.leaveDias.push({
								content: Hi.options.leavePre + "" + content,
								from: "client"
							});
						}
					}
				}
			})
		}
	}
	$.history = function(options) {
		var history = new HISTORY(options);
		return history;
	}
})(window, jQuery); /*robot.js 机器人*/
(function(window, $, undefined) {
	var ROBOT = function(options) {
			this.defaults = {
				visitorName: "",
				visitorId:"",
				ecselfList: null,
				langPk: "",
				dialogue: null,
				robotSetting: 2,
				companyPk: "",
				chatId: "",
				ywList: "ff80808150db355d0150e12f11a90388",
				confidence: 60,
				changeToNormal: function(argument) {}
			};
			this.options = $.extend({}, this.defaults, options);
		}
	ROBOT.prototype = {
		isUse: true,
		choose: false,
		ncRobotTime: 0,
		nc: {
			number: 2,
			answer: "非常抱歉，不能回答你的问题。如需进一步咨询，请点击这里，转接人工客服。",
			questions: "投诉".split(";")
		},
		recored: [],
		click: false,
		init: function(){
		  var robot = this;
		  if (robot.options.robotSetting == 2) {
        //跳出
        robot.isUse = false;
      }
      var ecselfList = (robot.options.ecselfList);
      //    try{
      //      ecselfList = JSON.parse(ecselfList);
      //    }catch(e){}
      if ( !! ecselfList) {
        for (var i in ecselfList) {
          var item = ecselfList[i];
          if ( !! item.eclangPk && item.eclangPk == robot.options.langPk) {
            robot.nc = {
              number: item.number || robot.nc.number,
              answer: item.answer || robot.nc.answer,
              questions: !! item.questions ? item.questions.split(";") : ""
            }
          }
        }
      }
      if (robot.options.robotSetting == 4) {
        robot.nc.answer = robot.nc.answer.replace(robot.clientJump,robot.clientJumpReplace);
      }
		},
		check: function(text) {
			var robot = this;
			var dialogue = robot.options.dialogue;
			if (!robot.isUse) {
				return false;
			}
			if ( !! text) {
				dialogue.showMsg({
					date: new Date().getTime(),
					content: text,
					from: "visitor",
					status: 0
				});
				robot.recored.push({
					date: new Date().getTime(),
					content: text,
					from: "visitor",
					status: 0
				})
			}
			if (robot.options.robotSetting == 3) {
				//小i
				robot.iRobot(text);
			} else if ((robot.options.robotSetting == 1 || robot.options.robotSetting == 4) && robot.options.ywList.indexOf(robot.options.companyPk) > -1) {
				//云问
				robot.ywRobot(text);
			} else if (robot.options.robotSetting == 4 && robot.nc) {
				//久科
				//robot.ncRobot(text);
				robot.umpRobot(text);
//			  robot.multipleRobot(text);
			} else if (robot.options.robotSetting == 1) {
				//旧版久科
				robot.oldNcRobot(text);
			}
			return true;
		},
		clientJump:'请点击这里',
	  clientJumpReplace:'请点击<a style="color:blue;" class="robotResp">这里</a>',
	  multipleRobot:function(text){
		  if (!text) return;
		  var robot = this;
		  var dialogue = robot.options.dialogue;
		  $.ajax({
        type: "POST",
        url: "echatManager.do",
        data: {
          method: "getAnswer",
          companyPk: robot.options.companyPk,
          visitorId:robot.options.visitorId,
          chatId:robot.options.chatId,
          channel:"web",
          question:text
        },
        dataType: "json"
      }).done(function(e) {
        robot.click = false;
        if(e.response && e.response.length>0){
            var content = e.response[0].content
            if(e.suggestions&&e.suggestions.length>=1){
              for(var i=0,len=e.suggestions.length;i<len;i++){
                content+="<b/><div class='robotSuggsetion'>"+e.suggestions[i]+"</div>"
              }
            }
            dialogue.showMsg({
              date: new Date().getTime(),
              content: content,
              from: "robot"
            });
            robot.recored.push({
              date: new Date().getTime(),
              content: content,
              from: "robot"
            })
        }else{
          robot.multipleFail(text);
        }
      }).fail(function(){
        if(!robot.isUse){
          return;
        }
        robot.click = false;
        robot.multipleFail(text);
      })
		},
		multipleFail:function(text){
		  var index = robot.nc.questions.indexOf(text)
		  if (index==-1) {
		    dialogue.showMsg({
          date: new Date().getTime(),
          content: robot.nc.answer,
          from: "robot"
        });
        robot.recored.push({
          date: new Date().getTime(),
          content: robot.nc.answer,
          from: "robot"
        })
        return
      }
		  if (robot.choose) {
		    return
		  }
      robot.choose == true;
      if(!robot.cf){
        robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
        if (robot.cf == true) {
          robot.options.changeToNormal();
          robot.choose = false;
        } else {
          robot.cf = null;
          dialogue.showMsg({
            date: new Date().getTime(),
            content: robot.nc.answer,
            from: "robot"
          });
          robot.recored.push({
            date: new Date().getTime(),
            content: robot.nc.answer,
            from: "robot"
          })
          robot.choose = false;
        }
      }
		},
		umpRobot: function(text) {
			if (!text) return;
			var robot = this;
			var dialogue = robot.options.dialogue;
			$.ajax({
				type: "POST",
				url: "echatManager.do",
				data: {
					method: "getAnswer",
					companyPk: robot.options.companyPk,
					visitorId:robot.options.visitorId,
					chatId:robot.options.chatId,
					codeKey:ucc.codeKey,
					userName:robot.options.visitorName,
					question:text
				},
				dataType: "json"
			}).done(function(e) {
				robot.click = false;
				if(e.response){
					if(e.response.length==1){
						if(e.response[0].type && (e.response[0].type=="0" || e.response[0].type=="5")){
//							text = text.replace(/\r|\n|<br>|<div>|<\/div>/g, "");
//							robot.answerFail(text);
							var p4Content = "您这个问题还真把我难住了，待我再去学习学习，下次见面再告诉您，您可以先咨询其他问题或点击<a  style='color:blue;' class='robotResp'>人工客服</a>哦";
							dialogue.showMsg({
								date: new Date().getTime(),
								content: p4Content,
								from: "robot"
							});
							$(".cssWriteMsg").click(function(){
								$(this).unbind();
								var valeMsg = $(this).html();
								if(valeMsg == "转人工"){
									robot.options.changeToNormal();
									clearInterval(robot.iShowAutoTextInit);
									return;
								}else{
									$(".dialogue-area-write").html(valeMsg);//PC
									$("#dialogue-footer-text").html(valeMsg);//H5
									$("#autodiv").hide();
									uccPcEvent.sendMsg();
								}
							});
							robot.recored.push({
								date: new Date().getTime(),
								content: p4Content,
								from: "robot"
							});
						}else{
							if(e.suggestions&&e.suggestions.length>=1){
								var p4Content = e.response[0].content
								//判断是否包含解决未解决
								var goodVar = "";
								var badVar = "";
								if(e.response[0].content.indexOf("以上答案是否解决了您的问题：")>0 && e.response[0].content.indexOf("\"]解决")>0 && e.response[0].content.indexOf("]未解决[/link]")>0){
									p4Content = e.response[0].content.split("以上答案是否解决了您的问题：")[0];
									p4Content = "<b>" + p4Content + "</b>";
									var resolvent = e.response[0].content.split("以上答案是否解决了您的问题：")[1];
									var reg1=new RegExp("\\[/link\\]","g");
									var rega=new RegExp("\"\\]未解决","g");
									var regb=new RegExp("\"\\]解决","g");
									var reg2=new RegExp("\\]","g");
									var reg3=new RegExp("\\d\{0,3\}\.\\[link submit=","g");
									var reg4=new RegExp("\\[link submit=\"faqvote:","g");
									faqVoteID++;
									var faqUnsolvedId = "unsolved"+faqVoteID;
									var faqSolvedId = "solved"+faqVoteID;
									var faqUnsolvedStr="','0','"+faqVoteID+"')\" href='javascript:void(0);' id='"+faqUnsolvedId+"'>未解决";
									var faqSolvedStr="','1','"+faqVoteID+"')\" href='javascript:void(0);' id='"+faqSolvedId+"'>解决";
									resolvent=resolvent.replace(reg1, "</a> ");
									resolvent=resolvent.replace(reg4,"<a class = 'faqVoted' onClick=\"faqVoted('faqvote:");
									resolvent=resolvent.replace(reg3,"<a onClick=\"exportMessage(");
									resolvent=resolvent.replace(rega,faqUnsolvedStr);
									resolvent=resolvent.replace(regb,faqSolvedStr);
									resolvent=resolvent.replace(reg2,")\" href='javascript:void(0);'>");
									p4Content = p4Content + "以上答案是否解决了您的问题：" + resolvent;
								}else{
									p4Content = "<b>" + p4Content + "</b>";
								}
								if(e.suggestions&&e.suggestions.length>=1){
									p4Content
									p4Content+="<br>您可能关注以下问题：<br>";
									for(var i=0,len=e.suggestions.length;i<len;i++){
										p4Content+="<b/><div class='robotSuggsetion'>"+e.suggestions[i]+"</div>"
									}
								}
//								p4Content += "<br><br>如需进一步咨询，请点击<a  style='color:blue;' class='robotResp'>这里</a>，转接人工客服。";
								p4Content = p4Content.replace(/\r\n/g,"<br>");
								var re = /[link[^>]*url="([^"]*)"[^>]*]/g;
								//如果content中有链接，将用正则取出链接.
								if(re.exec(p4Content)!=null){	
									p4Content = p4Content.replace(/\[link[^\]]*\]/g,"<a href='"+RegExp.$1+"'>").replace(/\[\/link\]/g,"</a>"); 
								}else{
									var rex = /[link[^>]*submit=['"]([\s\S]*?)['"]]([\s\S]*?)[\/link]/g;
									var subText =  new Array();
									var labelText = new Array();
									while(rex.exec(p4Content)!=null){
										subText.push(RegExp.$1);
										labelText.push(RegExp.$2);
									}        				
									p4Content = p4Content.replace(/\[link[^\]]*\]/g,"<a href='javascript:'  class='robotSuggsetion' style='text-decoration:none;'>").replace(/\[\/link\]/g,"</a>");            	                    				
								}
							}else{
								var assetQuery = "";
								if (e.response[0].content.indexOf("assetQuery")>0){
									assetQuery = JSON.parse(e.response[0].content);
								}
								if(assetQuery!="" && assetQuery.assetQuery.code==="00"){
									var p4Content = "总资产："+assetQuery.assetQuery.model.sumAssets+"<br>"+
											"银宝通："+assetQuery.assetQuery.model.lurpak+"<br>"+
											"私募基金："+assetQuery.assetQuery.model.privatePlacement+"<br>"+
											"公募基金："+assetQuery.assetQuery.model.publicPlacement+"<br>";
								}else if(assetQuery!="" && assetQuery.assetQuery.code==="99"){
									var p4Content = "查询无结果";
								}else{
									var p4Content = e.response[0].content
									//判断是否包含解决未解决
									var goodVar = "";
									var badVar = "";
									if(e.response[0].content.indexOf("以上答案是否解决了您的问题：")>0 && e.response[0].content.indexOf("\"]解决")>0 && e.response[0].content.indexOf("]未解决[/link]")>0){
										p4Content = e.response[0].content.split("以上答案是否解决了您的问题：")[0];
										p4Content = "<b>" + p4Content + "</b>";
										var resolvent = e.response[0].content.split("以上答案是否解决了您的问题：")[1];
										var reg1=new RegExp("\\[/link\\]","g");
										var rega=new RegExp("\"\\]未解决","g");
										var regb=new RegExp("\"\\]解决","g");
										var reg2=new RegExp("\\]","g");
										var reg3=new RegExp("\\d\{0,3\}\.\\[link submit=","g");
										var reg4=new RegExp("\\[link submit=\"faqvote:","g");
										faqVoteID++;
										var faqUnsolvedId = "unsolved"+faqVoteID;
										var faqSolvedId = "solved"+faqVoteID;
										var faqUnsolvedStr="','0','"+faqVoteID+"')\" href='javascript:void(0);' id='"+faqUnsolvedId+"'>未解决";
										var faqSolvedStr="','1','"+faqVoteID+"')\" href='javascript:void(0);' id='"+faqSolvedId+"'>解决";
										resolvent=resolvent.replace(reg1, "</a> ");
										resolvent=resolvent.replace(reg4,"<a class = 'faqVoted' onClick=\"faqVoted('faqvote:");
										resolvent=resolvent.replace(reg3,"<a onClick=\"exportMessage(");
										resolvent=resolvent.replace(rega,faqUnsolvedStr);
										resolvent=resolvent.replace(regb,faqSolvedStr);
										resolvent=resolvent.replace(reg2,")\" href='javascript:void(0);'>");
										p4Content = p4Content + "以上答案是否解决了您的问题：" + resolvent;
									}

//									p4Content += "<br><br>如需进一步咨询，请点击<a  style='color:blue;' class='robotResp'>这里</a>，转接人工客服。";
									p4Content = p4Content.replace(/\r\n/g,"<br>");
									var re = /[link[^>]*url="([^"]*)"[^>]*]/g;
									//如果content中有链接，将用正则取出链接.
									if(re.exec(p4Content)!=null){	
										p4Content = p4Content.replace(/\[link[^\]]*\]/g,"<a href='"+RegExp.$1+"'>").replace(/\[\/link\]/g,"</a>"); 
									}else{
										var rex = /[link[^>]*submit=['"]([\s\S]*?)['"]]([\s\S]*?)[\/link]/g;
										var subText =  new Array();
										var labelText = new Array();
										while(rex.exec(p4Content)!=null){
											subText.push(RegExp.$1);
											labelText.push(RegExp.$2);
										}        				
										p4Content = p4Content.replace(/\[link[^\]]*\]/g,"<a href='javascript:'  class='robotSuggsetion' style='text-decoration:none;'>").replace(/\[\/link\]/g,"</a>");            	                    				
									}
								}
							}

							if(e.response[0].content.indexOf("acs") != -1 && e.response[0].type > 100 ){
								robot.options.changeToNormal();
								clearInterval(robot.iShowAutoTextInit);
								return;
							}

							dialogue.showMsg({
								date: new Date().getTime(),
								content: p4Content,
								from: "robot"
							});
							$(".cssWriteMsg").click(function(){
								$(this).unbind();
								var valeMsg = $(this).html();
								if(valeMsg == "转人工"){
									robot.options.changeToNormal();
									clearInterval(robot.iShowAutoTextInit);
									return;
								}else{
									$(".dialogue-area-write").html(valeMsg);//PC
									$("#dialogue-footer-text").html(valeMsg);//H5
									$("#autodiv").hide();
									uccPcEvent.sendMsg();
								}
							});
							robot.recored.push({
								date: new Date().getTime(),
								content: p4Content,
								from: "robot"
							})
						}
					}
				}else{
					robot.answerFail(text);
				}
			}).fail(function(){
				if(!robot.isUse){
					return;
				}
				robot.click = false;
				robot.answerFail(text);
			})
		},
		answerFail: function(text) {
			robot.ncRobotTime++;
			if (robot.ncRobotTime >= robot.nc.number) {
				if (robot.choose) return;
				robot.choose == true;
				if(!robot.cf){
					robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
					if (robot.cf == true) {
						robot.options.changeToNormal();
						robot.choose = false;
					} else {
						robot.cf = null;
						dialogue.showMsg({
							date: new Date().getTime(),
							content: robot.nc.answer,
							from: "robot"
						});
						robot.recored.push({
							date: new Date().getTime(),
							content: robot.nc.answer,
							from: "robot"
						})
						robot.choose = false;
						robot.ncRobotTime = 0; //取消重置
					}
				}
			} else {
				var p = 0;
				for (var i in robot.nc.questions) {
					var item = robot.nc.questions[i];
					if (item == text) {
						p = 1;
						if (robot.choose) return;
						robot.choose == true;
						if(!robot.cf){
							robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
							if (robot.cf == true) {
								robot.choose = false;
								robot.options.changeToNormal();
							} else {
								robot.cf = null;
								p = 0;
								robot.choose = false;
								robot.ncRobotTime = 0; //取消重置
							}
						}
					}

				}
				if (p == 0) {
					dialogue.showMsg({
						date: new Date().getTime(),
						content: robot.nc.answer,
						from: "robot"
					});
					robot.recored.push({
						date: new Date().getTime(),
						content: robot.nc.answer,
						from: "robot"
					})
				}
			}
		},
		iRobot: function(text) {
			if (!text) return;
			var robot = this;
			$.ajax({
				url: "http://vdev.icontek.com:28080/queryj/x/ROOT->ucctest/" + robot.options.companyPk + new Date().getTime() + "/" + text
			}).done(function(e) {
				var result = "";
				if (e.confidence >= robot.confidence && !! e.answer) {
					result += e.answer.replace(/\+/g, " ") + "<br />";
					robot.options.dialogue.showMsg({
						date: new Date().getTime(),
						content: result,
						from: "robot"
					});
					robot.recored.push({
						date: new Date().getTime(),
						content: result,
						from: "robot"
					})
				}
				var cf = confirm("不能查找到答案，是否需要转人工服务?");
				if (cf == true) {
					robot.options.changeToNormal();
				}
			})
		},
		cf:null,
		ncRobot: function(text) {
			if (!text) return;
			var robot = this;
			var dialogue = robot.options.dialogue;
			$.ajax({
				type: "POST",
				url: "echatManager.do?method=automaticResponse",
				data: {
					"companyPk": robot.options.companyPk,
					"question": text,
					"chatId": robot.options.chatId,
					"visitorName": robot.options.visitorName,
					"langPk": robot.options.langPk,
					"true": robot.click
				},
				dataType: "json"
			}).done(function(data) {
				if(!robot.isUse){
					return;
				}
				robot.click = false;
				if (data.reply == true) {
					robot.ncRobotTime = 0; //连续错才会计算
					dialogue.showMsg({
						date: new Date().getTime(),
						content: data.answer,
						from: "robot"
					});
					robot.recored.push({
						date: new Date().getTime(),
						content: data.answer,
						from: "robot"
					})
				} else {
					robot.ncRobotTime++;
					if (robot.ncRobotTime >= robot.nc.number) {
						if (robot.choose) return;
						robot.choose == true;
						if(!robot.cf){
							robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
							if (robot.cf == true) {
								robot.options.changeToNormal();
								robot.choose = false;
							} else {
								robot.cf = null;
								dialogue.showMsg({
									date: new Date().getTime(),
									content: robot.nc.answer,
									from: "robot"
								});
								robot.recored.push({
									date: new Date().getTime(),
									content: robot.nc.answer,
									from: "robot"
								})
								robot.choose = false;
								robot.ncRobotTime = 0; //取消重置
							}
						}
					} else {
						var p = 0;
						for (var i in robot.nc.questions) {
							var item = robot.nc.questions[i];
							if (item == text) {
								p = 1;
								if (robot.choose) return;
								robot.choose == true;
								if(!robot.cf){
									robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
									if (robot.cf == true) {
										robot.choose = false;
										robot.options.changeToNormal();
									} else {
										robot.cf = null;
										p = 0;
										robot.choose = false;
										robot.ncRobotTime = 0; //取消重置
									}
								}
							}

						}
						if (p == 0) {
							dialogue.showMsg({
								date: new Date().getTime(),
								content: robot.nc.answer,
								from: "robot"
							});
							robot.recored.push({
								date: new Date().getTime(),
								content: robot.nc.answer,
								from: "robot"
							})
						}
					}
				}
			}).fail(function() {
				if(!robot.isUse){
					return;
				}
				robot.click = false;
				robot.ncRobotTime++;
				if (robot.ncRobotTime >= robot.nc.number) {
					if (robot.choose) return;
					robot.choose == true;
					if(!robot.cf){
						robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
						if (robot.cf == true) {
							robot.choose = false;
							robot.options.changeToNormal();
						} else {
							robot.cf = null;
							dialogue.showMsg({
								date: new Date().getTime(),
								content: robot.nc.answer,
								from: "robot"
							});
							robot.recored.push({
								date: new Date().getTime(),
								content: robot.nc.answer,
								from: "robot"
							})
							robot.choose = false;
							robot.ncRobotTime = 0; //取消重置
						}
					}
				} else {
					var p = 0;
					for (var i in robot.nc.questions) {
						var item = robot.nc.questions[i];
						if (item == text) {
							p = 1;
							if (robot.choose) return;
							robot.choose == true;
							if(!robot.cf){
								robot.cf = confirm("不能查找到答案，是否需要转人工服务?");
								if (robot.cf == true) {
									robot.choose = false;
									robot.options.changeToNormal();
								} else {
									robot.cf = null;
									p = 0;
									robot.choose = false;
									robot.ncRobotTime = 0; //取消重置
								}
							}
						}

					}
					if (p == 0) {
						dialogue.showMsg({
							date: new Date().getTime(),
							content: robot.nc.answer,
							from: "robot"
						});
						robot.recored.push({
							date: new Date().getTime(),
							content: robot.nc.answer,
							from: "robot"
						})
					}
				}
			})
		},
		ywRobot: function(text) {
			if (!text) return;
			var robot = this;
			var dialogue = robot.options.dialogue;
			$.ajax({
				type: "POST",
				url: "echatManager.do?method=loadSelfService2",
				data: {
					"chatId": robot.options.chatId,
					"companyPk": robot.options.companyPk,
					"content": encodeURIComponent(text)
				},
				dataType: "json"
			}).done(function(data) {
				var result = "";
				if (data && data.answer != 'Artificial customer service' && data.answer != null && data.answer != "" && data.answer != undefined) {
					result = data.answer.replace(/\+/g, " ") + "<br />";
					dialogue.showMsg({
						date: new Date().getTime(),
						content: result + "<br />单击<a href='javascript:' class='robo'><span style='color: red;'>转人工</span></a>进行提问。",
						from: "robot",
						status: 0
					});
					robot.recored.push({
						date: new Date().getTime(),
						content: result + "<br />单击<a href='javascript:' class='robo'><span style='color: red;'>转人工</span></a>进行提问。",
						from: "robot"
					})
				} else {
					dialogue.showMsg({
						date: new Date().getTime(),
						content: "<div id='conId'>您好，我正在成长过程中，您的这个问题可能已经超出了我目前的知识范围。单击<a href='javascript:' class='robo'><span style='color: red;'>转人工</span></a>进行提问。</div>",
						from: "robot",
						status: 0
					});
					robot.recored.push({
						date: new Date().getTime(),
						content: "<div id='conId'>您好，我正在成长过程中，您的这个问题可能已经超出了我目前的知识范围。单击<a href='javascript:' class='robo'><span style='color: red;'>转人工</span></a>进行提问。</div>",
						from: "robot"
					})
				}
				$(".robo").click(function() {
					robot.options.changeToNormal();
				})
			})
		},
		oldNcRobot: function(text) {
			if (!text) return;
			var robot = this;
			var dialogue = robot.options.dialogue;
			var result = "";
			$.ajax({
				type: "POST",
				url: "echatManager.do?method=loadSelfService",
				data: {
					"chatId": robot.options.chatId,
					"companyPk": robot.options.companyPk,
					"content": encodeURIComponent(text)
				},
				dataType: "json"
			}).done(function(rs) {
				if (rs && rs.length > 1) {
					$.each(rs, function(i) {
						result += rs[i].text.replace(/\+/g, " ") + "<br />";
					});
					dialogue.showMsg({
						msgid: "",
						date: new Date().getTime(),
						content: result,
						from: "client",
						status: 0
					});
				} else if (rs && rs.length == 1) {
					result += "<div>" + rs[0].text.replace(/\+/g, " ") + "</div>";
					dialogue.showMsg({
						msgid: "",
						date: new Date().getTime(),
						content: result,
						from: "client",
						status: 0
					});
				} else {
					var cf = confirm("不能查找到答案，是否需要转人工服务?");
					if (cf == true) {
						robot.options.changeToNormal();
					} else {
						robot.ncRobotTime = 0; //取消重置
					}
				}
			})
		}
	}
	$.robot = function(options) {
		var robot = new ROBOT(options);
		robot.recored = [];
		robot.init();
		return robot;
	}
})(window, jQuery); /*langTip.js 提示语*/
(function(window, $, undefined) {
	var LANGTIP = function(options) {
			this.defaults = {
				companyPk: "",
				defaultLangPk: "",
				langMap:{},
				show: function(data) {}
			}, this.options = $.extend({}, this.defaults, options)
		}
	LANGTIP.prototype = {
		type: {
			system: 1,
			operator: 2
		},
		// one:系统提示语 two:自动应答
		key: {
			welcome_1: 1,
			welcome_2: 2,
			chat_ad: 3,
			cs_busy: 4,
			no_answer_close: 5,
			no_answer_hint: 6,
			dialog_start: 7
		},
		langMap: {},
		init: function() {
			var langTip = this;
			if(JSON.stringify(langTip.options.langMap)!='{}'){
				langTip.langMap = langTip.options.langMap;
				return;
			}
			$.ajax({
				type: "POST",
				url: 'echatManager.do?method=getLangList',
				async: false,
				data: {
					companyPk: langTip.options.companyPk,
					langPk: langTip.options.defaultLangPk
				},
				dataType: "json"
			}).done(function(data) {
				if (!data) return;
				langTip.langMap = data;
			})
		},
		show: function(t, k) {
			var langTip = this;
			if (t == 1) {
				if (langTip.langMap && langTip.langMap[k]) {
					langTip.options.show(langTip.langMap[k]);
				}
			} else {
				$.ajax({
					type: "POST",
					url: 'echatManager.do?method=getLangListByPk',
					async: false,
					data: {
						companyPk: langTip.options.companyPk,
						langPk: langTip.options.defaultLangPk,
						langType: t,
						langKey: k
					},
					dataType: "json"
				}).done(function(data) {
					if (!data) return;
					langTip.options.show(data);
				})
			}

		}
	}
	$.langTip = function(options) {
		var langTip = new LANGTIP(options);
		langTip.init();
		return langTip;
	}
})(window, jQuery); /*visitLimit.js 访问限制*/
(function(window, $, undefined) {
	var VISTILIMIT = function(options) {
			this.defaults = {
				open: "1",
				storage: null,
				time: 60 * 1000,
				num: 5,
				blockTime: 5 * 1000,
				url: "./overLoad.jsp"
			}, this.options = $.extend({}, this.defaults, options)
		}
	VISTILIMIT.prototype = {
		init: function() {
			if (this.options.open == "0") return;
			var vl = this;
			var storage = this.options.storage;
			var visitLimit = storage.get("vLimit");
			var isLimit = storage.get("isLimit");
			var limitArray = [];
			var now = new Date().getTime();
			if ( !! visitLimit) {
				if (isLimit == "islimited" && now - visitLimit[visitLimit.length - 1].time <= vl.options.blockTime) {
					window.location.href = vl.options.url;
					return;
				} else if (isLimit == "islimited") {
					visitLimit = [];
				}
				storage.set("isLimit", "");
				for (var i in visitLimit) {
					if (now - visitLimit[i].time < vl.options.time) {
						limitArray.push({
							time: visitLimit[i].time
						})
					}
				}
				limitArray.push({
					time: now
				});
				storage.set("vLimit", limitArray);
				if (limitArray.length > vl.options.num) {
					storage.set("isLimit", "islimited");
					window.location.href = vl.options.url;
					return;
				}
			} else {
				limitArray.push({
					time: now
				})
				storage.set("vLimit", limitArray);
			}
		}
	}
	$.visitLimit = function(options) {
		var visitLimit = new VISTILIMIT(options);
		return visitLimit;
	}
})(window, jQuery); /*msgdb.js 所有信息的记录 langTip dialogue*/
(function(window, $, undefined) {
	var MSGDB = function(options) {
			this.defaults = {}, this.options = $.extend({}, this.defaults, options);
		};
	MSGDB.prototype = {
		allDB: {},
		id: 0,
		db: {},
		add: function(json) {
			var md = this;
			var item = {
				msgId: !! json.msgId ? json.msgId : "",
				type: json.type,
				/*type:"visitor","client","robot","system"*/
				content: json.content,
				/*内容*/
				time: !! json.date ? json.date : new Date().getTime(),
				isRevoke: json.isRevoke?json.isRevoke:false,
				/*是否已撤回*/
				hasChecked: json.hasChecked?json.hasChecked:false,
				/*是否经过超时判断*/
				status: !! json.status ? json.status : 0,
				/*是否保存到历史记录*/
				saveIn: !! json.saveIn ? json.saveIn : 0,
				/*是否是历史记录中的数据,0当前,1历史*/
				received: 0 ,/*0未读,1已读,2未读超时*/
				checkSend: 0/*0发送,1已发送,2未发送*/
				/*是否经过超时判断*/
			}
			md.db[md.id] = item;
			md.allDB[md.id] = item;
			md.id++;
		},
		clear: function() {
			var md = this;
			md.db = {};
		},
		last: function() {
			var md = this;
			var last = 0;
			for (var i in md.db) {
				if (!isNaN(Number(i)) && Number(last) <= Number(i)) {
					last = i;
				}
			}
			return last;
		},
		setKey: function(iKey, key, value) {
			var md = this;
			for (var i in md.db) {
				if (iKey == i) {
					md.db[i][key] = value;
					md.allDB[i][key] = value;
				}
			}
		},
		set: function(msgId, key, value) {
			var md = this;
			for (var i in md.db) {
				if (md.db[i].msgId == msgId) {
					md.db[i][key] = value;
					md.allDB[i][key] = value;
				}
			}
		},
		get: function(msgId) {
			var md = this;
			for (var i in md.db) {
				if (md.db[i].msgId == msgId) {
					return md.db[i];
				}
			}
			return ;
		},
		getAll: function() {
			return this.db;
		}
	};
	$.msgdb = function(options) {
		var msgdb = new MSGDB(options);
		return msgdb;
	}
})(window, jQuery);

/*monitor.js 访客监控*/
(function(window, $, undefined) {

	var MONITOR = function(options) {
			this.defaults = {
				userDatas: null,
				storage: null
			}, this.options = $.extend({}, this.defaults, options)
		}
	MONITOR.prototype = {
		init: function(msg) {
			var now = nowtime.getTime();
			var mo = this;
			var storage = mo.options.storage;
			var ncVisitor = !! storage.get("ncVisitor") ? storage.get("ncVisitor") : {};
			var t = mo.getTrace()
			var trace = t.result;
			var info = mo.getInfo();
			storage.set("visitorId", info.visitorId);
			storage.set("visitorName", info.visitorName);
			info = mo.changeFirstTime(info, trace);
			ncVisitor["trace"] = trace;
			ncVisitor["info"] = info;
			storage.set("ncVisitor", ncVisitor);
			var i = info;
			if (now - info.lastTime > 10 * 60 * 1000 || !t.hasVal) {
				i["trace"] = [t.item];
			} else {
				i["trace"] = [];
			}
			$.ajax({
				url: baseUrl + '/visitorMonitor.do',
				type: 'get',
				dataType: 'jsonp',
				data: {
					method: 'setVisitorMonitor',
					monitorInfo: encodeURIComponent(JSON.stringify(i))
				}
			})
		},
		changeFirstTime: function(info, trace) {
			var item = info;
			var firstTime = item.firstTime;
			var time;
			for (var i in trace) {
				if (!time || time > trace[i].firstInTime) {
					if (!time || new Date(trace[i].firstInTime).Format("yyyy-mm-dd") == nowtime.Format("yyyy-mm-dd")) {
						time = trace[i].firstInTime;
					}
				}
			}
			item.firstTime = !! time ? time : firstTime;
			if(new Date(item.firstTime).Format("yyyy-mm-dd")!=nowtime.Format("yyyy-mm-dd")){
				item.firstTime = item.lastTime;
			}
			return item;
		},
		get: function() {
			var storage = mo.options.storage;
			var route = storage.get("route");
			return route;
		},
		getInfo: function() {
			var mo = this;
			var storage = mo.options.storage;
			var userDatas = mo.options.userDatas;
			var info = userDatas.getJsonStr();
			var allTime = mo.getAllTime(info);
			info.firstTime = allTime.firstTime;
			info.lastTime = allTime.lastTime;
			info.status = "broswer";
			return info;
		},
		getAllTime: function(info) {
			var now = nowtime.getTime();
			return {
				firstTime: ( !! info && !! info.firstTime) ? info.firstTime : now,
				lastTime: now
			}
		},
		getTrace: function() {
			var now = nowtime.getTime();
			var mo = this;
			var storage = mo.options.storage;
			var ncVisitor = storage.get("ncVisitor");
			var route = !! ncVisitor ? ncVisitor.trace : null;
			var r = [];
			var item = null;
			var hasVal = false;
			//记录进入时间(第一次)去重
			if (!route) {
				item = {
					url: location.href,
					firstInTime: now,
					inTime: now,
					title: $("title").html()
				}
				r.push(item);
			} else {
				for (var i in route) {
					if ( !! route[i]) {
						var items = route[i];
						if (decodeURIComponent(items.url) == location.href) {
							hasVal = true;
							items.inTime = now;
							item = items;
						}
						r.push(items);
					}
				}
				if (!hasVal) {
					item = {
						url: location.href,
						firstInTime: now,
						inTime: now,
						title: $("title").html()
					}
					r.push(item);
				}
			}
			if (r.length > 10) {
				r = r.sort(function(a, b) {
					return a.inTime < b.inTime
				});
				r.pop();
			}
			r = r.sort(function(a, b) {
				return a.firstInTime < b.firstInTime
			});

			return {
				item: item,
				result: r,
				hasVal: hasVal
			}
		}
	}
	$.monitor = function(options) {
		var monitor = new MONITOR(options);
		monitor.init();
		return monitor;
	}
})(window, jQuery); /*jquery.form.js*/
(function(factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory)
	} else {
		factory((typeof(jQuery) != 'undefined') ? jQuery : window.Zepto)
	}
}(function($) {
	"use strict";
	var feature = {};
	feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
	feature.formdata = window.FormData !== undefined;
	var hasProp = !! $.fn.prop;
	$.fn.attr2 = function() {
		if (!hasProp) {
			return this.attr.apply(this, arguments)
		}
		var val = this.prop.apply(this, arguments);
		if ((val && val.jquery) || typeof val === 'string') {
			return val
		}
		return this.attr.apply(this, arguments)
	};
	$.fn.ajaxSubmit = function(options) {
		if (!this.length) {
			log('ajaxSubmit: skipping submit process - no element selected');
			return this
		}
		var method, action, url, $form = this;
		if (typeof options == 'function') {
			options = {
				success: options
			}
		} else if (options === undefined) {
			options = {}
		}
		method = options.type || this.attr2('method');
		action = options.url || this.attr2('action');
		url = (typeof action === 'string') ? $.trim(action) : '';
		url = url || window.location.href || '';
		if (url) {
			url = (url.match(/^([^#]+)/) || [])[1]
		}
		options = $.extend(true, {
			url: url,
			success: $.ajaxSettings.success,
			type: method || $.ajaxSettings.type,
			iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
		}, options);
		var veto = {};
		this.trigger('form-pre-serialize', [this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
			return this
		}
		if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSerialize callback');
			return this
		}
		var traditional = options.traditional;
		if (traditional === undefined) {
			traditional = $.ajaxSettings.traditional
		}
		var elements = [];
		var qx, a = this.formToArray(options.semantic, elements);
		if (options.data) {
			options.extraData = options.data;
			qx = $.param(options.data, traditional)
		}
		if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSubmit callback');
			return this
		}
		this.trigger('form-submit-validate', [a, this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
			return this
		}
		var q = $.param(a, traditional);
		if (qx) {
			q = (q ? (q + '&' + qx) : qx)
		}
		if (options.type.toUpperCase() == 'GET') {
			options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
			options.data = null
		} else {
			options.data = q
		}
		var callbacks = [];
		if (options.resetForm) {
			callbacks.push(function() {
				$form.resetForm()
			})
		}
		if (options.clearForm) {
			callbacks.push(function() {
				$form.clearForm(options.includeHidden)
			})
		}
		if (!options.dataType && options.target) {
			var oldSuccess = options.success ||
			function() {};
			callbacks.push(function(data) {
				var fn = options.replaceTarget ? 'replaceWith' : 'html';
				$(options.target)[fn](data).each(oldSuccess, arguments)
			})
		} else if (options.success) {
			callbacks.push(options.success)
		}
		options.success = function(data, status, xhr) {
			var context = options.context || this;
			for (var i = 0, max = callbacks.length; i < max; i++) {
				callbacks[i].apply(context, [data, status, xhr || $form, $form])
			}
		};
		if (options.error) {
			var oldError = options.error;
			options.error = function(xhr, status, error) {
				var context = options.context || this;
				oldError.apply(context, [xhr, status, error, $form])
			}
		}
		if (options.complete) {
			var oldComplete = options.complete;
			options.complete = function(xhr, status) {
				var context = options.context || this;
				oldComplete.apply(context, [xhr, status, $form])
			}
		}
		var fileInputs = $('input[type=file]:enabled', this).filter(function() {
			return $(this).val() !== ''
		});
		var hasFileInputs = fileInputs.length > 0;
		var mp = 'multipart/form-data';
		var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);
		var fileAPI = feature.fileapi && feature.formdata;
		log("fileAPI :" + fileAPI);
		var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;
		var jqxhr;
		if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
			if (options.closeKeepAlive) {
				$.get(options.closeKeepAlive, function() {
					jqxhr = fileUploadIframe(a)
				})
			} else {
				jqxhr = fileUploadIframe(a)
			}
		} else if ((hasFileInputs || multipart) && fileAPI) {
			jqxhr = fileUploadXhr(a)
		} else {
			jqxhr = $.ajax(options)
		}
		$form.removeData('jqxhr').data('jqxhr', jqxhr);
		for (var k = 0; k < elements.length; k++) {
			elements[k] = null
		}
		this.trigger('form-submit-notify', [this, options]);
		return this;

		function deepSerialize(extraData) {
			var serialized = $.param(extraData, options.traditional).split('&');
			var len = serialized.length;
			var result = [];
			var i, part;
			for (i = 0; i < len; i++) {
				serialized[i] = serialized[i].replace(/\+/g, ' ');
				part = serialized[i].split('=');
				result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])])
			}
			return result
		}
		function fileUploadXhr(a) {
			var formdata = new FormData();
			for (var i = 0; i < a.length; i++) {
				formdata.append(a[i].name, a[i].value)
			}
			if (options.extraData) {
				var serializedData = deepSerialize(options.extraData);
				for (i = 0; i < serializedData.length; i++) {
					if (serializedData[i]) {
						formdata.append(serializedData[i][0], serializedData[i][1])
					}
				}
			}
			options.data = null;
			var s = $.extend(true, {}, $.ajaxSettings, options, {
				contentType: false,
				processData: false,
				cache: false,
				type: method || 'POST'
			});
			if (options.uploadProgress) {
				s.xhr = function() {
					var xhr = $.ajaxSettings.xhr();
					if (xhr.upload) {
						xhr.upload.addEventListener('progress', function(event) {
							var percent = 0;
							var position = event.loaded || event.position;
							var total = event.total;
							if (event.lengthComputable) {
								percent = Math.ceil(position / total * 100)
							}
							options.uploadProgress(event, position, total, percent)
						}, false)
					}
					return xhr
				}
			}
			s.data = null;
			var beforeSend = s.beforeSend;
			s.beforeSend = function(xhr, o) {
				if (options.formData) {
					o.data = options.formData
				} else {
					o.data = formdata
				}
				if (beforeSend) {
					beforeSend.call(this, xhr, o)
				}
			};
			return $.ajax(s)
		}
		function fileUploadIframe(a) {
			var form = $form[0],
				el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
			var deferred = $.Deferred();
			deferred.abort = function(status) {
				xhr.abort(status)
			};
			if (a) {
				for (i = 0; i < elements.length; i++) {
					el = $(elements[i]);
					if (hasProp) {
						el.prop('disabled', false)
					} else {
						el.removeAttr('disabled')
					}
				}
			}
			s = $.extend(true, {}, $.ajaxSettings, options);
			s.context = s.context || s;
			id = 'jqFormIO' + (new Date().getTime());
			if (s.iframeTarget) {
				$io = $(s.iframeTarget);
				n = $io.attr2('name');
				if (!n) {
					$io.attr2('name', id)
				} else {
					id = n
				}
			} else {
				$io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />');
				$io.css({
					position: 'absolute',
					top: '-1000px',
					left: '-1000px'
				})
			}
			io = $io[0];
			xhr = {
				aborted: 0,
				responseText: null,
				responseXML: null,
				status: 0,
				statusText: 'n/a',
				getAllResponseHeaders: function() {},
				getResponseHeader: function() {},
				setRequestHeader: function() {},
				abort: function(status) {
					var e = (status === 'timeout' ? 'timeout' : 'aborted');
					log('aborting upload... ' + e);
					this.aborted = 1;
					try {
						if (io.contentWindow.document.execCommand) {
							io.contentWindow.document.execCommand('Stop')
						}
					} catch (ignore) {}
					$io.attr('src', s.iframeSrc);
					xhr.error = e;
					if (s.error) {
						s.error.call(s.context, xhr, e, status)
					}
					if (g) {
						$.event.trigger("ajaxError", [xhr, s, e])
					}
					if (s.complete) {
						s.complete.call(s.context, xhr, e)
					}
				}
			};
			g = s.global;
			if (g && 0 === $.active++) {
				$.event.trigger("ajaxStart")
			}
			if (g) {
				$.event.trigger("ajaxSend", [xhr, s])
			}
			if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
				if (s.global) {
					$.active--
				}
				deferred.reject();
				return deferred
			}
			if (xhr.aborted) {
				deferred.reject();
				return deferred
			}
			sub = form.clk;
			if (sub) {
				n = sub.name;
				if (n && !sub.disabled) {
					s.extraData = s.extraData || {};
					s.extraData[n] = sub.value;
					if (sub.type == "image") {
						s.extraData[n + '.x'] = form.clk_x;
						s.extraData[n + '.y'] = form.clk_y
					}
				}
			}
			var CLIENT_TIMEOUT_ABORT = 1;
			var SERVER_ABORT = 2;

			function getDoc(frame) {
				var doc = null;
				try {
					if (frame.contentWindow) {
						doc = frame.contentWindow.document
					}
				} catch (err) {
					log('cannot get iframe.contentWindow document: ' + err)
				}
				if (doc) {
					return doc
				}
				try {
					doc = frame.contentDocument ? frame.contentDocument : frame.document
				} catch (err) {
					log('cannot get iframe.contentDocument: ' + err);
					doc = frame.document
				}
				return doc
			}
			var csrf_token = $('meta[name=csrf-token]').attr('content');
			var csrf_param = $('meta[name=csrf-param]').attr('content');
			if (csrf_param && csrf_token) {
				s.extraData = s.extraData || {};
				s.extraData[csrf_param] = csrf_token
			}
			function doSubmit() {
				var t = $form.attr2('target'),
					a = $form.attr2('action'),
					mp = 'multipart/form-data',
					et = $form.attr('enctype') || $form.attr('encoding') || mp;
				form.setAttribute('target', id);
				if (!method || /post/i.test(method)) {
					form.setAttribute('method', 'POST')
				}
				if (a != s.url) {
					form.setAttribute('action', s.url)
				}
				if (!s.skipEncodingOverride && (!method || /post/i.test(method))) {
					$form.attr({
						encoding: 'multipart/form-data',
						enctype: 'multipart/form-data'
					})
				}
				if (s.timeout) {
					timeoutHandle = setTimeout(function() {
						timedOut = true;
						cb(CLIENT_TIMEOUT_ABORT)
					}, s.timeout)
				}
				function checkState() {
					try {
						var state = getDoc(io).readyState;
						log('state = ' + state);
						if (state && state.toLowerCase() == 'uninitialized') {
							setTimeout(checkState, 50)
						}
					} catch (e) {
						log('Server abort: ', e, ' (', e.name, ')');
						cb(SERVER_ABORT);
						if (timeoutHandle) {
							clearTimeout(timeoutHandle)
						}
						timeoutHandle = undefined
					}
				}
				var extraInputs = [];
				try {
					if (s.extraData) {
						for (var n in s.extraData) {
							if (s.extraData.hasOwnProperty(n)) {
								if ($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
									extraInputs.push($('<input type="hidden" name="' + s.extraData[n].name + '">').val(s.extraData[n].value).appendTo(form)[0])
								} else {
									extraInputs.push($('<input type="hidden" name="' + n + '">').val(s.extraData[n]).appendTo(form)[0])
								}
							}
						}
					}
					if (!s.iframeTarget) {
						$io.appendTo('body')
					}
					if (io.attachEvent) {
						io.attachEvent('onload', cb)
					} else {
						io.addEventListener('load', cb, false)
					}
					setTimeout(checkState, 15);
					try {
						form.submit()
					} catch (err) {
						var submitFn = document.createElement('form').submit;
						submitFn.apply(form)
					}
				} finally {
					form.setAttribute('action', a);
					form.setAttribute('enctype', et);
					if (t) {
						form.setAttribute('target', t)
					} else {
						$form.removeAttr('target')
					}
					$(extraInputs).remove()
				}
			}
			if (s.forceSync) {
				doSubmit()
			} else {
				setTimeout(doSubmit, 10)
			}
			var data, doc, domCheckCount = 50,
				callbackProcessed;

			function cb(e) {
				if (xhr.aborted || callbackProcessed) {
					return
				}
				doc = getDoc(io);
				if (!doc) {
					log('cannot access response document');
					e = SERVER_ABORT
				}
				if (e === CLIENT_TIMEOUT_ABORT && xhr) {
					xhr.abort('timeout');
					deferred.reject(xhr, 'timeout');
					return
				} else if (e == SERVER_ABORT && xhr) {
					xhr.abort('server abort');
					deferred.reject(xhr, 'error', 'server abort');
					return
				}
				if (!doc || doc.location.href == s.iframeSrc) {
					if (!timedOut) {
						return
					}
				}
				if (io.detachEvent) {
					io.detachEvent('onload', cb)
				} else {
					io.removeEventListener('load', cb, false)
				}
				var status = 'success',
					errMsg;
				try {
					if (timedOut) {
						throw 'timeout';
					}
					var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
					log('isXml=' + isXml);
					if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
						if (--domCheckCount) {
							log('requeing onLoad callback, DOM not available');
							setTimeout(cb, 250);
							return
						}
					}
					var docRoot = doc.body ? doc.body : doc.documentElement;
					xhr.responseText = docRoot ? docRoot.innerHTML : null;
					xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
					if (isXml) {
						s.dataType = 'xml'
					}
					xhr.getResponseHeader = function(header) {
						var headers = {
							'content-type': s.dataType
						};
						return headers[header.toLowerCase()]
					};
					if (docRoot) {
						xhr.status = Number(docRoot.getAttribute('status')) || xhr.status;
						xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText
					}
					var dt = (s.dataType || '').toLowerCase();
					var scr = /(json|script|text)/.test(dt);
					if (scr || s.textarea) {
						var ta = doc.getElementsByTagName('textarea')[0];
						if (ta) {
							xhr.responseText = ta.value;
							xhr.status = Number(ta.getAttribute('status')) || xhr.status;
							xhr.statusText = ta.getAttribute('statusText') || xhr.statusText
						} else if (scr) {
							var pre = doc.getElementsByTagName('pre')[0];
							var b = doc.getElementsByTagName('body')[0];
							if (pre) {
								xhr.responseText = pre.textContent ? pre.textContent : pre.innerText
							} else if (b) {
								xhr.responseText = b.textContent ? b.textContent : b.innerText
							}
						}
					} else if (dt == 'xml' && !xhr.responseXML && xhr.responseText) {
						xhr.responseXML = toXml(xhr.responseText)
					}
					try {
						data = httpData(xhr, dt, s)
					} catch (err) {
						status = 'parsererror';
						xhr.error = errMsg = (err || status)
					}
				} catch (err) {
					log('error caught: ', err);
					status = 'error';
					xhr.error = errMsg = (err || status)
				}
				if (xhr.aborted) {
					log('upload aborted');
					status = null
				}
				if (xhr.status) {
					status = (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) ? 'success' : 'error'
				}
				if (status === 'success') {
					if (s.success) {
						s.success.call(s.context, data, 'success', xhr)
					}
					deferred.resolve(xhr.responseText, 'success', xhr);
					if (g) {
						$.event.trigger("ajaxSuccess", [xhr, s])
					}
				} else if (status) {
					if (errMsg === undefined) {
						errMsg = xhr.statusText
					}
					if (s.error) {
						s.error.call(s.context, xhr, status, errMsg)
					}
					deferred.reject(xhr, 'error', errMsg);
					if (g) {
						$.event.trigger("ajaxError", [xhr, s, errMsg])
					}
				}
				if (g) {
					$.event.trigger("ajaxComplete", [xhr, s])
				}
				if (g && !--$.active) {
					$.event.trigger("ajaxStop")
				}
				if (s.complete) {
					s.complete.call(s.context, xhr, status)
				}
				callbackProcessed = true;
				if (s.timeout) {
					clearTimeout(timeoutHandle)
				}
				setTimeout(function() {
					if (!s.iframeTarget) {
						$io.remove()
					} else {
						$io.attr('src', s.iframeSrc)
					}
					xhr.responseXML = null
				}, 100)
			}
			var toXml = $.parseXML ||
			function(s, doc) {
				if (window.ActiveXObject) {
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = 'false';
					doc.loadXML(s)
				} else {
					doc = (new DOMParser()).parseFromString(s, 'text/xml')
				}
				return (doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror') ? doc : null
			};
			var parseJSON = $.parseJSON ||
			function(s) {
				return window['eval']('(' + s + ')')
			};
			var httpData = function(xhr, type, s) {
					var ct = xhr.getResponseHeader('content-type') || '',
						xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
						data = xml ? xhr.responseXML : xhr.responseText;
					if (xml && data.documentElement.nodeName === 'parsererror') {
						if ($.error) {
							$.error('parsererror')
						}
					}
					if (s && s.dataFilter) {
						data = s.dataFilter(data, type)
					}
					if (typeof data === 'string') {
						if (type === 'json' || !type && ct.indexOf('json') >= 0) {
							data = parseJSON(data)
						} else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
							$.globalEval(data)
						}
					}
					return data
				};
			return deferred
		}
	};
	$.fn.ajaxForm = function(options) {
		options = options || {};
		options.delegation = options.delegation && $.isFunction($.fn.on);
		if (!options.delegation && this.length === 0) {
			var o = {
				s: this.selector,
				c: this.context
			};
			if (!$.isReady && o.s) {
				log('DOM not ready, queuing ajaxForm');
				$(function() {
					$(o.s, o.c).ajaxForm(options)
				});
				return this
			}
			log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
			return this
		}
		if (options.delegation) {
			$(document).off('submit.form-plugin', this.selector, doAjaxSubmit).off('click.form-plugin', this.selector, captureSubmittingElement).on('submit.form-plugin', this.selector, options, doAjaxSubmit).on('click.form-plugin', this.selector, options, captureSubmittingElement);
			return this
		}
		return this.ajaxFormUnbind().bind('submit.form-plugin', options, doAjaxSubmit).bind('click.form-plugin', options, captureSubmittingElement)
	};

	function doAjaxSubmit(e) {
		var options = e.data;
		if (!e.isDefaultPrevented()) {
			e.preventDefault();
			$(e.target).ajaxSubmit(options)
		}
	}
	function captureSubmittingElement(e) {
		var target = e.target;
		var $el = $(target);
		if (!($el.is("[type=submit],[type=image]"))) {
			var t = $el.closest('[type=submit]');
			if (t.length === 0) {
				return
			}
			target = t[0]
		}
		var form = this;
		form.clk = target;
		if (target.type == 'image') {
			if (e.offsetX !== undefined) {
				form.clk_x = e.offsetX;
				form.clk_y = e.offsetY
			} else if (typeof $.fn.offset == 'function') {
				var offset = $el.offset();
				form.clk_x = e.pageX - offset.left;
				form.clk_y = e.pageY - offset.top
			} else {
				form.clk_x = e.pageX - target.offsetLeft;
				form.clk_y = e.pageY - target.offsetTop
			}
		}
		setTimeout(function() {
			form.clk = form.clk_x = form.clk_y = null
		}, 100)
	}
	$.fn.ajaxFormUnbind = function() {
		return this.unbind('submit.form-plugin click.form-plugin')
	};
	$.fn.formToArray = function(semantic, elements) {
		var a = [];
		if (this.length === 0) {
			return a
		}
		var form = this[0];
		var formId = this.attr('id');
		var els = semantic ? form.getElementsByTagName('*') : form.elements;
		var els2;
		if (els && !/MSIE [678]/.test(navigator.userAgent)) {
			els = $(els).get()
		}
		if (formId) {
			els2 = $(':input[form="' + formId + '"]').get();
			if (els2.length) {
				els = (els || []).concat(els2)
			}
		}
		if (!els || !els.length) {
			return a
		}
		var i, j, n, v, el, max, jmax;
		for (i = 0, max = els.length; i < max; i++) {
			el = els[i];
			n = el.name;
			if (!n || el.disabled) {
				continue
			}
			if (semantic && form.clk && el.type == "image") {
				if (form.clk == el) {
					a.push({
						name: n,
						value: $(el).val(),
						type: el.type
					});
					a.push({
						name: n + '.x',
						value: form.clk_x
					}, {
						name: n + '.y',
						value: form.clk_y
					})
				}
				continue
			}
			v = $.fieldValue(el, true);
			if (v && v.constructor == Array) {
				if (elements) {
					elements.push(el)
				}
				for (j = 0, jmax = v.length; j < jmax; j++) {
					a.push({
						name: n,
						value: v[j]
					})
				}
			} else if (feature.fileapi && el.type == 'file') {
				if (elements) {
					elements.push(el)
				}
				var files = el.files;
				if (files.length) {
					for (j = 0; j < files.length; j++) {
						a.push({
							name: n,
							value: files[j],
							type: el.type
						})
					}
				} else {
					a.push({
						name: n,
						value: '',
						type: el.type
					})
				}
			} else if (v !== null && typeof v != 'undefined') {
				if (elements) {
					elements.push(el)
				}
				a.push({
					name: n,
					value: v,
					type: el.type,
					required: el.required
				})
			}
		}
		if (!semantic && form.clk) {
			var $input = $(form.clk),
				input = $input[0];
			n = input.name;
			if (n && !input.disabled && input.type == 'image') {
				a.push({
					name: n,
					value: $input.val()
				});
				a.push({
					name: n + '.x',
					value: form.clk_x
				}, {
					name: n + '.y',
					value: form.clk_y
				})
			}
		}
		return a
	};
	$.fn.formSerialize = function(semantic) {
		return $.param(this.formToArray(semantic))
	};
	$.fn.fieldSerialize = function(successful) {
		var a = [];
		this.each(function() {
			var n = this.name;
			if (!n) {
				return
			}
			var v = $.fieldValue(this, successful);
			if (v && v.constructor == Array) {
				for (var i = 0, max = v.length; i < max; i++) {
					a.push({
						name: n,
						value: v[i]
					})
				}
			} else if (v !== null && typeof v != 'undefined') {
				a.push({
					name: this.name,
					value: v
				})
			}
		});
		return $.param(a)
	};
	$.fn.fieldValue = function(successful) {
		for (var val = [], i = 0, max = this.length; i < max; i++) {
			var el = this[i];
			var v = $.fieldValue(el, successful);
			if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
				continue
			}
			if (v.constructor == Array) {
				$.merge(val, v)
			} else {
				val.push(v)
			}
		}
		return val
	};
	$.fieldValue = function(el, successful) {
		var n = el.name,
			t = el.type,
			tag = el.tagName.toLowerCase();
		if (successful === undefined) {
			successful = true
		}
		if (successful && (!n || el.disabled || t == 'reset' || t == 'button' || (t == 'checkbox' || t == 'radio') && !el.checked || (t == 'submit' || t == 'image') && el.form && el.form.clk != el || tag == 'select' && el.selectedIndex == -1)) {
			return null
		}
		if (tag == 'select') {
			var index = el.selectedIndex;
			if (index < 0) {
				return null
			}
			var a = [],
				ops = el.options;
			var one = (t == 'select-one');
			var max = (one ? index + 1 : ops.length);
			for (var i = (one ? index : 0); i < max; i++) {
				var op = ops[i];
				if (op.selected) {
					var v = op.value;
					if (!v) {
						v = (op.attributes && op.attributes.value && !(op.attributes.value.specified)) ? op.text : op.value
					}
					if (one) {
						return v
					}
					a.push(v)
				}
			}
			return a
		}
		return $(el).val()
	};
	$.fn.clearForm = function(includeHidden) {
		return this.each(function() {
			$('input,select,textarea', this).clearFields(includeHidden)
		})
	};
	$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;
		return this.each(function() {
			var t = this.type,
				tag = this.tagName.toLowerCase();
			if (re.test(t) || tag == 'textarea') {
				this.value = ''
			} else if (t == 'checkbox' || t == 'radio') {
				this.checked = false
			} else if (tag == 'select') {
				this.selectedIndex = -1
			} else if (t == "file") {
				if (/MSIE/.test(navigator.userAgent)) {
					$(this).replaceWith($(this).clone(true))
				} else {
					$(this).val('')
				}
			} else if (includeHidden) {
				if ((includeHidden === true && /hidden/.test(t)) || (typeof includeHidden == 'string' && $(this).is(includeHidden))) {
					this.value = ''
				}
			}
		})
	};
	$.fn.resetForm = function() {
		return this.each(function() {
			if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
				this.reset()
			}
		})
	};
	$.fn.enable = function(b) {
		if (b === undefined) {
			b = true
		}
		return this.each(function() {
			this.disabled = !b
		})
	};
	$.fn.selected = function(select) {
		if (select === undefined) {
			select = true
		}
		return this.each(function() {
			var t = this.type;
			if (t == 'checkbox' || t == 'radio') {
				this.checked = select
			} else if (this.tagName.toLowerCase() == 'option') {
				var $sel = $(this).parent('select');
				if (select && $sel[0] && $sel[0].type == 'select-one') {
					$sel.find('option').selected(false)
				}
				this.selected = select
			}
		})
	};
	$.fn.ajaxSubmit.debug = false;

	function log() {
		if (!$.fn.ajaxSubmit.debug) {
			return
		}
		var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');
		if (window.console && window.console.log) {
			window.console.log(msg)
		} else if (window.opera && window.opera.postError) {
			window.opera.postError(msg)
		}
	}
}));
//依赖于/js/jquery.form.js
(function(window, $, undefined) {
	"use strict";
	var UPLOADFILE = function(el, options) {
			this.$el = el, this.defaults = {
				other: function(up, url) {},
				uploadType: "all",
				size: 0,
				inputImage: false,
				callback: function(url) {},
				error: function(type) {}
			}, this.options = $.extend({}, this.defaults, options);
		}
	UPLOADFILE.prototype = {
    errorCodes: {
      E001:'身份认证错误',
      E002:'上传文件类型错误，只允许上传.jpg .jpeg .bmp .png .doc .docx .xls .xlsx .pdf .txt .amr .ppt .pptx .csv',
      E003:''
    },
    init: function() {
			var up = this;
			var uploadType = this.options.uploadType;
			var size = this.options.size;
			up.create();
		},
		create: function() {
			var up = this;
			var uploadType = this.options.uploadType;
			var size = this.options.size;
			var e = up.$el;
			if (up.$el.find(".fileup").length > 0) {
				up.$el.find(".fileup").remove();
			};
			var url = "/any800/echatManager.do?method=uploadFile&fromType=visitor&chatId="+ucc.chatID;
			var t = "*/*"
			if (up.options.inputImage) t = "image/*";
			var str = '<form class="fileup" contentType="text/html"   method="post"  enctype="multipart/form-data" action="' + url + '"><input multiple="false" type="file" name="uploadField" accept="' + t + '" /></form>';
			$(e).append(str);
			var $input = up.$el.find(".fileup").find("input:file");
			$input.on("change", function() {
				var file = $input[0];
				var filePath = file.value;
				var fileExt = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
				if (!up.checkType(fileExt, uploadType)) {
					up.create();
					up.options.error("type");
					return;
				} else if (file.files && !! size && size < file.files[0].size) {
					up.create();
					up.options.error("size");
					return;
				};
				up.options.other(up, file.files ? file.files[0].name : filePath, new Date().getTime());
			});
		},
		submit: function(time, key) {
			var up = this;
			if (up.$el.find(".fileup").length == 0) return;
			up.$el.find(".fileup").ajaxSubmit(function(msg) {
			  var msgs = JSON.parse(msg)
        if (msgs.success) {
          up.options.callback(msgs.content,time,key)
        } else {
          up.options.error('other',time,msgs.errorMessage,key)
        }
				up.create();
			});
		},
		checkType: function(fileExt, uploadType) {
			fileExt = fileExt.toLowerCase();
			if (uploadType == "all") {
				return fileExt.match(/.gif|.jpg|.jpeg|.bmp|.png|.doc|.docx|.xls|.xlsx|.pdf|.txt/i);
			} else {
				var types = uploadType.split(";");
				if (types.length > 0) {
					for (var i in types) {
						if (types[i] == "image") {
							if (fileExt.match(/.gif|.jpg|.jpeg|.bmp|.png/i)) {
								return true;
							}
						} else if (types[i] == "doc") {
							if (fileExt.match(/.doc|.docx/i)) {
								return true;
							}
						} else if (types[i] == "xls") {
							if (fileExt.match(/.xls|.xlsx/i)) {
								return true;
							}
						} else if (types[i] == "pdf") {
							if (fileExt.match(/.pdf/i)) {
								return true;
							}
						}else if(types[i]=="txt"){
	    					if(fileExt.match(/.txt/i)){
	    						return true;
	    					}
	    				}
					}
					return false;
				}
			}
		}
	}
	$.fn.uploadFile = function(options) {
		var uploadFile = new UPLOADFILE($(this), options);
		uploadFile.init();
		return uploadFile;
	}
})(window, jQuery);
//localHistory需要在生成chatId时使用
(function(window, $, undefined) {
	var HISTORY = function(options) {
			this.defaults = {
				storage: null,
				loadMore:function(array){
					
				}
			};
			this.options = $.extend({}, this.defaults, options);
		};
	HISTORY.prototype = {
		current: [],
		history: [],
		time: 0,
		init: function() {
			this.current = !! this.options.storage.get("localCur") ? this.options.storage.get("localCur") : [];
			this.history = this.options.storage.get("localHis") ? this.options.storage.get("localHis") : [];
			this.time = this.options.storage.get("localTim") ? this.options.storage.get("localTim") : new Date().getTime();
			if(this.history.length>0){
				this.lastChat = this.history.length-1;
				this.lastId = this.history[this.lastChat].data.length-1;
			}
		},
		setCurrent: function(db) {
			var dia = [];
			for (var i in db) {
				if (!isNaN(Number(i))) {
					var item = db[i];
					if (item.saveIn == 0 && !item.isRevoke && item.type != "system" && item.status != 1  && item.checkSend != 2) {
						var opName = item.type == "client"?dialogue.getAttr("operatorName"):item.type == "visitor"?userDatas.getVisitorInfo().visitorName:item.type == "robot"?"机器人":"";
						dia.push({
							from: item.type,
							content: item.content,
							time: item.time,
							opName:opName
						});
					}
				}
			}
			this.options.storage.set("localTim", this.time);
			this.options.storage.set("localCur", dia);
			this.current = dia;
		},
		saveCurrent: function() {
			if (this.current.length > 0) {
			  if(this.history.length>0 && this.time==this.history[this.history.length-1].time){
			    return;
			  }
				this.history.push({
					data: this.current,
					time: this.time
				});
				this.current = [];
				this.save();
			}
			this.time = new Date().getTime()
      this.options.storage.set("localTim", this.time)
		},
		save: function() {
			this.options.storage.set("localCur", this.current)
			this.options.storage.set("localHis", this.history)
		},
		lastId:0,
		lastChat:0,
		page:5,
		loadMore:function(){
			var array = [],i = 0,page = this.page;
			while (i<page){
				var item = this.preload(this.lastChat,this.lastId);
				if(item){
					array.push(item);
					if(item.type!="date"){
						i++;
					}
				}else{
					break;
				}
			};
			this.options.loadMore(array);
		},
		preload:function(lastChat,lastId){
			if(lastChat==-1){
				return "";
			}
			if(lastId==-1){
				this.lastChat = lastChat-1
				if(this.lastChat==-1){
					return "";
				}
				this.lastId = this.history[this.lastChat].data.length-1
				return {
					type:"date",
					time:this.history[this.lastChat].time
				};
			}
			var msg = this.history[this.lastChat].data[this.lastId];
			this.lastId = this.lastId-1;
			return msg;
		}
	}
	$.localHistory = function(options) {
		var history = new HISTORY(options);
		return history;
	}
})(window, jQuery); 
(function(window, $, undefined) {
	var CONFIRMBOX = function(options) {
			this.defaults = {
			};
			this.options = $.extend({}, this.defaults, options);
		};
	CONFIRMBOX.prototype = {
		defered: null,
		init: function() {
			var c =this;
			if($(".confirmBox").length>0){
				return;
			}
			$("body").append("<div class='confirmBox'><div class='body'><div class='title'></div><div class='rightBtn'></div><div class='wrongBtn'></div></div></div>")
			$(".confirmBox .rightBtn").on("click",function(){
				if(c.defered){
					c.defered.resolve(true);
				};
				$(".confirmBox").hide();
				c.defered = null;
			});
			$(".confirmBox .wrongBtn").on("click",function(){
				if(c.defered){
					c.defered.resolve(false);
				};
				$(".confirmBox").hide();
				c.defered = null;
			});
			$(".confirmBox").hide();
		},
		create:function(title,right,wrong){
			var c =this;
			right = right?right:"确定";
			wrong = wrong?wrong:"取消";
			$(".confirmBox").show();
			c.switchTitle(title,right,wrong);
			if(c.defered){
				c.defered.resolve(false);
			};
			c.defered = new $.Deferred();
			return c.defered.promise();
		},
		switchTitle:function(title,right,wrong){
			$(".confirmBox .title").html(title);
			$(".confirmBox .rightBtn").html(right);
			$(".confirmBox .wrongBtn").html(wrong);
			var h = $(".confirmBox").height()/2-$(".confirmBox .body").height()/2
			$(".confirmBox .body").css({
				marginTop:h
			})
		}
	}
	$.confirm = function(options) {
		var confirmBox = new CONFIRMBOX(options);
		confirmBox.init();
		return confirmBox;
	}
})(window, jQuery); 
/*http://www.9client.com/ 021-4008837939*/