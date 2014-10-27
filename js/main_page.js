//--------------------------------------------------------------------- Initialization ---------------------------------------------------------------------------
$(document).ready(function() {
	populateCalendarRows(8, 20);
	loadDeck();
});

// Populate the course list array
var courseList = new Array();
var deckList = new Array();
var courseCatalog = new Array();
// courseCatalog.push(new Course("Computer Architecture", "Michael Bigrigg", "MoWe/11:00AM-12:15PM", "5505 Sennott Square", "Credits: 3", "10829", false, "Description"));
// courseCatalog.push(new Course("Intro to Operating Systems", "Jonathan Misurda", "MoWe/11:00AM-12:15PM", "0213 Cathedral", "Credits: 92", "34215", true, "Description"));
// courseCatalog.push(new Course("Intro to MacroEconomics", "George Bush", "MoWe/11:00AM-12:15PM", "3084 Clapp", "Credits: 2", "53521", false, "Description"));
// courseCatalog.push(new Course("Computer Organization", "Christine Lim", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "55332", false, "Description"));
// courseCatalog.push(new Course("Intro to Violin 1", "Justin Ying", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "32353", false, "Description"));
// courseCatalog.push(new Course("Psychology 0110", "Akane Tsumemori", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "09876", false, "Description"));
// courseCatalog.push(new Course("Engineering Analysis 1", "Joey Sadecky", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "66767", false, "Description"));
// courseCatalog.push(new Course("Data Structures", "Ethan Dale", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "45453", false, "Description"));
// courseCatalog.push(new Course("Web Development Stuff", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "23456", false, "Description"));
// courseCatalog.push(new Course("Physics 1", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 9", "89237", false, "Description"));
// courseCatalog.push(new Course("Physics 2", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 3", "77737", false, "Description"));
// courseCatalog.push(new Course("Calculus 1", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 3", "12349", false, "Description"));
// courseCatalog.push(new Course("Calculus 2", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 1", "12398", false, "Description"));
// courseCatalog.push(new Course("Calculus 3", "Timothy James", "MoWe/11:00AM-12:15PM", "102 David Lawrence", "Credits: 33", "82828", false, "Description"));

//--------------------------------------------------------------------- Search Functions ---------------------------------------------------------------------------
function searchKeyPress(event) {
	// Clear cards from sidebar
	clearSidebar();
	// If the user presses escape, clear the input field.
	if (event.keyCode == 27) {
		$("#course-search-box").val('');
		return;
	}
	// Get the search string that the user is typing
	var searchString = $("#course-search-box").val().toLowerCase();
	
	if (searchString.length > 0) {
		// Check each course for relevant strings
		courseCatalog.forEach(function(course) {
			for (field in course) {
				// If one of the fields has a substring that matches the search term, display the course.
				// More complex logic should go here as the course object becomes more complex.
				if ((typeof course[field] == "string") && (course[field].toLowerCase().indexOf(searchString) > -1)) {
					addCourseToSidebar(course);
					break;
				}
				// Timeslot logic here
				else if (course[field].type == "timeslot") {
					
				}
			}
		});	
	}
}
//--------------------------------------------------------------------- Deck Functions ---------------------------------------------------------------------------

function addCourseToSidebar(course) {
	$("#card-parent").append(new CourseTable(course));
	courseList.push(course);
}

function addCourseToDeck(course) {
	$("#deck").append(new CourseTable(course));
	deckList.push(course);
}

function clearSidebar() {
	$("#card-parent").children(".course-card").remove();
	courseList.length = 0; // Clears the courselist array
}

function clearDeck() {
	$("#deck").children(".course-card").remove();
	deckList.length = 0; // Clears the courselist array
}

// Disables dragging and grays out the course in course-list with the same course number as "card"
function disableDuplicateCard(course) {
	
}

// Binds deck saving to ctrl-s
$(window).bind('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            saveDeck();
        }
    }
});

