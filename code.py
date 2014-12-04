import os
import webapp2
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import memcache
import logging
from django.utils import simplejson as json

logging.getLogger().setLevel(logging.DEBUG)

# Run initialization functions.

class CourseList(db.Model):
	list = db.StringProperty()
	user = db.StringProperty()
	
def render_template(handler, templatename, templatevalues):
	path = os.path.join(os.path.dirname(__file__), "templates/" + templatename)
	html = template.render(path, templatevalues)
	handler.response.out.write(html)
	
def getStaticFileContents(dirName):
	path = os.path.join(os.path.split(__file__)[0], dirName)
	return file(path, 'r').read()

# -------------------------------------------------------------- Code for Populating the Server Course List ------------------------------------------------------------------
	
# Global object that has class data.
class_list_object = None
search_array = []

def init():
	class_json = getStaticFileContents("classes/classes_list.json")
	global class_list_object
	class_list_object = json.loads(class_json)

def DoesCourseContainsSearchTerm(course, search_string):
	for value in course.itervalues():
		if type(value) is unicode:
			if search_string.lower() in value.lower():
				return True
	return False
	
def PopulateSearchArray(search_string):
	global class_list_object
	global search_array
	search_array = []
	for course in class_list_object["classes"]:
		if DoesCourseContainsSearchTerm(course, search_string):
			search_array.append(course)
	
def CreateJsonFromSearchArray():
	global search_array
	return json.dumps(search_array)
	
# Run init on startup.
init()	
	
class ClassSearch(webapp2.RequestHandler):
	def post(self):
		search_string = self.request.get("search_term")
		PopulateSearchArray(search_string)
		json_return = CreateJsonFromSearchArray()
		self.response.out.write(json_return)
	def get(self):
		course_id = self.request.get("course_id")
		global class_list_object
		for course in class_list_object["classes"]:
			if int(course["ClassNum"]) == int(course_id):
				self.response.out.write(json.dumps(course))
				return
		self.response.out.write("Error")
		

# --------------------------------------------------------------------------------------------------------------------------------
	
class MainPage(webapp2.RequestHandler):
	def post(self):
		user = users.get_current_user()
		if user:
			CourseList(None, user.nickname(), user = user.email(), list=self.request.get("classList")).put()
			self.response.out.write(1) # This is the code for success.
		else:
			self.response.out.write(users.create_login_url("/"))
			memcache.add("classList", self.request.get("classList"))
			
	def get(self):
		user = users.get_current_user()
		login_url = None
		logout_url = None
		
		if user:
			logout_url = users.create_logout_url("/")
		else:
			login_url = users.create_login_url("/")
		
		template_values = {
			"login": login_url,
			"logout": logout_url
		}
		
		render_template(self, "index.html", template_values)
		
class LoadCourses(webapp2.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			user_list = CourseList.get_by_key_name(user.nickname())
			unsaved_list = memcache.get("classList")
			if user_list is not None and len(user_list.list) != 0:
				if unsaved_list is not None:
					courses = unsaved_list.split(",")
					for course in courses:
						if user_list.list.find(course) == -1:
							user_list.list += "," + course
					user_list.put()
				self.response.out.write(user_list.list)
				memcache.delete("classList")
			else: # No previous user_list
				if unsaved_list is not None:
					CourseList(None, user.nickname(), user = user.email(), list=unsaved_list).put()
					self.response.out.write(unsaved_list)
					memcache.delete("classList")
		
class AboutPage(webapp2.RequestHandler):
	def get(self):
		page_contents = getStaticFileContents("templates/about.html")
		self.response.out.write(page_contents)
		
app = webapp2.WSGIApplication([
	("/", MainPage),
	("/load_courses", LoadCourses),
	("/search", ClassSearch),
	("/about", AboutPage)
])