import {parentPort} from 'node:worker_threads';
import {runRegex} from './dist/core.js';
parentPort.on('message',data=>parentPort.postMessage(runRegex(data)));
