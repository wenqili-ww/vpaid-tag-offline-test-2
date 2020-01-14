wwplayer.define(["jquery","underscore","AnimationController","pubsub","globals"],function(e,t,i,n,a){return i.extend({init:function(e,i,s,o){a.LOG("make js animation controller");var r=this;this._super(e,i,s,o),r.comeInTimers=[],r.leaveTimers=[],r.frameRepresentedTagData={},r.tagsIn={},r.staticPositions={},r.animatingTags=[],r.animatingStaticTags=[],n.subscribe(a.HAS_SEEKED,function(){t.each(r.animatingStaticTags,function(e){e.hasBrungInStatic=!1})}),n.subscribe(a.HAS_PAUSED,function(){t.each(r.comeInTimers,function(e){window.clearTimeout(e)}),t.each(r.leaveTimers,function(e){window.clearTimeout(e)}),r.comeInTimers=[]}),n.subscribe(a.HAS_PLAYED,function(){window.setTimeout(function(){r.animateTag(null,null,null,a.GET_CURRENT_PLAYING_TIME)},100)}),function(){for(var e=0,t=["ms","moz","webkit","o"],i=0;i<t.length&&!window.requestAnimationFrame;++i)window.requestAnimationFrame=window[t[i]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[t[i]+"CancelAnimationFrame"]||window[t[i]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(t,i){var n=(new Date).getTime(),a=Math.max(0,40-(n-e)),s=window.setTimeout(function(){t(n+a)},a);return e=n+a,s}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}()},createAnimations:function(e,i,n){a.LOG("create js animations");var s=1/this.fps*1e3,o=t.size(e),r=t.size(n);this.generateKeyframesForClip(e,o,i,s,n,r)},generateKeyframesForClip:function(e,i,n,a,s,o){var r=this,m=[];t.each(e,function(e,i){t.each(e.tags,function(t,n){t.deleted||m.push({clipIndex:i,tagIndex:n,tag:t,clipIn:e.in})})}),t.each(m,function(e){for(var i=e.clipIndex,a=e.tagIndex,s=e.clipIn,o=e.tag,m=t.size(o.x),c=0;c<=m;c++){var l=parseFloat(o.w[c]),d=parseFloat(o.h[c]),g=parseFloat(o.y[c])-.5*d,u=parseFloat(o.x[c])-.5*l,f={top:100*g+"%",left:100*u+"%",width:100*l+"%",height:100*d+"%",display:"block"};if(n[i+"-"+a]){var p=n[i+"-"+a].getKeyFrameCSS({top:g,left:u,width:l,height:d});for(var h in p)"auto"!==p[h]&&(f[h]=p[h],"top"===h&&delete f.bottom,"bottom"===h&&delete f.top,"left"===h&&delete f.right,"right"===h&&delete f.left)}var w=o.in+c+s;r.frameRepresentedTagData[i]||(r.frameRepresentedTagData[i]={}),r.frameRepresentedTagData[i][a]||(r.frameRepresentedTagData[i][a]={}),r.frameRepresentedTagData[i][a][w]=f}});for(staticIndex in s)if(n["-1-"+staticIndex]){var c=s[staticIndex],l=parseFloat(c.w[0]),d=parseFloat(c.h[0]),g=parseFloat(c.y[0])-.5*d,u=parseFloat(c.x[0])-.5*l;if(n["-1-"+staticIndex].overridePosition());else{var f={top:100*g+"%;",left:100*u+"%;",width:100*l+"%;",height:100*d+"%;"},p=n["-1-"+staticIndex].getKeyFrameCSS({top:g,left:u,width:l,height:d});for(var h in p)f[h]=p[h];r.staticPositions["s"+staticIndex]=f}r.animateStaticTag(n["-1-"+staticIndex])}this.animationsCreated()},animateStaticTag:function(i){var n=this;i.element.style.display="none",e(i.element).css(n.staticPositions[i.tagIndex]),i.hasBrungInStatic=!1,t.contains(n.animatingStaticTags,i)||n.animatingStaticTags.push(i)},animateTag:function(i,n,a,s){var o=this,r=0;if(0!==this.tagDisplayMode){var m=function(){r++;var i=parseInt(s()*o.fps),n=s();t.each(o.animatingTags,function(t){o.frameRepresentedTagData[t.clipIndex][t.tagIndex][i]?(o.tagsIn[t.clipIndex+"-"+t.tagIndex]||(t.bringIn(),o.tagsIn[t.clipIndex+"-"+t.tagIndex]=!0),e(t.element).css(o.frameRepresentedTagData[t.clipIndex][t.tagIndex][i])):(e(t.element).css({display:"none"}),o.tagsIn[t.clipIndex+"-"+t.tagIndex]=!1,delete o.animatingTags[t])}),t.each(o.animatingStaticTags,function(e){e.tagStartTime<=n&&e.tagAnimationTime+e.tagStartTime>=n?(e.element.style.display="block",e.element.style.visibility="visible",e.hasBrungInStatic||(e.hasBrungInStatic=!0,e.bringIn())):e.element.style.display="none"}),o.animating&&window.requestAnimationFrame(m)};if(s)o.animating||(o.animating=!0,window.requestAnimationFrame(m)),!i||i.isStatic||t.contains(o.animatingTags,i)||o.animatingTags.push(i);else{var c=1/o.fps;i&&o.comeInTimers.push(window.setTimeout(function(){i.element.style.display="block",i.bringIn(),o.leaveTimers.push(window.setTimeout(function(){i.element.style.display="none",i.finished()},n*c*1e3))},1e3*a))}}i&&this._super(i,n,a)},pauseAnimation:function(e){this.animating=!1},animateTo:function(t,i,n,a,s,o){window.setTimeout(function(){e(t).animate(n,1e3*i,"linear",o)},1e3*a)},pauseTagAtPosition:function(t,i){i&&t.showOnPause?e(t.element).css({display:"block",visibility:"visible",height:100*i.height+"%",width:100*i.width+"%",left:100*i.left+"%",top:100*i.top+"%"}):i||e(t.element).css({display:"block",visibility:"visible"})}})});