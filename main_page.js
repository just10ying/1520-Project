// Populate the course list array
var courseList = new Array();
courseList.push(new Course("Computer Architecture", "Michael Bigrigg", "MoWe/11:00AM-12:15PM", "5505 SENSQ", "Credits: 3", "10829"));
courseList.push(new Course("Intro to Operating Systems", "Jonathan Misurda", "MoWe/11:00AM-12:15PM", "0213 Cathedral", "Credits: 92", "38384"));
courseList.push(new Course("Intro to MacroEconomics", "George Bush", "MoWe/11:00AM-12:15PM", "3084 Clapp", "Credits: 2", "38257"));
courseList.push(new Course("Computer Organization", "Christine Lim", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));
courseList.push(new Course("Intro to Violin 1", "Justin Ying", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));
courseList.push(new Course("Psychology 0110", "Akane Tsumemori", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));
courseList.push(new Course("Engineering Analysis 1", "Joey Sadecky", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));
courseList.push(new Course("Data Structures", "Ethan Dale", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));
courseList.push(new Course("Web Development Stuff", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289"));


function Course(name, professor, time, location, credits, classNumber, description) {
	this.name = name;
	this.professor = professor;
	this.time = time;
	this.location = location;
	this.credits = credits;
	this.classNumber = classNumber;
	this.description = description;
}

// Returns a course table with the proper information
// Card customization would occur here.
function CourseTable(course) {
	var parentDiv = $('<div class="course-card flex row std-margin unselectable" draggable="true" onclick="selectCard(this)" ondragstart="drag(event)" ondragover="cardDragOver(this)" ondragleave="cardDragLeave(this)"></div>');
	var col1 = $('<div class="card-col-1"></div>');
		col1.append($('<div class="row"></div>').attr("title", course.name).text(course.name));
		col1.append($('<div class="row"></div>').attr("title", course.time).text(course.time));
		col1.append($('<div class="row"></div>').attr("title", course.credits).text(course.credits));
	var col2 = $('<div class="card-col-2"></div>');
		col2.append($('<div class="row"></div>').attr("title", course.professor).text(course.professor));
		col2.append($('<div class="row"></div>').attr("title", course.location).text(course.location));
		col2.append($('<div class="row"></div>').attr("title", course.classNumber).text(course.classNumber));
	parentDiv.append(col1).append(col2);
	return parentDiv;
}

$(document).ready(function() {
	for (var index = 0; index < courseList.length; index++) {
		$("#card-parent").append(new CourseTable(courseList[index]));
	}
});

function selectCard(card) {
	$(card).toggleClass("selected");
}

function selectSingleCard(card) {
	$(".course-card").removeClass("selected");
	$(card).toggleClass("selected");
}

/* -------------------------------------- Drag and Drop Functions for Course Cards -------------------------------------------------- */
var draggedCard; // Global variable to store the currently dragged card.

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    draggedCard = ev.target;
}

function dropInSidebar(ev) {
    ev.preventDefault();
	// If the user is dropping the card on a card, put the dropped card afterwards.
    $(ev.target).closest(".course-card").after(draggedCard);
}

function dropInDeck(ev) {
    ev.preventDefault();
    var targetCard = $(ev.target).closest(".course-card");
	if (targetCard.length == 0) { // If there's no card in the deck
		$("#deck").append(draggedCard); // append it directly to the deck.
	}
	else {
	    $(ev.target).closest(".course-card").after(draggedCard);	
	}
}

function cardDragOver(card) {

}

function cardDragLeave(card) {

}