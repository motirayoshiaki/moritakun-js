/*!
 * https://emwai.jp/
 * Copyright (C) Yoshiaki Morita
 */


function moritakun () {
	'use strict';

	this.name = 'moritakun';
	this.version = 1.00;

	this.gotScripts = new Array();
	let d = window.document;

	let selectors = {};



	// --------------------
	// jQuery 関数とプラグイン
	// --------------------

	// window.jQuery を使用
	function jQueryNormalize() {
		if ( ! window.jQuery && window.$ && window.$.fn && window.$.fn.jquery ) window.jQuery = window.$;
	};
	jQueryNormalize();
	let gotJQuery = window.jQuery ? 1 : 0;

	// ショートカットで読み込んだ外部プラグインに渡すキュー
	let jQueryQueue = {};

	// jQuery プラグインとショートカット
	this.jQueryFunctions = function () {
		if ( gotJQuery > 1 ) return;

		let $window = jQuery(window);
		let $page   = jQuery('html, body');
		let $body   = jQuery('body');


		// スクロールトップボタン
		// --------------------

		if( 'undefined' == typeof jQuery.fn.scrollTopBtn ) {
			jQuery.fn.scrollTopBtn = function(opts) {
				opts = jQuery.extend({
					'fadeTime': 250
				}, opts);

				return this.each( function(index) {
					var $this = jQuery(this);
					$window.on('scroll', function () {
						var w = this.innerHeight, s = this.scrollY;
						( w < $page.height() && s > 0 ) ? $this.fadeIn(opts.fadeTime) : $this.stop().fadeOut(opts.fadeTime);
					}).trigger('scroll');
				});
			};
		}


		// ページャーのキーボードサポート
		// --------------------

		if( 'undefined' == typeof jQuery.fn.pagerKeySupport ) {
			jQuery.fn.pagerKeySupport = function(opts) {
				opts = jQuery.extend({
					'prev': '.prev a, a.prev',
					'next': '.next a, a.next'
				}, opts);
				return this.each( function(index) {
					var $this = jQuery(this);
					var $prev = $this.find(opts.prev), $next = $this.find(opts.next);
					jQuery(d).on( 'keydown.keyboard-support', function(e) {
						if ( ! jQuery('textarea:focus, input:focus').length ) {
							if ( e.which === 37 && $prev.length ) $prev.trigger('click');
							else if ( e.which === 39 && $next.length ) $next.trigger('click');
						}
					});
				});
			};
		}


		// 画像遅延表示
		// jquery.lazyload をセット
		// --------------------

		this.setJQqueryLazyload = function( selector, opt ) {
			// jQuery版は [data-original] のみ動作
			if ( ! selector ) selector = '*:visible img[data-original].lazyload';
			var $lazyload = ( 'object' == typeof selector ) ? selector : jQuery(selector);
			if ( ! $lazyload.length ) return;
			// オプション
			opt = jQuery.extend( {
				'effectspeed': 250,
				'threshold': 250,
				'effect': 'fadeIn',
				'failure_limit': 9999, // フロート対策
				'skip_invisible': true, // 非表示の画像をスキップ
				'force': false,
				'script': 'https://cdnjs.cloudflare.com/ajax/libs/jquery_lazyload/1.9.7/jquery.lazyload.min.js'
			}, opt );
			//
			var _lazyload_ = function() {
				opt.script = undefined;
				$lazyload.lazyload(opt);
				if ( opt.force ) $lazyload.trigger('lazyload');
				// Safari のバグ対策
				window.addEventListener('pageshow', e => {
					if ( ! e.persisted ) return;
					requestAnimationFrame(() => {
						d.querySelectorAll( selector ).forEach( img => {
							if (img.complete) lazySizes.loader.unveil(img);
						});
					});
				});
			};
			//
			if ( jQuery.fn.lazyload ) {
				_lazyload_();
			}
			else {
				try { jQuery.getScript( opt.script ).done( _lazyload_ ); }
				catch(e) { console.log(e); }
			}
		};


		// スライダー Swiper
		// https://swiperjs.com/
		// --------------------

		this.applySwiper = function ( $swiper, opt ) {
			var swiper = new Swiper($swiper.get(0), opt);
			if ( opt.autoplay && swiper.autoplay && 'function' == typeof swiper.autoplay.start ) {
				swiper.autoplay.start();
			}
			// 初期状態でサムネイルが動作しない対策
			if ( 'object' == typeof swiper.thumbs ) swiper.thumbs.update();
			//
			$swiper.swiper = swiper;
			return swiper;
		};

		var self = this;
		this.setJQquerySwiper = function( selector, opt ) {
			if ( ! selector ) selector = '.swiper';
			var $swiper = ( 'object' == typeof selector ) ? selector : jQuery(selector);
			if ( ! $swiper.length ) return;
			// オプション
			opt = jQuery.extend( {
				'script': 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js'
			}, opt );
			//
			if ( 'function' == typeof Swiper ) return self.applySwiper( $swiper, opt );
			// セットアップの関数をキュー
			if (! jQueryQueue['swiper']) jQueryQueue['swiper'] = [];
			jQueryQueue['swiper'].push( function () {
				self.applySwiper( $swiper, opt );
			} );
			jQuery.getScript( opt.script ).done( function () {
				for ( var i in jQueryQueue['swiper'] ) {
					if ( 'function' != typeof jQueryQueue['swiper'][i] ) continue;
					try { jQueryQueue['swiper'][i](); }
					catch(e) { console.log(e); }
					delete jQueryQueue['swiper'][i];
				}
				$window.trigger('resize').trigger('scroll');
			});

		};


		// ライトボックス
		// jquery.imagelightbox をセット
		// https://osvaldas.info/image-lightbox-responsive-touch-friendly
		// --------------------

		this.setJQqueryLightbox = function( selector, opt ) {
			if ( ! selector ) selector = 'a[href*=".png"], a[href*=".jpg"], a[href*=".jpeg"], a[href*=".JPG"]';
			var $lightbox = ( 'object' == typeof selector ) ? selector : jQuery(selector);
			if ( ! $lightbox.length ) return;
			// オプション
			opt = jQuery.extend( {
				'allowedTypes': '(?:png|jpg|jpeg|gif)(?:#[a-z0-9_\-]+)?',
				'animationSpeed': 500,
				'quitOnEnd': true,
				'containerClassName': 'container',
				'title_regexp': '【(.+?)】([^【]+)',
				'script': 'https://osvaldas.info/examples/image-lightbox-responsive-touch-friendly/imagelightbox.min.js'
			}, opt );
			opt.onStart = function () { // ライトボックス開始
				$body.append( jQuery('<div id="img-overlay"></div>') );
			};
			opt.onLoadStart = function () { // ライトボックス読み込み開始
				jQuery('#img-data').remove();
			};
			opt.onLoadEnd = function () { // ライトボックス読み込み終了
				var $a = jQuery('a[data-group][href="' + jQuery('#imagelightbox').attr('src') + '"]');
				// 画像
				jQuery('#imagelightbox').appendTo('#img-overlay');
				// テキスト
				var txt = $a.attr('title');
				if ( 'undefined' === typeof txt ) txt = $a.find('img:first').attr('alt');
				if ( txt ) {
					txt = txt.replace(/(\n|\\n)/g, '<br />');
					if ( opt.title_regexp && 'string' == typeof opt.title_regexp ) {
						var regexp = new RegExp( opt.title_regexp, 'g' );
						txt = ( txt.match(regexp) ) ? txt.replace(regexp, '<h6>$1</h6><p>$2</p>'): '<p>' + txt + '</p>';
					}
					else {
						txt = '<p>' + txt + '</p>';
					}
					jQuery('<div id="img-data"><div class="' + opt.containerClassName + '">' + txt + '</div></div>').appendTo('#img-overlay').slideUp(0).slideDown(opt.animationSpeed);
				}
				$window.trigger('resize');
			};
			opt.onEnd = function () { // ライトボックス終了
				jQuery('#img-overlay, #img-data').remove();
			};
			//
			jQuery.getScript( opt.script ).done( function () {
				var test = [];
				$lightbox.each(function (i) {
					var $this = jQuery(this);
					var group = $this.data('group');
					if ( ! group ) {
						group = 'imagelightbox' + i;
						$this.data('group', group);
					}
					if (true === test[group]) return true;
					jQuery('a[data-group=' + group + ']').imageLightbox(args);
					test[group] = true;
				});
			});
		};


		//
		gotJQuery++; // 二度実行しない
	};


	// --------------------
	// 初期化
	// --------------------

	this.init = function ( args ) {
		args = Object.assign({
			'wrapper' : false,
			'breakpoints' : { 's': '--breakpoint-s', 'm': '--breakpoint-m', 'l': '--breakpoint-l', 'xl': '--breakpoint-xl' }
		}, args);

		// クライアント環境
		var app = navigator.appVersion.toLowerCase();

		// 旧IE用のHTMLクラス
		this.msie = null;
		if ( app.match(/msie\s(\d+)/) || app.match(/Trident.*?rv:(\d\.+)/) ){
			this.msie = parseFloat( RegExp.$1 );
			d.documentElement.className += 'msie msie-' + Math.floor(this.msie);
		}

		// アニメーション更新のリクエスト（第一引数にコールバック）
		this.raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		// タッチイベント対策
		var touch = { pos: null, dir: null };
		touch.start = function(event) { // スワイプ開始時の横方向の座標を格納
			event.preventDefault();
			touch.pos = touch.pageX(event);
		};
		touch.move = function(event) { // スワイプの方向（left／right）を取得
			event.preventDefault();
			touch.dir = ( touch.pos > touch.pageX(event) ) ? 'right' : 'left';
		};
		touch.pageX = function(event) {
			event.preventDefault();
			if ( event.originalEvent.changedTouches ) {
				return event.originalEvent.changedTouches[0].pageX;
			}
			else if ( event.originalEvent.pageX ) {
				return event.originalEvent.pageX;
			}
			else if ( event.originalEvent.clientX ) {
				return event.originalEvent.clientX;
			}
			else {
				return event.originalEvent.screenY;
			}
		};
		this.touch = touch;

		// CSSに設定されたブレークポイント
		this.breakpoint = {};
		if ( 'object' === typeof args.breakpoints ) {
			for ( var name = ['s', 'm', 'l', 'xl'], i = 0; i < name.length; i++ ) {
				var cssVar = args.breakpoints[name[i]];
				var val = getComputedStyle(d.documentElement).getPropertyValue(cssVar).trim();
				if ( val ) {
					// ピクセル値以外
					var strexplode = val.match(/^([0-9][0-9\.]*)(\D+)$/);
					if ( strexplode && strexplode[2] ) {
						var size = strexplode[1], unit = strexplode[2];
						// フォントサイズ指定
						if ( 'em' == unit || 'rem' == unit ) {
							// HTMLのピクセルフォントサイズを取得
							var computedFontSize = window.getComputedStyle(d.documentElement).fontSize;
							val = parseInt( computedFontSize, 10 ) * parseInt( size, 10 );
						}
						// その他の単位は測定不能なので無視
						else if ( 'px' != unit ) {
							val = null;
						}
					}
				}
				this.breakpoint[name[i]] = val ? parseInt( val, 10 ) : 1;
			}
		}

		// キーボードサポート
		( function( app ) {
			if ( ! d.getElementById || ! window.addEventListener ) return;
			if ( app.indexOf( 'webkit' ) < 0 && app.indexOf( 'opera' ) < 0 && app.indexOf( 'msie' ) < 0 ) return;

			window.addEventListener( 'hashchange', function() {
				var element = d.getElementById( window.location.hash.substring( 1 ) );
				if (! element) return;
				if (! /^(?:a|select|input|button|textarea)$/i.test( element.nodeName ) ) {
					element.tabIndex = -1;
				}
				element.focus();
			}, false );
		} ) ( navigator.appVersion.toLowerCase() );

		// #wrapper を挿入
		if ( args.wrapper ) {
			if ( ! d.querySelector('body > #wrapper') ) {
				var div = d.createElement('div');
				    div.id = 'wrapper';
				div.innerHTML = d.querySelector('body').innerHTML;
				d.querySelector('body').innerHTML = div.outerHTML;
			}
		}

		// trim() がない環境用
		// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim
		if ( ! String.prototype.trim ) {
			String.prototype.trim = function () {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			};
		}

		// jQuery 関数とプラグイン
		if ( gotJQuery ) {
			this.jQueryFunctions();
		}

	};



	// --------------------
	// スタイルシートの挿入
	// --------------------

	this.appendCSS = function ( href, media ) {
		if ( ! href ) return;
		// 配置済のスタイルシートがあれば何もしない
		if ( d.querySelector('head>link[href="' + href + '"]') ) return;
		// ヘッダをバッファ
		if ( ! selectors['head'] ) {
			selectors['head'] = d.querySelector('head');
		}
		// 追加
		var link = d.createElement('link');
		    link.rel = 'stylesheet',
		    link.href = href;
		if ( media ) {
			link.media = media;
		}
		selectors['head'].appendChild(link);
		// console.log(selectors['head']);
	};



	// --------------------
	// スクリプトのロードとコールバック
	// --------------------

	this.getScript = function ( src, callback ) {
		if ( ! src || 'string' != typeof src ) return;
		var m = this;
		if ( 'loaded' == m.gotScripts[src] ) {
			// 配置済のスクリプトがあればスクリプトを実行
			if ( 'function' === typeof callback ) callback();
		}
		else {
			// ヘッダに追加
			if ( ! selectors['head'] ) {
				selectors['head'] = d.querySelector('head');
			}
			var script = d.querySelector('head > script[src="' + src + '"]');
			if ( ! script ) {
				script = d.createElement('script');
				script.src = src;
				selectors['head'].appendChild(script);
				m.gotScripts[src] = 'added';
			}
			//
			script.addEventListener( 'load', function () {
				m.gotScripts[src] = 'loaded';
				if ( 'function' === typeof callback ) callback( script );
			}, false );
		}
	};



	// --------------------
	// 文字列をブール値に変換して返す
	// --------------------

	this.toBool = function( s ) {
		if ( 'undefined' === typeof s || null === s || false === s || 0 === s ) {
			return false;
		}
		else if ( true === s || 1 === s ) {
			return true;
		}
		s = String(s).toLowerCase();
		return ( 'null' !== s && 'false' !== s && '' !== s && '0' !== s ) ? true : false;
	};



	// --------------------
	// 全角 -> 半角
	// --------------------

	this.em2en = function ( s ) {
		if ( ! s || 'string' !== typeof s ) return s;
		if ( 'UTF-8' == document.characterSet ) {
			var r = function ( chara ) {
				if ( ! chara ) return '';
				return String.fromCharCode(chara.charCodeAt(0) - 0xFEE0);
			};
			s = s.replace(/[Ａ-Ｚ０-９]/gmi, r);
		}
		return s
		.replace(/[−―‐ー]/gm, '-')
		.replace(/[＿]/gm, '_')
		.replace(/＠/gm, '@')
		.replace(/[\s　]/gm, '');
	};



	// --------------------
	// HTMLエスケープ
	// --------------------

	this.htmlize = function( s ) {
		if ( ! s || 'string' !== typeof s ) return s;
		// s = s.replace(/&(?!(amp;|#38;))/gm, '&amp;');
		return s
		//.replace(/&(?!amp;)/gm, '&amp;')
		.replace(/</gm, '&lt;')
		.replace(/>/gm, '&gt;')
		.replace(/"/gm, '&quot;')//"
		.replace(/'/gm, '&#x27;')//'
		.replace(/\//gm, '&#x2F;');
	};

	// HTML属性用のエスケープ
	this.esc_attr = function( s ) {
		if ( ! s || 'string' !== typeof s ) return s;
		// s = s.replace(/&(?!(amp;|#38;))/gm, '&amp;');
		return s
		.replace(/&(?!amp;)/gm, '&amp;')
		.replace(/\s/gm, '%20')
		.replace(/"/gm, '&quot;')//"
		.replace(/'/gm, '&#x27;');//'
	};

	// HTMLエスケープを元に戻す
	this.dehtmlize = function( s ) {
		if ( ! s || 'string' !== typeof s ) return s;
		return s
		.replace(/&lt;/gm, '<')
		.replace(/&gt;/gm, '>')
		.replace(/&quot;/gm, '"')
		.replace(/&#x27;/gm, "'")
		.replace(/&#x2F;/gm, '/')
		.replace(/&amp;/gm, '&');
	};



	// --------------------
	// 数値を数値フォーマットに変換
	// --------------------

	this.number_format = function ( num ) {
		if ( isNaN(num) || num < 1000 ) return num;
		var string     = num.toString(),
		    breakpoint = 1,
		    length     = string.length,
		    result     = '';
		for ( var i = 1; i <= length; i++ ) {
			if( breakpoint > 3 ) {
				breakpoint = 1;
				result = ',' + result;
			}
			result = string.substring( length - i, length - (i - 1) ) + result;
			breakpoint++;
		}
		return result;
	};



	// --------------------
	// jQuery の読み込みと実行
	// --------------------

	this.jQuery = function( src, callback ) {
		jQueryNormalize(); // window.jQuery を使用

		if ( ! src && window.jQuery ) {
			callback();
		}
		else {
			if ( ! src ) src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/' + ( this.msie ? '1.12.4' : '3.6.1' ) + '/jquery.min.js';

			var self = this;
			this.getScript( src, function () {
				jQueryNormalize();
				if ( ! gotJQuery ) {
					gotJQuery = 1;
					self.jQueryFunctions();
				}
				window.jQuery(callback);
			} );
		}

	};



	// --------------------
	// 文書内でのオフセットを取得
	// --------------------

	this.getAbsOffsetTop = function ( element ) {
		var style = window.getComputedStyle(element);
		if ( 'none' === style.display ) {
			element.style.display = 'block';
			var parentElement = element.offsetParent;
			element.style.display = 'none';
			element = parentElement;
		}
		var offsetTop = 0;
		do {
			if ( ! isNaN( element.offsetTop ) ) offsetTop += element.offsetTop;
		} while ( element = element.offsetParent );
		return offsetTop;
	};

	this.getAbsOffsetLeft = function ( element ) {
		var style = window.getComputedStyle(element);
		if ( 'none' === style.display ) {
			element.style.display = 'block';
			var parentElement = element.offsetParent;
			element.style.display = 'none';
			element = parentElement;
		}
		var offsetLeft = 0;
		do {
			if ( ! isNaN( element.offsetLeft ) ) offsetLeft += element.offsetLeft;
		} while( element = element.offsetParent );
		return offsetLeft;
	};



	// --------------------
	// モバイルユーザーエージェント
	// --------------------

	this.detectMobile = function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};



	// --------------------
	// CSSアニメーション用のクラス付け
	// --------------------

	this.toggleClassOnScroll = function( selector, opts ) {
		if ( ! selector || ( 'string' != typeof selector && 'object' != typeof selector ) ) return;
		var targets = 'string' === typeof selector ? d.querySelectorAll( selector ) : selector;
		if ( ! targets || ! targets.length ) return;

		opts = Object.assign( {
			'visibleClassName' : 'is-visible',
			'toggleClass' : false,
			'threshold' : 0.5, // しきい値（ウィンドウ高さに乗算）
			'delay' : 0,
			'duration' : 0
		}, opts );

		// クラスを追加・取り除く関数
		let moritakun = this;
		var visibleClassNames = opts.visibleClassName.split(' ');
		var _toggleClass_ = function ( element ) {
			var scrollY = window.scrollY; // ウィンドウ高さ
			if ( opts.threshold ) {
				scrollY += window.innerHeight * opts.threshold; // ウィンドウ高さ * 閾値
			}
			var windowBottom = scrollY + window.innerHeight;
			// この要素の絶対位置
			var absOffsetTop = moritakun.getAbsOffsetTop( element );
			if (
				d.body.clientHeight < windowBottom // 終端
				|| absOffsetTop < scrollY // 要素が表示
				|| windowBottom > ( absOffsetTop + element.offsetHeight + window.scrollY ) // 要素の終端がウィンドウ内に表示
			) {
				//console.log( 'scrollY:' + scrollY + '; absOffsetTop:' + absOffsetTop + '; offsetHeight:' +  element.offsetHeight + '; windowBottom:' + windowBottom + ';' );
				element.classList.add(...visibleClassNames);
				return opts.toggleClass;
			}
			else {
				if ( opts.toggleClass ) {
					element.classList.remove(...visibleClassNames);
				}
				return 1;
			}
		};
		//
		let handlers = [];
		for ( var i = 0; i < targets.length; i++ ) {
			var element = targets[i];
			if ( 'object' !== typeof element ) continue;
			if ( 'object' != typeof element.dataset ) element.dataset = {};
			// 遅延
			var delay = element.dataset.delay ? element.dataset.delay : opts.delay ? opts.delay : 0;
			if ( delay ) element.style.setProperty('animation-delay', delay);
			// アニメーションスピード
			var duration = element.dataset.duration ? element.dataset.duration : opts.duration ? opts.duration : 0;
			if ( duration ) element.style.setProperty('animation-duration', duration);
			// イベントハンドラ
			handlers[i] = function () {
				if ( ! _toggleClass_(element) ) window.removeEventListener( 'scroll', handlers[i] );
			};
			window.addEventListener( 'scroll', handlers[i] );
		}
		window.dispatchEvent( new Event('scroll') );
	};

}





