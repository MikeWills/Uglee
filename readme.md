This is Uglee. Uglee is a dwarven fighter/priest of Gwar. His is stupid and strong as an ox. 
He is now also a TT.FM bot. 

While this is mostly for my learning and fun, feel free to use him in your own chatrooms. 

This project utilizes the [Turntable-API](https://github.com/alaingilbert/Turntable-API). 
Go there to learn how to setup Node.js then you can run this project. Make a copy of `config.sample.json` 
and rename that copy to `config.json`. Also make a copy of `actions.sample.js` and rename that copy to 
`actions.js`. Edit the document filling in the information required.

You can edit the `actions.js` I have or completely change the listing.

Features:

* Can check by artist, song, or genre and give smart-ass comments (and vote up or down on that song).
* Owner can awesome and lame songs either publicly or via private message
* Can be used as a fun chat-bot
* Can autobop songs based on how many people are up or down voting the songs.
* Bitches if a song is too long

Upcoming features:

* Auto dj
* More dynamic way of adding fun chat commands.

## Config options

    {"botinfo":
        {"auth":"auth+live+##############",  // Use the bookmarklet from TTAPI to find this
	    "userid":"##############",  // Use the bookmarklet from TTAPI to find this
	    "laptoptype":"chrome"},
    "roomid":"##################",  // Use the bookmarklet from TTAPI to find this
    "admins":
	    {"mainadmin":"#############",
	    "admins": ["################", "###########"] }, // Use the bookmarklet from TTAPI to find this, this is you
    "consolelog":false, // if true, spits out information that can be used for troubleshooting
    "autobop": false, // if true, will autobop if more than 25% of the room is. See http://faq.turntable.fm/customer/portal/articles/258935 for warnings.
    "autodj":false, // not used yet
    "newsongcomments":true, // if true, bot autobops on songs/bands/genres defined in actions.js
    "monitorsonglength":true, "maxsonglength":600 // if true, a comment can be made about the length of a song. maxsonglegth is in seconds