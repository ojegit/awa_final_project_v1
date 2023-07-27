# Advanced Web Programming: final project 
Version 1: Frameworkless design /w 
- client and server NOT separated
- package.json also doesn't contain separation between these components

## References
https://stackoverflow.com/questions/39746718/mongodb-node-js-role-based-access-control-rbac
https://www.mongodb.com/docs/manual/core/authorization/
https://www.developerhandbook.com/blog/passportjs/passport-role-based-authorisation-authentication/
https://stackoverflow.com/questions/53880700/how-to-create-mongodb-schema-design-while-dealing-with-single-user-account-and-m

https://riemke.dev/blog/bootstrap-with-pug-template/


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
- front-end (`client`):
    - pages:
        - landing (?)
        - login
        - logoff
        - register
        - admin dashboard
        - user settings
        - code snippets/commentary etc. 
    - functionality:
        - search bar 
        - navbar
        - comments: add/edit/delete
        - code snippets: add/edit/delete
        - up/downvote
        - user image upload
        - RBAC/Roles/Responsibilities handling 
    - UI design: Materialize, React, Template engine, CSS (?)
- back-end (`server`):
    - user input verification
        * login: username(email), password)
        * register: first name, last name, email, password, nick)
        * input code blocks
        * routes (has to do with capturing different range of addresses and case sensitivity; very different approach to the above, but still may be relevant)
    - choice of authentication method:
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

