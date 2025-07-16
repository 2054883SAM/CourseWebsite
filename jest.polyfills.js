/* eslint-disable */
require('whatwg-fetch');
const { TextEncoder, TextDecoder } = require('node:util');
const { Blob } = require('node:buffer');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob; 