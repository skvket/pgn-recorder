const http = require('request-promise');
const fs = require('fs-extra');
const dateformat = require('dateformat');
const md5 = require('md5');

const url = process.argv[2];
const dir = process.argv[3] || 'dest';
const interval = process.argv[4] || 1;

if (!url || !dir) {
  console.warn('Usage: node index.js <url> <output-dir> <freq in seconds>');
  process.exit(1);
}

fs.ensureDir(dir);

console.log(`Recording ${url} to ${dir} every ${interval} seconds`);

function utcDate() {
  return dateformat(Date.now(), 'yyyy-mm-dd_HH:MM:ss', true);
}

function store() {
  http.get(url).then(pgn => {
    const file = `${dir}/${utcDate()}.pgn`;
    const games = (pgn.match(/\[Event /g) || []).length;
    console.log(`+ ${file} games:${games} md5:${md5(pgn)} size:${pgn.length}`);
    return fs.writeFile(file, pgn);
  }).then(scheduleStore)
    .catch(err => {
      console.log('Error! ' + err);
      scheduleStore();
    });
}

function scheduleStore() {
  setTimeout(store, interval * 1000);
}

store();
