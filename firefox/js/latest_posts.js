$(function(){
	var topics_interval = null,
		posts_interval = null;

	var recent_topics = (localStorage["recent_topics"] == "true" ? true : false),
		latest_posts = (localStorage["latest_posts"] == "true" ? true : false);
	// Interface
	$("div.__xXrecent20topics").parent().before("<div class='section_update'><input type='checkbox' id='recent_topics'/> Auto-updating of this section</div>");
	$("div.__xXlatest20posts").parent().before("<div class='section_update'><input type='checkbox' id='latest_posts'/> Auto-updating of this section</div>");
	// Interface Startup
	if(recent_topics)
		start_interval("recent_topics");
	if(latest_posts)
		start_interval("latest_posts");
	$("input#recent_topics").prop("checked", recent_topics);
	$("input#latest_posts").prop("checked", latest_posts);
	// Events
	$("input#recent_topics, input#latest_posts").click(function(){
		localStorage.setItem($(this).prop('id'), $(this).prop('checked'));
		if($(this).prop('checked'))
			start_interval($(this).prop('id'));
		else
			stop_interval($(this).prop('id'));
	});
	// Overly complicated start and stop intervals for refreshing sections
	function start_interval(state) {
		if(state == "recent_topics") {
			$("ul.ipsList_withminiphoto").eq(0).parent().load(location.href + " ul.ipsList_withminiphoto");
			topics_interval = setTimeout(function(){ start_interval(state) }, 10000);
		}
		else {
			$("ul.ipsList").load(location.href + " li.ipsPad_half")
			posts_interval = setTimeout(function(){ start_interval(state) }, 10000);
		}
	}
	function stop_interval(state) {
		if(state == "recent_topics")
			clearTimeout(topics_interval);
		else
			clearTimeout(posts_interval);
	}
});
