# Automa Trigger Library

A lightweight, standalone Node.js library for triggering local Automa workflows directly from backend applications.

This package handles temporary data file generation, constructs the correct Automa trigger URL, and invokes the workflow using an included helper script.

---

## Features

* Trigger Automa workflows with a single function call.
* Pass structured data to the workflow via a temporary or custom JSON file.
* Automatically manages file path creation if none is provided.
* Returns the data file path used, making tracking and logging easy.
* Bundled with a `openMinimized.ahk` script to launch the browser in a minimized state.

---

## Installation

This package is intended for use in a `pnpm` workspace. Ensure your `pnpm-workspace.yaml` is configured, then install it with:

```bash
pnpm add automa-trigger@workspace:* -w
```

---

## Usage

Import the `triggerWorkflow` function and call it with the necessary options and your payload:

```ts
import { triggerWorkflow } from 'automa-trigger';
import path from 'path';

async function runWorkflow() {
  const options = {
    triggerUrl: 'automa://<your-workflow-id>',
    extensionId: 'your-automa-extension-id',
    workflowId: 'your-workflow-id',
    websiteName: 'My Awesome App',
    browser: 'chrome' as const, // or 'edge'
    filePath: path.join(__dirname, '..', 'data', 'workflow-input.json'), // optional
  };

  const payload = {
    userId: 123,
    task: 'process-data',
    details: {
      source: 'api-request',
    },
  };

  try {
    const fileUsed = await triggerWorkflow(options, payload);
    console.log(`Workflow triggered. Data file saved at: ${fileUsed}`);
  } catch (err) {
    console.error('Failed to trigger workflow:', err);
  }
}

runWorkflow();
```

---

## API

### `triggerWorkflow(options, data)`

Triggers an Automa workflow and returns a `Promise<string>` containing the full path to the JSON data file used.

#### Parameters

* **`options: TriggerOptions`** – Required configuration for the workflow trigger.
* **`data: object`** – A JSON-serializable object to be passed to the workflow.

---

### `TriggerOptions` Interface

| Property      | Type                 | Required | Description                                                                         |
| ------------- | -------------------- | -------- | ----------------------------------------------------------------------------------- |
| `triggerUrl`  | `string`             | Yes      | The URL to trigger the Automa workflow (e.g., `automa://...`).                      |
| `extensionId` | `string`             | Yes      | Automa browser extension ID.                                                        |
| `workflowId`  | `string`             | Yes      | The ID of the workflow to run.                                                      |
| `websiteName` | `string`             | Yes      | Name of the app or service initiating the trigger.                                  |
| `browser`     | `'chrome' \| 'edge'` | Yes      | Browser in which to open the workflow.                                              |
| `filePath`    | `string`             | No       | Optional absolute file path for the data file. Defaults to a temporary system path. |

---

## How It Works

1. **File Path Resolution**: Uses a custom `filePath` if provided; otherwise, generates one in the OS's temp directory.
2. **Data File Creation**: Serializes the input `data` to JSON and writes it to the chosen path, creating necessary directories.
3. **URL Construction**: Compresses and embeds the file path and parameters into the trigger URL.
4. **Workflow Invocation**: Uses the internal `openMinimized.ahk` script to launch the browser minimized and open the URL.
5. **Path Return**: Resolves with the path to the created JSON file.

---

## Development

To build from source:

```bash
cd automa-trigger
pnpm install
pnpm build
```

This will compile TypeScript to the `dist` directory and copy over the `.ahk` script.

---

## Requirements

* [AutoHotkey](https://www.autohotkey.com/) installed (Windows only)
