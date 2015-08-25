'use strict';
var diff = require('diff');

module.exports = {
	cleanList: function(list) {
		var diffList = {'created': [], 'deleted': []};
		var myDiff = new diff.Diff();
		myDiff.tokenize = function(value) {
		  return value.split(/(\n|\r\n)/);
		};
		let differences = myDiff.diff('', list);
		for (let i in differences) {
			let lines = differences[i].value.split('\n')
			for (let line of lines) {
				if (!(line.replace(/\s/g, '').charAt(0) === '[' && line.slice(-1) === ']') && line.length > 0 && line.charAt(0) !== '!' && line.indexOf(' ') === -1) {
					if (differences[i].added === true) {
						diffList.created.push(line.replace('\n', ''));
					} else if (differences[i].removed === true) {
						diffList.deleted.push(line.replace('\n', ''));
					}
				}
			}
		}
		return diffList.created
	},
	getList: function() {
		return [{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'}];
	},
	getLists: function() {
		return [
			{'name': 'EasyList', 'url': 'https://easylist-downloads.adblockplus.org/easylist.txt'},
			{'name': 'EasyPrivacy', 'url': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt'},
			{'name': 'AdblockWarningRemoval', 'url': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt'},
			{'name': 'EasyList_France', 'url': 'https://easylist-downloads.adblockplus.org/liste_fr.txt'},
			{'name': 'EasyList_Germany', 'url': 'https://easylist-downloads.adblockplus.org/easylistgermany.txt'},
			{'name': 'EasyList_Italy', 'url': 'https://easylist-downloads.adblockplus.org/easylistitaly.txt'},
			{'name': 'EasyList_Dutch', 'url': 'https://easylist-downloads.adblockplus.org/easylistdutch.txt'},
			{'name': 'EasyList_China', 'url': 'https://easylist-downloads.adblockplus.org/easylistchina.txt'},
			{'name': 'EasyList_Bulgaria', 'url': 'http://stanev.org/abp/adblock_bg.txt'},
			{'name': 'EasyList_Indonesia', 'url': 'https://indonesianadblockrules.googlecode.com/hg/subscriptions/abpindo.txt'},
			{'name': 'EasyList_Arabic', 'url': 'https://liste-ar-adblock.googlecode.com/hg/Liste_AR.txt'},
			{'name': 'EasyList_Czechoslovakia', 'url': 'https://adblock-czechoslovaklist.googlecode.com/svn/filters.txt'},
			{'name': 'EasyList_Hebrew', 'url': 'https://raw.githubusercontent.com/AdBlockPlusIsrael/EasyListHebrew/master/EasyListHebrew.txt'},
			{'name': 'EasyList_SocialMedia', 'url': 'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt'},
			{'name': 'EasyList_Latvia', 'url': 'https://notabug.org/latvian-list/adblock-latvian/raw/master/lists/latvian-list.txt'},
			{'name': 'EasyList_Romania', 'url': 'http://www.zoso.ro/rolist'},
			{'name': 'EasyList_Russia', 'url': 'http://easylist-downloads.adblockplus.org/advblock.txt'},
			{'name': 'EasyList_Iceland', 'url': 'http://adblock.gardar.net/is.abp.txt'},
			{'name': 'EasyList_Greece', 'url': 'http://adblock.gardar.net/is.abp.txt'},
			{'name': 'EasyList_Poland', 'url': 'https://raw.githubusercontent.com/adblockpolska/Adblock_PL_List/master/adblock_polska.txt'},
			{'name': 'List_Japan', 'url': 'https://raw.githubusercontent.com/k2jp/abp-japanese-filters/master/abpjf.txt'},
			{'name': 'List_Estonia', 'url': 'http://gurud.ee/ab.txt'},
			{'name': 'List_Hungary', 'url': 'https://raw.githubusercontent.com/szpeter80/hufilter/master/hufilter.txt'},
			{'name': 'List_Danish', 'url': 'http://adblock.schack.dk/block.txt'},
			{'name': 'List_England', 'url': 'http://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&startdate%5Bday%5D=&startdate%5Bmonth%5D=&startdate%5Byear%5D=&mimetype=plaintext'}
		];
	}
};