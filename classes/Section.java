public class Section {
	public String term;
	public String type;
	public String subject;
	public int catalogNumber;
	public String title;
	public int numCredits;
	public String classNum; // This should be unique.
	public String session;
	public String location;
	
	public boolean[] days; // Monday through Sunday, in that order.  Boolean if class is on that day.
	public int startHour;
	public int startMinute;
	public int endHour;
	public int endMinute;
	
	public String associatedClasses; // This should also be unique.
	public int enrollLimit;
	public String instructors; // Comma delimited string containing instructors.
	
	public String toJSONString() {
		StringBuilder jsonString = new StringBuilder("\t{");
		
		jsonString.append(propertyNameToJson("Term", term));
		jsonString.deleteCharAt(2); // remove extraneous initial tab:
		jsonString.append(propertyNameToJson("Type", type));
		jsonString.append(propertyNameToJson("Subject", subject));
		jsonString.append(propertyNameToJson("CatalogNumber", String.format("%05d", catalogNumber)));
		jsonString.append(propertyNameToJson("Title", title));
		jsonString.append(propertyNameToJson("NumCredits", numCredits));
		jsonString.append(propertyNameToJson("ClassNum", classNum));
		jsonString.append(propertyNameToJson("Session", session));
		jsonString.append(propertyNameToJson("Location", location));
		jsonString.append(propertyNameToJson("Days", daysToString()));
		jsonString.append(propertyNameToJson("StartHour", startHour));
		jsonString.append(propertyNameToJson("StartMinute", startMinute));
		jsonString.append(propertyNameToJson("EndHour", endHour));
		jsonString.append(propertyNameToJson("EndMinute", endMinute));		
		jsonString.append(propertyNameToJson("AssociatedClasses", associatedClasses));
		jsonString.append(propertyNameToJson("EnrollLimit", enrollLimit));
		jsonString.append(propertyNameToJson("Instructors", instructors));		

		jsonString.deleteCharAt(jsonString.length()-1);
		jsonString.deleteCharAt(jsonString.length()-1);
		
		jsonString.append("}");
		return jsonString.toString();
	}
	
	public String daysToString() {
		String[] dayStrings = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
		String returnString = "";
		for (int index = 0; index < days.length; index++) {
			if (days[index]) {
				returnString += dayStrings[index] + ",";
			}
		}
		if (returnString.length() > 0) {
			returnString = new StringBuilder(returnString).deleteCharAt(returnString.length()-1).toString(); // Delete the last comma
		}
		return returnString;
	}
	
	public static String propertyNameToJson(String name, String value) {
		return "\t\"" + name + "\": \"" + value + "\",\n";	
	}
	
	public static String propertyNameToJson(String name, int value) {
		return "\t\"" + name + "\": \"" + value + "\",\n";	
	}

}