import os
import webapp2
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import memcache
import logging

logging.getLogger().setLevel(logging.DEBUG)
#from webapp2_extras import sessions

class CourseList(db.Model) :
  list = db.StringProperty()
  user = db.StringProperty()

def render_template(handler, templatename, templatevalues) :
  path = os.path.join(os.path.dirname(__file__), 'templates/' + templatename)
  html = template.render(path, templatevalues)
  handler.response.out.write(html)

# If / when we get web scraping working, we would have courses being populated here.
def populate_Courses() :
  pass
		
class MainPage(webapp2.RequestHandler) :
  def post(self) :
    user = users.get_current_user()
    if user : 
      CourseList(None, user.nickname(), user=user.email(), list=self.request.get("classList")).put()
      self.response.out.write(1)	
    else :
      self.response.out.write(users.create_login_url('/'))  
      memcache.add('classList', self.request.get("classList"))
      
  
  def get(self) :
    user = users.get_current_user()
  
    login_url = ''
    logout_url = ''
    
    email = ''
    name = ''
    
    if user :
      logout_url = users.create_logout_url('/')
    else :
      login_url = users.create_login_url('/')
    
    template_values = {
      'login' : login_url,
      'logout' : logout_url,
    }
  
    render_template(self, 'index.html', template_values)

class LoadCourses(webapp2.RequestHandler) :
  def get(self) :
    user = users.get_current_user()
    if user :
      user_list = CourseList.get_by_key_name(user.nickname())
      unsaved_list = memcache.get('classList')
      if user_list is not None and len(user_list.list) != 0:
        if unsaved_list is not None :
          courses = unsaved_list.split(',')
          for course in courses :	#prevent repeats in course list
            if user_list.list.find(course) == -1 :
              user_list.list += "," + course
              logging.info("from memcache to current list")
          user_list.put()
          user_list = CourseList.get_by_key_name(user.nickname())
        self.response.out.write(user_list.list)
        memcache.delete('classList')
      else :	# no previous user_list (user_list is None)
        if unsaved_list is not None :
          logging.info("no saved list, adding from memcache")
          CourseList(None, user.nickname(), user=user.email(), list=unsaved_list).put()
          self.response.out.write(unsaved_list)
          memcache.delete('classList')
      

app = webapp2.WSGIApplication([
  ('/', MainPage),
  ('/load_courses', LoadCourses)
])