# Adios Engine

A small library to transform standard AdBlock Plus rules like [EasyList](https://easylist-downloads.adblockplus.org/easylist.txt) into [rules working in Safari](https://www.webkit.org/blog/3476/content-blockers-first-look/).

## Demo
You can visit [this website](http://armand.gr/Adios-Engine-Demo/) to try the engine.

## Working example
If you want to see how to use Adios Engine, check [this project](https://github.com/ArmandGrillet/Adios-Engine-Example).

## Installation

```
npm install adios-engine --save
```

## Usage

```javascript
var parser = require('adios-engine');
var rule = 'savevideo.me,sddt.com,~search.yahoo.com,yahoo.com,youthedesigner.com,yuku.com##.ads';
var rules = ['@@|http://example.com', 'http://example.com/banner/foo/bar/img?param'];
var wrongRule = '|http://*.com^*|*$script,third-party,domain=lœç.com';

for (var rule of parser.parseRule(rule)) {
	console.log(rule); // The original rule created two parsed rules, parseRule() always returns an array even if the output is only one parsed rule.
}

for (var rule of parser.parseRules(rules)) {
	console.log(rule); // Will print all the parsed rules from the original rules array, can be used to parse an entire list like EasyList.
}

for (var rule of parser.parseRule(wrongRule)) {
	console.log(rule); // Nothing will be printed because the array returned is empty, the original rule contains characters that are not ASCII compliant.
}
```

## Documentation

Only two functions: 

``parseRule(rule)``: takes a String as an argument and returns an array containing the parsed rules. If the rule given cannot be parsed the method returns an empty array.

``parseRules(rules)``: takes a String array as an argument and returns the same thing as ``parseRule()``.

## Tests

```
npm test
```
