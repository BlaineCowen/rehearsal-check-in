# Outline

## Features
- Google Auth sign in
- Alternate sign in method
- postgres database using supabase
- Admin creates an Organization Name and can upload an image
- Admin Uploads a list of students with first name, last name, id
    - optionally add grade and group
    - make it easy for admin to append a name to the list

- admin clicks start new rehearsal and gets a link
    - Admin also selects from a list of groups to say who needs to be there (select multiple)
- the link takes them to a simple page where students can sign in
    - the link must be secure so students can't copy the link for the future or change admin settings
- students sign in with their student ID
- A message should show up with their name if success, and error if they typed their name incorrectly
- their signin should be sent to the Attendance db table
- the admin should get a list of students who should have been at the rehearsal but weren't

- There should be a dashboard where admins can see student stats
- admin should be able to filter by start and end dates so they can view by grading period

- Admins can send an invite link to other directors to add co-admins


