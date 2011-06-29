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
			 	var DIRECTION_HORIZONTAL = "horizontal";
			 	var DIRECTION_VERTICAL = "vertical";

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
					return (opts.direction == DIRECTION_HORIZONTAL)?
							(Math.abs(mouse.pageX - centerPoint.x) < opts.deadZoneSpread)? true : false :
							(Math.abs(mouse.pageY - centerPoint.y) < opts.deadZoneSpread)? true : false;
				};
				
				function isEntireThumbContainerFitInViewPort(){
					var lastItem = contentContainer.children().last();

					return (opts.direction == DIRECTION_HORIZONTAL)?
								((lastItem.position().left + lastItem.innerWidth())<= viewPort.innerWidth()):
								((lastItem.position().top + lastItem.innerHeight())<= viewPort.innerHeight());
				};
				
				
				function scrollBackward (dist){
					var lastThumb = contentContainer.children().last();
					
					if(opts.direction == DIRECTION_HORIZONTAL){
						if((lastThumb.position().left + lastThumb.innerWidth() - Math.abs(contentContainer.position().left) ) < viewPort.innerWidth()){ 
							debug("cannot scroll more backwards");
							return;
						}		
						
						contentContainer.css("left", (contentContainer.position().left - dist) + "px");
					}else{
						if((lastThumb.position().top + lastThumb.innerHeight() - Math.abs(contentContainer.position().top) ) < viewPort.innerHeight()){ 
							debug("cannot scroll more backwards");
							return;
						}		
						
						contentContainer.css("top", (contentContainer.position().top - dist) + "px");
					}
					
				};
				
				function scrollForward (dist){
					if(opts.direction == DIRECTION_HORIZONTAL){
						if(contentContainer.position().left > 0){
							debug("cannot scroll more fowards");
							return;
						}
						contentContainer.css("left", contentContainer.position().left + dist + "px");
					}else{
						if(contentContainer.position().top > 0){
							debug("cannot scroll more fowards");
							return;
						}
						contentContainer.css("top", contentContainer.position().top + dist + "px");
					}
					
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
					mouse = e;
					var dist;
					var halfContainer;
					
					if(opts.direction == DIRECTION_HORIZONTAL){
						dist = Math.abs(mouse.pageX - centerPoint.x);
						halfContainer = viewPort.innerWidth()/2;
					}else{
						dist = Math.abs(mouse.pageY - centerPoint.y);
						halfContainer = viewPort.innerHeight()/2;
					}
					return (opts.maxDur - opts.minDur)*((halfContainer - dist)/(halfContainer)) + opts.minDur;
				};
				
				function isScrollBackward(){
					return (opts.direction == DIRECTION_HORIZONTAL)?
							(mouse.pageX > centerPoint.x)? true:false : 
							(mouse.pageY > centerPoint.y)? true:false; 
				};
				
				function isWithInContainer(targetItem, container){
					var target = targetItem;
					
					//assume no relationship between target and container
					if(opts.direction == DIRECTION_HORIZONTAL){
						if(target.offset().left >= container.offset().left){
							return (target.innerWidth() + target.offset().left <= (container.offset().left + container.innerWidth()))? true : false;
						}else{
							return false;
						}
					}else{
						if(target.offset().top >= container.offset().top){
							return (target.innerHeight() + target.offset().top <= (container.offset().top + container.innerHeight()))? true : false;
						}else{
							return false;
						}
					}
							
					
				};
				
				function bringItemIntoView(index){
					//@TODO add vertical functionality
					 var thumb = $(contentContainer.children()[index]);
						
					 if(thumb.length == 0) return;
					
					 if(isWithInContainer(thumb, viewPort)){
						 debug("index " + index + " is within the view port");
					 }else{
						 if(opts.direction == DIRECTION_HORIZONTAL){
							 debug("inner width" + thumb.innerWidth());
							 var thumbXDelta = thumb.offset().left - viewPort.offset().left;
							 var newContentContainerLeft;
							 if(thumbXDelta < 0){
								 newContentContainerLeft =  contentContainer.position().left + Math.abs(thumbXDelta);
							 }else{
								 newContentContainerLeft =  contentContainer.position().left - (thumbXDelta - viewPort.innerWidth() + thumb.innerWidth());
							 }
							
							 contentContainer.animate({left: newContentContainerLeft + "px"}, opts.showItemSpeed);
						 }else{
							 debug("inner height" + thumb.innerHeight());
							 var thumbYDelta = thumb.offset().top - viewPort.offset().top;
							 var newContentContainerTop;
							 if(thumbYDelta < 0){
								 newContentContainerTop =  contentContainer.position().top + Math.abs(thumbYDelta);
							 }else{
								 newContentContainerTop =  contentContainer.position().top - (thumbYDelta - viewPort.innerHeight() + thumb.innerHeight());
							 }
							
							 contentContainer.animate({top: newContentContainerTop + "px"}, opts.showItemSpeed);
						 }
						 
					 }
					 
				};
				
		 });
	 };
	 
	 $.fn.scrollAdaptor.defaults = {
			 	stepSize:10,
			 	minDur:10,
			 	maxDur:20,
			 	deadZoneSpread:25,
			 	contentSelector:false,
			 	showItemSpeed:20,
			 	direction:"horizontal",
			 	objAccessProxy:false
			 };
	 
	
})(jQuery);