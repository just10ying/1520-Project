import java.io.*;
import java.util.*;

public class ClassGenerator {
	
	// Course possibilities:
	private static Random randomGenerator;
	private static String[] prefixes = {"Intro to","Intermediate","Advanced","Beginners","Mathematical","Magical","Applied","Theoretical","Expensive","Annoying","Impossible","Easy","Blue","Red","Green","Upper-Level","Lower-Level","Basic","Difficult","Super Advanced","Poorly Taught","Superb","Cognitive","Civil","Computer","Bio","Chemical","Senior","Amazing","Kawaii","Sugoi","Infinite","Crazy","Calm","Charming","Arrogant","Grungy","Hairy","Handy","Global","Fuzzy","Electric","Signal","Defense Against","Philosophy of","Pokemon"};
	private static String[] courses = {"Calculus","Whole Numbers","Thermodynamics","Engineering Analysis","Freshmen Seminar","Sophomore Seminar","CoE Seminar","Web Applications","Web Development","Software Development","Software Engineering","Mobile Platform Development","App Development","Economics","Differential Equations","Psychology","Engineering","Design","Game Theory","Data Structures","Algorithms","Variables","Addition","Algebra","Kung Fu","Gaming","Swimming","Basketball","Videogames","Construction","Basket Weaving","Lab","Firefighting","Desktop Applications","Network Security","Circuits","Analysis","Jedi Training","Halo","Arts","Latin","Spanish","Chinese","Parseltongue","Simpsons","Tree climbing","Magical Girl Seminar","Knitting","Justice","Training"};
	private static String[] suffixes = {"For Engineers", "For Beginners", "For Peasants", "I", "II", "III", "for Noobs", "for Pros", "for Scientists","Basics"};
	
	private static List<String> instructorList;
	private static List<String> sessionList;
	private static List<String> termsList;
	private static List<String> categoryList;
	private static List<String> categoryAbbreviations;
	
	
	public static String generateCourseName() {
		int prefixIndex = randomGenerator.nextInt(prefixes.length*2);
		int courseIndex = randomGenerator.nextInt(courses.length);
		int suffixIndex = randomGenerator.nextInt((int)(suffixes.length*2.3));
		
		String returnString = "";
		if (prefixIndex < prefixes.length) {
			returnString = returnString.concat(prefixes[prefixIndex] + " ");
		}
		returnString = returnString.concat(courses[courseIndex]);
		if (suffixIndex < suffixes.length) {
			returnString = returnString.concat(" " + suffixes[suffixIndex]);
		}
		return returnString;
	}
	
	public static String getRandomMember(List<String> list) {
		return list.get(randomGenerator.nextInt(list.size()));
	}
	
	public static void main(String[] args) {
		// Initialize random:
		randomGenerator = new Random();

		// Read instructor names
		instructorList = getInstructors("InstructorNames.txt");
		// Read possible sessions:
		sessionList = readCommaDelimitedFile("Sessions.txt");
		termsList = readCommaDelimitedFile("Terms.txt");
		// Read in courses
		categoryList = new ArrayList<String>();
		categoryAbbreviations = new ArrayList<String>();
		loadCategories(categoryList, categoryAbbreviations);
		
		StringBuilder jsonString = new StringBuilder("\"classes:\":[\n");
		
		int minNum = 10000;
		int maxClasses = 20000;
		
		for (int classNum = minNum; classNum < maxClasses; classNum++) {
			jsonString.append(createRandomSection(classNum, String.valueOf(randomGenerator.nextInt(maxClasses+1))).toJSONString());
		}
		
		jsonString.append("]}");
		try {
			PrintWriter jsonOut = new PrintWriter("output.txt");
			jsonOut.print(jsonString.toString());
		}
		catch (FileNotFoundException e) {
			// This should not occur.
		}
	}

	public static Section createRandomSection(int catalogNum, String associatedClassInput) {
		Section randomSection = new Section();
		
		randomSection.term = getRandomMember(termsList);
		randomSection.type = getRandomMember(categoryAbbreviations);
		randomSection.subject = getRandomMember(categoryList);
		randomSection.catalogNumber = catalogNum;
		randomSection.title = generateCourseName();
		randomSection.numCredits = randomGenerator.nextInt(5) + 1;
		randomSection.classNum = String.valueOf(String.format("%05d", catalogNum));
		randomSection.session = getRandomMember(sessionList);
		randomSection.days = getRandomBooleans(7);
		randomSection.startHour = randomGenerator.nextInt(10)+8;
		randomSection.startMinute = randomGenerator.nextInt(4)*15;
		randomSection.endHour = randomSection.startHour + randomGenerator.nextInt(3)+1;
		int endMin = (randomSection.startMinute + randomGenerator.nextInt(4)*15);
		if (endMin >= 60) {
			randomSection.endHour++;
		}
		randomSection.endMinute = (endMin % 60);
		randomSection.associatedClasses = associatedClassInput;
		randomSection.enrollLimit = randomGenerator.nextInt(81)+10;
		randomSection.instructors = getRandomMember(instructorList);
		
		return randomSection;
	}
	
	public static boolean[] getRandomBooleans(int num) {
		boolean[] returnValue = new boolean[7];
		for (int index = 0; index < num; index++) {
			if (randomGenerator.nextInt(2) == 1) {
				returnValue[index] = true;
			}
			else {
				returnValue[index] = false;
			}
		}
		return returnValue;
	}
	
	// Prints the contents of a list of strings.
	public static void printList(List<String> list) {
		for (String s : list) {
			System.out.println(s);
		}		
	}
	
	public static void loadCategories(List<String> categories, List<String> abbreviations) {
		try {
			BufferedReader reader = new BufferedReader(new FileReader("Subjects.txt"));
			String line = "";
			do {
				line = reader.readLine();
				if (line != null) {
					String[] strings = line.split(",");
					categories.add(strings[0]);
					abbreviations.add(strings[1]);
				}
			} while (line != null);
		}
		catch (FileNotFoundException e) {
			System.out.println("File was not found.");
		}
		catch (IOException e) {
			System.out.println("IO Exception");
		}
	}
	
	public static List<String> getInstructors(String fileName) {
		List<String> nameList = new ArrayList<String>();
		try {
			BufferedReader nameReader = new BufferedReader(new FileReader(fileName));
			String name = "";
			do {
				name = nameReader.readLine();
				if (name != null) {
					nameList.add(name);
				}
			} while (name != null);
		}
		catch (FileNotFoundException e) {
			System.out.println("File was not found.");
		}
		catch (IOException e) {
			System.out.println("IO Exception");
		}
		return nameList;
	}
	
	// Reads a comma delimited file, parses the contents, and returns the contents in a list.
	public static List<String> readCommaDelimitedFile(String fileName) {
		String inputString = "";
		try {
			BufferedReader reader = new BufferedReader(new FileReader(fileName));
			inputString = reader.readLine();
		}
		catch (FileNotFoundException e) {
			System.out.println("File was not found.");
		}
		catch (IOException e) {
			System.out.println("IO Exception");
		}
		return Arrays.asList(inputString.split(","));
		
	}
	
}