function saveDeck() {
	var classNumberElements = $("#deck").find(".CourseNumber");
	var classNumberString = "";
	for (var index = 0; index < classNumberElements.length; index++) {
		classNumberString += classNumberElements[index].innerText;
		if (index != (classNumberElements.length - 1)) {
			classNumberString += ",";
		}
	}
	$.ajax({
		type: "POST",
		url: "/",
		data: {classList: classNumberString},
		success: function(data) {
			alert(data);
		}
	});
}

function loadDeck() {
	$.ajax({
		type: "GET",
		url: "/load_courses",
		success: function(data) {
			var classNumberArray = data.split(',');
			for (var index = 0; index < classNumberArray.length; index++) {
				for (var list_index = 0; list_index < courseCatalog.length; list_index++) {
					if (classNumberArray[index] == courseCatalog[list_index].classNumber) {
						addCourseToDeck(courseCatalog[list_index]);
					}
				}
			}
		}
	});
}

//--------------------------------------------------------------------- Card Functions ---------------------------------------------------------------------------

// Creates a new course object
function Course(name, professor, time, location, credits, classNumber, needsRecitation, description) {
	this.name = name;
	this.professor = professor;
	this.time = time; // this should be a TimeSlot object.
	this.location = location;
	this.credits = credits;
	this.classNumber = classNumber;
	this.needsRecitation = needsRecitation;
	this.description = description;
}

// Stores the times a class will meet.
// Days: an array of strings corresponding to whether or not a class is on a specific day.  Example: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"] would be a class on all days.
// Start time: xx:yy, where xx is the hour and yy is the minute.  Example: 12:15 would be "12:15", as a string.
// End time: xxyy, where xx is the hour and yy is the minute.
function TimeSlot(days, start, end) {
	this.type = "timeslot";
	this.days = days;
	this.start = start;
	this.end = end;
}

// Returns a course table with the proper information
// Card customization would occur here.
function CourseTable(course) {
	var parentDiv = $('<div draggable="true" onclick="selectCard(this)" ondragstart="drag(event)" ondragover="cardDragOver(this)" ondragleave="cardDragLeave(this)"></div>');
		parentDiv.addClass("course-card flex row static std-margin unselectable");
	var col1 = $('<div class="card-col-1"></div>')
		.append(newRowDiv(course.Title))
		.append(newRowDiv(course.Subject))
		.append(newRowDiv("Credits: " + course.NumCredits));
	var col2 = $('<div class="card-col-2"></div>')
		.append(newRowDiv(course.Instructors))
		.append(newRowDiv(course.Days))
		.append(newRowDiv(course.CatalogNumber).addClass("CourseNumber"));
	parentDiv.append(col1).append(col2);
	return parentDiv;
}

function newRowDiv(stringName) {
	return $('<div class="row"></div').attr("title", stringName).text(stringName);
}

function selectCard(card) {
	$(card).toggleClass("selected");
}

/* -------------------------------------- Drag and Drop Functions for Course Cards -------------------------------------------------- */
var draggedCard; // Global variable to store the currently dragged card.
var cardDivider = $('<div id="card-insert-divider"></div>'); // This is a divider to show where the dragged card will be dropped.

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text/plain", ""); // for firefox compatibility
    draggedCard = ev.target;
}

// Do we even want the user to be able to drop cards in the sidebar? FIX
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

//--------------------------------------------------------------------- Calendar Functions ---------------------------------------------------------------------------

// Populates the calendar with rows.  Start and end are integers from 0-23 corresponding to hours.
function populateCalendarRows(start, end) {
	for (var i = start; i < end; i++) {
		var row = $('<div class="calendar-row"></div>');
		$(".calendar-col").append(row);
		var timeDiv = $('<div class="time-div flex row x-align y-align"></div>');
		timeDiv.text(i.toString() + ":00");
		$("#time-col").append(timeDiv);
	}
}

$.getJSON( "classes/classes_list.json", function(data) {
	courseCatalog = data.classes;
}).fail(function(){alert("JSON load failure!");});













