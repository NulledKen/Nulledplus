$(function(){
	$("a#inbox_link, a#notify_link").click(function(){
		document.title = "Nulled - Expect the unexpected";
	});
	refresh_notifications();
	setInterval(function(){
		refresh_notifications();
	}, 5000);
});

function refresh_notifications() {
	$("a#inbox_link").parent().load(location.href + " #inbox_link");
	$("a#notify_link").parent().load(location.href + " #notify_link");
}
