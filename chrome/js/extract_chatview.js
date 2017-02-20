setTimeout(function() {
	var loadedMessages = chatView.$get("messages");
	var s = document.createElement('script');
	s.src = "https://code.jquery.com/jquery-3.1.1.min.js";
	(document.head||document.documentElement).appendChild(s);
	s.onload = function(){
		$(function(){
			var array = [];
			loadedMessages.forEach(function(message){
				array.push(message);
			});
			document.dispatchEvent(new CustomEvent('nulledplus_pass_recheck_shoutbox', {
				detail: [array, chat.isMod]
			}));
		});
	};
}, 1500);
