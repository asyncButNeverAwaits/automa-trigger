export interface TriggerOptions {
  triggerUrl: string;
  extensionId: string;
  workflowId: string;
  websiteName: string;
  browser: 'chrome' | 'edge';
  filePath?: string; // Optional custom file path
}