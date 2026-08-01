// Mock process.stdin so that Next.js dev server doesn't monitor it or exit on EOF
const { Readable } = require('stream');

const mockStdin = new Readable({
  read() {}
});

Object.defineProperty(process, 'stdin', {
  value: mockStdin,
  writable: false,
  configurable: true
});

// Pass the rest of the arguments to Next
require('next/dist/bin/next');
