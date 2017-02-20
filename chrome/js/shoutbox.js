$(function(){
	var userID = $("a#user_link").attr("href").split("-")[0].split("user")[1].substring(1);
	var userName = $("a#user_link").text().split(' ')[0];
	console.log("Your Nulled ID: " + userID + ", Name: " + userName);

	if(localStorage["nulledplus_shoutbox"] == undefined)
		localStorage.setItem("nulledplus_shoutbox", JSON.stringify({"users":[], "words":[]}));
	var parsed_blacklist = JSON.parse(localStorage["nulledplus_shoutbox"]);

	var blacklist_state = "users";
	var insert_state = "";

	// Emotes Modal
	$("div#content").prepend("<div id='sbplus_modal_emotes'><div class='sbplus-modal-content ipsPad ipsForm_center'><h3 id='emotes_title'>NULLED</h3><div id='nulled_emotes'><table><tbody></tbody></table></div><br><h3 id='emotes_title'>TWITCH.TV</h3><div id='twitch_emotes'><table><tbody></tbody></table></div><br><h3 id='emotes_title'>BTTV</h3><div id='btwitch_emotes'><table><tbody></tbody></table></div></div></div>");
	$("div#sbplus_modal_emotes").dialog({
		autoOpen: false,
		title: "Insert Emotes",
		show: "blind",
		hide: "blind",
		dialogClass: 'nulledplus_dialog'
	});
	// Twitch emotes
	json_loaded_count = 0;
	var twitch_emotes = [];
	$.getJSON("https://twitchemotes.com/api_cache/v2/global.json", function(json){
		twitch_emotes = json.emotes;
		// Load into modal
		var index = 0;
		var current_row = $("<tr></tr>").appendTo("div#twitch_emotes > table > tbody");
		Object.keys(twitch_emotes).forEach(function (key) {
			index++;
			current_row.append("<td><img src='https://static-cdn.jtvnw.net/emoticons/v1/" + twitch_emotes[key].image_id + "/1.0' onclick='document.getElementById(\"shoutbox_input\").value += \" \" + \"" + key + "\" + \" \"' class='shoutbox_emote'></td>");
			if(index == 6) {
				current_row = $("<tr></tr>").appendTo("div#twitch_emotes > table > tbody");
				index = 0;
			}
		});
	});
	// BTTV emotes
	var btwitch_emotes = [];
	$.getJSON("https://api.betterttv.net/2/emotes", function(json){
		btwitch_emotes = json.emotes;
		// Load into modal
		var index = 0;
		var current_row = $("<tr></tr>").appendTo("div#btwitch_emotes > table > tbody");
		json.emotes.forEach(function(emote){
			index++;
			current_row.append("<td><img src='https://cdn.betterttv.net/emote/" + emote.id + "/1x' onclick='document.getElementById(\"shoutbox_input\").value += \" \" + \"" + emote.code + "\" + \" \"' class='shoutbox_emote'></td>");
			if(index == 6) {
				current_row = $("<tr></tr>").appendTo("div#btwitch_emotes > table > tbody");
				index = 0;
			}
		});
	});

	// Nulled emotes
	$.get("//www.nulled.to/index.php?app=forums&module=extras&section=legends", function(data){
		// Load into modal
		var index = 0;
		var current_row = $("<tr></tr>").appendTo("div#nulled_emotes > table > tbody");
		$(data).find("table.ipb_table > tbody").children().each(function(){
			var emote = $(this).children().first().children().first();
			index++;
			current_row.append("<td><img src='https://s.nulledcdn.com/public/style_emoticons/default/" + emote.attr('title') + "' onclick='document.getElementById(\"shoutbox_input\").value += \" \" + \"" + emote.text() + "\" + \" \"' class='shoutbox_emote'></td>");
			if(index == 6) {
				current_row = $("<tr></tr>").appendTo("div#nulled_emotes > table > tbody");
				index = 0;
			}
		});
	});
	// Detect if tab is active or not (for notification sound)
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
	/* Interface */
	// Add new shoutbox
	$("div#categories").prepend("<div class='category_block block_wrap'><div class='nulledplus_shoutbox'><h3 class='maintitle'>Nulledplus Shoutbox <div style='float: right;'><button id='fullscreen' class='input_submit mpr' style='height: 26px; width: 26px;'><img src='" + chrome.extension.getURL("images/maximize.png") + "' style='height: 12px; width: 12px;'/></button></div></h3><div class='nulledplus_shoutbox_table'><div class='shoutbox_loading'><img src='" + chrome.extension.getURL("images/loading.gif") + "' id='shoutbox_loading'/></div><table style='border-collapse: collapse;'><tbody></tbody></table></div><div class='nulledplus_shoutbox_inputs'><div style='text-align: center;'><input type='text' maxlength='255' class='input_text nulledplus_shoutbox_input' id='shoutbox_input' placeholder='Shoutbox Message'/>&nbsp;<input type='button' value='Send' class='input_submit mpr' id='nulledplus_shoutbox_send' onclick='chat.sendMessage(document.getElementById(\"shoutbox_input\").value); document.getElementById(\"shoutbox_input\").value = \"\";'/>&nbsp;<input type='button' class='input_submit mpr' onclick='document.getElementById(\"shoutbox_input\").value = \"\";' value='Clear'/>&nbsp;<input type='button' id='shoutbox_emotes' class='input_submit mpr' value='Emotes'/>&nbsp;<input type='button' id='shoutbox_banlist' value='Ban List' class='input_submit mpr'/>&nbsp;<button class='input_submit mpr' value='insert_youtube' style='height: 27px;'><img class='button_image' src='" + chrome.extension.getURL('images/youtube_icon.png') + "'/></button>&nbsp;<button class='input_submit mpr' value='insert_image' style='height: 27px;'><img class='button_image' src='" + chrome.extension.getURL('images/image_icon.png') + "'/></button></div></div></div></div>");
	// Remove original shoutbox
	$("div#socket_chat").remove();
	// Custom context menu
	$("<ul class='nulledplus_context_menu' data-shout data-userid data-userdisplayname><li class='user'></li><li class='total_shouts'>Loading..</li><li data-context='previous_names'><i class='fa fa-pencil' aria-hidden='true'></i> &nbsp;Previous Nicknames</li><li data-context='send_message'><i class='fa fa-comments-o' aria-hidden='true'></i> &nbsp;Send Message</li><li data-context='change_reputation'><i class='fa fa-thumbs-up' aria-hidden='true'></i> &nbsp;Change Reputation</li></ul>").appendTo("div.nulledplus_shoutbox");
	// Options panel
	$("div#index_stats").prepend("<div class='ipsBlockOuter' id='nulledplus_options_div' style='display: none;'><div id='nulledplus_options' class='maintitle'>Nulled+ Options</div><div id='nulledplus_options_content' style='display: none; padding: 10px;'><div><input type='button' value='users' name='blacklist_flipswitch' class='input_submit mpr checked' style='width: 48%;'/>&nbsp;<input type='button' value='words' class='input_submit' name='blacklist_flipswitch' style='width: 48%;'/></div><br><span id='blacklist_desc'>Blacklisted Users</span><br><input type='text' class='added_item input_text mpr'/><input type='button' class='add_item input_submit mpr' value='Add'/><br><ul class='shoutbox_blacklist'></ul><br><input type='checkbox' id='mark_on_tag'> Mark messages where i'm tagged<br><input type='checkbox' id='sound_on_tag'> Make sound when tagged (Inactive tab)<br><input type='checkbox' id='legendary'/> <span class='legendary'>Legendary</span></div></div>");
	// User shoutbox custom
	$("<div class='user_custom' id='sbplus_modal_custom' style='background-color: #252525; z-index: 99999;'><div class='description'></div><div class='main'></div></div>").appendTo("div.nulledplus_shoutbox");
	$("div#sbplus_modal_custom").dialog({
		autoOpen: false,
		title: "User details",
		dialogClass: 'nulledplus_dialog',
		show: "fade",
		hide: "fade",
		minHeight: 75
	});
	// Insert youtube/ img tags
	$("div#content").prepend("<div id='sbplus_modal_insert'><div class='sbplus-modal-content ipsPad ipsForm_center'><span id='sbplus-insert-title'></span><br><br><input type='text' class='input_text' id='sbplus-modal-input'/><br><br><a id='sbplus-modal-add' class='input_submit mpr'>Add</a></div></div>");
	$("div#sbplus_modal_insert").dialog({
		autoOpen: false,
		title: "Insert Tags",
		dialogClass: 'nulledplus_dialog'
	});
	// Interface startup
	$("input#sound_on_tag").prop("checked", (localStorage["tagsound"]  == "true" ? true : false));
	$("input#mark_on_tag").prop("checked", (localStorage["tagmark"] == "true" ? true : false));
	$("input#legendary").prop("checked", (localStorage["legendary"] == "true" ? true : false));
	$("#nulledplus_options_div").slideDown();
	array_to_textarea(blacklist_state);
	// Events
	$("#nulledplus_options").click(function(){ $("#nulledplus_options_content").slideToggle("slow"); });
	$("#sound_on_tag").click(function(){ localStorage.setItem("tagsound", $("#sound_on_tag").prop("checked")); });
	$("#mark_on_tag").click(function(){ localStorage.setItem("tagmark", $("#mark_on_tag").prop("checked")); });
	$("#legendary").click(function(){ localStorage.setItem("legendary", $("#legendary").prop("checked")); window.location.reload(); });
	$("input[name='hide_method']").click(function() { localStorage.setItem("hide_method", $(this).prop('id')); });
	$("input#shoutbox_input").keyup(function(event){
		if(event.keyCode == 13) {
			$("input#nulledplus_shoutbox_send").click();
		}
	});
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
		localStorage.setItem("nulledplus_shoutbox", JSON.stringify(parsed_blacklist));
		recheck_shoutbox();
	});
	$("button[value^='insert_']").click(function(e){
		$("div#sbplus_modal_insert").dialog('option',
			"position", {
				my: "center top",
				at: "center top",
				of: e,
				offset: "20 140"
			}
		);
		var state_string = $(this).val().split('_')[1];
		$('span#sbplus-insert-title').text("Insert " + state_string + " Tag");
		insert_state = $(this).val();
		$("input#sbplus-modal-input").focus();
		$('div#sbplus_modal_insert').dialog("open");
	});
	$("a#sbplus-modal-add").click(function(){
		var inserted_tag = " ";
		inserted_tag += (insert_state == "insert_youtube" ? "[yt]" + $("input#sbplus-modal-input").val() + "[/yt]" : "[img]" + $("input#sbplus-modal-input").val() + "[/img]");
		inserted_tag += " ";
		$("input#sbplus-modal-input").val("");
		$("input#shoutbox_input").val($("input#shoutbox_input").val() + inserted_tag);
		$('div#sbplus_modal_insert').dialog("close");
	});
	$(document).on("click", "#shoutbox_emotes", function(e){
		var x = e.pageY - $(document).scrollTop();
		var y = e.pageX - $(document).scrollLeft();
		$("div#sbplus_modal_emotes").dialog('option',
			"position", {
				my: "center top",
				at: "center top",
				of: e,
				offset: "20 140"
			}
		);
		$("div#sbplus_modal_emotes").dialog('open');
	});
	$(document).on('click', 'button#fullscreen', function(){
		var fullscreened = $(this).parent().parent().parent().prependTo(document.body);
		$(fullscreened).css({
			top:0,
			right:0,
    		bottom:0,
			left:0,
			position: 'absolute',
            width: "100%",
            height: "100%",
			background: "#151515",
			"z-index": "10000"
		});
		$(fullscreened).children("div.nulledplus_shoutbox_table").css({
			"height": "87%",
			"max-height": "87%"
		});
		$("div#ipbwrapper").hide();
		$("div#footer_utilities").hide();
		$("body").css("overflow-x", "hidden");
		$(this).html("<img src='" + chrome.extension.getURL("images/minimize.png") + "' style='height: 12px; width: 12px;'/>");
		$(this).attr("id", "minimize");
	});
	$(document).on('click', 'button#minimize', function(){
		var minimized = $(this).parent().parent().parent().prependTo($("div#categories").children().eq(0));
		$(minimized).css({
			position: 'relative'
		});
		$(minimized).children("div.nulledplus_shoutbox_table").css({
			"height": "360px",
			"max-height": "360px"
		});
		$("div#ipbwrapper").show();
		$("div#footer_utilities").show();
		$("body").css("overflow-x", "scroll");
		$(this).html("<img src='" + chrome.extension.getURL("images/maximize.png") + "' style='height: 12px; width: 12px;'/>");
		$(this).attr("id", "fullscreen");
	});
	$(document).on('click', '.block_user', function(){
		parsed_blacklist["users"].push($(this).parent().parent().children("td.user").children().eq(0).html());
		localStorage.setItem("nulledplus_shoutbox", JSON.stringify(parsed_blacklist));
		recheck_shoutbox();
		array_to_textarea("users");
	});
	$(document).on('click', 'img.shoutbox_emote', function(){
		$("input#shoutbox_input").focus();
	});
	$(document).on('click', 'img.remove_item', function(){
		for(i = 0; i < parsed_blacklist[blacklist_state].length; i++) {
			if($(parsed_blacklist[blacklist_state][i]).text() == $(this).parent().text()) {
				parsed_blacklist[blacklist_state].splice(i, 1);
				localStorage.setItem("nulledplus_shoutbox", JSON.stringify(parsed_blacklist));
				$(this).parent().remove();
			}
		}
		recheck_shoutbox();
	});
	$(document).on('click', 'input.add_item', function(){
		var added_item = "<span>" + $("input.added_item").val() + "</span>";
		parsed_blacklist[blacklist_state].push(added_item);
		localStorage.setItem("nulledplus_shoutbox", JSON.stringify(parsed_blacklist));
		$("ul.shoutbox_blacklist").append("<li class='blacklisted_item'><img src='" + chrome.extension.getURL("images/remove_icon.png") + "' class='remove_item'/>" + added_item + "</li>");
		recheck_shoutbox();
	});
	$(document).on("contextmenu", "td.user > a", function(event){
		event.preventDefault();
		if($("button#fullscreen").length)
			$("ul.nulledplus_context_menu").finish().toggle(100).css({ top: (event.pageY - 265) + "px", left: (event.pageX - 25) + "px" });
		else
			$("ul.nulledplus_context_menu").finish().toggle(100).css({ top: (event.pageY) + "px", left: (event.pageX) + "px" });
		$(this).css("background-color", "black");
		var contextUserID = $(this).attr("class").split("_")[1];
		$("ul.nulledplus_context_menu > li.user").html("<span class='actual_user'>" + $(this).html() + "</span> <span class='user_id'>{" + contextUserID + "}</span>");
		$("ul.nulledplus_context_menu").attr("data-shout", $(this).parent().parent().attr('id'));
		$("ul.nulledplus_context_menu").attr("data-userid", contextUserID);
		$("ul.nulledplus_context_menu").attr("data-userdisplayname", $(this).text());
		socket.emit("getTotalShouts", { uid: contextUserID });
	});
	$(document).on("mousedown", function(event){
		if (!$(event.target).parents("ul.nulledplus_context_menu").length > 0 && $("ul.nulledplus_context_menu").is(":visible")) {
			$("ul.nulledplus_context_menu").hide(100);
			$("tr#" + $("ul.nulledplus_context_menu").attr("data-shout") + " > td.user > a").css("background-color", "inherit");
			$("li.total_shouts").hide();
		}
	});
	$(document).on('click', 'td.controls > img.edit_shout', function(){
		var shout = $(this).parent().parent();
		var shout_id = shout.attr("id");
		var existing_message = shout.children("td.message").text();
		// Dialog
		var mainDiv = $("div.user_custom > div.main");
		var mainDescription = $("div.user_custom > div.description");
		if(mainDiv.children().length)
			mainDiv.empty();
		mainDiv.append("<input type='text' id='edit_shout' class='input_text mpr' value='" + existing_message + "' style='width: 75%; margin-left: 5px;'/>&nbsp;<input type='button' id='apply_edit_shout' class='input_submit mpr' value='Apply' onclick='chat.sendEditShout(\"" + shout_id + "\", document.getElementById(\"edit_shout\").value);'/>");
		mainDescription.empty();
		$("div#sbplus_modal_custom").dialog("option", "title", "Edit Shout #" + shout_id);
		$("div#sbplus_modal_custom").dialog("open");
	});
	$(document).on("click", "ul.nulledplus_context_menu > li", function(event){
		var data_userID = $("ul.nulledplus_context_menu").attr("data-userid");
		var data_userDisplayName = $("ul.nulledplus_context_menu").attr("data-userdisplayname");
		var data_shoutID = $("ul.nulledplus_context_menu").attr("data-shout");
		// Dialog
		var mainDiv = $("div.user_custom > div.main");
		var mainDescription = $("div.user_custom > div.description");
		switch($(this).attr("data-context")) {
			case "previous_names":
				var name_changes = [];
				if(mainDiv.children().length)
					mainDiv.empty();
				mainDiv.append("<ul></ul>");
				mainDescription.text("Previous nicknames:");
				$("div#sbplus_modal_custom").dialog("option", "title", "User: " + data_userDisplayName);
				$.get("https://www.nulled.to/index.php?app=members&module=profile&section=dname&id=" + data_userID, function(data){
					var name_changes_table = $(data).contents().find("table.ipb_table > tbody").children("tr[class^='row']");
					name_changes_table.each(function(index, element) {
						var name = $(element).children("td").eq((index < name_changes_table.length - 1 ? 1 : 0)).text();
						if(!name_changes.includes(name)) {
							name_changes[name_changes.length] = name;
							$("div.user_custom > div.main > ul").append("<li><span><span class='date'>[" + $(element).children("td.altrow").text() + "]</span> " + name + "</span></li>");
						}
					});
					$("div#sbplus_modal_custom").dialog('option',
						"position", {
							my: "left bottom",
							at: "right bottom",
							of: event,
							offset: "20 140"
						}
					);
					$("div#sbplus_modal_custom").dialog("open");
				});
				break;
			case "change_reputation":
				$.get("https://www.nulled.to/reputation.php?uid=" + data_userID, function(data){
					// CSRF cookie is HTTP only :/
					var extracted_CSRF = data.split("csrf: \'")[1].split("\'")[0];
					var reputation_state = "neutral";
					if(mainDiv.children().length)
						mainDiv.empty();
					mainDescription.html("Change reputation for <span style='background-color: black; padding: 3px; border-radius: 3px; margin-right: 3px; margin-left: 3px;'>" + data_userDisplayName + "</span>");
					mainDiv.append("<div class='change_reputation'><div class='reputation_state'><input type='button' class='reputation_button' value='negative'/><input type='button' class='reputation_button' value='neutral' disabled/><input type='button' class='reputation_button' value='positive'/></div><span>Comment:</span><br><input type='text' class='input_text mpr' id='rep_comment' style='width: 96%; margin-top: 5px;'/><br><input type='button' class='input_submit mpr' id='apply_rep' value='Apply Reputation' style='float: right; margin-top: 5px;'/><br></div>")
					$("div#sbplus_modal_custom").dialog('option',
						"position", {
							my: "left bottom",
							at: "right bottom",
							of: event,
							offset: "20 140"
						}
					);
					$("div#sbplus_modal_custom").dialog("open");
					$(document).on("click", "input.reputation_button:enabled", function(){
						$("input.reputation_button:disabled").attr("disabled", false);
						$(this).attr("disabled", true);
						reputation_state = $(this).val();
					});
					$(document).on("click", "input#apply_rep", function(){
						$(this).attr("disabled", true);
						$.ajax({
							url: "/misc.php?action=addReputation",
							dataType: 'JSON',
							type: 'POST',
							data: {
								rating: reputation_state,
								target: data_userID,
								comment: $("input#rep_comment").val(),
								csrf: extracted_CSRF
							},
							success: function(response) {
								alert(response.status + ", " + response.message);
								$("div#sbplus_modal_custom").dialog("close");
								$(this).attr("disabled", false);
							}
						});
					});
				});
				break;
			case "send_message":
				window.open("https://www.nulled.to/index.php?app=members&module=messaging&section=send&do=form&fromMemberID=" + data_userID, "_blank");
				break;
			default:
				console.log("Unknown context menu clicked?");
				break;
		}
	});
	$(document).on("click", "input#shoutbox_banlist", function(event){
		var mainDiv = $("div.user_custom > div.main");
		var mainDescription = $("div.user_custom > div.description");
		if(mainDiv.children().length)
			mainDiv.empty();
		mainDescription.text("Current active bans in the shoutbox");
		mainDiv.append("<div class='bans_list'><table class='bans_list'><tbody></tbody></table></div>");
		$("div#sbplus_modal_custom").dialog('option',
			"position", {
				my: "left bottom",
				at: "right bottom",
				of: event,
				offset: "20 140"
			}
		);
		$("div#sbplus_modal_custom").dialog('option', "title", "Active Shoutbox Bans");
		$("div#sbplus_modal_custom >")
		socket.emit("getBans", "");
	});
	// Functions
	function recheck_shoutbox() {
		$("div.nulledplus_shoutbox_table > table > tbody > tr").each(function(){
			var plain_msg_no_tags = $(this).children("td.message").children().eq(0).clone().children("a[href^='/!']").remove().end().text();
			var plain_author = $(this).children("td.user").text();
			if(blacklist_state == "words") {
				if(check_blacklist_words(plain_msg_no_tags))
					$(this).fadeOut(1000);
				else
					if(!check_blacklist_users(plain_author.substring(0, plain_author.length - 1)))
						if($(this).css("display") == "none")
							$(this).fadeIn(1000);
			}
			else {
				if(check_blacklist_users(plain_author.substring(0, plain_author.length - 1)))
					$(this).fadeOut(1000);
				else
					if(!check_blacklist_words(plain_msg_no_tags))
						if($(this).css("display") == "none")
							$(this).fadeIn(1000);
			}
		});
	}
	function array_to_textarea(state) {
		$("ul.shoutbox_blacklist").empty();
		if(parsed_blacklist[state].length > 0)
			for(i = 0; i < parsed_blacklist[state].length; i++)
				$("ul.shoutbox_blacklist").prepend("<li class='blacklisted_item'><img src='" + chrome.extension.getURL("images/remove_icon.png") + "' class='remove_item'/>" + parsed_blacklist[state][i] + "</li>");
	}
	function check_blacklist_users(shoutAuthor) {
		for(i = 0;i < parsed_blacklist.users.length; i++)
			if($(parsed_blacklist.users[i]).text() == shoutAuthor)
				return true;
		return false;
	}
	function check_blacklist_words(shoutMessage) {
		for(i = 0; i < parsed_blacklist.words.length; i++)
			if($(parsed_blacklist.words[i]).text() != '' && !$(parsed_blacklist.words[i]).text().includes(' '))
				if(shoutMessage.includes($(parsed_blacklist.words[i]).text()))
					return true;
		return false;
	}
	function insert_shout(data) {
		var plainMessageNoTags = $("<div>" + data.msg + "<div>").clone().children("a[href^='/!']").remove().end().text();
		// Twitch global emotes
		Object.keys(twitch_emotes).forEach(function (key) {
			if(plainMessageNoTags.includes(key))
				data.msg = data.msg.replace(new RegExp(key, 'g'), "<img src='https://static-cdn.jtvnw.net/emoticons/v1/" + twitch_emotes[key].image_id + "/1.0'/>");
		});
		// BTTV Emotes
		btwitch_emotes.forEach(function (emote) {
			if(plainMessageNoTags.includes(emote.code))
				data.msg = data.msg.replace(new RegExp(escape(emote.code), 'g'), "<img src='https://cdn.betterttv.net/emote/" + emote.id + "/1x'/>");
		});
		// Add finalized message
		var actualDisplayName = $(data.author).text();
		var added = $("<tr id='" + data.shout_id + "'><td class='block'><img class='block_user' src='" + chrome.extension.getURL('images/block_icon.png') + "' name='" + actualDisplayName + "'/></td><td class='tag'><img class='tag_user' src='" + chrome.extension.getURL('images/tag_icon.png') + "' onclick='document.getElementById(\"shoutbox_input\").value += \"@[member=" + data.displayName + "] \"; document.getElementById(\"shoutbox_input\").focus();'/></td><td class='user'><a href='https://www.nulled.to/user/" + data.uid + "-" + data.displayName + "' target='_blank' class='user_" + data.uid + "'>" + data.author + "</a>:</td><td class='message'><span class='msg' data-plain='" + $("<div>" + data.msg + "</div>").text() + "'>" + data.msg + "</span></td><td class='controls'></td><td class='date'><span class='date' style='float: right;'>(" + data.date + ")</span></td></tr>").hide().prependTo("div.nulledplus_shoutbox > div.nulledplus_shoutbox_table > table > tbody");
		// Styling odd messages
		if(odd)
			added.addClass("odd");
		//odd = !odd;
		// Check if you're tagged
		var tags = $("<div>" + data.msg + "</div>").children("a[href^=\'/!\']");
		for(i = 0; i < tags.length; i++) {
			if($(tags[i]).attr("href").split("#")[1].toLowerCase() == userName.toLowerCase()) {
				added.addClass("tagged");
				break;
			}
		}
		// Add edit/ remove message controls
		var controls = added.children("td.controls");
		var you = false;
		if(actualDisplayName == userName || isMod) {
			controls.append("<img src='" + chrome.extension.getURL("images/edit_icon.png") + "' class='control_icon edit_shout'/>&nbsp;");
			controls.css("background-color", "black");
			you = true;
		}
		if(localStorage["legendary"] == "true" || isMod) {
			controls.append("<img src='" + chrome.extension.getURL("images/slap.png") + "' class='control_icon' style='height: 18px; width: 18px;' onclick='chat.sendMessage(\"/slap " + data.displayName + "\");'/>&nbsp;");
			controls.css("background-color", "black");
			if(!isMod)
				if(you)
					controls.css("width", "53px");
				else
					controls.css("width", "25px");
			else
				controls.css("width", "98px");
		}
		if(isMod) {
			controls.append("<img src='" + chrome.extension.getURL("images/remove_icon.png") + "' class='control_icon' onclick='chat.sendDeleteShout(\"" + data.shout_id + "\");'/>&nbsp;");
			controls.append("<img src='" + chrome.extension.getURL("images/ban_icon.png") + "' class='control_icon' onclick='chat.sendMessage(\"/ban " + data.uid + " 24h No Reason Specified\")'/>&nbsp;");
		}

		// Check if message passes blacklist filters
		if(!check_blacklist_users(actualDisplayName) && !check_blacklist_words(data.plain_msg))
			added.fadeIn(1000);
	}
	// Shoutbox
	var s = document.createElement('script');
	s.src = chrome.extension.getURL('js/extract_chatview.js');
	(document.head||document.documentElement).appendChild(s);

	var socket = io.connect("https://chat.nulled.to");
	var odd = false;
	var isMod = false;
	document.addEventListener('nulledplus_pass_recheck_shoutbox', function(e) {
		var extracted_previous_messages = e.detail[0].reverse();
		isMod = e.detail[1];
		//isMod = true;
		$("img#shoutbox_loading").parent().fadeOut(function(){
			var index = 0;
			while(index < extracted_previous_messages.length) {
				insert_shout(extracted_previous_messages[index]);
				index++;
			}
			socket.on("message",function(data){
				insert_shout(data);
			});
			socket.on("editShout", function(data){
				$("tr#" + data.shoutID + " > td.message > span.msg").html(data.msg);
				if(!$("tr#" + data.shoutID + " > td.date > span.edited").length)
					$("tr#" + data.shoutID + " > td.date").append("<span class='edited'> ( Edited )</span>");
			});
			socket.on("deleteShout", function(data){
				$("tr#" + data.shoutID).fadeOut(1000, function(){
					$(this).remove();
				});
			});
			socket.on("getBans", function(data){
				var ban_list = $("div.main > div.bans_list > table.bans_list > tbody");
				var ban_list_odd = false;
				ban_list.empty();
				data.bans.forEach(function(ban){
					ban_list.append("<tr class='" + (ban_list_odd ? "odd" : "") + "'><td>" + ban[0] + "</td><td>" + ban[1] + "</td><td>" + ban[2] + "</td></tr>");
					ban_list_odd = !ban_list_odd
				});
				$("div#sbplus_modal_custom").dialog("open");
			});
			socket.on("getTotalShouts", function(data){
				$("li.total_shouts").text("Total Shouts: " + data.totalShouts);
				$("li.total_shouts").slideDown(1000);
			});
		});
	});
});
