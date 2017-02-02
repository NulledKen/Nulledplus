$(function(){
	$("a#inbox_link, a#notify_link").click(function(){
		document.title = "Nulled - Expect the unexpected";
	});
	// TODO: Figure out why it moves the notifications icons;
	refresh_notifications();
	setInterval(function(){
		refresh_notifications();
	}, 1000);
});

function refresh_notifications() {
	$("a#inbox_link").load(location.href + " #inbox_link");
	$("a#notify_link").load(location.href + " #notify_link");
}
