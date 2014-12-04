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

function clearDeck() { //****************************************************************************
	$("#deck").children(".course-card").remove();
	deckList.length = 0; // Clears the courselist array
	
	// Also clear cards with occupied classes 
	$("#calendar-wrapper").children(".occupied").remove();
	
	refreshCalendar();
}
/*
function checkForConflicts(card) { 
	var d = $("#deck").children(".course-card");
	var courseA = getCourseWithNumber(card.getAttribute("catalognumber"));
	for (var i = 0; i < d.length; i++) { 
		// get d[i] course
		var courseB = getCourseWithNumber(d[i].getAttribute("catalognumber"));
		
		// Check if days overlap
		if (doDaysOverlap(generateDayString(courseA.Days), generateDayString(courseB.Days))) {
			// if card is not occupied and days/time conflict, mark conflict
			if (d[i] != card && !($(d[i]).hasClass("occupied")) && doesTimeOverlap(courseA.StartHour, courseA.StartMinute, courseA.EndHour, courseA.EndMinute, 
												courseB.StartHour, courseB.StartMinute, courseB.EndHour, courseB.EndMinute)) {
			$(card).addClass("conflict");
			console.log("conflict");
			}
		}
	}
}
*/

function checkForConflicts() { 
	console.log("checking for conflicts");
	var deckCards = $("#deck").children(".course-card");
	var selectedCards = $("#deck").children(".course-card.scheduled");
	
	// Clear previous conflicts 
	$(deckCards).removeClass("conflict");
	
	// Check all deck cards against all selected cards, mark conflicting deck cards
	for (var s = 0; s < selectedCards.length; s++) {
		// Get course
		var courseA = getCourseWithNumber(selectedCards[s].getAttribute("catalognumber"));
		
		for (var d = 0; d < deckCards.length; d++) { 
			// get deckCards[d] course
			var courseB = getCourseWithNumber(deckCards[d].getAttribute("catalognumber"));
			
			// Check if days overlap
			if (doDaysOverlap(generateDayString(courseA.Days), generateDayString(courseB.Days))) {
				// if card is not occupied and days/time conflict, mark conflict
				if (deckCards[d] != selectedCards[s] && !($(deckCards[d]).hasClass("occupied")) && doesTimeOverlap(courseA.StartHour, courseA.StartMinute, courseA.EndHour, courseA.EndMinute, 
													courseB.StartHour, courseB.StartMinute, courseB.EndHour, courseB.EndMinute)) {
					$(deckCards[d]).addClass("conflict");
					console.log("CONFLICT!");
				}/* else {
				// if does not conflict now but previously conflicted, remove conflict class
					if ($(deckCards[d]).hasClass("conflict")) {
						console.log("removing conflict class");
						$(deckCards[d]).removeClass("conflict");
					}
				}*/
			}/* else {
				// if does not conflict now but previously conflicted, remove conflict class
				if ($(deckCards[d]).hasClass("conflict")) {
					console.log("removing conflict class");
					$(deckCards[d]).removeClass("conflict");
				}
			}*/
		}
	}
}


// Disables dragging and grays out the course in course-list with the same course number as "card"
function disableDuplicateCard(course) {
	
}

function showDeckCoursesInCalendar() { //******************************************
	updateDeckList();
	var count = 0;
	deckList.forEach(function(course) {
		putCourseOnCalendar(course, ++count);
	});
//	console.log('show deck courses in calendar');
}

function updateDeckList() { //*******************************************************************************************
	deckList.length = 0; // Clears the deck array
//	$("#deck").find(".course-card").each(function(index, obj) {
	$("#deck").find(".course-card.scheduled").each(function(index, obj) { 
		deckList.push(getCourseWithNumber(obj.getAttribute("catalognumber")));
	});
}

function clearCalendar() { // *************************************************************************
	$("#calendar-wrapper").find(".occupied").removeClass("occupied");
}

function refreshCalendar() {
	console.log('refresh calendar');
	clearCalendar();
	checkForConflicts();
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
	
	// if $("#deck") has that card, toggle with unique color and refresh calendar?? (call selectDeckCard)
	var d = $("#deck").children(".course-card");
	for (var i = 0; i < d.length; i++) { //**************************************************************************************************************
		if (d[i] == card) {
			selectDeckCard(card);
//			checkForConflicts(card);
		}
	}
	refreshCalendar();	
}

function selectDeckCard(card) { // ************************************************************************************************************
	// Check if it conflicts
	if ($(card).hasClass("conflict")) {
		alert("This class conflicts with something you have already scheduled.");
	} else {
		// Mark course as scheduled
		$(card).toggleClass("scheduled");
		$(card).toggleClass("");
		// Highlight this card in the deck
	}
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
	
	// Remove class if it has a color
	if ($(draggedCard).hasClass("occupied")) { 
		$(draggedCard).removeClass("occupied");
	}
	
	// Remove conflict class if it has
	if ($(draggedCard).hasClass("conflict")) { 
		$(draggedCard).removeClass("conflict");
	}
	
	cardDivider.remove();
	refreshCalendar();
}

