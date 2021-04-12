// 888b     d888                    .d8888b.  888                        
// 8888b   d8888                   d88P  Y88b 888         o              
// 88888b.d88888                   Y88b.      888        d8b             
// 888Y88888P888  .d88b.  88888b.   "Y888b.   888888    d888b    888d888 
// 888 Y888P 888 d88""88b 888 "88b     "Y88b. 888   "Y888888888P"888P"   
// 888  Y8P  888 888  888 888  888       "888 888     "Y88888P"  888     
// 888   "   888 Y88..88P 888  888 Y88b  d88P Y88b.   d88P"Y88b  888     
// 888       888  "Y88P"  888  888  "Y8888P"   "Y888 dP"     "Yb 888     
//
// MonStar - Copyright (C) 2013 B^Dub - Last update June 22nd 2013
//
// dubbytt@gmail.com
//
// A NodeJS Process Monitor designed specifically from the ground up 
// for Turntable.fm bots. If your bot crashes, this will declare it offline
// after 20 seconds and restart it after 40 seconds (both are programmable).
//
// Put this script in your bot directory, add the code on lines 36-45
// to your bot, add your bot's path to the process_list array below 
// and run with "node monstar.js". 
//
// Note: you could run a bunch of bots from one script, but it may start to
// get confusing with all of the logs in one terminal.  This process is so
// lightweight that you could just put one with each bot without worrying.
// Other ideas would be to color code the processes, which is pretty easy.
//
// This software is best viewed with Sublime Text http://www.sublimetext.com
//
// ASCII GEN http://patorjk.com/software/taag/#p=display&f=Colossal&t=MonSt*r
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Add the following code to each process so that it can respond to status 
// requests, loopback its process id and deliver its process name
/*-----------------------------------------------------------------------------
process.on('message', function(m) {
    if (m.status && m.msg === 'are_you_there') {
        process.send({
            status: true,
            msg: 'online',
            process: m.process,
            name: your_process_name // "string" or variable_name
        });
    }
});

*///---------------------------------------------------------------------------
// Create your list of processes here
//-----------------------------------------------------------------------------
var process_list    = [
                    './uglee.js',
                    './drunkenRegular.js',
                    './buttheadBot.js'/*,
                    './WayneBot.js',
                    './spindrelllascrib.js'*/
                    ];

//-----------------------------------------------------------------------------
var cp              = require('child_process');
var processes       = {};       // Global object processes
var UPDATE_INTERVAL = 5;        // Update status after this many seconds
var OFFLINE_MAX     = 40;       // Restart process after this many seconds
var OFFLINE_THRESH  = 20;       // Declare offline after this many seconds
var version         = "v1.0.0"  // Software version
//-----------------------------------------------------------------------------
function isOffline() {
    for(var x in processes) {
        if(processes[x].offline_cnt >= OFFLINE_MAX) {
            processes[x].offline_cnt = OFFLINE_MAX;
            processes[x].offline_status = true;
            console.log('>>> '+processes[x].name+' offline for '+OFFLINE_MAX+' seconds now, restarting!!!!!');
            restart(x); // restart a specific process if it crashed
        } else if(processes[x].offline_cnt < OFFLINE_THRESH) {
            if(processes[x].offline_status) processes[x].offline_status = false,
                console.log('>>> '+processes[x].name+' is online.');
            processes[x].offline_status = false;
            processes[x].offline_cnt += UPDATE_INTERVAL;
        } else {
            console.log('>>> '+processes[x].name+' offline for '+processes[x].offline_cnt+' seconds.');
            processes[x].offline_status = false;
            processes[x].offline_cnt += UPDATE_INTERVAL;
        }
    }
}
//-----------------------------------------------------------------------------
function requestStatus() {
    if (arguments.length == 1) {
        if (processes[arguments[0]].process.connected) // request one specifically
            processes[arguments[0]].process.send({
                status: true,
                msg: 'are_you_there',
                process: arguments[0]
            });
    } else {
        for (x in processes) { // else just request them all
            if (processes[x].process.connected)
                processes[x].process.send({
                    status: true,
                    msg: 'are_you_there',
                    process: x
                });
        }
    }
}
//-----------------------------------------------------------------------------
function restart() {
    if(arguments.length == 1) {
        initProcess(arguments[0]); // restart one specifically
    } else {
        for (var x = 0; x < process_list.length; x++) {
            initProcess(x); // else restart them all
        }
    }
}
//-----------------------------------------------------------------------------
function initProcess(x) {
    var saved = null;
    if( typeof processes[x] !== "undefined" ) {
        saved = {};
        saved.restarted = ++processes[x].restarted;
        saved.name = processes[x].name;
    }
    processes[x] = {};
    processes[x].process = cp.fork( process_list[x] ); // Da Bizness
    processes[x].offline_status = true;
    processes[x].offline_cnt = 0;
    if(saved != null) {
        processes[x].name = saved.name;
        processes[x].restarted = saved.restarted;
        console.log('>>> '+processes[x].name+' restarted '+processes[x].restarted+' time(s) now.');
    } else {
        processes[x].name = "PROCESS "+x; // assumed name, until app says otherwise
        processes[x].restarted = 0;
    }    
    processes[x].process.on('message', function(m) {
        if (m.status && m.msg === 'online') {
            processes[m.process].offline_cnt = 0;
            if(m.name) processes[m.process].name = m.name;
        }
    });
    requestStatus(x); // mostly to seed the process name, if available.
}
//-----------------------------------------------------------------------------
function start() {
    restart(); // fire up all of the child processes for the first time
    // start the master process that keeps tabs on your children
    setInterval(function() {
        requestStatus();    // request status from each process
        isOffline();        // check if any processes are offline
    }, UPDATE_INTERVAL * 1000);
}
//-----------------------------------------------------------------------------
start(); // get the party started ~(_8-{)
//-----------------------------------------------------------------------------
