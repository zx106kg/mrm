jest.mock('fs');
jest.mock('git-username');
jest.mock('@xzhou/mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('@xzhou/mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add a workflow file', async () => {
	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});
