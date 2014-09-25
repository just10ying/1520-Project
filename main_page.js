// Populate the course list array
var courseList = new Array();
courseList.push(new Course("Computer Architecture", "Michael Bigrigg", "MoWe/11:00AM-12:15PM", "5505 Sennott Square", "Credits: 3", "10829", "Description"));
courseList.push(new Course("Intro to Operating Systems", "Jonathan Misurda", "MoWe/11:00AM-12:15PM", "0213 Cathedral", "Credits: 92", "38384", "Description"));
courseList.push(new Course("Intro to MacroEconomics", "George Bush", "MoWe/11:00AM-12:15PM", "3084 Clapp", "Credits: 2", "38257", "Description"));
courseList.push(new Course("Computer Organization", "Christine Lim", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));
courseList.push(new Course("Intro to Violin 1", "Justin Ying", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));
courseList.push(new Course("Psychology 0110", "Akane Tsumemori", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));
courseList.push(new Course("Engineering Analysis 1", "Joey Sadecky", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));
courseList.push(new Course("Data Structures", "Ethan Dale", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));
courseList.push(new Course("Web Development Stuff", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "37289", "Description"));

//--------------------------------------------------------------------- Search Functions ---------------------------------------------------------------------------
function searchKeyPress(event) {
	// Clear cards from card-parent only:
	$("#card-parent").children(".course-card").remove();
	// If the user presses escape, clear the input field.
	if (event.keyCode == 27) {
		$("#course-search-box").val('');
		return;
	}
	var searchString = $("#course-search-box").val().toLowerCase();
	if (searchString.length > 0) {
		courseList.forEach(function(course) {
			for (field in course) {
				var x = course[field].toLowerCase();
				if (course[field].toLowerCase().indexOf(searchString) > -1) {
					$("#card-parent").append(new CourseTable(course));
					break;
				}
			}
		});	
	}
}


//--------------------------------------------------------------------- Card Functions ---------------------------------------------------------------------------

// Creates a new course object
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
	var parentDiv = $('<div draggable="true" onclick="selectCard(this)" ondragstart="drag(event)" ondragover="cardDragOver(this)" ondragleave="cardDragLeave(this)"></div>');
		parentDiv.addClass("course-card flex row static std-margin unselectable");
	var col1 = $('<div class="card-col-1"></div>')
		.append(newRowDiv(course.name))
		.append(newRowDiv(course.time))
		.append(newRowDiv(course.credits));
	var col2 = $('<div class="card-col-2"></div>')
		.append(newRowDiv(course.professor))
		.append(newRowDiv(course.location))
		.append(newRowDiv(course.classNumber));
	parentDiv.append(col1).append(col2);
	return parentDiv;
}

function newRowDiv(stringName) {
	return $('<div class="row"></div').attr("title", stringName).text(stringName);
}

function selectCard(card) {
	$(card).toggleClass("selected");
}

function selectSingleCard(card) {
	$(".course-card").removeClass("selected");
	$(card).toggleClass("selected");
}

/* -------------------------------------- Drag and Drop Functions for Course Cards -------------------------------------------------- */
var draggedCard; // Global variable to store the currently dragged card.
var cardDivider = $('<div id="card-insert-divider"></div>'); // This is a divider to show where the dragged card will be dropped.

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    draggedCard = ev.target;
}

function dropInSidebar(ev) {
    ev.preventDefault();
	// If the item is being dropped on the sidebar, append dragged card.
	if (ev.target.id == "card-parent") {
		$("#card-parent").append(draggedCard);
	}
	else {
		// If the user is dropping the card on a card, put the dropped card after that card.
	    $(ev.target).closest(".course-card").after(draggedCard);
	}
	cardDivider.remove();
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
	cardDivider.remove();
}

function cardDragOver(card) {
	$(card).after(cardDivider);
}

function cardDragLeave(card) {
	cardDivider.remove();
}