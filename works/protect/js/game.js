/*
 *author:linxiaohu  953554202@qq.com
*/
// JavaScript Document
//获取视区宽高，设置全屏
var _stage=document.getElementById('stage'),_ele=document.documentElement;
_stage.style.width=_ele.clientWidth+'px';
_stage.style.height=_ele.clientHeight+'px';
_stage.width=_ele.clientWidth;
_stage.height=_ele.clientHeight;
//设置竖屏提醒；检测为非移动设备，则添加提醒
var browser={
	versions:function(){
	var u = navigator.userAgent, app = navigator.appVersion;
	return { //移动终端浏览器版本信息
		trident: u.indexOf('Trident') > -1, //IE内核
		presto: u.indexOf('Presto') > -1, //opera内核
		webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
		gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
		mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
		ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
		android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
		iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
		iPad: u.indexOf('iPad') > -1, //是否iPad
		webApp: u.indexOf('Safari') == -1 //是否web应用程序，没有头部与底部
		};
	}(),
	language:(navigator.browserLanguage || navigator.language).toLowerCase()
}
if(!browser.versions.mobile){
	document.getElementById('warm1').style.display='block';
	document.getElementById('portrait').style.display='none';
}else{
	document.getElementById('warm1').style.display='none';
	var evt="onorientationchange" in window?"orientationchange":"resize",ort=document.getElementById('portrait');window.addEventListener(evt,function(ev){if(evt==="resize"){window.orientation=0}switch(window.orientation){case 90:case -90:ort.style.display="block";break;default:ort.style.display="none";break}},false);
}


//图片加载器
function ImageMonitor(){
	var imgArray = [];
	return {
		createImage : function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback=='function'){
						callback();
					}
				}
				imgArray[img].src = img;
			}
		}
	}
};


//受击消失函数
function destroy(id,left,top){
	var bubble=$('<img src="images/1.png" class="bubble' + id +'">');
	bubble.appendTo($('#game'));
	var _bubble=$('.bubble' + id);
	//_bubble.css({'display':'none','width':88,'height':82,'position':'absolute','z-index':99,'left':left-12,'top':top-9});
	_bubble.addClass('bubbleCom').css({'left':left-12,'top':top-9,'-webkit-animation-play-state':'running','animation-play-state':'running'});
	//_bubble.fadeIn();
	setTimeout(function(){
		_bubble.remove();
	},500);
};


//定义游戏角色
//为忍者猫、萌犬定义类
function Cat(left,type,id){
	this.width = 64;
	this.height = 64;
	this.left = left;
	this.type = type;
	this.id = id;
	this.top = -64;
	this.speed = Math.random()*0.02;
	this.loop = 0;
	var src = this.type == 0 ? 'images/cat.png' : 'images/dog.png';
	this.pic = gameMonitor.imgR.createImage(src);	
};
Cat.prototype.paint=function(ctx){
	ctx.drawImage(this.pic,this.left,this.top,this.width,this.height);
};
Cat.prototype.move = function(ctx){	
	var _this=this;
	this.top += ++this.loop * this.speed;
	this._ctxH=parseInt(document.getElementById('stage').style.height,10);
	if(this.top>(this._ctxH-$('#game-bottom').height())){
		if(this.type==0){
			//忍者猫到达画面最下方则失去一个萌犬屋
			if($('#houses').find('img').length<3){
				$('#houses').append('<img src="images/attacked.png">');
			};
			document.getElementById('sxSound').play();
		};
	 	gameMonitor.catList[this.id] = null;
	}else{
		this.paint(ctx);
	};
	
	//占领萌犬屋
	Occupy();
};
var _shen = function(){
	//神犬跑过，需要配置五档速度，随得分增加而提速
	function Run(timer){		
		var shen = document.getElementById('shen');
		if(shen != null){	
			var s = function(left,bp,timer){
				var s = setTimeout(function(){
					shen.style.left=left;
					shen.style.backgroundPosition = bp;
				},timer);
			};
			s('.3413rem','-.3413rem 100%',timer);
			s('1.28rem','-1.28rem 100%',timer*2);
			s('2.304rem','-2.304rem 100%',timer*3);
			s('3.3427rem','-3.3427rem 100%',timer*4);
			s('4.452rem','-4.452rem 100%',timer*5);
			s('5.4955rem','-5.4955rem 100%',timer*6);
			s('100%','-5.4955rem 100%',timer*7);
			if(s.left == '100%'){
				clearTimeout(s);
			};	
		};
	};
	//偶尔跑过,根据得分设置速度
	var nowScore=document.getElementById('now-score').innerText,t = 8000,rand = Math.random()*(t - 3000) + 3000;
	//console.log(rand)
	switch(true){
		case nowScore<=200:
		setInterval(function(){Run(180)},rand);
		break;
		case nowScore>200 && nowScore<=500:
		setInterval(function(){Run(160)},rand);
		break;
		case nowScore>500 && nowScore<=700:
		setInterval(function(){Run(140)},rand);
		break;
		case nowScore>700 && nowScore<=900:
		setInterval(function(){Run(120)},rand);
		break;
		default:
		setInterval(function(){Run(100)},rand);
	};
};

