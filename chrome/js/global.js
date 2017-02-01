refresh_notifications();
$(function(){
	setInterval(function(){
		refresh_notifications();
	}, 1000);
});

function refresh_notifications() {
	$("a#inbox_link").load(location.href + " #inbox_link");
	$("a#notify_link").load(location.href + " #notify_link");
}
