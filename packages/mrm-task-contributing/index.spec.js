jest.mock('fs');
jest.mock('git-username');
jest.mock('@xzhou/mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const fs = jest.requireActual('fs');
const path = require('path');
const { omitBy } = require('lodash');
const { getTaskOptions } = require('@xzhou/mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

afterEach(() => vol.reset());

it('should add a Contributing.md file', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Contributing.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Contributing.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
		}),
	});

	task(
		await getTaskOptions(task, false, {
			github: 'gendalf',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});
