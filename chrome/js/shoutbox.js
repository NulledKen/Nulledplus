$(function(){
	var userID = $("a#user_link").attr("href").split("-")[0].split("user")[1].substring(1);
	var userName = $("a#user_link").text().split(' ')[0];
	console.log("Your Nulled ID: " + userID + ", Name: " + userName);

	if(localStorage["blacklist"] == undefined)
		localStorage.setItem("blacklist", JSON.stringify({"users":[], "words":[]}));
	var parsed_blacklist = JSON.parse(localStorage["blacklist"]);

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
	$("div#categories").prepend("<div class='category_block block_wrap'><div class='nulledplus_shoutbox'><h3 class='maintitle'>Nulledplus Shoutbox</h3><div class='nulledplus_shoutbox_table'><table><tbody></tbody></table></div><div class='nulledplus_shoutbox_inputs'><div style='text-align: center;'><input type='text' maxlength='255' class='input_text nulledplus_shoutbox_input' id='shoutbox_input' placeholder='Shoutbox Message'/>&nbsp;<input type='button' value='Send' class='input_submit mpr' id='nulledplus_shoutbox_send' onclick='chat.sendMessage(document.getElementById(\"shoutbox_input\").value); document.getElementById(\"shoutbox_input\").value = \"\";'/>&nbsp;<input type='button' class='input_submit mpr' onclick='document.getElementById(\"shoutbox_input\").value = \"\";' value='Clear'/>&nbsp;<input type='button' id='shoutbox_emotes' class='input_submit mpr' value='Emotes'/>&nbsp;<button class='input_submit mpr' value='insert_youtube' style='height: 27px;'><img class='button_image' src='" + chrome.extension.getURL('images/youtube_icon.png') + "'/></button>&nbsp;<button class='input_submit mpr' value='insert_image' style='height: 27px;'><img class='button_image' src='" + chrome.extension.getURL('images/image_icon.png') + "'/></button></div></div></div></div>");
	// Remove original shoutbox
	$("div#socket_chat").remove();
	// Options panel
	$("div#index_stats").prepend("<div class='ipsBlockOuter' id='nulledplus_options_div' style='display: none;'><div id='nulledplus_options' class='maintitle'>Nulled+ Options</div><div id='nulledplus_options_content' style='display: none; padding: 10px;'><div><input type='button' value='users' name='blacklist_flipswitch' class='input_submit mpr checked' style='width: 48%;'/>&nbsp;<input type='button' value='words' class='input_submit' name='blacklist_flipswitch' style='width: 48%;'/></div><br><span id='blacklist_desc'>Blacklisted Users</span><textarea id='array_content' style='width: 93%; margin-top: 12px;'></textarea><br><input type='button' class='input_submit mpr' id='save_blacklist' value='Save' style='float: right; margin-right: 10px;'><br><br><input type='checkbox' id='mark_on_tag'> Mark messages where i'm tagged<br><input type='checkbox' id='sound_on_tag'> Make sound when tagged (Inactive tab)</div></div>");
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
	$("#nulledplus_options_div").slideDown();
	array_to_textarea(blacklist_state);
	// Events
	$("#nulledplus_options").click(function(){ $("#nulledplus_options_content").slideToggle("slow"); });
	$("#sound_on_tag").click(function(){ localStorage.setItem("tagsound", $("#sound_on_tag").prop("checked")); });
	$("#mark_on_tag").click(function(){ localStorage.setItem("tagmark", $("#mark_on_tag").prop("checked")); });
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
		localStorage.setItem("blacklist", JSON.stringify(parsed_blacklist));
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
	$(document).on('click', '.block_user', function(){
		parsed_blacklist[blacklist_state].push($(this).prop("name"));
		localStorage.setItem("blacklist", JSON.stringify(parsed_blacklist));
		array_to_textarea("users");
		// Recheck shoutbox
		recheck_shoutbox();
	});
	$(document).on('click', 'img.shoutbox_emote', function(){
		$("input#shoutbox_input").focus();
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
	function array_to_textarea(blacklist_state) {
		$("#array_content").val("");
		if(parsed_blacklist[blacklist_state].length > 0) {
			for(i = 0; i < parsed_blacklist[blacklist_state].length - 1; i++)
				$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][i] + ",");
			$("#array_content").val($("#array_content").val() + parsed_blacklist[blacklist_state][parsed_blacklist[blacklist_state].length - 1]);
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
		var added = $("<tr id='" + data.shout_id + "'><td class='block'><img class='block_user' src='" + chrome.extension.getURL('images/block_icon.png') + "' name='" + actualDisplayName + "'/></td><td class='tag'><img class='tag_user' src='" + chrome.extension.getURL('images/tag_icon.png') + "' onclick='document.getElementById(\"shoutbox_input\").value += \"@[member=" + data.displayName + "] \"; document.getElementById(\"shoutbox_input\").focus();'/></td><td class='user'><a href='https://www.nulled.to/user/" + data.uid + "-" + data.displayName + "' target='_blank'>" + data.author + "</a>:</td><td class='message'><span class='msg'>" + data.msg + "</span></td><td class='date'><span class='date' style='float: right;'>(" + data.date + ")</span></td></tr>").hide().prependTo("div.nulledplus_shoutbox > div.nulledplus_shoutbox_table > table > tbody");
		// Styling odd messages
		if(odd)
			added.addClass("odd");
		odd = !odd;
		// Check if you're tagged
		if(data.plain_msg.includes("@[member=" + userName.replace("+", "") + "]") || data.plain_msg.includes("@" + userName.replace("+", ""))) {
			if($("input#mark_on_tag").prop("checked"))
				added.addClass("tagged");
			if($("input#sound_on_tag").prop("checked"))
				if(!vis())
					new Audio(chrome.extension.getURL("sounds/notification.mp3")).play();
		}
		// Check if message passes blacklist filters
		if(!check_blacklist_users(actualDisplayName) && !check_blacklist_words(data.plain_msg))
			added.fadeIn(1000);
	}
	// Shoutbox
	var s = document.createElement('script');
	s.src = chrome.extension.getURL('js/extract_chatview.js');
	(document.head||document.documentElement).appendChild(s);

	var odd = false;
	document.addEventListener('nulledplus_pass_recheck_shoutbox', function(e) {
		e.detail.reverse();
		var index = 0;
		while(index < e.detail.length) {
			insert_shout(e.detail[index]);
			index++;
		}
		var socket = io.connect("https://chat.nulled.to");
		socket.on("message",function(data){
			insert_shout(data);
		});
	});
});
