$(function(){
	jQuery.fn.selectText = function(){
	   var doc = document;
	   var element = this[0];
	   if (doc.body.createTextRange) {
	       var range = document.body.createTextRange();
	       range.moveToElementText(element);
	       range.select();
	   } else if (window.getSelection) {
	       var selection = window.getSelection();
	       var range = document.createRange();
	       range.selectNodeContents(element);
	       selection.removeAllRanges();
	       selection.addRange(range);
	   }
	};
	$(document).on("click", "button.select_all", function(){
		$(this).parent().next().selectText();
	});
	$(document).on("click", "button.save_file", function(){
		var text = $(this).parent().next().text();
		text = text.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "");
		var filename = document.title;
		saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), filename+".txt");
	});
	$("div.hiddencontent-unhidden").each(function(){
		$(this).before("<div class='right select_all'><button class='select_all input_submit mpr'>Select All</button><button class='save_file input_submit mpr'>Save File</button></div>");
	});
});
