$(function(){
	var userID = $("a#user_link").attr("href").split("-")[0].split("user")[1].substring(1);
	console.log("Your nulled user ID: " + userID);

	if(localStorage["blacklist"] == undefined) {
		localStorage.setItem("blacklist", JSON.stringify({"users":[], "words":[]}));
	}

	var parsed_blacklist = JSON.parse(localStorage["blacklist"]);
	var blacklist_state = "users";
	var insert_state = "";

	var tab_focused = true;
	document.addEventListener('visibilitychange', function(){
	    tab_focused = !tab_focused;
	});

	var twitch_emotes;
	$.getJSON("https://twitchemotes.com/api_cache/v2/global.json", function(json){
		twitch_emotes = json;
	});

	// Interface
	$("div#index_stats").prepend("<div class='ipsBlockOuter' id='nulledplus_options_div' style='display: none;'><div id='nulledplus_options' class='maintitle'>Nulled+ Options</div><div id='nulledplus_options_content' style='display: none; padding: 10px;'><div><input type='button' value='users' name='blacklist_flipswitch' class='input_submit mpr checked' style='width: 48%;'/>&nbsp;<input type='button' value='words' class='input_submit' name='blacklist_flipswitch' style='width: 48%;'/></div><br><span id='blacklist_desc'>Blacklisted Users</span><textarea id='array_content' style='width: 93%; margin-top: 12px;'></textarea><br><input type='button' class='input_submit mpr' id='save_blacklist' value='Save' style='float: right; margin-right: 10px;'><br><br><input type='checkbox' id='mark_on_tag'> Mark messages where i'm tagged<br><input type='checkbox' id='sound_on_tag'> Make sound when tagged (Inactive tab)</div></div>");
	$("div#socket_chat").css("margin-bottom", "0px");
	$("h3.maintitle:first").append("<input type='button' id='recheck_shoutbox' style='float: right; padding: 3px; border-radius: 3px; background-color: #252525; border-color: #353535; border-style: solid; color: #afafaf;' value='Recheck Shoutbox'/>");
	$("div#socket_chat").after("<div class='category_block block_wrap side_extra'><div class='extra_buttons'><button class='input_submit mpr' value='insert_youtube'><img class='button_image' src='" + chrome.extension.getURL('images/youtube_icon.png') + "'/></button>&nbsp;<button class='input_submit mpr' value='insert_image'><img class='button_image' src='" + chrome.extension.getURL('images/camera_icon.png') + "'/></button></div></div><br>");
	$("div.content").prepend("<div id='sbplus_modal' class='sb-modal fadein-transition' style='display: none;'><div class='popupWrapper'><div class='popupInner'><h3>xd</h3><div><div class='sbplus-modal-content ipsPad ipsForm_center'><span id='sbplus-modal-title'></span><br><br><input type='text' class='input_text' id='sbplus-modal-input'/><br><br><a id='sbplus-modal-add' class='input_submit mpr' rel='modal:close'>Add</a>&nbsp;<a id='sbplus-modal-close' class='input_submit mpr' rel='modal:close'>Close</a></div></div></div></div></div>");
	// Interface startup
	$("#sound_on_tag").prop("checked", (localStorage["tagsound"]  == "true" ? true : false));
	$("#mark_on_tag").prop("checked", (localStorage["tagmark"] == "true" ? true : false));
	$("#nulledplus_options_div").slideDown();
	arrayToTextarea(blacklist_state);
	// Events
	$("#nulledplus_options").click(function(){ $("#nulledplus_options_content").slideToggle(); });
	$("#sound_on_tag").click(function(){ localStorage.setItem("tagsound", $("#sound_on_tag").prop("checked")); });
	$("#mark_on_tag").click(function(){ localStorage.setItem("tagmark", $("#mark_on_tag").prop("checked")); });
	$("input[name='blacklist_flipswitch']").click(function(){
	 	$(this).addClass("checked");
	 	$("input[value='" + ($(this).val() == "words" ? "users" : "words") + "']").removeClass("checked");
		$("#blacklist_desc").text("Blacklisted " + $(this).val());
		blacklist_state = $(this).val();
		arrayToTextarea(blacklist_state);
 	});
	$("#save_blacklist").click(function() {
		var splitList = $("#array_content").val().split(',');
		var newArray = [];
		for(i = 0; i < splitList.length; i++) {
			if(splitList[i] != '') {
				if(splitList[i].indexOf(' ') == -1) {
					newArray.push(splitList[i]);
				}
			}
		}
		parsed_blacklist[blacklist_state] = newArray;
		localStorage.setItem("blacklist", JSON.stringify(parsed_blacklist));
		$("#recheck_shoutbox").click();
	});
	$("#recheck_shoutbox").click(function(){
		$("tr.checked").each(function(){
			$(this).removeClass("checked");
		});
	});
	$("button[value^='insert_']").click(function(){
		$('div#sbplus_modal').modal({
			showClose: false,
			clickClose: true
		});
		$('span#sbplus-modal-title').text("Insert " + $(this).val().split('_')[1] + " Tag");
		insert_state = $(this).val();
		$("input#sbplus-modal-input").focus();
	});
	$("a#sbplus-modal-add").click(function(){
		var inserted_tag = " ";
		if(insert_state == "insert_youtube") {
			inserted_tag += "[yt]" + $("input#sbplus-modal-input").val() + "[/yt]";
		} else {
			inserted_tag += "[img]" + $("input#sbplus-modal-input").val() + "[/img]";
		}
		inserted_tag += " ";
		$("input#sbplus-modal-input").val("");
		$("input.shoutBoxInputMessage").val($("input.shoutBoxInputMessage").val() + inserted_tag);
	});
	// Functions
	function arrayToTextarea(blacklist_state) {
		$("#array_content").val("");
		if(parsed_blacklist[blacklist_state].length > 0) {
			for(i = 0; i < parsed_blacklist[blacklist_state].length - 1; i++) {
				$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][i] + ",");
			}
			$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][parsed_blacklist[blacklist_state].length - 1]);
		}
	}
	// Shoutbox
	setInterval(function() {
		$("tr.shout:not(.checked)").each(function(){
			var shoutID = $(this).attr("id").split("_")[1];
			if(shoutID != "shout_global_srv_msg") {
				$("div.chatMessages").removeAttr("max-height");
				$("div.chatMessages").css("height", "250px");
				var shoutAuthor = $(this).contents().find("span.shoutAuthor > a > span").text();
				var shoutMessage = $(this).contents().find("span.shoutMessage");
				console.log("=> Scanning Shout #" + shoutID + " by " + shoutAuthor);

				console.log("> Checking if user is blacklisted");
				if(parsed_blacklist.users.includes(shoutAuthor)) {
					$(this).fadeOut("slow");
					console.log(">> Blocked shout by " + shoutAuthor + ", Blacklisted user");
				} else {
					console.log("> Checking if shout contains any blacklisted words");
					var shout_hidden = false;
					for(i = 0; i < parsed_blacklist.words.length; i++) {
						if(parsed_blacklist.words[i] != '' && parsed_blacklist.words[i].includes(' ') == false) {
							if(shoutMessage.text().includes(parsed_blacklist.words[i])) {
								$(this).fadeOut("fast");
								console.log(">> Blocked shout by " + shoutAuthor + ", contained blacklisted word: " + parsed_blacklist.words[i]);
								shout_hidden = true;
							}
						}
					}
					if(!shout_hidden) {
						if($(this).is('visible') == false) {
							$(this).fadeIn("slow");
						}
						console.log("> Searching for your tags in shout");
						$(shoutMessage).children("a").each(function(){
							if($(this).attr("href").split("#")[0].split("!")[1] == userID) {
								console.log(">> Found your tag, marking shout");
								if($("input#mark_on_tag").prop("checked")) {
									$(shoutMessage).parent().css("background-color", "rgba(189, 34, 34, 0.27)");
								}
								if($("input#sound_on_tag").prop('checked')) {
									if(tab_focused == false) {
										var notification = new Audio();
										notification.src = chrome.extension.getURL('sounds/notification.mp3');
										notification.play();
									}
								}
							}
						});
						console.log("> Searching for twitch emotes");
						Object.keys(twitch_emotes).forEach(function (key) {
							if(shoutMessage.text().includes(key)) {
								shoutMessage.text(shoutMessage.text().replace(new RegExp(key, 'g'), "XD" + key + "XD"));
							}
						});
					}
				}
			}
			$(this).addClass("checked");
		});
	}, 1);
});
