import os
import webapp2
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import db

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
        # 
        CourseList(None, user.nickname(), user=user.email(), list=self.request.get("classList")).put()
        self.response.out.write(1)	
    else :
        self.response.out.write(users.create_login_url('/'))      
  
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
      if user_list is not None :
        self.response.out.write(user_list.list)
      

app = webapp2.WSGIApplication([
  ('/', MainPage),
  ('/load_courses', LoadCourses)
])