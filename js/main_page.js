//--------------------------------------------------------------------- Initialization ---------------------------------------------------------------------------
$(document).ready(function() {
	populateCalendarRows(8, 20);
	loadDeck();
	hidePages();
	showCalendarInformation();
});

// Hotkeys here
$(document).keydown(function(event) {
	if (event.keyCode == 191) {
		event.preventDefault();
		$("#course-search-box").focus();
	}
});

// Populate the course list array
var courseList = new Array();
var deckList = new Array();
var courseCatalog = new Array();

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
	
	if (searchString.length > 1) {
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
		// Remove duplicate courses from sidebar
		$("#deck").children().each(function(index, courseDomObj){
			removeCourseFromSidebar($(courseDomObj).attr("catalognumber"));
		});
	}
}

function getCourseWithNumber(number) {
	var returnCourse = null;
	courseCatalog.forEach(function(course) {
		if (course.CatalogNumber == number) {
			returnCourse = course;
		}
	});
	return returnCourse;
}
//--------------------------------------------------------------------- Deck Functions ---------------------------------------------------------------------------

function addCourseToSidebar(course) {
	$("#card-parent").append(new CourseTable(course));
	courseList.push(course);
}

function removeCourseFromSidebar(courseNumber) {
	$("#card-parent").children("[catalognumber='" + courseNumber + "']").remove();
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
			// Handle save dialog box here.
			if (data ==  1) {
				alert("Saved!");
			}
			else {
				alert("Not saved!");
			}
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
					if (classNumberArray[index] == courseCatalog[list_index].CatalogNumber) {
						addCourseToDeck(courseCatalog[list_index]);
					}
				}
			}
		}
	});
}

//--------------------------------------------------------------------- Card Functions ---------------------------------------------------------------------------

// Returns a course table with the proper information
// Card customization would occur here.
function CourseTable(course) {
	var parentDiv = $('<div draggable="true" onclick="selectCard(this)" ondragstart="drag(event)" ondragover="cardDragOver(this)" ondragleave="cardDragLeave(this)"></div>');
		parentDiv.attr("catalognumber", course.CatalogNumber);
		parentDiv.addClass("course-card flex row static std-margin unselectable");
	var col1 = $('<div class="card-col-1"></div>')
		.append(newRowDiv(course.Title))
		.append(newRowDiv(course.Location))
		.append(newRowDiv("Credits: " + course.NumCredits));
	var col2 = $('<div class="card-col-2"></div>')
		.append(newRowDiv(course.Instructors))
		.append(newRowDiv(course.Subject))
		.append(newRowDiv(course.CatalogNumber).addClass("CourseNumber"));
	parentDiv.append(col1).append(col2);
	parentDiv.get(0).addEventListener('contextmenu', function(e){
		showCourseInformation(e.currentTarget.getAttribute("catalognumber"));
		e.preventDefault();
	});
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

/* -------------------------------------- Functions for Showing Alternate Pages -------------------------------------------------- */
function hidePages() {
	$("#info-display").children().hide();
}

function showCourseInformation(courseNumber) {
	hidePages();
	var course = getCourseWithNumber(courseNumber);
	$("#course-name").text("Title: " + course.Title);
	$("#course-teacher").text("Instructors: " + course.Instructors);
	$("#course-location").text("Location: " + course.Location);
	$("#course-credits").text("Credits: " + course.NumCredits);
	$("#course-class-number").text("Catalog Number: " + course.CatalogNumber);
	$("#course-term").text("Term: " + course.Term);
	$("#course-type").text("Type: " + course.Type);	
	$("#course-description").text("Description: " + course.Description);

	$("#course-info-view").show();
}

function showCalendarInformation() {
	hidePages();
	$("#calendar-wrapper").show();
}
















