(function(window, $, undefined) {
	var WEBSOCKET = function(options) {
			this.defaults = {
				path: "/any800/UccWebSocket/",
				visitorId: "",
				message: function(chatId, content) {

				},
				deal: function(type, chatId, json) {

				},
				connect:function(isConnect){
					
				},
				confirmSend:function(messageId){
					
				},
				leaveCover:function(){
				},
				open:function(){
				}
			}, this.options = $.extend({}, this.defaults, options)
		};
		var keepalive = {
		    pong:0,
		    sendTime:2,
		    checkTime:3,
		    warnTime:10,
		    reconnectTime:20,
		    connnectNumber:0,
		    connectTime:-1,
		    w:null,
			init:function(w){
				var m = this;
				m.w = w;
		    	if (this.interval) {
		           clearInterval(this.interval);
		        }
		    	m.check();
		    	this.interval = setInterval(function(){
		    	   m.check();
			    },this.checkTime*1000);
			},
			setPong:function(){
				this.pong = new Date().getTime();
			},
			check:function(){
				this.w.websocket.isConnect = true;
				if (navigator && navigator.onLine == false) {
					this.w.endTimeout()
					console.log("navigator offline");
					this.w.websocket.isConnect = false;
					return;
				}
				if (this.w&& this.w.websocket&&this.w.websocket.readyState == this.w.websocket.CLOSED){
					this.w.websocket.isConnect = false;
					this.w.endTimeout()
				}
			},
			setRate:function(){
				if (this.pong){
					var now = new Date().getTime();
					var delay = (now-this.pong)/1000;
					delay = Math.max(delay,20);
					this.reconnectTime = delay;
					this.warnTime = delay/2;
					storage.set("reconnectTime",delay);
				}
			},
			sendPing:function(){
				var m = new UccMessage({date: new Date().getTime(), chatId: '', type: 'PING'})
			    this.w.send(JSON.stringify(m))
			    this.ping = new Date().getTime();
			},
			end:function(){
				if (this.interval) {
			       clearInterval(this.interval);
			    }
				if (this.w.websocket.readyState !=this.w.websocket.CLOSED) {
			        this.w.websocket.close();
			    }
				this.connnectNumber++;
			},
			reconnect:function(){
				var isReconnect = false;
				if (this.connnectNumber<=this.connectTime){
					isReconnect = true;
					this.w.reconnect();
				}
				return isReconnect;
			}
		  };
	var UccMessage = function(messageJson) {
			var self = this;
			self.chatId = messageJson.chatID;
			self.type = messageJson.type ? messageJson.type : "VS_CHAT";
			self.content = JSON.stringify(new Message(messageJson.message));
			self.messageId = "Other" +messageJson.date;
			return self;
		};
	var UccQueue = function(messageJson) {
			var self = this;
			self.chatId = messageJson.chatID;
			self.type = messageJson.type ? messageJson.type : "VS_CHAT";
			self.content = (messageJson.message);
			self.messageId = "Other" +messageJson.date;
			return self;
		};
	var UccReceipts = function(messageId) {
			var self = this;
			self.type = "RECEIPTS";
			self.messageId = messageId;
			return self;
		};
	var Message = function(message){
		var self = this;
		self.msg = message;
		return self;
	}
	var dfd = new $.Deferred();
	WEBSOCKET.prototype = {
		isWork: false,
		isConnect:false,
		connectTimeout:null,
		websocket: null,
		keepAliveModel: true,
		init: function() {
			var w = this;
			var webSocketIsWork = storage.get("webSocketIsWork") 
//			if(typeof webSocketIsWork != "undefined"){
//			  w.isWork = webSocketIsWork
//			}else	
		  if ( !! window.WebSocket && window.WebSocket.prototype.send) {
				if (w.options.isWs == "true") {
					w.isWork = true;
				}
//				$.ajax({
//					url: "./echat.do",
//					data: {
//						method: "isWebSocketSupported"
//					},
//					async: false,
//					dataType: "json"
//				}).done(function(data) {
//					if (data.isWs == "true") {
//						w.isWork = true;
//					}
//				})
			};
			if(w.isWork){
				w.reconnectionFun();
				w.connect();
			}
			if(!w.isWork){
				return dfd.resolve(false);
			}else{
				return dfd.promise();
			}
		},
		reconnectionFun: function () {
	        var w = this
	        if (!w.isWork) return;
	        return window.WebSocket || window.MozWebSocket
	    },
		getWebSocketUri: function() { 	
			return (window.location.protocol == "http:" ? "ws://" : "wss://") + (document.location.hostname == "" ? "localhost" : document.location.hostname) +  (document.location.port == "" ? "" : (":"+document.location.port)) + this.options.path + this.options.visitorId;
		},
		connectType:0,
		connect: function() {
			var w = this;
			if (!w.isWork){
				return;
			}
			if(w.websocket && w.websocket.readyState!=WebSocket.CLOSED){
				return;
			};
			var websocket = window.WebSocket || window.MozWebSocket;
			w.websocket = new websocket(w.getWebSocketUri())
			w.websocket.onopen = w.doOpen;
			w.websocket.onerror = w.doError;
			w.websocket.onclose = w.doClose;
			w.websocket.onmessage = w.doMessage;
			w.connectType = 1;
		},
		doOpen: function() {
			var w = this;
			dfd.resolve(true);
			console.log('Info: WebSocket connection opened.');
			w.isConnect = true;
			webSocket.hasOpend = true;
			webSocket.startTimeout();
			webSocket.pingTime = 0;
			webSocket.pongTime = 0;
			webSocket.options.open();
			webSocket.connectType = 2;
			keepalive.connnectNumber = 0;
			storage.set("webSocketIsWork",true)
		},
		pingTime:0,
		pongTime:0,
		sendPing:function(){
			var w = this;
			if(w.pingTime && w.pongTime){
				if(w.pingTime-w.pongTime>3*1000){
					w.websocket.isConnect = false;
				}else{
					w.websocket.isConnect = true;
				}
			}
			w.pingTime = new Date().getTime();
			var m = new UccMessage({date:new Date().getTime(),chatId:"",type:"PING"});
			if(w.websocket){
				w.websocket.send(JSON.stringify(m));
			}
		},
		startTimeout:function(){
			if (!this.isWork) return;
			if (this.keepAliveModel) {
	      	  keepalive.init(this);
	      	  //return;
	        }
			var w = this;
			if (w.connectTimeout) {
				clearTimeout(w.connectTimeout);
			}
			w.connectTimeout = setTimeout(function(){
				//w.sendPing();
				w.options.connect(w.websocket.isConnect);
				if(!w.websocket.isConnect && w.connectType == 3){
		          if(w.websocket && w.websocket.readyState == WebSocket.CLOSED) {
		            w.connect()
		          };
		        }
				w.startTimeout();
			},1000)
		},
		endTimeout:function(){
			if (this.keepAliveModel) {
	            keepalive.end();
	        }
			var w = this;
			if (w.connectTimeout) {
				clearTimeout(w.connectTimeout);
			}
			w.connectTimeout = null;
		},
		startReconnect:function(){
      var w = this;
      if (w.reconnectTimeout) {
        clearTimeout(w.reconnectTimeout);
      }
      if (w.websocket && w.websocket.isConnect) {
        return
      }
      w.connect()
      w.reconnectTimeout = setTimeout(function () {
        w.startReconnect()
      }, 5000)
    },
		doError: function(evt) {
			var w = this;
			if(!webSocket.hasOpend){
				webSocket.isWork = false;
				storage.set("webSocketIsWork",false)
				dfd.resolve(false);
			}
			console.log('Info: WebSocket error. code=' + evt.code);
		},
		doClose: function(evt) {
			var w = this;
			if(webSocket.hasOpend){
				if(evt.code=="1004" || evt.code=="1006"){
					webSocket.options.leaveCover();
				}
				if (evt.code=="1006") {
				  webSocket.startReconnect()
				}
				console.log('Info: WebSocket closed. code=' + evt.code);
				console.log(evt);
				w.isConnect = false;
			}
			webSocket.connectType = 3;
		},
		doMessage: function(message) {
			keepalive.setPong();
			var w = this;
			console.log(message.data);
			var json = JSON.parse(message.data);
			var type = json.type;
			if(type=="WELCOME_TIPS"){
				var body = JSON.parse(json.content);
				webSocket.options.deal("CUTOMER_IS_INVITED", json.chatId, body.msg);
			}else if(type=="CHAT"){
				var body = JSON.parse(json.content);
				webSocket.options.message(json.chatId, body.msg,json.messageId);
			}else if(type=="CLOSE_ROOM"){
				var body = JSON.parse(json.content);
				if(body.msg=="operatorLeaving"){
					webSocket.options.deal("CLOSE", json.chatId, body.msg);		
				}else{
					webSocket.options.deal("CLOSE_CUSTOMER", json.chatId, body.msg);
				}
			}else if(type=="LEAVE_ROOM"){
				var body = JSON.parse(json.content);
				webSocket.options.deal("CLOSE_CUSTOMER", json.chatId, body.msg);	
			}else if (type == "RECEIPTS") {
				var body = JSON.parse(json.content);
				webSocket.options.deal("RECEIPT", json.chatId, body.targetMsgId);
			}else if (type == "OPERATION_TIPS") {
				var body = JSON.parse(json.content);
				webSocket.options.deal(type, json.chatId, {params:body});
			}else if (type == "REVOKE") {
				var body = JSON.parse(json.content);
				webSocket.options.deal("CUTOMER_REVOKE", json.chatId, json.messageId);
			}else if (type == "VS_QUEUE_INDEX"){
				var body = JSON.parse(json.content);
				webSocket.options.deal("VS_QUEUE_INDEX", json.chatId, body);
			}else  if(type == "PONG"){
				webSocket.pongTime = new Date().getTime();
			}else if(type == "DISCONNECTED_TIP"){
				var body = JSON.parse(json.content);
				webSocket.options.deal("CUSTOMER_NETWORK_INTERRUPT", json.chatId, body);
			}
			if (type != "PONG" && type != "RECEIPTS") {
				if (webSocket.websocket != null && json.messageId) {
					var m = new UccReceipts(json.messageId);
					webSocket.websocket.send(JSON.stringify(m));
				}
			}
		},
		close: function(message) {
			var w = this;
			if (w.websocket != null) {
				//w.websocket.close();
			}
		},
		send: function(message) {
			var w = this;
			if (w.websocket != null) {
				var m = new UccMessage(message);
				w.options.confirmSend(m.messageId);
				w.websocket.send(JSON.stringify(m));
			}
		},
		queue:function(message) {
			var w = this;
			if (w.websocket != null) {
				var m = new UccQueue(message);
				w.websocket.send(JSON.stringify(m));
			}
		}
	}
	$.webSocket = function(options) {
		var webSocket = new WEBSOCKET(options);
		return webSocket;
	}
})(window, jQuery);