//点击一个犬神=10分+1个忍术卷轴
$('#shen').tap(function(){	
	var num=parseInt($('#jz-num').text().substr(1));
	num++;
	$('#jz-num').text('×'+num);
	var nowScore=parseInt($('#now-score').text());
	nowScore+=10;
	$('#now-score').text(nowScore);
	var mark2=parseInt($('#mark2').text());
	mark2+=10;
	$('#mark2').text(mark2);
});
//点击“补”按钮，补充满苦无
$('.bu').tap(function(){
	var $kw_len=$('#kuwus').find('.kuwu_1').length;
	var $cz=6-$kw_len;
	if($kw_len<6){
		for(var i=0;i<$cz;i++){
			$('.kuwu_0').attr('class','kuwu_1');
		};		
	};
	document.getElementById('fullSound').play();
});

//射击苦无
function Kuwu(ctx,width,height){
	this.width=width;
	this.height=height;
	//this.left = document.documentElement.clientWidth/2-this.width/2;
	//this.top = document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10;
	var src='images/wea-kw.png';
	this.pic=gameMonitor.imgR.createImage(src);
	this.paint=function(){
		ctx.drawImage(this.pic,this.left,this.top,this.width,this.height);
	};
	//位置响应
	this.fun=function(event){
		if(!browser.versions.mobile){	
			var tarL = event.offsetX;
			var tarT = event.offsetY;		
		}
		else{
			var tarL = event.changedTouches[0].clientX;
			var tarT = event.changedTouches[0].clientY;
		}
		this.left = tarL - this.width/2;
		this.top = tarT - this.height/2;
		this._Width = $('body').width();
		this._Height = $('body').height();
		if(this.left<0){
			this.left = -10;
		};
		if(this.left>this._Width-this.width){
			this.left = this._Width-this.width+10;
		};
		if(this.top<$('#game-top').height()){
			this.top = $('#game-top').height();
		};
		if(this.top>document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10){
			this.top = document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10;
		};
		this.paint();
	};
	this.hit = function(){
		var _this = this;
		var stage = $('#stage');
		stage.on('touchstart', function(event){
			_this.fun(event);
		}).on('touchend', function(){
			_this.fun(event);
		}).on('touchmove', function(event){
			event.preventDefault();
			_this.fun(event);	
		});
	};
	
	//苦无攻击
	this.attack = function(catList){
		var arr = [];
		for(var i=catList.length-1; i>=0; i--){
			//console.log('循环开始:')
			var c = catList[i];
			if(c){
				//拿到其对应四个点坐标，与攻击点的坐标比较;攻击点在萌犬/猫忍者内部，视为攻击成功。
				var h1 = this.top+this.height/2 - (c.top+c.height/2);
				var h2 = this.left+this.width/2 - (c.left+c.width/2);
				var h3 = Math.sqrt(h1*h1 + h2*h2);
				var nowScore=parseInt($('#now-score').text());
				var mark1=parseInt($('#mark1').text());
				var mark3=parseInt($('#mark3').text());
				if(h3<=this.height/2 + c.height/2){
					//alert(catList[c.id].left+':'+catList[c.id].top);
					//产生受击光效，同时角色移除
					destroy(catList[c.id].id,catList[c.id].left,catList[c.id].top);
					//一个苦无可能攻击多个，则在其攻击一次之后，将苦无坐标移到(-9999,-9999)，防止同时攻击多次
					//var d = new Date();
					//console.log('id' + catList[c.id].id + '被销毁;' + '时间为:' + d);
					catList[c.id] = null;
					//console.log('此刻的苦无坐标:' + this.left + ':' + this.top);
					this.left = this.top = -9999;
					//console.log('此刻的苦无坐标:' + this.left + ':' + this.top);
					if(c.type==0){
						nowScore+=1;//打掉一个忍者猫得1分
						$('#now-score').text(nowScore);
						mark1+=1;
						$('#mark1').text(mark1);	
					}else{
						nowScore-=3;//误伤一个萌犬扣3分
						$('#now-score').text(nowScore);
						//误伤一个萌犬则失去一个萌犬屋
						if($('#houses').find('img').length<3){
							$('#houses').append('<img src="images/attacked.png">')};
						document.getElementById('sxSound').play();
						
						mark3-=3;
						$('#mark3').text(mark3);	
					};
				};
			};
			continue;		
		};
	
		//占领萌犬屋
		Occupy();
	};
};
//使用忍术卷轴
var circle=$('<img src="images/jzgx.png" class="jzgx" id="jzgx">');
circle.appendTo($('#game'));
function Rsjz(ctx){
	this.width=40;
	this.height=40;
	this.left = document.documentElement.clientWidth/2-this.width/2;
	this.top = document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10;
	var src='images/wea-jz.png';
	this.pic=gameMonitor.imgR.createImage(src);
	this.paint=function(){
		ctx.drawImage(this.pic,this.left,this.top,this.width,this.height);
	};
};
function Rsjzgx(ctx,width,height){
	this.width=width;
	this.height=height;
	var src='images/jzgx_0.png';
	this.pic=gameMonitor.imgR.createImage(src);
	this.paint=function(){
		ctx.drawImage(this.pic,this.left,this.top,this.width,this.height);
	};
	this.position = function(event){
		if(!browser.versions.mobile){	
			var tarL = event.offsetX;
			var tarT = event.offsetY;		
		}
		else{
			var tarL = event.changedTouches[0].clientX;
			var tarT = event.changedTouches[0].clientY;
		}
		this.left = tarL - this.width/2;
		this.top = tarT - this.height/2;
		this._Width=$('body').width();
		this._Height=$('body').height();
		if(this.left<0){
			this.left = -10;
		};
		if(this.left>this._Width-this.width){
			this.left = this._Width-this.width+10;
		};
		if(this.top<$('#game-top').height()){
			this.top = $('#game-top').height();
		};
		if(this.top>document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10){
			this.top = document.documentElement.clientHeight-document.getElementById('game-bottom').offsetHeight-this.height-10;
		};	
	};
	this.fun=function(){
		this.position(event);
		this.paint();
	};
	this.hit = function(){
		var _this = this;
		var stage = $('#stage');
		stage.on('touchstart', function(event){
			_this.fun(event);
		}).on('touchend', function(){
			_this.fun(event);
		}).on('touchmove', function(event){
			event.preventDefault();
			_this.fun(event);			
		});
	};
	//忍术光效函数
	this.circle = function(event){
		var _circle=$('#jzgx');
		_circle.css({'left':this.left,'top':this.top,'opacity':1});
		setTimeout(function(){
			_circle.css('opacity',0);
		},500);
	};
	//忍术卷轴攻击
	this.attack = function(catList){
		this.circle(event);
		var m = 0;//用来计算施放忍术一次，击中几个
		for(var i=catList.length-1; i>=0; i--){
			var c = catList[i];
			if(c){
				//相交区域视为攻击成功
				var h1 = this.top+this.height/2 - (c.top+c.height/2);
				var h2 = this.left+this.width/2 - (c.left+c.width/2);
				var h3 = Math.sqrt(h1*h1 + h2*h2);
				var nowScore=parseInt($('#now-score').text());
				var mark1=parseInt($('#mark1').text());
				var mark3=parseInt($('#mark3').text());
				if(h3<=this.height/2 + c.height/2){
					m++;
					//console.log(catList[c.id].id + ':' + catList[c.id].left + ':' +catList[c.id].top)
					destroy(catList[c.id].id,catList[c.id].left,catList[c.id].top);
					catList[c.id] = null;
					if(c.type==0){
						nowScore+=1;//打掉一个忍者猫得1分
						$('#now-score').text(nowScore);
						mark1+=1;
						$('#mark1').text(mark1);	
					}else{
						nowScore-=3;//误伤一个萌犬扣3分
						$('#now-score').text(nowScore);
						//误伤一个萌犬则失去一个萌犬屋
						if($('#houses').find('img').length<3){
							$('#houses').append('<img src="images/attacked.png">');};
						
						document.getElementById('sxSound').play();
						mark3-=3;
						$('#mark3').text(mark3);						
					};
				};
			};			
		};
		//console.log(m);//存储击中数目的变量。决定死亡光效出现次数
		for (var i = 0,_len = m.length; i < _len; i++) {
			destroy(left,top);
		};

		//占领萌犬屋
		Occupy();
	};
};
//占领萌犬屋,游戏结束
function Occupy(){
	if($('#houses').find('img').length >= 3){
		//结束画面出现，并呈现分数表
		$('#stage').hide();
		$('.jieshu').css({'display':'block'});
		var sxS=document.getElementById('sxSound');
		if($('#game').is(':hidden')){sxS.pause();sxS.currentTime = 0.0;};
		setTimeout(function(){
			$('#game-result').show();
			$('#game').hide();
			$('.jieshu').find('img').css({'display':'none'});
		},1500);		
		$('#shen').remove();//移除神犬
		//根据分数设置称号
		var $nowScore=parseInt($('#now-score').text());
		$('.chenghao-wrap').find('.count').text($nowScore);
		$('#count1').text('×'+parseInt($('#mark1').text()));
		$('#count2').text('×'+parseInt($('#mark2').text())/10);
		$('#count3').text('×'+Math.abs(parseInt($('#mark3').text()))/3);
		var $count=parseInt($('.chenghao-wrap').find('.count').text()),$chenghao=$('.chenghao-wrap').find('.chenghao');
		switch(true){
			case $count<=0:
			$chenghao.attr('class','chenghao chenghao1');
			break;
			case $count>0 && $count<=200:
			$chenghao.attr('class','chenghao chenghao2');
			break;
			case $count>200 && $count<=500:
			$chenghao.attr('class','chenghao chenghao3');
			break;
			case $count>500 && $count<=700:
			$chenghao.attr('class','chenghao chenghao4');
			break;
			case $count>700 && $count<=900:
			$chenghao.attr('class','chenghao chenghao5');
			break;
			default:
			$chenghao.attr('class','chenghao chenghao6');
		};
	};
};


