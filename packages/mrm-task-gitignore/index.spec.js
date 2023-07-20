jest.mock('fs');
jest.mock('@xzhou/mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('@xzhou/mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add .gitignore', async () => {
	vol.fromJSON();

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add package-lock.json and pnpm-lock.yaml, if yarn.lock exists', async () => {
	vol.fromJSON({
		'/yarn.lock': '',
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add yarn.lock and pnpm-lock.yaml, if package-lock.json exists', async () => {
	vol.fromJSON({
		'/package-lock.json': '',
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add package-lock.json and yarn.lock, if pnpm-lock.yaml exists', async () => {
	vol.fromJSON({
		'/pnpm-lock.yaml': '',
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});
