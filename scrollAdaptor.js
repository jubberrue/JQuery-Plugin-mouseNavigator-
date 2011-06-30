/**
 * 
 * @TODO should have the ability to apply to the same containers both vertical and horizontal mouse
 * scrolling. Will need to do the following:
 * - currently it is assumed the first item is located at the beginning of the container should
 * modify the code to allow the first item to be placed anywhere.
 * 
 * - allow for manual selection of first item and last item. 
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
			 	
				// private function for debugging, only works with firefox/firebug
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
					if(isEntireContentContainerFitInViewPort()){
						debug("item container smaller than viewPort, no scrolling " + contentContainer.innerWidth() + " : " + viewPort.innerWidth() );
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
				
				function isEntireContentContainerFitInViewPort(){
					var lastItem = contentContainer.children().last();

					return (opts.direction == DIRECTION_HORIZONTAL)?
								((lastItem.position().left + lastItem.innerWidth())<= viewPort.innerWidth()):
								((lastItem.position().top + lastItem.innerHeight())<= viewPort.innerHeight());
				};
				
				
				function scrollBackward (dist){
					var lastItem = contentContainer.children().last();
					
					if(opts.direction == DIRECTION_HORIZONTAL){
						if((lastItem.position().left + lastItem.innerWidth() - Math.abs(contentContainer.position().left) ) < viewPort.innerWidth()){ 
							debug("cannot scroll more backwards");
							return;
						}		
						
						contentContainer.css("left", (contentContainer.position().left - dist) + "px");
					}else{
						if((lastItem.position().top + lastItem.innerHeight() - Math.abs(contentContainer.position().top) ) < viewPort.innerHeight()){ 
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
					var result = false;
					if(opts.direction == DIRECTION_HORIZONTAL){
						result = (mouse.pageX > centerPoint.x)? true:false;
					}else{
						result = (mouse.pageY > centerPoint.y)? true:false;						
					}
					
					return (!opts.invertedControl)? result : !result;
				};
				
				function isWithInContainer(targetItem, container){
					var target = targetItem;
					
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
					 var item = $(contentContainer.children()[index]);
						
					 if(item.length == 0) return;
					
					 if(isWithInContainer(item, viewPort)){
						 debug("index " + index + " is within the view port");
					 }else{
						 if(opts.direction == DIRECTION_HORIZONTAL){
							 debug("inner width" + item.innerWidth());
							 var itemXDelta = item.offset().left - viewPort.offset().left;
							 var newContentContainerLeft;
							 if(itemXDelta < 0){
								 newContentContainerLeft =  contentContainer.position().left + Math.abs(itemXDelta);
							 }else{
								 newContentContainerLeft =  contentContainer.position().left - (itemXDelta - viewPort.innerWidth() + item.innerWidth());
							 }
							
							 contentContainer.animate({left: newContentContainerLeft + "px"}, opts.showItemSpeed);
						 }else{
							 debug("inner height" + item.innerHeight());
							 var itemYDelta = item.offset().top - viewPort.offset().top;
							 var newContentContainerTop;
							 if(itemYDelta < 0){
								 newContentContainerTop =  contentContainer.position().top + Math.abs(itemYDelta);
							 }else{
								 newContentContainerTop =  contentContainer.position().top - (itemYDelta - viewPort.innerHeight() + item.innerHeight());
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
			 	invertedControl:false,
			 	objAccessProxy:false
			 };
	 
	
})(jQuery);