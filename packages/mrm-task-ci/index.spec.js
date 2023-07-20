jest.mock('fs');
jest.mock('git-username');
jest.mock('got', () => () => ({
	json: () =>
		Promise.resolve([
			{ version: 'v15.0.1', date: '2020-10-21', lts: false },
			{ version: 'v14.15.0', date: '2020-10-27', lts: 'Fermium' },
			{ version: 'v10.23.0', date: '2020-10-27', lts: 'Dubnium' },
		]),
}));
jest.mock('@xzhou/mrm-core/src/util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const { getTaskOptions } = require('@xzhou/mrm');
const vol = require('memfs').vol;
const task = require('./index');

const console$log = console.log;

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'unicorn',
	engines: {
		node: 4,
	},
	scripts: {
		test: 'jest',
	},
});
const gitConfig = `
[remote "origin"]
	url = git@github.com:sapegin/antbear.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
`;

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	console.log = console$log;
});

it('should add GitHub Action workflow', async () => {
	vol.fromJSON({
		'/.git/config': gitConfig,
		'/package.json': packageJson,
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/.git/config']).toBe(gitConfig);
	expect(vol.toJSON()['/package.json']).toBe(packageJson);
	expect(vol.toJSON()['/.github/workflows/node.js.yml']).toMatchSnapshot();
});

it('should add latest Node version if engines field is not defined', async () => {
	vol.fromJSON({
		'/.git/config': gitConfig,
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'jest',
			},
		}),
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/.github/workflows/node.js.yml']).toMatchSnapshot();
});

it('should add a badge to the Readme', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': '# Unicorn',
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/Readme.md']).toMatchSnapshot();
});

it('should remove Travis badge from the Readme', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': `# Unicorn

[![Build Status](https://travis-ci.org/gh/unicorn.svg)](https://travis-ci.org/gh/unicorn)`,
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/Readme.md']).toMatchSnapshot();
});

it('should remove basic Travis config', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/.travis.yml': `language: node_js
cache:
  directories:
    - node_modules
node_js:
  - 12`,
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/.travis.yml']).toBeUndefined();
});

it('should not remove complex Travis config', async () => {
	const travisYml = `language: node_js
script:
  - npm run something
node_js:
  - 12`;

	vol.fromJSON({
		'/package.json': packageJson,
		'/.travis.yml': travisYml,
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/.travis.yml']).toBe(travisYml);
});
