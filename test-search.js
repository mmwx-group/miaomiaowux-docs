const Fuse = require('fuse.js');

const items = [
  { title: '链式代理', content: '这是一个中文的链式代理配置指南' },
  { title: 'Test', content: 'This is English' }
];

const fuse = new Fuse(items, {
  keys: ['title', 'content'],
  minMatchCharLength: 2,
  threshold: 0.3
});

console.log('Search for "链式":', fuse.search('链式').length, 'results');
console.log('Search for "代理":', fuse.search('代理').length, 'results');
console.log('Search for "链":', fuse.search('链').length, 'results (single char)');
console.log('Search for "test":', fuse.search('test').length, 'results');
