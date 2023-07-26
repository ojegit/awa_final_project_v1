# Advanced Web Programming: final project 
Version 1: Frameworkless design


## Scoring table 
|Requirement|Points|Yes (x)/No (-)|
|:---|:---:|:---:|
|Basic features with well written documentation|25|-|
|Users can edit their own comments/posts|4|-|
|Utilization of a frontside framework|5|-|
|Use some highlight library for the code snippets|2|-|
|Use of a pager when there is more than 10 posts available|2|-|
|Login with Facebook, Google or Twitter accounts (use Passport.js)|2|-|
|Admin account with rights to edit all the post and comments and delete content (if a post is removed, all its comments should be removed too)|3|-|
|Test software for accessibility; can it be used only with keyboard / voice command? Can screen readers work with your application?|3|-|
|Provide a search that can filter out only those messages that have the searched keyword|2|-|
|Vote (up or down) posts and comments (only one vote per user)|3|-|
|User profiles can have images which are show next to posts/comments|3|-|
|User can click username and see user profile page where name, register date, (user picture) and user bio is listed|2|-|
|Last edited timestamp is stored and shown with posts/comments|2|-|
|Translation of the whole UI in two or more languages|2|-|
|Create (unit) tests and automate some testing for example with https://www.cypress.io/ (at least 10 cases have to be implemented)|5|-|
|
|TOTAL|65||

## Done
Not done:
- use `https://highlightjs.org/` for displaying the code
- finally: review points achieved, check for bugs and most importantly make sure the program works!
- choice of auth token placement is important for implementation: place auth tokens to either headers where it can be accessed by the server very easily or save locally so as to be accessed UNTIL it expires or is deleted for independent verification.
    * header: a) enables server side rendering, b) and usage of template engines and c) client is always known therefore rendering can be directly applied to a specific group 
    * local storage (most likely jwt): all has to be done client side: a) the code for all groups is always accessible b) template engines can't be used (not that they'd be used anyway if React, Angular, Vue etc. is used)

Done: 
- DB Schemas
- Routes
- UI design

## Changes:
07/26/2023
- planning
07/17/2023
- init