function dropInDeck(ev) { // ***************************************************************************************************************
    ev.preventDefault();
    var targetCard = $(ev.target).closest(".course-card");
	
	// get rid of selected class (so card isn't still highlighted when it is moved to deck) *************************************************
	if ($(draggedCard).hasClass("selected")) {
		$(draggedCard).toggleClass("selected");
	}
	
	if (targetCard.length == 0) { // If there's no card in the deck
		$("#deck").append(draggedCard); // append it directly to the deck.
	}
	else {
	    $(ev.target).closest(".course-card").after(draggedCard);	
	}
	deckList.push(getCourseWithNumber(draggedCard.getAttribute("catalognumber")));
	cardDivider.remove();
	checkForConflicts();
	refreshCalendar();
}

function cardDragOver(card) {
	$(card).after(cardDivider);
}

function cardDragLeave(card) {
	cardDivider.remove();
}

//--------------------------------------------------------------------- Calendar Functions ---------------------------------------------------------------------------
var calendarColors = ['c1','c2','c3','c4','c5','c6'];

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
function putCourseOnCalendar(course, colorNumber) { 
	var dayCols = $("#calendar-wrapper").children(".calendar-col");
	var color = getCalendarColor(colorNumber);
	
	for (var index = 0; index < dayCols.length; index++) {
		// If there is class on that day:
		if (course.Days[index]) {
			var currentHour = parseInt(course.StartHour);
			var currentMinute = parseInt(course.StartMinute);
			while (!isFirstTimeLater(currentHour, currentMinute, parseInt(course.EndHour), parseInt(course.EndMinute))) {
				if ((currentMinute == 60) && (!areTimesEqual(currentHour + 1, 0, parseInt(course.EndHour), parseInt(course.EndMinute)))){
					highlightSlot(index, currentHour + 1, 0, color);
				}
				else {
					highlightSlot(index, currentHour, currentMinute, color);
				}
				currentMinute += slotLength;
				if (currentMinute > 60) {
					currentHour++;
					currentMinute -= 60;
				}
			}
		}
		// Change color of card to match its calendar color here

	}
	console.log('put course on calendar');
}

function areTimesEqual(hourA, minuteA, hourB, minuteB) {
	if ((hourA == hourB) && (minuteA == minuteB)) {
		return true;
	}
}

function isTimeWithinRange(botHour, botMinute, topHour, topMinute, hour, minute) {
	
}

function doesTimeOverlap(startHourA, startMinuteA, endHourA, endMinuteA, startHourB, startMinuteB, endHourB, endMinuteB) {
	// Check if times start or end at same time (classes overlap)
	startHourA = parseInt(startHourA);
	startMinuteA = parseInt(startMinuteA);
	endHourA = parseInt(endHourA);
	endMinuteA = parseInt(endMinuteA);
	startHourB = parseInt(startHourB);
	startMinuteB = parseInt(startMinuteB);
	endHourB = parseInt(endHourB);
	endMinuteB = parseInt(endMinuteB);
	
	if (areTimesEqual(startHourA, startMinuteA, startHourB, startMinuteB) || areTimesEqual(endHourA, endMinuteA, endHourB, endMinuteB)) {
		return true;
	}
	// Check if classes overlap in the middle of the time block
	if (isFirstTimeLater(endHourA, endMinuteA, startHourB, startMinuteB) && (isFirstTimeLater(endHourB, endMinuteB, endHourA, endMinuteA) || isFirstTimeLater(startHourB, startMinuteB, startHourA, startMinuteA)) ) {
		return true;
	}
	
	if (isFirstTimeLater(endHourB, endMinuteB, startHourA, startMinuteA) && (isFirstTimeLater(endHourA, endMinuteA, endHourB, endMinuteB) || isFirstTimeLater(startHourA, startMinuteA, startHourB, startMinuteB)) ) {
		return true;
	}

	console.log("no conflicts");
	return false;
}

function doDaysOverlap(daysA, daysB) {
	var daysArray = daysA.split(", ");
	
	for (var i = 0; i < daysArray.length; i++) {
		if (daysB.indexOf(daysArray[i]) > -1) {
			return true
		}
	}
	console.log("no day overlap");
	return false;
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

function getCalendarColor(colorNumber) {
	if (calendarColors.length > colorNumber) {
		return 'occupied ' + calendarColors[colorNumber];
	} else {
		return 'occupied default';
	}
}

// Day is 0-6, Mon-Sun
// Highlights the slot with the specified time
// This should never receive minute 60.
function highlightSlot(day, hourNum, minute, color) { // ******************************************
	// Finds the element with the specified hour.
	var dayCols = $("#calendar-wrapper").children(".calendar-col");
	var hour = $(dayCols[day]).find(".hour" + hourNum);
	var slotNum = Math.floor(minute/slotLength);

	if ($(hour.find(".calDiv" + slotNum)).hasClass("occupied")) { 
		// Remove class if it already has a color
		$(hour.find(".calDiv" + slotNum)).removeClass("occupied");
	}
	
	hour.find(".calDiv" + slotNum).addClass(color);
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
















