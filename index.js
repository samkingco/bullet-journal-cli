#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const open = require('open');
const program = require('commander');
const inquirer = require('inquirer');

program
  .version('0.0.1')
  .option('-i, --info [info]', 'show some info about the journal')
  .option('-l, --list [list]', 'list of todays journal items')
  .option('-o, --open [open]', 'open todays journal')
  .parse(process.argv);

const pad = num => num < 10 ? `0${num}` : `${num}`;
const date = new Date();
const dateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const dest = path.resolve(os.homedir(), 'media/journal');
const filename = `${dateString}.md`;
const journalFile = path.resolve(dest, filename);

const exists = filepath => {
  try {
    const stats = fs.statSync(filepath);
    return stats;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
  }
};

const showInfo = () => {
  console.log(`Journal folder: ${dest}`);
};

const listTodaysJournal = () => {
  if (!exists(journalFile)) {
    console.log('You have no journal for today.');
    process.exit();
  } else {
    fs.readFile(journalFile, 'utf8', (err, data) => {
      if (err) return console.log(err);
      console.log(`\n${data}`);
      process.exit();
    });
  }
};

const openTodaysJournal = () => {
  open(journalFile);
  process.exit();
};

const ensureJournalFile = (filename, title, cb) => {
  if (!exists(filename)) {
    fs.appendFile(filename, title, 'utf8', (err) => {
      if (err) return console.log(err);
      cb();
    });
  } else {
    cb();
  }
};

const addBulletToJournal = ({ bulletType, bulletText }, filename) => {
  const prefixes = {
    note: ' - ',
    todo: '[ ]',
    event: '( )'
  };

  const prefix = prefixes[bulletType] || prefixes.note;
  const bullet = `${prefix} ${bulletText}\n`;

  fs.appendFile(filename, bullet, 'utf8', (err) => {
    if (err) return console.log(err);
  });
};

const addToTodaysJournal = () => {
  const questions = [
    {
      type: 'input',
      name: 'bulletText',
      message: 'Text:'
    },
    {
      type: 'list',
      name: 'bulletType',
      message: 'Type:',
      choices: ['Note', 'TODO', 'Event'],
      filter: (val) => val.toLowerCase()
    }
  ];

  inquirer.prompt(questions).then((answers) => {
    ensureJournalFile(journalFile, `# ${dateString}\n\n`, () => {
      addBulletToJournal(answers, journalFile, (err) => {
        if (err) return console.log(err);
      });
    });
  });
};

if (program.info) {
  showInfo();
} else if (program.list) {
  listTodaysJournal();
} else if (program.open) {
  openTodaysJournal();
} else {
  addToTodaysJournal();
}
