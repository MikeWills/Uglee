This is the new readme.md for the new version of this bot. I won't publish a new config for the bot until I have this working back to where the old bot was.

Required NPM packages:
* npm install ttapi
* npm install ansi-color
* npm install mysql
* npm install util
* [sudo] npm install forever -g // required to have the bot automatically come back up after a downtime.

Most of the configuration is stored in the database, so a database is required.

Core Functions:
* AutoDJs
* AutoBop at 40% of the room is bopping (lames if 40% of the room lames).
* Ban users
* Per-room settings
* Play count moderation (beta)