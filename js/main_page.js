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

$.getJSON( "classes/classes_list.json", function(data) {
	courseCatalog = data.classes;
}).fail(function(){alert("JSON load failure!");});

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
	$("#deck").append(new CourseTable(course)); // This does not occur anymore because we're moving the DOM object directly in the drop handler.
	deckList.push(course);
}

function clearSidebar() {
	$("#card-parent").children(".course-card").remove();
	courseList.length = 0; // Clears the courselist array
}

function clearDeck() {
	$("#deck").children(".course-card").remove();
	deckList.length = 0; // Clears the courselist array
	refreshCalendar();
}

// Disables dragging and grays out the course in course-list with the same course number as "card"
function disableDuplicateCard(course) {
	
}

function showDeckCoursesInCalendar() {
	updateDeckList();
	deckList.forEach(function(course) {
		putCourseOnCalendar(course);
	});
}

function updateDeckList() {
	deckList.length = 0; // Clears the deck array
	$("#deck").find(".course-card").each(function(index, obj) {
		deckList.push(getCourseWithNumber(obj.getAttribute("catalognumber")));
	});
}

function clearCalendar() {
	$("#calendar-wrapper").find(".occupied").removeClass("occupied");
}

function refreshCalendar() {
	clearCalendar();
	showDeckCoursesInCalendar();
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
				window.location.replace(data);
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
			refreshCalendar();
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
	refreshCalendar();
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
	deckList.push(getCourseWithNumber(draggedCard.getAttribute("catalognumber")));
	cardDivider.remove();
	refreshCalendar();
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
	start--;
	for (var i = start; i < end; i++) {
		var row = $('<div class="calendar-row flex col"></div>');
		row.addClass("hour" + (i + 1));
		$(".calendar-col").append(row);
		var timeDiv = $('<div class="time-div flex row x-align y-align"></div>');
		timeDiv.text(((i%12)+1).toString() + ":00");
		$("#time-col").append(timeDiv);
	}
	
	calCreateRowSubdivisions();
}

function calCreateRowSubdivisions() {
	for (var index = 0; index < numDivs; index++) {
		var newDiv = $("<div></div>");
		newDiv.addClass("flex row grow");
		newDiv.addClass("calDiv" + index);
		$(".calendar-row").append(newDiv)
	}
}

// FIX THIS; IT DOESN'T WORK QUITE RIGHT FOR TIME RANGES
function putCourseOnCalendar(course) {
	var dayCols = $("#calendar-wrapper").children(".calendar-col");
	for (var index = 0; index < dayCols.length; index++) {
		// If there is class on that day:
		if (course.Days[index]) {
			var currentHour = parseInt(course.StartHour);
			var currentMinute = parseInt(course.StartMinute);
			while (!isFirstTimeLater(currentHour, currentMinute, parseInt(course.EndHour), parseInt(course.EndMinute))) {
				if ((currentMinute == 60) && (!areTimesEqual(currentHour + 1, 0, parseInt(course.EndHour), parseInt(course.EndMinute)))){
					highlightSlot(index, currentHour + 1, 0);
				}
				else {
					highlightSlot(index, currentHour, currentMinute);
				}
				currentMinute += slotLength;
				if (currentMinute > 60) {
					currentHour++;
					currentMinute -= 60;
				}
			}
		}
	}
}

function areTimesEqual(hourA, minuteA, hourB, minuteB) {
	if ((hourA == hourB) && (minuteA == minuteB)) {
		return true;
	}
}

function isTimeWithinRange(botHour, botMinute, topHour, topMinute, hour, minute) {
	
}

function isFirstTimeLater(hourA, minuteA, hourB, minuteB) {
	if (hourA > hourB) {
		return true;
	}
	if (hourA < hourB) {
		return false;
	}
	else {
		return minuteA > minuteB;
	}
}

// Day is 0-6, Mon-Sun
// Highlights the slot with the specified time
// This should never receive minute 60.
function highlightSlot(day, hourNum, minute) {
	// Finds the element with the specified hour.
	var dayCols = $("#calendar-wrapper").children(".calendar-col");
	var hour = $(dayCols[day]).find(".hour" + hourNum);
	var slotNum = Math.floor(minute/slotLength);
	hour.find(".calDiv" + slotNum).addClass("occupied");
}

// Calendar Constants:
// Number of divisions per hour:
var numDivs = 4;
var slotLength = 60/numDivs;


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
	$("#course-days").text("Days: " + generateDayString(course.Days));
	$("#course-start-time").text("Start time: " + timeToString(course.StartHour, course.StartMinute));
	$("#course-end-time").text("End time: " + timeToString(course.EndHour, course.EndMinute));
	
	$("#course-info-view").show();
}

function timeToString(inputHour, inputMinute) {
	var hour = parseInt(inputHour);
	var minute = parseInt(inputMinute);
	
	var endString = "AM";
	if (hour > 11) {
		endString = "PM";
	}
	
	var humanHour = (hour % 12) + 1;
	return humanHour + ":" + pad(minute, 2) + " " + endString;
}

// From stackoverflow: http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function generateDayString(boolArray) {
	var dayStrings = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	var returnString = "";
	for (var index = 0; index < boolArray.length; index++) {
		if (boolArray[index]) {
			returnString += dayStrings[index] + ", ";
		}
	}
	if (returnString.length > 0) {
		// Chop off last two characters
		returnString = returnString.slice(0, returnString.length-2);
	}
	return returnString;
}

function showCalendarInformation() {
	hidePages();
	$("#calendar-wrapper").show();
}
















