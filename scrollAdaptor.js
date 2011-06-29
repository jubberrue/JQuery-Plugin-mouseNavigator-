/**
 * 
 */
(function($) {
	 $.fn.scrollAdaptor = function(options) {

		 var opts = $.extend({}, $.fn.scrollAdaptor.defaults, options);
		 
		 //@TODO need to test this out
		 opts = $.meta ? $.extend({}, opts, this.data()) : opts;
		 
		 return this.each(function(){
			 	var viewPort=$(this);
			 	var contentContainer=false;
			 	var navInterval=false;
			 	var centerPoint = {x:0,y:0};
			 	var mouse;

			 	init();
				
			 	
			 	
				// private function for debugging, only works with firefox
				function debug(msg) {
					if (window.console && window.console.log)
						window.console.log(msg);
				};
				
				function trackMouse(e){
					mouse = e;
				};
				
				function calculateCenterPoint (){
					centerPoint.x = Math.round(viewPort.offset().left + (viewPort.innerWidth()/2));
					centerPoint.y = Math.round(viewPort.offset().top + (viewPort.innerHeight()/2));
				};
				
				/* @TODO not finished*/
				function handleResize (e){
					calculateCenterPoint();
					
				};
				
				function navigate(){
					
					if(!shouldScroll()){
						return;
					}
					if(isScrollBackward()){
						scrollBackward(opts.stepSize);
					}else{
						scrollForward(opts.stepSize);
					}
				};
				
				function shouldScroll(){
					if(isEntireThumbContainerFitInViewPort()){
						debug("thumb container smaller than viewPort, no scrolling " + contentContainer.innerWidth() + " : " + viewPort.innerWidth() );
						return false;
					};
					
					if(isInsideDeadZone()){
						return false;
					}
					
					return true;
				};
				
				function isInsideDeadZone(){
					/*@TODO add vertical component*/
					return (Math.abs(mouse.pageX - centerPoint.x) < opts.deadZoneSpread)? true : false;
				};
				
				function isEntireThumbContainerFitInViewPort(){
					/*@TODO add vertical component*/
					var lastItem = contentContainer.children().last();
					
					return ((lastItem.position().left + lastItem.innerWidth())<= viewPort.innerWidth());
				};
				
				
				function scrollBackward (dist){
					/*@TODO add vertical component*/
					var lastThumb = contentContainer.children().last();
					
					if((lastThumb.position().left + lastThumb.innerWidth() - Math.abs(contentContainer.position().left) ) < viewPort.innerWidth()){
						debug("cannot scroll more to the left");
						return;
					}		
					
					contentContainer.css("left", (contentContainer.position().left - dist) + "px");
				};
				
				function scrollForward (dist){
					/*@TODO add vertical component*/
					if(contentContainer.position().left > 0){
						debug("cannot scroll more to the right");
						return;
					}
					contentContainer.css("left", contentContainer.position().left + dist + "px");
				};
				
				function handleMouseOut(e){
					stopNavigation(e);
				};
				
				function handleMouseOver(e){
					stopNavigation();
					calculateCenterPoint();
					startNavigation(calculateDuration(e));
				};

				function startNavigation (duration){
					navInterval = setInterval(function(){navigate();},duration);
				};
				
				function stopNavigation(){
					if(navInterval) clearInterval(navInterval);
				};
				
				function handleMouseMove(e){
					stopNavigation();
					startNavigation(calculateDuration(e));
				};
				
				function calculateDuration(e){
					/*@TODO add vertical component*/
					mouse = e;
					var dist = Math.abs(mouse.pageX - centerPoint.x);
					var halfContainer = viewPort.innerWidth()/2;
					return (opts.maxDur - opts.minDur)*((halfContainer - dist)/(halfContainer)) + opts.minDur;
				};
				
				function isScrollBackward(){
					/*@TODO add vertical component*/
					return (mouse.pageX > centerPoint.x)? true:false;
				};
				

				
				function isWithInContainer(targetItem, container){
					var target = targetItem;
					
					//assume no relationship between target and container
					if(target.offset().left >= container.offset().left){
						return (target.innerWidth() + target.offset().left <= (container.offset().left + container.innerWidth()))? true : false;
					}else{
						return false;
					}
				};
				
				function bringItemIntoView(index){
					 var thumb = $(contentContainer.children()[index]);
						
					 if(thumb.length == 0) return;
					
					
					 if(isWithInContainer(thumb, viewPort)){
						 debug("index " + index + " is within the view port");
					 }else{
						 debug("inner width" + thumb.innerWidth());
						 var thumbXDelta = thumb.offset().left - viewPort.offset().left;
						 var newContentContainerLeft;
						 if(thumbXDelta < 0){
							 newContentContainerLeft =  contentContainer.position().left + Math.abs(thumbXDelta);
						 }else{
							 newContentContainerLeft =  contentContainer.position().left - (thumbXDelta - viewPort.innerWidth() + thumb.innerWidth());
						 }
						
						 contentContainer.animate({left: newContentContainerLeft + "px"}, opts.showItemSpeed);
					 }
				};
				
				function init(){
			 		contentContainer = $(opts.contentSelector);
					
					if(contentContainer.length == 0){
						contentContainer = viewPort.children().first();
					};
					
					viewPort
						.bind("mousemove.scrollAdaptor", function(e){handleMouseMove(e);})
						.bind("mouseleave.scrollAdaptor", function(e){handleMouseOut(e);})
						.bind("mouseenter.scrollAdaptor", function(e){handleMouseOver(e);})
						.bind("resize.scrollAdaptor", function(e){handleResize(e);});
					
					if(opts.objAccessProxy){	
						opts.objAccessProxy.bringItemIntoView = function(index){bringItemIntoView(index);};
					}
			 	};
				
		 });
	 };
	 
	 $.fn.scrollAdaptor.defaults = {
			 	stepSize:10,
			 	minDur:10,
			 	maxDur:50,
			 	deadZoneSpread:25,
			 	contentSelector:'.ad-thumb-list',
			 	showItemSpeed:20,
			 	objAccessProxy:false
			 };
	 
	
})(jQuery);