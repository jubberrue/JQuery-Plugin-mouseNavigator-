/**
 * 
 */
function AdGalleryThumbNavigation(settings){
	var viewPort=false;
	var contentContainer=false;
	var navInterval=false;
	var centerPoint = {x:0,y:0};
	var mouse;
	
	var stepSize = 10;
	var minDur = 5;
	var maxDur = 20;
	var deadZoneSpread = 50;
	var showThumbSpeed = 100;
	
	this.applyNavigation=function(){
		viewPort = $(".ad-thumbs");
		
		viewPort.bind("mousemove.adGalleryThumbNavigation", function(e){handleMouseMove(e);}).bind("mouseleave.adGalleryThumbNavigation", function(e){handleMouseOut(e);}).bind("mouseenter.adGalleryThumbNavigation", function(e){handleMouseOver(e);}).bind("resize.adGalleryThumbNavigation", function(e){handleResize(e);});
		
		contentContainer = $(".ad-thumb-list");
	};
	
	function trackMouse (e){
		mouse = e;
	};
	
	function calculateCenterPoint (){
		centerPoint.x = Math.round(viewPort.offset().left + (viewPort.innerWidth()/2));
		centerPoint.y = Math.round(viewPort.offset().top + (viewPort.innerHeight()/2));
	};
	
	
	/* need to test this functionality out */
	function handleResize (e){
		calculateCenterPoint();
		
	};
	
	function navigate(){
		if(!shouldScroll())	return;
		
		(isScrollBackward())? scrollBackward(stepSize): scrollForward(stepSize);
	};
	
	function shouldScroll(){
		if(isEntireThumbContainerFitInViewPort()){
			debug("thumb container smaller than viewPort, no scrolling " + contentContainer.innerWidth() + " : " + viewPort.innerWidth() );
			return false;
		};
		
		return (isInsideDeadZone())? false: true;
	};
	
	function isInsideDeadZone(){
		/*@TODO add vertical component*/
		return (Math.abs(mouse.pageX - centerPoint.x) < deadZoneSpread)? true : false;
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
		/*@TODO add vertical component
		 * maybe should use the first child element as the reference point instead of contentContianer*/
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
		return (maxDur - minDur)*((halfContainer - dist)/(halfContainer)) + minDur;
	};
	
	function isScrollBackward(){
		/*@TODO add vertical component*/
		return (mouse.pageX > centerPoint.x)? true:false;
	};
	
	this.showThumb = function(thumbIndex){
		var thumb = $(contentContainer.children()[thumbIndex]);
		
		if(thumb.length == 0) return;
		
		
		if(isWithInContainer(thumb, viewPort)){
			debug("thumb " + thumbIndex + " is within the view port");
		}else{
			var thumbXDelta = thumb.offset().left - viewPort.offset().left;
			var newContentContainerLeft;
			if(thumbXDelta < 0){
				newContentContainerLeft =  contentContainer.position().left + Math.abs(thumbXDelta);
			}else{
				newContentContainerLeft =  contentContainer.position().left - (thumbXDelta - viewPort.innerWidth() + thumb.innerWidth());
			}
			
			contentContainer.animate({left: newContentContainerLeft + "px"}, showThumbSpeed);
		};
		
		
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
}