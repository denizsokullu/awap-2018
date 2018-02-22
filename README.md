ACM@CMU Algorithms with a Purpose 2018 Website

Requirements
- Python3 not >= 3.6 with NetworkX
- Nodejs and npm

```javascript
npm install
npm run dev
```

Code structure
/ -> information about the competition link to login etc.

/login -> handles login -> redirects to /loginFailed if wrong info
/team -> has the upload form and the gallery of games to view
         * The user clicks one of the logs and sends a AJAX request to load a
           certain output script.
         * The script then gets added to the canvas thats in the middle of
           the screen and is executed to replay that certain output.
         * Clicking another one while playing, pauses the replay and waits
           until the new one has loaded.

/upload -> handles file execution and properly adds the file into the users
           repository and deletes the oldest one if limit is reached(MAX_UPLOAD).
         * loads the /team page again once its successful or loads up a
            /uploadFailed screen if something bad happens and that page has
            a link to /team back again.
         * things to do later - redirect in 5 seconds when in uploadFailed
/scoreboard -> fetches the scoreboard info for each player
         * initially public?
         * later on final results are viewed
         * links to the gameplay of each?
/runCompetition?=password -> runs the tournament?(implement later)
  grab a submission from each team
/
