import { triggerWorkflow } from '../src/index';
// Imports are for type-checking and Jest setup. The actual functions are mocked.
import { exec } from 'child_process';
import fs from 'fs/promises';
import { promisify } from 'util';
import * as utils from '../src/utils';
import os from 'os';
import crypto from 'crypto';
import path from 'path';

// --- JEST MOCKS ---
jest.mock('child_process');
jest.mock('fs/promises');
jest.mock('util');
jest.mock('../src/utils');
jest.mock('os', () => ({ tmpdir: jest.fn() }));
jest.mock('crypto', () => ({ randomUUID: jest.fn() }));
// --- END MOCKS ---

// --- TEST SETUP ---
const mockedPromisify = promisify as unknown as jest.Mock;
const mockedCompress = utils.compressAndEncode as jest.Mock;
const mockedTmpdir = os.tmpdir as jest.Mock;
const mockedRandomUUID = crypto.randomUUID as jest.Mock;
const mockedWriteFile = fs.writeFile as jest.Mock;

let execAsyncMock: jest.Mock;
// --- END SETUP ---

describe('triggerWorkflow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    execAsyncMock = jest.fn().mockResolvedValue({ stdout: 'ok' });

    mockedPromisify.mockImplementation((fn) => {
      if (fn === exec) {
        return execAsyncMock;
      }
      return jest.fn();
    });

    mockedCompress.mockReturnValue('COMPRESSED_PATH');
    mockedTmpdir.mockReturnValue('/mock/tmp');
    mockedRandomUUID.mockReturnValue('mock-uuid-1234');
  });

  describe('when no filePath is provided', () => {
    it('should create a file in a temporary directory and return its path', async () => {
      // Arrange
      const options = {
        triggerUrl: 'automa://start',
        extensionId: 'test-ext-id',
        workflowId: 'test-wf-id',
        websiteName: 'TestSite',
        browser: 'chrome' as const,
      };
      const data = { message: 'hello' };
      const expectedPath = path.join('/mock/tmp', 'automa-trigger', 'mock-uuid-1234.json');

      // Act
      const returnedPath = await triggerWorkflow(options, data);

      // Assert
      expect(mockedWriteFile).toHaveBeenCalledWith(expectedPath, JSON.stringify(data));
      expect(returnedPath).toBe(expectedPath);
    });
  });

  describe('when a custom filePath is provided', () => {
    it('should use the custom file path and return it', async () => {
      // Arrange
      const customPath = '/custom/path/my-data.json';
      const options = {
        triggerUrl: 'automa://start',
        extensionId: 'test-ext-id',
        workflowId: 'test-wf-id',
        websiteName: 'TestSite',
        browser: 'chrome' as const,
        filePath: customPath,
      };
      const data = { message: 'hello' };

      // Act
      const returnedPath = await triggerWorkflow(options, data);

      // Assert
      expect(mockedWriteFile).toHaveBeenCalledWith(customPath, JSON.stringify(data));
      expect(returnedPath).toBe(customPath);
      // Ensure it does NOT try to generate a temporary path
      expect(mockedRandomUUID).not.toHaveBeenCalled();
    });
  });
});