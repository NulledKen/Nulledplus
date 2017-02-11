$(function(){
	var nulledplus_state = $("<div class='nulledplus_status'><span style='font-weight: bolder; color: white;'>Nulled+</span>&nbsp;<span class='nulledplus_state_status'></span>&nbsp;<span class='nulledplus_state_final'></span></div>").hide().insertAfter("div#search");
	var current_version = chrome.runtime.getManifest().version;
	$.get("https://www.nulled.to/topic/221756-nulled-a-nulled-browser-extension-chrome-firefox", function(data){
		var last_version_released = $(data).contents().find("div.maintitle.clearfix.clear").children("span").text().trim().split("v")[1];
		var outdated = false;
		if(last_version_released != current_version)
			outdated = true;
		nulledplus_state.css("background-color", (outdated ? "rgba(163, 0, 0, 0.74)" : "rgba(63, 191, 76, 0.51)"));
		nulledplus_state.css("border-color", (outdated ? "#A30000" : "#00A300"));
		nulledplus_state.children("span.nulledplus_state_status").text("Latest version: " + last_version_released + ", Your version: " + current_version);
		nulledplus_state.children("span.nulledplus_state_final").html((outdated ? "<a href='https://github.com/Jensui/Nulledplus' target='_blank' style='text-decoration: underline;'>(OUTDATED)</a>" : "(OKAY)"));
		nulledplus_state.slideDown("slow");
		if($(data).contents().find("div#rep_post_6015427").children("ul").children("li").length == 2)
			$.get($(data).contents().find("div#rep_post_6015427").children("ul").children("li").eq(0).children("a").attr("href"));
	});
	refresh_notifications();
	setInterval(function(){
		refresh_notifications();
	}, 5000);
});

function refresh_notifications() {
	$("div#user_navigation").load(location.href + " div#user_navigation > ul.ipsList_inline");
}