//定义全局对象，定义游戏用到的参数、方法
var gameMonitor={
	timmer:null,
	imgR:new ImageMonitor(),
	catList:[],
	evenType:{
		start:'touchstart',
		move:'touchmove',
		end:'touchend'
	},
	innit:function(){
		var _this=this;
		var canvas=document.getElementById('stage');
		var ctx=canvas.getContext('2d');
		_this.initListener(ctx);
	},
	initListener:function(ctx){
		var _this=this;
		var body=$(document.body);
		//点击“开始游戏”按钮进入游戏主场景逻辑
		body.on(gameMonitor.evenType.start,'#start-btn',function(){
			//按钮点击音效
			$(this).parents('#start-game').hide();
			$('#game').fadeIn('100');
			_shen();//神犬偶尔跑过的函数
			//1.2s后“开始”消失，游戏开始
			setTimeout(function(){
				$('.kaishi').hide();
			},1200);
			setTimeout(function(){
				$('#stage').show();			
			},1400);
			_this.Kuwu=new Kuwu(ctx,40,40);
			_this.Rsjz=new Rsjz(ctx);
			//_this.Rsjzgx=new Rsjzgx(ctx,182,182);
			gameMonitor.run(ctx);
		});
		//点击“玩法说明”按钮进入游戏说明界面
		body.on(gameMonitor.evenType.start,'#intro-btn',function(){	
			$(this).parents('#start-game').hide();
			$('#intro-stage').fadeIn('slow');
		});
		
		//使用“忍术卷轴”攻击，在游戏画面点击部位产生忍术光效，即攻击范围
		var hid=document.getElementById('hid').value;
		body.on(gameMonitor.evenType.start,$('.shu'),function(){
			var num=parseInt($('#jz-num').text().substr(1));
			if(num>0){
				//设置hid值绘制卷轴和产生忍术卷轴光效					
				document.getElementById('hid').value=1;	
			};		
		});	
		body.on(gameMonitor.evenType.start,$('#stage'),function(event){	
			var num=parseInt($('#jz-num').text().substr(1));
			//射击苦无
			if(hid==0){
				if($('#kuwus').find('.kuwu_1').length>0){
					document.getElementById('kwSound').play();
					_this.Rsjzgx=new Rsjzgx(ctx,0,0);
					_this.Kuwu=new Kuwu(ctx,0,0);
					_this.Kuwu.hit();
					//_this.Kuwu.attack(_this.catList);
					$('#kuwus').find('.kuwu_1').last().attr('class','kuwu_0');
					setTimeout(function(){ 
						_this.Kuwu=new Kuwu(ctx,40,40);
					},300);
				}else{
					document.getElementById('emptySound').play();
					$('<img src="images/buchong.png" class="buchong">').appendTo('body');
					$('.buchong').fadeIn();
					setTimeout(function(){$('.buchong').fadeOut()},200)
				};
			};	
			//使用卷轴&个数减少
			if(document.getElementById('hid').value == 1){
				document.getElementById('hid').value = 2;
			};
		  	if(document.getElementById('hid').value == 2 && num > 0){
				document.getElementById('rsSound').play();
				num--;
			  	$('#jz-num').text('×'+num);
				//使用卷轴攻击，定义圆形光效范围
				_this.Rsjzgx=new Rsjzgx(ctx,182,182);
				_this.Rsjzgx.hit();
				_this.Kuwu=new Kuwu(ctx,0,0);
				
				//防止苦无数为0时，攻击出现“补充”按钮
				$('.buchong').css('visibility', 'hidden');

				//卷轴施放完毕，回退到苦无状态
				setTimeout(function(){
					document.getElementById('hid').value=0;
					_this.Rsjzgx=new Rsjzgx(ctx,0,0);
					//_this.Rsjzgx.hit();
					
				},300);					
			};	
		});
		
		//分享按钮
		body.on(gameMonitor.evenType.start,$('#share-btn'),function(){
			$('.weixin').show().siblings().hide();
			$('.back').show();
		});
		body.on(gameMonitor.evenType.start,$('.back'),function(){
			$('.result,#game-result h2,#game-result .btns').fadeIn();			
			$('.weixin,.back').hide();
		});
		//再玩一次按钮
		body.on(gameMonitor.evenType.start,$('#replay-btn'),function(){
			window.location.reload();
		});
		
		WeixinApi.ready(function(Api) { 
			// 隐藏浏览器下方的工具栏
    		Api.hideToolbar();  
            // 微信分享的数据
            var wxData = {
                "appId":"", 
                "imgUrl":"images/dog.png",
                "link":"",
                "desc":"保卫萌犬屋",
                "title":"保卫萌犬屋"
            };
            // 分享的回调
			var wxCallbacks = {
				// 分享操作开始之前
				ready:function () {},
				// 分享被用户自动取消
				cancel:function (resp) {},
				// 分享失败了
				fail:function (resp) {},
				// 分享成功
				confirm:function (resp) {},
				// 整个分享过程结束
				all:function (resp) {}
			};

             // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
			Api.shareToFriend(wxData, wxCallbacks);		 
			// 点击分享到朋友圈，会执行下面这个代码
			Api.shareToTimeline(wxData, wxCallbacks);		 
			// 点击分享到腾讯微博，会执行下面这个代码
			Api.shareToWeibo(wxData, wxCallbacks);
		});			
		
	},
	run:function(ctx){
		var _this = gameMonitor;
		ctx.clearRect(0,0,document.documentElement.clientWidth,document.documentElement.clientHeight);
		//绘制忍者猫、萌犬
		_this.paintCat();
		for(i = 0,len = _this.catList.length; i < len; i++){
			var c = _this.catList[i];
			if(c){
				c.paint(ctx);
				c.move(ctx);

				//优化：若忍者猫/萌犬数组的任意两项相交区域达到一定范围,则重新调整位置，避免重叠
				//console.log(Math.round(c.left) + ':' + c.type + ':' + c.id + ':' + c.top)	
				for (var x = i + 1; x < len; x++) {
					var _x = _this.catList[x];
					if(_x){
						var _diff1 = c.left - _x.left,
							_diff2 = c.top - _x.top;
						if(Math.abs(_diff1) <= 10 && Math.abs(_diff2) <= 10){
							if(_diff1 <= 0){
									//c在_x左边，一旦c的left值>=相交区域宽度，则c左移，反之_x右移,64为忍者猫/萌犬宽度
									var _commonWidth = 64 - (_x.left - c.left);
									if(c.left >= _commonWidth){c.left -= _commonWidth;}else{_x.left +=  _commonWidth;}  
								}else{
									//c在_x右边，一旦_x的left值>=相交区域宽度，则_x左移，反之c右移
									var _commonWidth = 64 - (c.left - _x.left);
									if(_x.left >= _commonWidth){_x.left -= _commonWidth;}else{c.left += _commonWidth;}
							};
						};
					};
				};

			};
		};
		_this.timmer = setTimeout(function(){
			gameMonitor.run(ctx);
		}, 1000 / 60);
		
		//射击苦无
		if(document.getElementById('hid').value==0){
			//if($('#kuwus').find('.kuwu_1').length>0){
				//_this.Kuwu.paint();
				//_this.Kuwu.hit();
				_this.Kuwu.attack(_this.catList);
			//};	
		};		
		//使用卷轴
		if(document.getElementById('hid').value==1){
			_this.Rsjz.paint();	
		};
		if(document.getElementById('hid').value==2){
			_this.Rsjz.paint();			
			_this.Rsjzgx.paint();
			_this.Rsjzgx.attack(_this.catList);
		};
	},
	paintCat:function(){
		//以50为分数区间，绘制个数增加		
		var rate = parseInt($('#now-score').text())/50;
		if(rate <= 0){rate = 1};
		//绘制频率，数值越小，单位时间视区出现的角色越多 
		var Rate = 30/Math.ceil(rate);
		
		var random = Math.random();
		if(random*Rate>Rate-1){
			var n = Math.random();
			var left = Math.random()*(document.documentElement.clientWidth-64);
			var type = n < .7 ? 0 : 1;
			var id = this.catList.length;
			var c = new Cat(left,type,id);
			this.catList.push(c);
		};
	}
};
gameMonitor.innit();




