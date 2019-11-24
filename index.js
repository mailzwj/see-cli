#!/usr/bin/env node

const yargs = require('yargs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const shell = require('shelljs');

const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const print = log => console.log(log);
const warning = log => print(chalk.keyword('orange')(`Warning: ${log}`));
const success = log => print(chalk.green(`Done: ${log}`));
const error = log => print(chalk.red(`Error: ${log}`));

const gits = {
    js: 'base-library',
    ts: 'base-library-ts'
};

const keys = {
    name: 'Enter plugin name'
};

const protocols = ['https:', 'git:'];

const rDir = /^[a-z0-9_-]/i;

const loader = ora('正在克隆...\n');
let timer;

const upgradePkg = project => {
    const pkgJson = `${project}/package.json`;
    const pkgCfg = require(pkgJson);
    const newJson = {
        ...pkgCfg,
        name: project.toLowerCase(),
        author: '',
        repository: '',
        description: ''
    };
    fs.writeFileSync(pkgJson, JSON.toString(newJson, null, 2), 'utf8');
};

const createPlugin = (project, base) => {
    const idx = Math.floor(protocols.length * Math.random());
    const gitAddr = `${protocols[idx]}//github.com/mailzwj/${base}.git`;
    // const gitAddr = `git@github.com:mailzwj/${base}.git`;
    const dir = path.join('./', project);
    if (!rDir.test(project)) {
        error('插件名称只能包含字母、数字、连字符(-)和下划线(_)');
        shell.exit(1);
    }
    if (fs.existsSync(dir)) {
        warning(`目录【${dir}】已存在`);
        shell.exit(1);
    }
    print(`Remote: ${gitAddr}`);
    shell.exec(`git clone ${gitAddr} ${project}`, (code, stdout, stderr) => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if (code) {
            shell.rm('-rf', dir);
            error(stderr);
            loader.fail('Fail.');
            shell.exit(1);
        }
        shell.rm('-rf', `${project}/.git`);
        upgradePkg(project);
        loader.succeed('Done.');
        success('Success!');
    });
    timer = setTimeout(() => {
        loader.start();
    }, 500);
};

if (!shell.which('git')) {
    error('Error: 部分命令依赖git');
    print('Mac系统可通过【brew install git】安装');
    shell.exit(1);
}

yargs.version(`前端脚手架工具【see】：v${pkg.version}`);

yargs.command({
    command: 'init [project]',
    aliases: 'i',
    desc: '初始化应用',
    handler: argv => {
        const { t, project = '' } = argv;
        if (project) {
            createPlugin(project, gits[t]);
        } else {
            inquirer.prompt({
                type: 'input',
                name: keys['name']
            }).then(aws => {
                createPlugin(aws[keys['name']], gits[t]);
            });
        }
    }
})
.option('type', {
    alias: 't',
    default: 'js',
    choices: ['js', 'ts'],
    describe: '设置初始化类型'
})
.help();

// yargs.showHelp();

yargs.showHelpOnFail(false, '使用 --help 查看可用选项');
yargs.parse();
