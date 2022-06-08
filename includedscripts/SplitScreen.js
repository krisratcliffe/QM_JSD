// Check for IE 7 - some of this JS won't work with IE7 and causes annoying errors in QM
// #TimB 22Nov19 Changed === to !== below. === was triggering the error overide for ALL BROWSERs
//       We only want to indexOf("MSIE 7") return 0+ for IE7 and -1 for everyone else!
if (navigator.appVersion.indexOf('MSIE 7') !== -1) {
	window.onerror = function (message, url, lineNumber) {
		return true;
	};
}

var isNewAccaExamType =
	$('head style').filter(function (index) {
		return $(this)[0].innerText.match(/ACCA-BPP/); // only return true if we have some that contain the new ACCA css stuff
	}).length > 0; // If one or more are returned, then we have the new exam stuff present

var isICAEWExamType =
	$('head style').filter(function (index) {
		return $(this)[0].innerText.match(/ICAEW-2016/); // only return true if we have some that contain the new ACCA css stuff
	}).length > 0; // If one or more are returned, then we have the new exam stuff present

function SplitScreen() {
	var isEndOfAssessment = !!$('body').attr('endofassessment');
	var isSafeScreenWidth = document.body.offsetWidth > 1024;

	// Don't do splitscreen on the feedback page #TB 06/10/2017
	if (isSafeScreenWidth && !isEndOfAssessment) {
		AdjustableSplitScreen2();
	}

	function AdjustableSplitScreen2() {
		var scriptTag = $("script[src='includedscripts/SplitScreen.js']");
		var divTag = $(scriptTag[scriptTag.length - 1]).closest('div')[0];
		var legendTag = $(scriptTag[scriptTag.length - 1]).closest('legend')[0];

		// if it's end of assessment, don't run this script
		var EndOfAssessment =
			$('body[endofassessment]').length !== 0 &&
			divTag.className.indexOf('qm_QUESTION_essay') !== -1;

		// if not End of Assessment && is a spreadsheet or mce question
		if (!EndOfAssessment && scriptTag.length !== 0) {
			var legendTags = document.getElementsByTagName('legend');
			var legendTag = legendTags[legendTags.length - 1];
			var parentTag = legendTag.parentNode;

			$(legendTag).addClass('left_panel').parent().addClass('split-container');
			if (
				navigator.appVersion.indexOf('IE ') !== -1 &&
				navigator.appVersion.indexOf('IE 11') === -1 &&
				navigator.appVersion.indexOf(/Edge/i) === -1
			) {
				$(legendTag).css({ 'margin-right': '70px' }); // if Ie add some padding
			}

			$(divTag)
				.addClass('right_panel')
				.prepend(
					'<div class="splitDragger" title="Click and drag this bar to resize horizontally."></div>'
				);

			// use try/catch to only add the style once to the screen - keep tings tidy
			try {
				splitScreenStyle;
			} catch (e) {
				//console.log(e.message);

				// If its our new ACCA Exam stuff, then the top setting for the left panel needs adjusting
				// Search for script in the head tag
				/*var isNewAccaExamType = $("head style").filter( function(index){
					return $(this)[0].innerText.match(/ACCA-BPP/) ; // only return true if we have some that contain the new ACCA css stuff
				}).length > 0; // If one or more are returned, then we have the new exam stuff present*/
				//console.log(isNewAccaExamType);
				splitScreenStyle =
					'<style>.split-container { 	width:99%; 	/*height:500px;*/ } /*Increased specificity to override QM without effecting any other elements and no use of !important - #TB*/ .qm_QUESTION div.qm_QA_CONTENT legend.left_panel.left_panel { 	position:absolute; 	left:0; 	top: ' +
					(isNewAccaExamType ? '20px' : '1px') +
					'; 	bottom:0; 	right:100px; 	display:block; 	overflow:auto; 	width:50%; margin-right: 10px; padding-right: 10px; } .right_panel { 	position: relative; 	right:0; 	top: 0; 	bottom:0; 	width:50%; 	/* this turned question stimulus for split screen multi choice white color:#fff so dont use it;*/ 	display:block; 	overflow:auto; margin-right: -40px /*-20px*/; padding-left: 20px; 	padding-top: 0; 	float: right; 	height: 100%; } .splitDragger { 	position:absolute; 	left:0; 	z-index:10; 	top: 0px; 	bottom:0; 	width:1px; 	cursor:w-resize; 	border-right:5px double #aaa; 	height: 99%; } .noselect { -webkit-touch-callout: none; /* iOS Safari */ -webkit-user-select: none;   /* Chrome/Safari/Opera */ -khtml-user-select: none;    /* Konqueror */ -moz-user-select: none;      /* Firefox */ -ms-user-select: none;       /* Internet Explorer/Edge */ user-select: none;           /* Non-prefixed version, currently*/ }</style>';
				$('body').append(splitScreenStyle);
			}

			var isResizing = false;
			var lastDownX = 0;

			// Trigger the window resize event to reflow the contents of the page, ie the spreadsheets
			try {
				var evt = document.createEvent('UIEvents');
				evt.initUIEvent('resize', true, false, window, 0);
			} catch (e) {
				/* console.log("UIEvents failed, using jquery rezise"); */ $(
					window
				).resize();
			}

			$(function () {
				var splitContainer = $(legendTag).parent(),
					left = legendTag,
					right = divTag,
					handle = $(divTag).find('.splitDragger');

				handle.on('mousedown', function (e) {
					isResizing = true;
					lastDownX = e.clientX;
				});

				$(document)
					.on('mousemove', function (e) {
						// we don't want to do anything if we aren't resizing.
						if (!isResizing) {
							return;
						}
						var offsetRight =
							splitContainer.width() -
							(e.clientX - splitContainer.offset().left);

						// the addition/subtraction for the offsetRight needs to match the .right-panel's padding-left value plus 2
						// ONLY CHANGE THESE IF THE PADDING-LEFT CHANGES OR IF THE VERT-DRAG ARROW ISN'T ALIGNED ON THE SPLIT DRAGGER
						$(left)
							.css('width', 'auto')
							.css('right', offsetRight + 22)
							.addClass('noselect');
						$(right)
							.css('width', offsetRight + 22)
							.addClass('noselect');
					})
					.on('mouseup', function (e) {
						// stop resizing
						isResizing = false;

						// Trigger the window resize event to reflow the contents of the page, ie the spreadsheets
						try {
							window.dispatchEvent(evt);
						} catch (e) {
							console.log('UIEvents failed, using jquery resize');
							$(window).resize();
						}

						// Remove noselect classes
						$(left).removeClass('noselect');
						$(right).removeClass('noselect');
						//$(divTag).closest(".qm_QUESTION").css("width", "95%!important");
					});
			});

			$(window).resize(function () {
				splitAdjustemtents();
			});

			function splitAdjustemtents() {
				// Make questions full available height of screen - causes the 2 sided scrolling on longer questions
				if (isICAEWExamType)
					$(legendTag)
						.parent()
						.height(
							/*$("#qm_DOCUMENT").height() - 50*/ legendTag.offsetHeight - 5
						);
				else
					$(legendTag)
						.parent()
						.height($('#qm_DOCUMENT').height() - 50);

				// Now adjust the dragger's height for questions that do scroll
				// Initially it's height is set to the questions default hight before we cause the scrolling with the code above.
				var thisQ = $(legendTag).closest('.qm_QUESTION')[0];
				var dragger = $(divTag).find('.splitDragger');

				if (divTag.scrollHeight !== 0) {
					$(dragger).height(divTag.scrollHeight);
					//$('.split-container').width( $("#qm_DOCUMENT").width()-100 );
				}
				var docWidth = $('#qm_DOCUMENT').width();
				var questinoWidth =
					docWidth > 1284
						? '95%'
						: docWidth > 1109
						? '94%'
						: docWidth > 969
						? '93%'
						: docWidth > 864
						? '92%'
						: '90%';
				$(divTag).closest('.qm_QUESTION').css('width', questinoWidth);
			}
		}
	}

	function OrigionalSplitScreen() {
		// #TB - added check for only picking up SplitScreen javascript tags
		var scriptTag = $("script[src='includedscripts/SplitScreen.js']");
		var divTag = closestByTagName(scriptTag[scriptTag.length - 1], 'div');
		//scriptTag = scriptTag[scriptTag.length - 1].parentNode;

		// Line below added as a quick-fix displaying section C stuff on feedback and with easy removal in mind #TB - 28-07-2016
		// if end of assessment && is a spreadsheet or mce question
		var EofA =
			$('body[endofassessment]').length !== 0 &&
			divTag.className.indexOf('qm_QUESTION_essay') !== -1;
		if (!EofA) {
			var legendTag = document.getElementsByTagName('legend');
			legendTag = legendTag[legendTag.length - 1];
			var parentTag = legendTag.parentNode;
			var legendTags = parentTag.getElementsByTagName('legend');
			for (i = 0; i < legendTags.length; i++) {
				legendTag = legendTags[i];
				legendTag.style.width = '45%';
				legendTag.style.cssFloat = 'left';
				legendTag.style.styleFloat = 'left';
				legendTag.style.paddingRight = '4%';
				legendTag.style.position = 'relative';
				legendTag.style.borderRight = '5px double lightgrey';
			}

			divTag.style.width = '45%';
			divTag.style.cssFloat = 'left';
			divTag.style.styleFloat = 'left';
			divTag.style.paddingLeft = '4%';
			divTag.style.marginTop = '-23px';
			divTag.style.borderLeft = '5px double lightgrey';
			divTag.style.minHeight = '100%';
			divTag.style.position = 'relative';
			divTag.style.left = '-5px';
			var newBr = document.createElement('br');
			parentTag.appendChild(newBr);

			var brTag = document.getElementsByTagName('br');
			brTag = brTag[brTag.length - 1];
			brTag.style.clear = 'both';

			parentTag.style.position = 'relative';
		}
	}

	//*adapted from closestByClass function on clubmate.fi
	var closestByTagName = function (el, tagNameIn) {
		while (el.tagName.toLowerCase() != tagNameIn.toLowerCase()) {
			el = el.parentNode;
			if (!el) {
				return null;
			}
		}
		return el;
	};
}
