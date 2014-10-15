import os
import webapp2
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import db

class Course(db.Model) :
  dept = db.StringProperty()	#department
  cat_num = db.IntegerProperty()	#catalog number
  term = db.StringProperty()
  class_num = db.IntegerProperty()
  title = db.StringProperty()
  instructor = db.StringProperty()
  credits = db.IntegerProperty()
  reqs = db.StringProperty	#general education requirements
  days = db.StringProperty	#meeting days
  time = db.StringProperty	#meeting times
  classroom = db.StringProperty		#location
  user = db.StringProperty	#how to identify user: id number, username, email address, full name?


def render_template(handler, templatename, templatevalues) :
  path = os.path.join(os.path.dirname(__file__), 'templates/' + templatename)
  html = template.render(path, templatevalues)
  handler.response.out.write(html)

def populate_Courses() :
  #loop through array here?? Or pass in objects and have loop elsewhere calling this function
  # we can populate this object...
	  course = Course()
	  #for now, must hardcode all course information and populate here
	  #eventually will use web scraping to get this information, 
	  #but does the database get populated every time, or can it
	  #be done once and saved?
	  course.put()
populate_Courses()
  
class MainPage(webapp2.RequestHandler) :
  def post(self) :

    
    # retrieving the current user is simple.
    user = users.get_current_user()
    
    # if this object is defined now, we can assume a valid user is signed in.
    # if user :


      # ... then save it to the datastore with the db.Model put() method.
    self.response.out.write("everything worked out ok.")
      
  
  def get(self) :
  
    user = users.get_current_user()
  
    login_url = ''
    logout_url = ''
    
    email = ''
    name = ''
    
    if user :
      # it's easy to get basic details from our user, as well as a URL to sign out.
      # the parameter to the create_logout_url method just identifies where to redirect after logout.
      logout_url = users.create_logout_url('/')
      email = user.email()
      name = user.nickname()
    else :
      login_url = users.create_login_url('/')
    
    template_values = {
      'login' : login_url,
      'logout' : logout_url,
      'email' : email,
      'nickname' : name,
    }
  
    render_template(self, 'index.html', template_values)


# we'll use this to retrieve the values from the datastore.
class ShowCourses(webapp2.RequestHandler) :
  def get(self) :
  
    course_info = []
    
    # we'll get the current user... 
    user = users.get_current_user()
    if user :
    
      # ... then build a query based on that users's entries.
      q = Course.all()
      #q.filter('user =', user.email()) --- figure this out
      
      # we'll run the query and save all the results.	-- this should create the cards??
      for course in q.run() :
        course_info.append(course)
      
    template_values = {
      'courses' : courses
    }
    render_template(self, 'courses.html', template_values)


app = webapp2.WSGIApplication([
  ('/', MainPage),
  ('/courses', ShowCourses)
])