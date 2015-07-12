'use strict';
var diff = require('diff');

module.exports = {
	diffLists: function(oldList, newList) {
		var diffList = {'added': [], 'removed': []};
		if (oldList !== '') {
			var differences = diff.diffLines(oldList, newList);
			for (var i = 0; i < differences.length; i++) {
				if (differences[i].value[0] !== '!') {
					if (differences[i].added === true) {
						diffList.added.push(differences[i].value.replace('\n', ''));
					} else if (differences[i].removed === true) {
						diffList.removed.push(differences[i].value.replace('\n', ''));
					}
				}
				if (i === differences.length - 1) {
					return diffList;
				}
			}
		} else {
			return {'added': newList.split('\n'), 'removed': []};
		}
	},
	getList: function() {
		return [{'name': 'EasyList_Bulgaria', 'url': 'http://stanev.org/abp/adblock_bg.txt'}];
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