$(function(){
	var userID = $("a#user_link").attr("href").split("-")[0].split("user")[1].substring(1);
	console.log("Your nulled user ID: " + userID);

	if(localStorage["blacklist"] == undefined) {
		localStorage.setItem("blacklist", JSON.stringify({"users":[], "words":[]}));
	}
	if(localStorage["hide_method"] == undefined) {
		localStorage.setItem("hide_method", "fade");
	}

	var parsed_blacklist = JSON.parse(localStorage["blacklist"]);
	var blacklist_state = "users";
	var insert_state = "";

	var json_loaded_count = 0;
	var twitch_emotes;
	$.getJSON("https://twitchemotes.com/api_cache/v2/global.json", function(json){
		twitch_emotes = json.emotes;
		json_loaded();
	});
	var btwitch_emotes;
	$.getJSON("https://api.betterttv.net/2/emotes", function(json){
		btwitch_emotes = json.emotes;
		json_loaded();
	});

	var vis = (function(){
	    var stateKey, eventKey, keys = {
	        hidden: "visibilitychange",
	        webkitHidden: "webkitvisibilitychange",
	        mozHidden: "mozvisibilitychange",
	        msHidden: "msvisibilitychange"
	    };
	    for (stateKey in keys) {
	        if (stateKey in document) {
	            eventKey = keys[stateKey];
	            break;
	        }
	    }
	    return function(c) {
	        if (c) document.addEventListener(eventKey, c);
	        return !document[stateKey];
	    }
	})();
	// Interface
	$("div#index_stats").prepend("<div class='ipsBlockOuter' id='nulledplus_options_div' style='display: none;'><div id='nulledplus_options' class='maintitle'>Nulled+ Options</div><div id='nulledplus_options_content' style='display: none; padding: 10px;'><div><input type='button' value='users' name='blacklist_flipswitch' class='input_submit mpr checked' style='width: 48%;'/>&nbsp;<input type='button' value='words' class='input_submit' name='blacklist_flipswitch' style='width: 48%;'/></div><br><span id='blacklist_desc'>Blacklisted Users</span>&nbsp; ( <input type='radio' id='fade' name='hide_method'/> Fade <input type='radio' id='slide' name='hide_method'/> Slide <input type='radio' id='hide' name='hide_method'/> Hide )<textarea id='array_content' style='width: 93%; margin-top: 12px;'></textarea><br><input type='button' class='input_submit mpr' id='save_blacklist' value='Save' style='float: right; margin-right: 10px;'><br><br><input type='checkbox' id='mark_on_tag'> Mark messages where i'm tagged<br><input type='checkbox' id='sound_on_tag'> Make sound when tagged (Inactive tab)</div></div>");
	$("div#socket_chat").css("margin-bottom", "0px");
	$("div#socket_chat").after("<div class='category_block block_wrap side_extra'><div class='extra_buttons'><button class='input_submit mpr' value='insert_youtube'><img class='button_image' src='" + chrome.extension.getURL('images/youtube_icon.png') + "'/></button>&nbsp;<button class='input_submit mpr' value='insert_image'><img class='button_image' src='" + chrome.extension.getURL('images/image_icon.png') + "'/></button></div></div><br>");
	$("div#content").prepend("<div id='sbplus_modal' class='sb-modal fadein-transition' style='display: none;'><div class='popupWrapper'><div class='popupInner'><h3 id='insert_title'>xd</h3><div><div class='sbplus-modal-content ipsPad ipsForm_center'><span id='sbplus-modal-title'></span><br><br><input type='text' class='input_text' id='sbplus-modal-input'/><br><br><a id='sbplus-modal-add' class='input_submit mpr' rel='modal:close'>Add</a>&nbsp;<a id='sbplus-modal-close' class='input_submit mpr' rel='modal:close'>Close</a></div></div></div></div></div>");
	// Interface startup
	$("input#sound_on_tag").prop("checked", (localStorage["tagsound"]  == "true" ? true : false));
	$("input#mark_on_tag").prop("checked", (localStorage["tagmark"] == "true" ? true : false));
	$("input#" + localStorage["hide_method"]).prop("checked", true);
	$("#nulledplus_options_div").slideDown();
	array_to_textarea(blacklist_state);
	// Events
	$("#nulledplus_options").click(function(){ $("#nulledplus_options_content").slideToggle("slow"); });
	$("#sound_on_tag").click(function(){ localStorage.setItem("tagsound", $("#sound_on_tag").prop("checked")); });
	$("#mark_on_tag").click(function(){ localStorage.setItem("tagmark", $("#mark_on_tag").prop("checked")); });
	$("input[name='hide_method']").click(function() { localStorage.setItem("hide_method", $(this).prop('id')); });

	$("input[name='blacklist_flipswitch']").click(function(){
	 	$(this).addClass("checked");
	 	$("input[value='" + ($(this).val() == "words" ? "users" : "words") + "']").removeClass("checked");
		$("#blacklist_desc").text("Blacklisted " + $(this).val());
		blacklist_state = $(this).val();
		array_to_textarea(blacklist_state);
 	});
	$("#save_blacklist").click(function() {
		var splitList = $("#array_content").val().split(',');
		var newArray = [];

		for(i = 0; i < splitList.length; i++)
			if(splitList[i] != '')
				if(splitList[i].indexOf(' ') == -1)
					newArray.push(splitList[i]);

		parsed_blacklist[blacklist_state] = newArray;
		localStorage.setItem("blacklist", JSON.stringify(parsed_blacklist));
		// Recheck shoutbox
		$("tr.checked").each(function(){
			$(this).removeClass("checked");
		});
	});
	$("button[value^='insert_']").click(function(){
		$('div#sbplus_modal').modal({
			showClose: false,
			clickClose: true
		});
		var state_string = $(this).val().split('_')[1];
		$('span#sbplus-modal-title').text("Insert " + state_string + " Tag");
		$('h3#insert_title').text(state_string);
		insert_state = $(this).val();
		$("input#sbplus-modal-input").focus();
	});
	$("a#sbplus-modal-add").click(function(){
		var inserted_tag = " ";
		inserted_tag += (insert_state == "insert_youtube" ? "[yt]" + $("input#sbplus-modal-input").val() + "[/yt]" : "[img]" + $("input#sbplus-modal-input").val() + "[/img]");
		inserted_tag += " ";
		$("input#sbplus-modal-input").val("");
		$("input.shoutBoxInputMessage").val($("input.shoutBoxInputMessage").val() + inserted_tag);
	});
	$(document).on('click', 'a.block_user', function(){
		parsed_blacklist[blacklist_state].push($(this).prop("name"));
		localStorage.setItem("blacklist", JSON.stringify(parsed_blacklist));
		array_to_textarea("users");
		// Recheck shoutbox
		$("tr.checked").each(function(){
			$(this).removeClass("checked");
		});
	});
	// Functions
	function array_to_textarea(blacklist_state) {
		$("#array_content").val("");
		if(parsed_blacklist[blacklist_state].length > 0) {
			for(i = 0; i < parsed_blacklist[blacklist_state].length - 1; i++)
				$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][i] + ",");
			$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][parsed_blacklist[blacklist_state].length - 1]);
		}
	}
	function hide_shout(shout) {
		switch(localStorage["hide_method"]) {
			case "fade":
				shout.fadeOut("fast");
				break;
			case "slide":
				// TODO: Not working ATM, just hides.
				shout.slideUp("fast");
				break;
			case "hide":
				shout.hide(1);
				break;
		}
	}
	function check_blacklist_users(shoutAuthor) {
		return parsed_blacklist.users.includes(shoutAuthor);
	}
	function check_blacklist_words(shoutMessage) {
		for(i = 0; i < parsed_blacklist.words.length; i++)
			if(parsed_blacklist.words[i] != '' && !parsed_blacklist.words[i].includes(' '))
				if(shoutMessage.includes(parsed_blacklist.words[i]))
					return true;
		return false;
	}
	function json_loaded() {
		json_loaded_count++;
		// If loaded both BTTV & Twitch emotes JSON
		if(json_loaded_count == 2) {
			// Shoutbox
			setInterval(function() {
				$("tr.shout:not(.checked)").each(function(){
					var shoutID = $(this).attr("id").split("_")[1];
					if(shoutID != "shout_global_srv_msg") {
						var shoutAuthor = $(this).contents().find("span.shoutAuthor > a > span").text();
						var shoutMessage = $(this).contents().find("span.shoutMessage");
						// Check for blacklist, hide if found, if not check for everything else
						if(check_blacklist_users(shoutAuthor) || check_blacklist_words(shoutMessage.text()))
							hide_shout($(this));
						else {
							// Show if hidden (Added users to blacklist and then removed: shows back up)
							if($(this).is('visible') == false)
								$(this).fadeIn("slow");
							// Add block user
							if(!$(this).contents().find("img.block_user").length) {
								//target = $(this).children()[0].children[0];
								$(this).children().eq(0).children().eq(0).before("<a name='" + shoutAuthor + "' class='block_user' title='Block " + shoutAuthor + "'><img src='" + chrome.extension.getURL("images/block_icon.png") + "' class='block_user'></a>");
							}
							// Tags in message
							$(shoutMessage).children("a").each(function(){
								if($(this).attr("href").split("#")[0].split("!")[1] == userID) {
									if($("input#mark_on_tag").prop("checked"))
										$(shoutMessage).parent().css("background-color", "rgba(189, 34, 34, 0.27)");
									if($("input#sound_on_tag").prop('checked')) {
										if(!vis()) {
											var notification = new Audio();
											notification.src = chrome.extension.getURL('sounds/notification.mp3');
											notification.play();
										}
									}
								}
							});
							// Twitch global emotes
							Object.keys(twitch_emotes).forEach(function (key) {
								if(shoutMessage.text().includes(key))
									shoutMessage.html(shoutMessage.html().replace(new RegExp(key, 'g'), "<img src='https://static-cdn.jtvnw.net/emoticons/v1/" + twitch_emotes[key].image_id + "/1.0'/>"));
							});
							// BTTV Emotes
							btwitch_emotes.forEach(function (emote) {
								if(shoutMessage.text().includes(emote.code))
									shoutMessage.html(shoutMessage.html().replace(new RegExp(escape(emote.code), 'g'), "<img src='https://cdn.betterttv.net/emote/" + emote.id + "/1x'/>"));
							});
						}
					}
					$(this).addClass("checked");
				});
			}, 10);
		}
	}
});