/*-----游戏说明------*/
window.onload = function(){ 
	var img = document.getElementById('help'); 
	var src = img.getAttribute('src'); 
	img.setAttribute('src',''); 
	img.onload = function(){ 
		document.getElementById('loading').style.display = 'none';
	}; 
	img.setAttribute('src',src); 
}; 

$('#return').tap(function(){
	$(this).parent('#intro-stage').hide();
	$('#start-game').show();
});

/*-----背景音乐-------*/
//IOS需添加节点才可播放;安卓不支持多音频播放，舍弃背景音乐;淡入
if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad){
	function musicPlay(){
		var audio = document.createElement("audio");
		audio.src = "media/1.mp3";
		audio.loop = true;
		audio.id = "bgSound";
		audio.load();
		audio.addEventListener("canplaythrough", function(){		
			audio.volume=0.05;
			timer_volume_up=setInterval(function(){
				if(audio.volume<0.15){
					audio.volume+=0.05;
				}
				else{
					audio.volume=0.15;
					clearInterval(timer_volume_up);
				}
			},500);			
			/*timer_count=setTimeout(function(){
				timer_volume_down=setInterval(function(){
					if(audio.volume>0.01){
						audio.volume-=0.01;
					}
					else{
						audio.volume=0.01;
						clearInterval(timer_volume_down);
					}
				},1000);
			},parseInt(audio.duration*1000-15000));*/
			audio.play();			
		},false);
		
		$("body").append(audio);
	}	
	musicPlay();
};

/**---控制背景音乐播放与否--**/
if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad){
	var musicIcon=$('<a href="javascript:;" class="musicIcon" id="musicIcon"></a>');
	musicIcon.appendTo('#start-game');
	var bgSound=document.getElementById("bgSound");
	if(bgSound!==null){
		$('#musicIcon').click(function(){
			if(bgSound.paused){
				bgSound.play();
				$(this).removeClass('paused');
			}else{			
				bgSound.pause();
				$(this).addClass('paused');
			};
		});
	};
};
