var numCards = 33;
var numDeckCards = 4;

var cardString = '<div class="course-card flex row std-padding std-margin unselectable" draggable="true" onclick="selectCard(this)"><table><tr><td>Name of Course</td><td>Professor</td></tr><tr><td>Time</td><td>Location</td></tr><tr><td>Credits</td><td>Class Number</td></tr></table></div>';

function NewCourse(name, professor, time, location, credits, classNumber, description) {
	
}

$(document).ready(function() {
	for (var index = 0; index < numCards; index++)
	{
		var card = $.parseHTML(cardString);
		$("#card-parent").append(card);
	}
	for (var index = 0; index < numDeckCards; index++)
	{
		var card = $.parseHTML(cardString)
		$("#deck").append(card);
	}
});

function selectCard(card) {
	$(card).toggleClass("selected");
}

function selectSingleCard(card) {
	$(".course-card").removeClass("selected");
	$(card).toggleClass("selected");
}