// Bot details
global.botAuthId = "xaNtZwhizOWLtPcXMQFnoHgI";
global.botUserId = "604ee75647c69b001db18341";
global.botRoomId = "604131d63f4bfc001809d4a8";
//global.botRoomId = "605418f647c69b001bbbd236"; // The Correctional Facility
global.botName = "botty";
global.botLaptop = "mac";
global.botAdmins = ["604054243f4bfc001be4c156", "MixxMasterMike"]; // This can be 1 or more people

global.botWebsite = "";
global.botTwitter = "";
global.botFacebook = "";
global.botAbout = "MixxMasterMike's highly custom bot. Source code coming soon.";
global.botTopartists = "Any hot hitz.";
global.botHangout = "Hot Hitz";

// Database Details
global.dbHost = "localhost";
global.dbName = "tt_bots";
global.dbTablePrefix = "botty_";
global.dbLogin = "ttfm";
global.dbPassword = "8jSGVKD0S4I%aXD2mVy2";

global.lastfmApiKey = "";
global.lastfmApiSecret = "";

// Flags
global.logtoconsole = true;

// Configure sayings
global.stepUpText = "I listen to everyone else play, but no one ever wants to hear me spin. I have the BEST tunes.";
global.stepDownText = "So you're saying you don't love me. I see how it is. :angry:";
global.summonText = "Can you want to join us in Hot Hitz (tt.fm/hot_hitz)?";
global.welcomeText = "Welcome back @{u}!";
global.welcomeVisitorText = "Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.";
global.welcomeDaily = ["Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Sunday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Monday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Tuesday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Wednesday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Thursday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Friday
	"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules."]; // Saturday
global.ruleText = "Welcome to Hot Hitz, home of the happy folk. We are a warm and welcoming room allowing for almost all types of music. Play top hitz from any decade in all genres except screemo, EDM, dubstep, and vulgar songs. Please limit songs to 6 min or under. Please no bad language from 8 am to 8 pm Eastern or 5 am to 5 pm Pacific, for those who are listening at work. Thanks for being here with us!";
global.startupText = "Out of the way world. I've got my sassy pants on today.";

global.awesomeText = ["I love it!",
	"This song is awesome!",
	"How'd you know I'd love this song?",
	"Raise the roof!",
	"The roof, the roof is on fire!",
	"W00t!",
	"Hell yah!",
	"This rocks!"];
global.lameText = ["Yawn"];
global.downVoteText = ["If you can't be nice, don't vote at all.",
	"A lame? Imma lame your ass next time you play a song!",
	"An all music mix room encourages people to take risks with their song choices, laming discourages that.",
	"HEY EVERYONE! Some jerk just lamed this song!",
	"You wouldn't lame your momma would you? So why lame this person?"];
global.userLeaveQuickText = ["Hey! {u} just took our beer!",
	"OMG! {u} just took our last bottle of Jack!",
	"Thanks for coming {u}!"];
global.hitBot = ["OMG! Okay I'll awesome. Whatta prick!",
	"What?!?",
	"What the hell? I am simply voicing my opinion! *cough*jerk*cough*",
	"OUCH! Fine... I'll awsome."];
global.crankIt = ["Already did!!",
	"I think I broke the knob off trying to hit 11!",
	"The neighbors won't like this but....",
	"Hell yah!",
	"Pumping up the jam!",
	"The roof, the roof is on fire!",
	"Wait, I think I hear the cops knocking...",
	"I'm on 11!"];
global.danceGif = ["https://media4.giphy.com/media/3vdFJocaKvygTLw8PK/giphy.gif",
	"https://media3.giphy.com/media/cklPOHnHepdwBLRnQp/giphy.gif",
	"https://media2.giphy.com/media/JJGUejl0pLcRy/giphy.gif?cid=82a1493bh92hof7pp9nzk4j8fiifra4csdj7w05a5wylacnc&rid=giphy.gif"];
global.chat_responses = [{ name: "hi", response1: "Duh!", response2: "" },
{ name: "whois", response1: "I'm a bot that wass created by @MixxMasterMike. My code can be found at https://github.com/MikeWills/Uglee.", response2: "" },
{ name: "speak", response1: "Ohmygawd", response2: "" },
{ name: "300", response1: "THIS. IS SPARTA!!!!!!", response2: "" },
{ name: "ping", response1: "pong", response2: "" },
{
	name: "menu", response1: "Here is my drink menu: whiskey | brandy | tequilla | gin | coke | dew | coffee | water.",
	response2: "Here is my food menu: pizza | cake | taquitos | churro"
},
{ name: "beer", response1: "/me hands @{u} a cold one.", response2: "Here you go @{u}." },
{ name: "whiskey", response1: "/me hands @{u} a Crown Royal on the rocks.", response2: "Here you go @{u}." },
{ name: "brandy", response1: "/me hands @{u} a E&J VSOP on the rocks.", response2: "Here you go @{u}." },
{ name: "tequila", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go @{u}. Real humans don't need limes and salt." },
{ name: "tequilla", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go @{u}. Real humans don't need limes and salt." },
{ name: "taquila", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go @{u}. Real humans don't need limes and salt." },
{ name: "taquilla", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go  @{u}. Real humans don't need limes and salt." },
{ name: "gin", response1: "/me hands @{u} a Hendricks with soda and lemon.", response2: "Here you go @{u}." },
{ name: "wine", response1: "I just LOVE wine. I drink it by the bottle.", response2: "/me hands @{u} a glass of wine." },
{ name: "coke", response1: "/me hands @{u} a cold one.", response2: "Here you go @{u}." },
{ name: "dew", response1: "/me hands @{u} a Mt. Dew.", response2: "Here you go Master @{u}. Like to do the Dew huh?" },
{ name: "coffee", response1: "/me hands @{u} a large cup of liquid energy.", response2: "Here you go Master @{u}." },
{ name: "water", response1: "Do we serve water here??", response2: "HELL NO H2O!!" },
{ name: "Taquitos", response1: "Stop trying to break me @Lord of Nerds!", response2: "" },
{ name: "cake", response1: "Mmmm cake!", response2: "/me cuts a slice and hands it to @{u}." },
{ name: "pizza", response1: "Mmmm pizza!", response2: "/me cuts a slice and hands it to @{u}." },
{ name: "churro", response1: "OMG, cinnamon goodness.", response2: "/me eats @{u} 's churro because it's soooo good." },
{ name: "dance", response1: "https://media4.giphy.com/media/3vdFJocaKvygTLw8PK/giphy.gif", response2: "" },
{ name: "mosh", response1: "/me starts the mosh pit.", response2: "" },
{ name: "discord", response1: "Please join our Discord server at: https://discord.gg/JrTEkhnKCc", response2: "" }
];

//Configuration
require("./main.js");