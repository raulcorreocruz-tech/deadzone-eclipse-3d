const fs=require('fs');for(const file of ['index.html','server.js']){
 const text=fs.readFileSync(file,'utf8');
 console.log('\nFILE',file,text.length);
 const needles=file==='index.html'?[
  '<div id="hud"','id="hud"','id="pause"','id="fullscreen"','id="fullScreen"','id="points"','id="score"','id="coopModal"','id="mainMenu"','id="coopCreate"','id="dz536-live-menu"','COOPERATIVO ONLINE','PANTALLA ONLINE','SALAS EN VIVO','NOVEDADES','novedades','function showNews','function showChangelog','function dz43','function updateHud','function dz525','function dz537Install','function dz537RoomsUi','function dz523','function endGame','function finish','/api/leaderboard','fetch(',"function reset(){","function dz55Reset",'dz524-graphics-pause'
 ]:[
 '/api/leaderboard','const scorePath','let scores=[]','scores=scores.filter','dz523Save','function dz523Save','function dz523Load','function dz523HandleHTTP','/api/social','/api/friends','/api/profile','m.type===','if(m.type===','sendRoom','wss.on','function leave','socialToken','leaderboard.json','/ws'
 ];
 for(const needle of needles){const at=[];let start=-1;while((start=text.indexOf(needle,start+1))!==-1 && at.length<3)at.push(start);for(const i of at)console.log('NEEDLE '+JSON.stringify(needle)+' @'+i+'\n'+text.slice(Math.max(0,i-300),Math.min(text.length,i+1400)).replace(/\n/g,' ').slice(0,1650))}
}
