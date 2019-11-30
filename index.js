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

const sources = ['gitee', 'github'];

const keys = {
    name: 'Enter plugin name'
};

const rDir = /^[a-z0-9_-]/i;

const loader = ora('正在克隆...\n');
let timer;

const upgradePkg = project => {
    const pkgJson = `${project}/package.json`;
    let pkgCfg = fs.readFileSync(pkgJson).toString('utf8');
    pkgCfg = JSON.parse(pkgCfg);
    const newJson = {
        ...pkgCfg,
        name: project.toLowerCase(),
        author: '',
        repository: '',
        description: ''
    };
    const content = JSON.stringify(newJson, null, 2);
    // console.log(pkgJson, '\n', content);
    fs.writeFileSync(pkgJson, content, 'utf8');
};

const createPlugin = (project, argv) => {
    const { t, s } = argv;
    const base = gits[t];
    const gitAddr = `https://${s}.com/mailzwj/${base}.git`;
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
    error('部分命令依赖git');
    print('Mac系统可通过【brew install git】安装');
    shell.exit(1);
}

yargs.version(`前端脚手架工具【see】：v${pkg.version}`);

yargs.command({
    command: 'init [project]',
    aliases: 'i',
    desc: '初始化应用',
    handler: argv => {
        const { project = '' } = argv;
        if (project) {
            createPlugin(project, argv);
        } else {
            inquirer.prompt({
                type: 'input',
                name: keys['name']
            }).then(aws => {
                createPlugin(aws[keys['name']], argv);
            });
        }
    }
})
.command({
    command: 'serve [path]',
    aliases: 's',
    desc: '启动本地静态服务器',
    handler: argv => {
        const { path = './', port } = argv;
        if (!shell.which('serve')) {
            error('运行该命令需先安装serve依赖');
            print('可通过【npm install -g serve】安装');
            shell.exit(1);
        }
        if (!fs.existsSync(path)) {
            error(`目录${path}不存在`);
            shell.exit(1);
        }
        shell.exec(`serve ${path} -l ${port}`, (code, stdout, stderr) => {
            if (code !== 0) {
                error(stderr);
                shell.exit(code);
            }
            success('Started');
        });
    }
})
.option('port', {
    alias: 'p',
    default: 9000,
    describe: '端口'
})
.option('type', {
    alias: 't',
    default: 'js',
    choices: ['js', 'ts'],
    describe: '设置初始化类型'
})
.option('source', {
    alias: 's',
    default: 'gitee',
    choices: ['gitee', 'github'],
    describe: '资源托管服务'
})
.help();

// yargs.showHelp();

yargs.showHelpOnFail(false, '使用 --help 查看可用选项');
yargs.parse();
