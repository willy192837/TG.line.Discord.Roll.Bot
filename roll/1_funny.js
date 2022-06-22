"use strict";
const rollbase = require('./rollbase.js');
var variables = {};
const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axiosRetry = require('axios-retry');
const chineseConv = require('chinese-conv'); //繁簡轉換
const axios = require('axios');
const wiki = require('wikijs').default;
const gameName = function () {
	return '【趣味擲骰】 排序(至少3個選項) choice/隨機(至少2個選項) 運勢 每日塔羅 每日笑話 每日動漫 每日一言 每日廢話 每日黃曆 每日毒湯 每日情話 每日靈簽 每日急口令 每日大事 每日(星座) 每日解答	立flag .me'
}
axiosRetry(axios, { retries: 3 });

const gameType = function () {
	return 'funny:funny:hktrpg'
}
const prefixs = function () {
	return [{
		first: /^排序|排序$|^隨機|隨機$|^choice|^每日塔羅|^時間塔羅|^大十字塔羅|立flag|運勢|鴨霸獸|^每日笑話$|^每日動漫$|^每日一言$|^每日廢話$|^每日黃曆$|^每日毒湯$|^每日情話$|^每日靈簽$|^每日急口令$|^每日大事$|^每日解答$|^每日白羊$|^每日牡羊$|^每日金牛$|^每日雙子$|^每日巨蟹$|^每日獅子$|^每日處女$|^每日天秤$|^每日天平$|^每日天蠍$|^每日天蝎$|^每日射手$|^每日人馬$|^每日摩羯$|^每日山羊$|^每日水瓶$|^每日寶瓶$|^每日雙魚$/i,
		second: null
	}]
}
const getHelpMessage = async function () {
	return `【趣味擲骰】

【隨機選擇】： 啓動語 choice 隨機
(問題)(啓動語)(問題)  (選項1) (選項2) 
例子 收到聖誕禮物隨機數 1 2 >3  

【隨機排序】：啓動語 排序
(問題)(啓動語)(問題) (選項1) (選項2)(選項3)
例子 交換禮物排序 A君 C君 F君 G君

【複述功能】：啓動語 .re (模擬系統說話)
(啓動語) (句子)(句子)(句子)
例子 .re C君殺死了NPC 村民, 受到尼什村通緝!

【占卜運氣功能】：字句開頭或結尾包括「運勢」兩字及四十字以內

【塔羅牌占卜】：「大十字塔羅 每日塔羅 時間塔羅」 等關键字可啓動

【隨機死亡FLAG】： 字句開頭或結尾包括「立FLAG」可啓動

【每日功能】
每日笑話	顯示一條笑話
每日動漫	顯示一條動漫金句
每日廢話 	(名字)	生產一條你的廢話  
每日一言	顯示一條金句
每日黃曆	顯示今日黃曆
每日毒湯	顯示一條有毒的雞湯
每日情話	顯示一條情話
每日靈簽	抽取一條觀音簽
每日急口令	顯示一條急口令
每日大事	顯示今天歷史上的大事
每日解答    顯示問題的答案
每日(星座) 顯示每日星座運程 如 每日白羊 每日金牛 每日巨蟹
`
}
const initialize = function () {
	return variables;
}

const rollDiceCommand = async function ({
	inputStr,
	mainMsg,
	displayname, displaynameDiscord, tgDisplayname
}) {
	let rply = {
		default: 'on',
		type: 'text',
		text: ''
	}
	//let result = {};
	//		if (trigger.match(/排序/) != null && mainMsg.length >= 3) return exports.funny.SortIt(inputStr, mainMsg);
	//choice 指令開始於此
	//	if (trigger.match(/choice|隨機|選項|選1/) != null && mainMsg.length >= 3) return exports.funny.choice(inputStr, mainMsg);
	//tarot 指令
	/*
	if (trigger.match(/tarot|塔羅牌|塔羅/) != null) {
		if (trigger.match(/^單張|^每日|^daily/) != null) return exports.funny.NomalDrawTarot(mainMsg[1], mainMsg[2]); //預設抽 79 張
		if (trigger.match(/^時間|^time/) != null) return exports.funny.MultiDrawTarot(mainMsg[1], mainMsg[2], 1);
		if (trigger.match(/^大十字|^cross/) != null) return exports.funny.MultiDrawTarot(mainMsg[1], mainMsg[2], 2);
	}
	*/

	//FLAG指令開始於此
	//		if (trigger.match(/立flag|死亡flag/) != null) return exports.funny.BStyleFlagSCRIPTS();

	//鴨霸獸指令開始於此
	//		if (trigger.match(/鴨霸獸/) != null) return exports.funny.randomReply();
	//		if (trigger.match(/運勢/) != null) return exports.funny.randomLuck(mainMsg); //占卜運氣		
	/*猜拳指令
	if (trigger.match(/猜拳/) != null) {
	return RockPaperScissors(inputStr, mainMsg[1]);
	}
*/

	switch (true) {
		case /^help$/i.test(mainMsg[1]):
			rply.text = await this.getHelpMessage();
			return rply;
		case /^排序|排序$/i.test(mainMsg[0]) && (mainMsg.length >= 4):
			rply.text = SortIt(inputStr, mainMsg);
			return rply;
		case /^隨機|^choice|隨機$|choice$/i.test(mainMsg[0]) && (mainMsg.length >= 3):
			rply.text = choice(inputStr, mainMsg);
			return rply;
		case /^每日解答$/i.test(mainMsg[0]):
			rply.text = dailyAnswerChoice(inputStr);
			return rply;
		case /塔羅/i.test(mainMsg[0]):
			if (mainMsg[0].match(/^每日塔羅/) != null)
				rply.text = NomalDrawTarot(mainMsg[1], mainMsg[2]); //預設抽 79 張
			if (mainMsg[0].match(/^時間塔羅/) != null)
				rply.text = MultiDrawTarot(mainMsg[1], mainMsg[2], 1);
			if (mainMsg[0].match(/^大十字塔羅/) != null)
				rply.text = MultiDrawTarot(mainMsg[1], mainMsg[2], 2);
			return rply;
		case (/立flag$|^立flag/i.test(mainMsg[0]) && mainMsg[0].toString().match(/[\s\S]{1,25}/g).length <= 1):
			rply.text = BStyleFlagSCRIPTS();
			return rply;
		case /^鴨霸獸$/i.test(mainMsg[0]):
			rply.text = randomReply();
			return rply;
		case (/運勢$|^運勢/i.test(mainMsg[0]) && mainMsg[0].toString().match(/[\s\S]{1,40}/g).length <= 1):
			rply.text = randomLuck(mainMsg);
			return rply;
		case /^每日笑話$/.test(mainMsg[0]): {
			try {
				const data = fs.readFileSync('./assets/joke.txt', 'utf8').toString();
				const word = data.split('\n');
				rply.text = word[rollbase.Dice(word.length) - 1];
			} catch (e) {
				console.log('Error:', e.stack);
			}
			return rply;
		}
		case /^每日動漫$/.test(mainMsg[0]): {
			try {
				const data = fs.readFileSync('./assets/acg.txt', 'utf8').toString();
				const word = data.split('\n');
				rply.text = word[rollbase.Dice(word.length) - 1];
			} catch (e) {
				console.log('Error:', e.stack);
			}
			return rply;
		}
		case /^每日一言$/.test(mainMsg[0]): {
			try {
				const data = fs.readFileSync('./assets/slogan.txt', 'utf8').toString();
				const word = data.split('\n');
				rply.text = word[rollbase.Dice(word.length) - 1];
			} catch (e) {
				console.log('Error:', e.stack);
			}
			return rply;
		}
		case /^每日黃曆$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/huang/api.php?type=json')
			return rply;
		}
		case /^每日毒湯$/.test(mainMsg[0]): {
			try {
				const data = fs.readFileSync('./assets/blackjoke.txt', 'utf8').toString();
				const word = data.split('\n');
				rply.text = word[rollbase.Dice(word.length) - 1];
			} catch (e) {
				console.log('Error:', e.stack);
			}
			return rply;
		}
		case /^每日情話$/.test(mainMsg[0]): {
			try {
				const data = fs.readFileSync('./assets/mlove.txt', 'utf8').toString();
				const word = data.split('\n');
				rply.text = word[rollbase.Dice(word.length) - 1];
			} catch (e) {
				console.log('Error:', e.stack);
			}
			return rply;
		}
		case /^每日靈簽$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/chouq/api.php?type=json')
			return rply;
		}
		case /^每日廢話$/.test(mainMsg[0]): {
			let name = mainMsg[1] || displaynameDiscord || tgDisplayname || displayname || '你';
			rply.text = await axiosDaily(`https://ovooa.com/API/dog/api.php?msg=${name}&num=500&type=json`)
			return rply;
		}
		case /^每日急口令$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/rao/api.php?type=json')
			return rply;
		}
		case /^每日大事$/.test(mainMsg[0]): {
			const date = new Date();
			const day = date.getDate();
			const month = date.getMonth() + 1;
			let respond = `${month}月${day}日\n\n`;
			rply.text = await wiki({
				apiUrl: 'https://zh.wikipedia.org/w/api.php'
			}).page(`${month}月${day}日`)
				.then(async page => {
					let temp = await page.content();
					let answerFestival = temp.find(v => {
						return v && v.title.match(/(节日)|(節日)|(习俗)|(假日)|(节假)/)
					})
					respond += `${(answerFestival && answerFestival.title) ? `${answerFestival.title}\n` : ''}${(answerFestival && answerFestival.content) ? `${answerFestival.content}\n` : ''}\n`
					let answerBig = temp.find(v => {
						return v && v.title.match(/(大事记)|(大事記)/)
					})
					if (answerBig && answerBig.items) answerBig = answerBig.items;

					for (let index = 0; index < answerBig.length; index++) {

						respond += `${answerBig[index].title}\n${answerBig[index].content}\n\n`
					}
					return chineseConv.tify(respond)
				})
				.catch(error => {
					if (error == 'Error: No article found')
						return '沒有此條目'
					else {
						console.error('每日大事error', error)
						console.error('每日大事 this.page', this.page)

						return '條目出錯';
					}
				})
			return rply;
		}
		//白羊座、金牛座、雙子座、巨蟹座、獅子座、處女座、天秤座、天蠍座、射手座、摩羯座、水瓶座、雙魚
		case (/^每日白羊$/.test(mainMsg[0]) || /^每日牡羊$/.test(mainMsg[0])): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=白羊&type=json')
			return rply;
		}

		case /^每日金牛$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=金牛&type=json')
			return rply;
		}

		case /^每日雙子$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=双子&type=json')
			return rply;
		}

		case /^每日巨蟹$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=巨蟹&type=json')
			return rply;
		}

		case /^每日獅子$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=狮子&type=json')
			return rply;
		}

		case /^每日處女$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=处女&type=json')
			return rply;
		}

		case (/^每日天秤$/.test(mainMsg[0]) || /^每日天平$/.test(mainMsg[0])): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=天秤&type=json')
			return rply;
		}

		case /^每日天蠍$/.test(mainMsg[0]) || /^每日天蝎$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=天蝎&type=json')
			return rply;
		}

		case (/^每日射手$/.test(mainMsg[0]) || /^每日人馬$/.test(mainMsg[0])): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=射手&type=json')
			return rply;
		}

		case (/^每日摩羯$/.test(mainMsg[0]) || /^每日山羊$/.test(mainMsg[0])): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=摩羯&type=json')
			return rply;
		}

		case (/^每日水瓶$/.test(mainMsg[0]) || /^每日寶瓶$/.test(mainMsg[0])): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=水瓶&type=json')
			return rply;
		}
		case /^每日雙魚$/.test(mainMsg[0]): {
			rply.text = await axiosDaily('https://ovooa.com/API/xz/api.php?msg=双鱼&type=json')
			return rply;
		}
		default:
			break;
	}
}

/**
 * .ME
 */
function me(inputStr) {
	return inputStr.replace(/^[.]re/i, '');
}

/**
 * 占卜&其他
 */

function BStyleFlagSCRIPTS() {
	const rplyArr = ['\
「打完這仗我就回老家結婚（この戦いが終わったら、故郷に帰って結婚するんだ）」', '\
「打完這一仗後我請你喝酒」', '\
別怕！子彈還很多！', '\
「現在的我，已經戰無不勝了！（今の俺は、負ける気がしねぇ！）', '\
這裡是安全屋吧。', '\
「你、你要錢嗎！要什麼我都能給你！\n我可以給你更多的錢！」', '\
「做完這次任務，我就要結婚了。」', '\
「幹完這一票我就金盆洗手了。」', '\
「好想再試一次啊……」', '\
「已經沒什麼好害怕的了（もう何も恐くない）」', '\
「我一定會回來的（必ず帰る！）」', '\
「差不多該走了」', '\
「我只是希望你永遠不要忘記我。」', '\
「我只是希望能永遠和你在一起。」', '\
「啊啊…為什麼會在這種時候、想起了那些無聊的事呢？」', '\
「能遇見你真是太好了。」', '\
「我終於…為你們報仇了！」', '\
「他們佔盡優勢。」', '\
「等到一切結束後，我有些話想跟妳說！」', '\
「這段時間我過的很開心啊。」', '\
「待一切結束後記得還給我。」', '\
「真希望這份幸福可以永遠持續下去。」', '\
「這工作結束後我們兩人一起生活吧！」（この仕事が終わったら2人で暮らそう）', '\
「我們三個人要永永遠遠在一起！」', '\
「這是我女兒的照片，很可愛吧？」', '\
「請告訴他/她，我永遠愛他/她」', '\
「聽好，在我回來之前絕不要亂走動哦（いいか、俺が帰ってくるまでここを動くんじゃないぞ）」', '\
「要像一個乖孩子一樣等著我回來」', '\
「我去去就來（先に行って、すぐ戻るから）」', '\
「快逃！(逃げろう！/早く逃げろう！)」', '\
「對方只有一個人，大家一起上啊」', '\
「我就不信，這麼多人還殺不了他一個！」', '\
「幹，幹掉了嗎？（やったのか？）」', '\
「身體好輕」', '\
「可惡！你給我看著！（逃跑）」', '\
「躲在這裡就應該不會被發現了吧。」', '\
「我不會讓任何人死的。」', '\
「可惡！原來是這麼回事！」', '\
「嘛 反正以後還有很多機會問的。」', '\
「你的生命已經如風中殘燭。」', '\
「沒有手牌場上也沒卡，你還想要贏嗎？」', '\
「跑這麼遠應該就行了。」', '\
「我已經甚麼都不怕了（もう何も恐くない）」', '\
「這東西是什麼，怎麼之前沒見過（なんだこのXXX、見たことないな）」', '\
「什麽聲音……？就去看一下吧（:「何の音だ？ちょっと見てくる」', '\
「是我的錯覺嗎？可能是我看錯了」', '\
「成功了嗎！？」', '\
「二十年後又是一條好漢！」', '\
「大人武運昌隆」', '\
「這次工作的報酬是以前無法比較的（「今度の仕事でまとまったカネが入るんだ」）', '\
「我才不要和罪犯呆在一起，我回自己的房間去了！（この中に殺人者がいるかもしれないのに、一緒に居られるか!俺は自分の部屋に戻るぞ!）」', '\
「其實我知道事情的真相…犯人就是……」', '\
「我已經天下無敵了~~」', '\
「大人！這邊就交給小的吧，請快離開這邊吧」', '\
「這就是我們流派的最終奧義。這一招我只會演示一次，你看好了！」', '\
「誰敢殺我？」', '\
「從來沒有人能破解我這招。」', '\
「就算殺死也沒問題吧？」', '\
「看我塔下強殺！」', '\
「騙人的吧，我們不是朋友嗎？」', '\
「不需要大人出手，就交給在下吧」', '\
「原來只有這種水平嗎」', '\
「操縱一切的黑手其實就是！」', '\
「沒看過你呢，你是誰？」', '\
「外面怎麼這麼吵」', '\
「我老爸是....你有種就....」', '\
「戰鬥力只有五的渣渣。」', '\
「我真是HIGH到不行了啊！」', '\
「嗯？鞋帶斷了。」', '\
「這一招我只會演示一次，你看好了！」', '\
「過了明天就沒事了。」', '\
「我出門了。」', '\
「你能走到這裡很了不起……」', '\
「給我打，打出事來我負責」', '\
「我已經不是那個一無所知的我了！」', '\
「明天我會把所有事全部告訴你……」', '\
「只要擊敗你們兩個，剩下的就很容易解決。」', '\
「我會變得比任何人都強，一生保護你。」', '\
「你可以繼承這裡嗎，這孩子也說喜歡你。」', '\
「打倒了！他死掉了！」', '\
「來戰個痛快，我和你最後的戰鬥！！」', '\
「我看你是個分身或是什麼類似東西吧。」', '\
「謝謝你，你讓我感到我不是孤單一人。」', '\
「我先去死了，你儘管加油。」', '\
「這次任務輕輕鬆鬆，訓練時辛苦多了！」', '\
「我的這把刀可是塗滿了毒藥的毒刃！」\nhttp://takehana.cocolog-nifty.com/photos/uncategorized/2011/08/06/onesegpc_20110806_01041904.jpg', '\
「哈哈哈，今天又是幸運的一天，死裡逃生了！」', '\
「我花費一生的實驗終於完成了！」', '\
「什麼寺廟什麼神像，看我拆了它！」', '\
「世上怎會有鬼，都是吓小朋友啦。」', '\
「這個經過多重實驗，保證不會發生意外。」', '\
「大哥……哥……。」', '\
「大哥哥，一起玩吧。」', '\
「接下來將會說明規則。」\n「夠了，這種整人節目可以停了吧，我要走了。」', '\
「過不久我也要升級了！」', '\
「這是你的生日禮物，很有歷史價值的」', '\
「哇，好嘔心的液體！」', '\
「我已經死而無憾！」', '\
「好大件事呢，但這和我們也沒什麼關係。草」', '\
「回來後我會十倍奉還！」', '\
「雷達出現巨大的影子！」「雷達故障了吧。」', '\
「今天天氣真好，是適合出海的日子！」', '\
「雖然被怪物咬了一口，但只是皮外傷而已！」', '\
「隊長，這裡看到一個人影……」「喂喂？你說什麼」「……」', '\
「這裡很安全」「這下放心了！」', '\
「前輩會停住他，別怕，去吧！」', '\
「我要將我超過５年的感情告訴她！」', '\
「換人吧，你太無聊了。」', '\
「只要他們幸福就好，我從心底祝福他們。」', '\
「我可以好好利用這件事」'];

	//	rply.text = rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
	return rplyArr[rollbase.Dice(rplyArr.length) - 1]
}

function randomReply() {
	const rplyArr = ['\
你們死定了呃呃呃不要糾結這些……所以是在糾結哪些？', '\
在澳洲，每過一分鐘就有一隻鴨嘴獸被拔嘴。 \n我到底在共三小。', '\
嗚噁噁噁噁噁噁，不要隨便叫我。', '\
幹，你這學不會的豬！', '\
嘎嘎嘎。', '\
wwwwwwwwwwwwwwwww', '\
為什麼你們每天都可以一直玩；玩就算了還玩我。', '\
好棒，整點了！咦？不是嗎？', '\
不要打擾我挖坑！', '好棒，誤點了！', '\
在南半球，一隻鴨嘴獸拍打他的鰭，他的嘴就會掉下來。 \n我到底在共三小。', '\
什麼東西你共三小。', '\
哈哈哈哈哈哈哈哈！', '\
一直叫，你4不4想拔嘴人家？', '\
一直叫，你想被淨灘嗎？', '\
幫主你也敢嘴？', '\
拔嘴的話，我的嘴巴會長出觸手，然後開花成四個花瓣哦 (´×`)', '\
看看我！！我體內的怪物已經這麼大了！！', '\
傳說中，凡是拔嘴過鴨嘴獸的人，有高機率在100年內死去。 \n我到底在共三小。', '\
人類每花60秒拔嘴，就減少一分鐘的壽命。 \n我到底在共三小。', '\
嘴被拔，就會掉。', '\
你在大聲什麼啦！！！！', '\
公道價，八萬一（伸手）。', '\
你的嘴裡有異音（指）', '\
幫主說，有人打你的左臉，你就要用肉食性猛擊咬斷他的小腿。'];
	//	rply.text = rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
	return rplyArr[rollbase.Dice(rplyArr.length) - 1];
}

function randomLuck(TEXT) {
	const rplyArr = ['超吉', '超級上吉', '大吉', '吉', '中吉', '小吉', '吉', '小吉', '吉', '吉', '中吉', '吉', '中吉', '吉', '中吉', '小吉', '末吉', '吉', '中吉', '小吉', '末吉', '中吉', '小吉', '小吉', '吉', '小吉', '末吉', '中吉', '小吉', '凶', '小凶', '沒凶', '大凶', '很凶', '你不要知道比較好呢', '命運在手中,何必問我'];
	//	rply.text = TEXT[0] + ' ： ' + rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
	return TEXT[0] + ' ： ' + rplyArr[rollbase.Dice(rplyArr.length) - 1];
}

/**
 * Tarot塔羅牌
 */
function MultiDrawTarot(text, text2, type) {
	let returnStr = '';
	let cards = []
	switch (type) {
		case 1:
			returnStr = '【時間塔羅】/每日塔羅/大十字塔羅\n';
			(text) ? returnStr += "；" + text + " " + text2 : '';
			cards = rollbase.shuffleTarget(TarotList2);
			returnStr += '過去: ' + cards[0] + '\n'
			returnStr += '現在: ' + cards[1] + '\n'
			returnStr += '未來: ' + cards[2] + '\n'
			break;
		case 2:
			returnStr = '【大十字塔羅】/每日塔羅/時間塔羅\n';
			(text) ? returnStr += "；" + text + " " + text2 : '';
			cards = rollbase.shuffleTarget(TarotList2);
			returnStr += '現況: ' + cards[0] + '\n'
			returnStr += '助力: ' + cards[1] + '\n'
			returnStr += '目標: ' + cards[2] + '\n'
			returnStr += '基礎: ' + cards[3] + '\n'
			returnStr += '過去: ' + cards[4] + '\n'
			returnStr += '未來: ' + cards[5] + '\n'
			returnStr += '自我: ' + cards[6] + '\n'
			returnStr += '環境: ' + cards[7] + '\n'
			returnStr += '恐懼: ' + cards[8] + '\n'
			returnStr += '結論: ' + cards[9] + '\n'
			break;
		default:
			break;

	}
	return returnStr;
}

function NomalDrawTarot(text, text2) {
	let returnStr = '';
	returnStr = '【每日塔羅】/大十字塔羅/時間塔羅'
	if (text)
		returnStr += "；" + text + " " + text2
	let ans = rollbase.shuffleTarget(TarotList)
	returnStr += '\n' + ans[0]
	return returnStr;
}


const TarotList = ["愚者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/00.jpg",
	"魔術師 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/01.jpg",
	"女祭司 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/02.jpg",
	"女皇 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/03.jpg",
	"皇帝 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/04.jpg",
	"教皇 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/05.jpg",
	"戀人 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/06.jpg",
	"戰車 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/07.jpg",
	"力量 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/08.jpg",
	"隱者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/09.jpg",
	"命運之輪 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/10.jpg",
	"正義 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/11.jpg",
	"吊人 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/12.jpg",
	"死神 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/13.jpg",
	"節制 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/14.jpg",
	"惡魔 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/15.jpg",
	"高塔 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/16.jpg",
	"星星 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/17.jpg",
	"月亮 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/18.jpg",
	"太陽 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/19.jpg",
	"審判 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/20.jpg",
	"世界 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/21.jpg",
	"愚者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/00-Re.jpg",
	"魔術師 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/01-Re.jpg",
	"女祭司 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/02-Re.jpg",
	"女皇 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/03-Re.jpg",
	"皇帝 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/04-Re.jpg",
	"教皇 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/05-Re.jpg",
	"戀人 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/06-Re.jpg",
	"戰車 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/07-Re.jpg",
	"力量 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/08-Re.jpg",
	"隱者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/09-Re.jpg",
	"命運之輪 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/10-Re.jpg",
	"正義 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/11-Re.jpg",
	"吊人 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/12-Re.jpg",
	"死神 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/13-Re.jpg",
	"節制 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/14-Re.jpg",
	"惡魔 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/15-Re.jpg",
	"高塔 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/16-Re.jpg",
	"星星 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/17-Re.jpg",
	"月亮 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/18-Re.jpg",
	"太陽 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/19-Re.jpg",
	"審判 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/20-Re.jpg",
	"世界 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/21-Re.jpg",
	"聖杯一 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_01.jpg",
	"聖杯二 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_02.jpg",
	"聖杯三 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_03.jpg",
	"聖杯四 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_04.jpg",
	"聖杯五 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_05.jpg",
	"聖杯六 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_06.jpg",
	"聖杯七 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_07.jpg",
	"聖杯八 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_08.jpg",
	"聖杯九 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_09.jpg",
	"聖杯十 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_10.jpg",
	"聖杯國王 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_KING.jpg",
	"聖杯騎士 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_KNIGHT.jpg",
	"聖杯侍者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_PAGE.jpg",
	"聖杯皇后 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_QUEEN.jpg",
	"錢幣一 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_01.jpg",
	"錢幣二 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_02.jpg",
	"錢幣三 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_03.jpg",
	"錢幣四 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_04.jpg",
	"錢幣五 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_05.jpg",
	"錢幣六 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_06.jpg",
	"錢幣七 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_07.jpg",
	"錢幣八 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_08.jpg",
	"錢幣九 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_09.jpg",
	"錢幣十 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_10.jpg",
	"錢幣國王 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_KING.jpg",
	"錢幣騎士 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_KNIGHT.jpg",
	"錢幣侍者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_PAGE.jpg",
	"錢幣皇后 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_QUEEN.jpg",
	"寶劍一 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_01.jpg",
	"寶劍二 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_02.jpg",
	"寶劍三 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_03.jpg",
	"寶劍四 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_04.jpg",
	"寶劍五 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_05.jpg",
	"寶劍六 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_06.jpg",
	"寶劍七 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_07.jpg",
	"寶劍八 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_08.jpg",
	"寶劍九 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_09.jpg",
	"寶劍十 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_10.jpg",
	"寶劍國王 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_KING.jpg",
	"寶劍騎士 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_KNIGHT.jpg",
	"寶劍侍者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_PAGE.jpg",
	"寶劍皇后 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_QUEEN.jpg",
	"權杖一 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_01.jpg",
	"權杖二 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_02.jpg",
	"權杖三 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_03.jpg",
	"權杖四 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_04.jpg",
	"權杖五 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_05.jpg",
	"權杖六 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_06.jpg",
	"權杖七 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_07.jpg",
	"權杖八 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_08.jpg",
	"權杖九 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_09.jpg",
	"權杖十 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_10.jpg",
	"權杖國王 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_KING.jpg",
	"權杖騎士 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_KNIGHT.jpg",
	"權杖侍者 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_PAGE.jpg",
	"權杖皇后 ＋\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_QUEEN.jpg",
	"聖杯一 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_01-Re.jpg",
	"聖杯二 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_02-Re.jpg",
	"聖杯三 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_03-Re.jpg",
	"聖杯四 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_04-Re.jpg",
	"聖杯五 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_05-Re.jpg",
	"聖杯六 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_06-Re.jpg",
	"聖杯七 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_07-Re.jpg",
	"聖杯八 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_08-Re.jpg",
	"聖杯九 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_09-Re.jpg",
	"聖杯十 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_10-Re.jpg",
	"聖杯國王 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_KING-Re.jpg",
	"聖杯騎士 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_KNIGHT-Re.jpg",
	"聖杯侍者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_PAGE-Re.jpg",
	"聖杯皇后 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/CUPS_QUEEN-Re.jpg",
	"錢幣一 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_01-Re.jpg",
	"錢幣二 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_02-Re.jpg",
	"錢幣三 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_03-Re.jpg",
	"錢幣四 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_04-Re.jpg",
	"錢幣五 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_05-Re.jpg",
	"錢幣六 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_06-Re.jpg",
	"錢幣七 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_07-Re.jpg",
	"錢幣八 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_08-Re.jpg",
	"錢幣九 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_09-Re.jpg",
	"錢幣十 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_10-Re.jpg",
	"錢幣國王 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_KING-Re.jpg",
	"錢幣騎士 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_KNIGHT-Re.jpg",
	"錢幣侍者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_PAGE-Re.jpg",
	"錢幣皇后 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/PANTA_QUEEN-Re.jpg",
	"寶劍一 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_01-Re.jpg",
	"寶劍二 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_02-Re.jpg",
	"寶劍三 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_03-Re.jpg",
	"寶劍四 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_04-Re.jpg",
	"寶劍五 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_05-Re.jpg",
	"寶劍六 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_06-Re.jpg",
	"寶劍七 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_07-Re.jpg",
	"寶劍八 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_08-Re.jpg",
	"寶劍九 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_09-Re.jpg",
	"寶劍十 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_10-Re.jpg",
	"寶劍國王 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_KING-Re.jpg",
	"寶劍騎士 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_KNIGHT-Re.jpg",
	"寶劍侍者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_PAGE-Re.jpg",
	"寶劍皇后 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/SWORDS_QUEEN-Re.jpg",
	"權杖一 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_01-Re.jpg",
	"權杖二 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_02-Re.jpg",
	"權杖三 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_03-Re.jpg",
	"權杖四 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_04-Re.jpg",
	"權杖五 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_05-Re.jpg",
	"權杖六 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_06-Re.jpg",
	"權杖七 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_07-Re.jpg",
	"權杖八 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_08-Re.jpg",
	"權杖九 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_09-Re.jpg",
	"權杖十 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_10-Re.jpg",
	"權杖國王 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_KING-Re.jpg",
	"權杖騎士 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_KNIGHT-Re.jpg",
	"權杖侍者 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_PAGE-Re.jpg",
	"權杖皇后 －\nhttps://raw.githubusercontent.com/hktrpg/TG.line.Discord.Roll.Bot/master/assets/tarot/WANDS_QUEEN-Re.jpg",
	"空白"
]

const TarotList2 = ["愚者 ＋",
	"魔術師 ＋",
	"女祭司 ＋",
	"女皇 ＋",
	"皇帝 ＋",
	"教皇 ＋",
	"戀人 ＋",
	"戰車 ＋",
	"力量 ＋",
	"隱者 ＋",
	"命運之輪 ＋",
	"正義 ＋",
	"吊人 ＋",
	"死神 ＋",
	"節制 ＋",
	"惡魔 ＋",
	"高塔 ＋",
	"星星 ＋",
	"月亮 ＋",
	"太陽 ＋",
	"審判 ＋",
	"世界 ＋",
	"聖杯一 ＋",
	"聖杯二 ＋",
	"聖杯三 ＋",
	"聖杯四 ＋",
	"聖杯五 ＋",
	"聖杯六 ＋",
	"聖杯七 ＋",
	"聖杯八 ＋",
	"聖杯九 ＋",
	"聖杯十 ＋",
	"聖杯國王 ＋",
	"聖杯騎士 ＋",
	"聖杯侍者 ＋",
	"聖杯皇后 ＋",
	"錢幣一 ＋",
	"錢幣二 ＋",
	"錢幣三 ＋",
	"錢幣四 ＋",
	"錢幣五 ＋",
	"錢幣六 ＋",
	"錢幣七 ＋",
	"錢幣八 ＋",
	"錢幣九 ＋",
	"錢幣十 ＋",
	"錢幣國王 ＋",
	"錢幣騎士 ＋",
	"錢幣侍者 ＋",
	"錢幣皇后 ＋",
	"寶劍一 ＋",
	"寶劍二 ＋",
	"寶劍三 ＋",
	"寶劍四 ＋",
	"寶劍五 ＋",
	"寶劍六 ＋",
	"寶劍七 ＋",
	"寶劍八 ＋",
	"寶劍九 ＋",
	"寶劍十 ＋",
	"寶劍國王 ＋",
	"寶劍騎士 ＋",
	"寶劍侍者 ＋",
	"寶劍皇后 ＋",
	"權杖一 ＋",
	"權杖二 ＋",
	"權杖三 ＋",
	"權杖四 ＋",
	"權杖五 ＋",
	"權杖六 ＋",
	"權杖七 ＋",
	"權杖八 ＋",
	"權杖九 ＋",
	"權杖十 ＋",
	"權杖國王 ＋",
	"權杖騎士 ＋",
	"權杖侍者 ＋",
	"權杖皇后 ＋",
	"愚者 －",
	"魔術師 －",
	"女祭司 －",
	"女皇 －",
	"皇帝 －",
	"教皇 －",
	"戀人 －",
	"戰車 －",
	"力量 －",
	"隱者 －",
	"命運之輪 －",
	"正義 －",
	"吊人 －",
	"死神 －",
	"節制 －",
	"惡魔 －",
	"高塔 －",
	"星星 －",
	"月亮 －",
	"太陽 －",
	"審判 －",
	"世界 －",
	"聖杯一 －",
	"聖杯二 －",
	"聖杯三 －",
	"聖杯四 －",
	"聖杯五 －",
	"聖杯六 －",
	"聖杯七 －",
	"聖杯八 －",
	"聖杯九 －",
	"聖杯十 －",
	"聖杯國王 －",
	"聖杯騎士 －",
	"聖杯侍者 －",
	"聖杯皇后 －",
	"錢幣一 －",
	"錢幣二 －",
	"錢幣三 －",
	"錢幣四 －",
	"錢幣五 －",
	"錢幣六 －",
	"錢幣七 －",
	"錢幣八 －",
	"錢幣九 －",
	"錢幣十 －",
	"錢幣國王 －",
	"錢幣騎士 －",
	"錢幣侍者 －",
	"錢幣皇后 －",
	"寶劍一 －",
	"寶劍二 －",
	"寶劍三 －",
	"寶劍四 －",
	"寶劍五 －",
	"寶劍六 －",
	"寶劍七 －",
	"寶劍八 －",
	"寶劍九 －",
	"寶劍十 －",
	"寶劍國王 －",
	"寶劍騎士 －",
	"寶劍侍者 －",
	"寶劍皇后 －",
	"權杖一 －",
	"權杖二 －",
	"權杖三 －",
	"權杖四 －",
	"權杖五 －",
	"權杖六 －",
	"權杖七 －",
	"權杖八 －",
	"權杖九 －",
	"權杖十 －",
	"權杖國王 －",
	"權杖騎士 －",
	"權杖侍者 －",
	"權杖皇后 －",
	"空白"
]

/**
 *  choice 及SORT
 */

function dailyAnswerChoice(input) {
	return input + ' \n→ ' + dailyAnswer[rollbase.Dice(dailyAnswer.length) - 1];
}
function choice(input, str) {
	let array = input.replace(str[0], '').match(/\S+/ig);
	return str[0] + ' [ ' + array.join(' ') + ' ] \n→ ' + array[rollbase.Dice(array.length) - 1];
}

function SortIt(input, mainMsg) {
	let a = input.replace(mainMsg[0], '').match(/\S+/ig);
	for (let i = a.length - 1; i >= 0; i--) {
		//var randomIndex = Math.floor(Math.random() * (i + 1));  
		//3 -> 210 , 10, 0
		var randomIndex = rollbase.Dice(i + 1) - 1
		//3 ->
		var itemAtIndex = a[randomIndex];
		a[randomIndex] = a[i];
		a[i] = itemAtIndex;
	}
	return mainMsg[0] + ' \n→ [ ' + a.join(', ') + ' ]';
}
async function axiosDaily(url) {
	let reply = await fetchData(url);
	if (reply === '錯誤error') {
		reply = await fetchData(url.replace('https://ovooa.com', 'http://lkaa.top'));
	}
	if (reply === '錯誤error') {
		reply = `伺服器出現問題，請稍後再試。`;
	}
	return reply;

}

async function fetchData(url) {
	let reply = '';
	try {
		const response = await axios.get(encodeURI(url), { timeout: 20000 });
		const json = analyzeResponse(response);
		reply += `${json.title ? json.title + '\n' : ''}`
		reply += `${json.text && json.text !== '获取成功' ? json.text + '\n' : ''}`
		reply += `${json.data && json.data.title ? json.data.title + '\n' : ''}`
		reply += `${json.data && json.data.text ? json.data.text + '\n' : ''}`
		reply += `${json.data && json.data.Msg ? json.data.Msg + '\n' : ''}`
		reply = chineseConv.tify(reply);
		reply += `${json.image ? json.image + '\n' : ''}`
		reply += `${json.data && json.data.image ? json.data.image + '\n' : ''}`
		reply = reply.replace(/\\r/g, '\n').replace(/\\n/g, '\n')
		return reply || '沒有結果，請檢查內容'
	} catch (error) {
		if (error.code !== 'ETIMEDOUT' || error.code !== 'ECONNABORTED' || error.code !== 'ECONNRESET' || error.code !== 'undefined') {
			return '錯誤error'
		}
		//return `'伺服器連線出現問題，請稍後再試，錯誤代碼: ${error.code}`;
	}
}
function analyzeResponse(response) {
	switch (typeof response) {
		case 'string':
			return { data: { text: response } }
		case 'object':
			if (response && response.data && response.data.data) {
				return response.data;
			}
			if (response && response.data) {
				return response;
			}
			break;
		default:
			break;
	}
}
/*來源自 https://ovooa.com

http://api.uuouo.cn/
http://ybapi.top/
http://weizhinb.top/

*/
const discordCommand = [
	{
		data: new SlashCommandBuilder()
			.setName('mee')
			.setDescription('【複述功能】 /mee 模擬HKTRPG說話 ')
			.addStringOption(option => option.setName('text').setDescription('複述內容').setRequired(true)),
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null) {
				await interaction.reply({ content: '已進行模擬HKTRPG說話', ephemeral: true }).catch();
				return `.me ${text}`
			}
			else return `需要輸入內容\n 
			例子 /mee C君殺死了NPC 村民, 受到尼什村通緝!`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('排序')
			.setDescription('進行隨機排序')
			.addStringOption(option => option.setName('text').setDescription('輸入所有內容，以空格分隔').setRequired(true))
		,
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null)
				return `排序 ${text}`

		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('隨機')
			.setDescription('進行隨機抽選')
			.addStringOption(option => option.setName('text').setDescription('輸入所有內容，以空格分隔').setRequired(true))
		,
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null)
				return `隨機 ${text}`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('choice')
			.setDescription('進行隨機抽選')
			.addStringOption(option => option.setName('text').setDescription('輸入所有內容，以空格分隔').setRequired(true))
		,
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null)
				return `隨機 ${text}`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('運勢')
			.setDescription('進行隨機抽選')
			.addStringOption(option => option.setName('text').setDescription('可選: 什麼的運勢'))
		,
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null)
				return `${text}的運勢`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('塔羅')
			.setDescription('進行塔羅占卜')
			.addStringOption(option =>
				option.setName('category')
					.setDescription('塔羅種類')
					.setRequired(true)
					.addChoice('每日塔羅(單張)', '每日塔羅')
					.addChoice('大十字塔羅', '大十字塔羅')
					.addChoice('時間塔羅', '時間塔羅'))
		,
		async execute(interaction) {
			const category = interaction.options.getString('category')
			if (category !== null)
				return `${category}`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('立flag')
			.setDescription('立FLAG')
			.addStringOption(option => option.setName('text').setDescription('可選: 立什麼FLAG'))
		,
		async execute(interaction) {
			const text = interaction.options.getString('text')
			if (text !== null)
				return `${text}立FLAG`
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('每日')
			.setDescription('進行每日功能')
			.addSubcommand(subcommand =>
				subcommand
					.setName('星座')
					.setDescription('顯示每日星座運程')
					.addStringOption(option =>
						option.setName('star')
							.setDescription('哪個星座')
							.setRequired(true)
							.addChoice('白羊', '每日白羊')
							.addChoice('金牛', '每日金牛')
							.addChoice('巨蟹', '每日巨蟹')
							.addChoice('獅子', '每日獅子')
							.addChoice('雙子', '每日雙子')
							.addChoice('處女', '每日處女')
							.addChoice('天秤', '每日天秤')
							.addChoice('天蠍', '每日天蠍')
							.addChoice('射手', '每日射手')
							.addChoice('摩羯', '每日摩羯')
							.addChoice('水瓶', '每日水瓶')
							.addChoice('雙魚', '每日雙魚')
					))
			.addSubcommand(subcommand =>
				subcommand
					.setName('塔羅')
					.setDescription('抽取一張塔羅牌'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('一言')
					.setDescription('顯示一條金句'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('毒湯')
					.setDescription('顯示一條有毒的雞湯'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('情話')
					.setDescription('顯示一條情話'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('靈簽')
					.setDescription('抽取一條觀音簽'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('大事')
					.setDescription('顯示今天歷史上的大事'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('笑話')
					.setDescription('顯示一條笑話'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('動漫')
					.setDescription('顯示一條動漫金句'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('急口令')
					.setDescription('顯示一條急口令'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('黃曆')
					.setDescription('顯示今日黃曆'))
			.addSubcommand(subcommand =>
				subcommand
					.setName('廢話')
					.setDescription('生產一條你或對像的廢話').addStringOption(option => option.setName('name').setDescription('可選: 對像的名字，留白則使用你的名字')))

		,
		async execute(interaction) {
			await interaction.deferReply({});
			const category = interaction.options.getString('category')
			const name = interaction.options.getString('name') || '';
			const subcommand = interaction.options.getSubcommand()
			const star = interaction.options.getString('star')
			if (star !== null)
				return `${star}`
			if (subcommand !== null)
				return `每日${subcommand} ${name}`
			if (category !== null)
				return `${category}`
			return;
		}
	}
];

const dailyAnswer = [
	"不一定",
	"需要別人的幫助",
	"需要慎重考慮",
	"相信你自己",
	"你是對的",
	"放棄吧",
	"聽聽別人的建議",
	"需要堅持",
	"不要放棄",
	"不要錯過機會",
	"會有轉機",
	"等待機會",
	"花更多時間來决定",
	"再多考慮",
	"你可能要放棄些東西",
	"考慮下別人的感受",
	"這事不靠譜",
	"別讓它影響到你",
	"做能讓你快樂的那個决定",
	"掃清障礙",
	"不要覺得憂慮",
	"主動一點",
	"時間會給你答案",
	"現在就開始",
	"別猶豫",
	"决定了就做",
	"顯而易見的結果",
	"保存實力",
	"時機還不成熟",
	"你需要掌握更多的信息",
	"去找個人傾訴",
	"你需要去探索真相",
	"把握機會",
	"决定了就堅持",
	"很麻煩2現在比以往任何時候的情况都要好",
	"重新思考",
	"列出原因",
	"期待一下,令人期待的事情馬上會發生",
	"培養一項新的愛好",
	"走容易走的路",
	"時間不對",
	"給自己點時間",
	"坦誠相告",
	"著眼未來",
	"信任",
	"別傻傻等待",
	"希望渺茫",
	"需要新的開始",
	"其實你已經有了答案",
	"聽聽別人的建議",
	"試著放棄",
	"不要猶豫",
	"趁早放棄",
	"再努力一些",
	"忘掉過去",
	"可以",
	"值得一試",
	"抓住機會",
	"不要嘗試",
	"聽長輩的建議",
	"不要堅持",
	"你可以的",
	"不靠譜",
	"打消念頭",
	"等待機會",
	"重新計劃",
	"重新開始",
	"擺脫現在的環境",
	"建議多次嘗試",
	"需要休息一下再决定",
	"冷靜思考再决定",
	"珍惜他或者她",
	"坦白一切",
	"努力一下",
	"主動出擊",
	"不要太主動",
	"冷靜處理",
	"謹慎做决定",
	"獨立面對",
	"從過去尋找答案",
	"多和家人溝通",
	"多和朋友溝通",
	"暗中觀察",
	"不太確定",
	"沒太大可能",
	"沒什麽把握",
	"學會放棄",
	"放弃這個念頭",
	"不值得一試",
	"風險很大",
	"不要再浪費時間",
	"做多重計劃",
	"再堅持一下",
	"不能繼續下去",
	"不會有結果",
	"結果不會讓你滿意",
	"結果出乎你的意料",
	"堅持就有結果",
	"付諸行動",
	"你會成功",
	"成功率很高",
	"沒問題",
	"耐心處理",
	"不要主動出擊",
	"好運馬上來了",
	"會有變化",
	"無濟于事",
	"是個好主意",
	"不太穩妥",
	"放空自己",
	"信任",
	"相信自己的判斷",
	"堅持就能看見真理",
	"會有轉折",
	"會有改變",
	"相信自己的第一直覺",
	"定下目標",
	"學會獨立思考",
	"學會捨得",
	"繼續前行",
	"不懼未來",
	"需要些時間",
	"還有更好的選擇",
	"不合適",
	"結果不理想",
	"抓住新的機會",
	"尋找新的機會",
	"尋找更好的方法",
	"聽取家人的建議",
	"接受它",
	"當面溝通",
	"多次嘗試",
	"你一定會成功",
	"可以確定是的",
	"不重要",
	"錯誤的想法",
	"爭取機會",
	"或許很難",
	"放心去嘗試",
	"沒有好結果",
	"花點時間處理",
	"堅持自己的想法",
	"多方面思考再决定",
	"別猶豫",
	"思考風險再决定",
	"有希望",
	"不要失去信心",
	"擺脫現在的關係",
	"十分困難",
	"需要一些準備",
	"需要條件",
	"改變自己再决定",
	"參考朋友的建議",
	"分享想法會有收穫",
	"不算是",
	"考慮全面",
	"非常肯定",
	"也許希望很小",
	"不是最佳選擇",
	"再找找別的辦法",
	"趁早放棄",
	"一定要堅持",
	"時間會改變一切",
	"充實自己再做决定",
	"從回憶中找答案",
	"不可以嘗試",
	"不要做讓自己後悔的事",
	"不做你會後悔",
	"抓緊行動",
	"機不可失",
	"等待好機會",
	"整理思路",
	"可以確定",
	"控制自己",
	"做充分準備",
	"需要好的建議",
	"幷沒有那麽好",
	"不是最好的選擇",
	"不要抱太大希望",
	"完全正確",
	"很遺憾",
	"這不是一個好辦法",
	"不能否認",
	"千真萬確",
	"一定是",
	"完全肯定",
	"尋找可能",
	"細心觀察",
	"勇于面對",
	"爲未來做打算",
	"背向而馳",
	"憑藉自己的直覺",
	"深思熟慮再决定",
	"不是唯一的選擇",
	"最好的選擇",
	"找個人給你點意見",
	"請教你媽媽",
	"誰說的准呢先觀望著",
	"把心踹懷裏",
	"答案在鏡子裏",
	"這事兒不靠譜",
	"天上要掉餡餅了",
	"有好運",
	"要有耐心",
	"你需要知道真相",
	"還有另一種情况",
	"觀望",
	"別讓他影響到你",
	"照你想做的那樣去",
	"但行好事莫問前程",
	"走容易走的路",
	"試試賣萌",
	"借助他人的經驗",
	"再多考慮",
	"機會稍縱即逝",
	"制定一個新計劃",
	"GO",
	"情况很快會發生變化",
	"轉移你的注意力",
	"告訴自己什麽是最重要的",
	"爲什麽不",
	"別傻等了",
	"不要忘記",
	"WHY",
	"NOT",
	"去解决",
	"尋找更多的選擇8上帝爲你關一扇門必定會爲你開一扇窗",
	"隨波逐流未必是好事",
	"問天問大地不如問問自己",
	"你就是答案",
	"去爭取機會",
	"改變不了世界就改變自己",
	"主動一點人生會大不相同",
	"學會妥協",
	"掌握更多信息",
	"相信你的最初想法",
	"勿忘初心方得始終",
	"掃清障礙",
	"把重心放在工作學習上",
	"培養一項新的愛好",
	"對他人慷慨",
	"去做其他的事情",
	"觀察形勢",
	"休息休息一會兒",
	"這是你最後的機會",
	"再考慮一下",
	"幷不明智",
	"等待更好的",
	"很快能解决",
	"重要",
	"去做",
	"不要過火",
	"事情開始變得有趣了",
	"保存你的實力",
	"不確定因素有點多",
	"結果不錯,你可能不得不放棄其他東西",
	"不要憂慮",
	"不需要",
	"去傾訴,告訴別人這對你意味著什麽",
	"無論你做何種選擇結果都是對的",
	"保持頭腦清醒",
	"克服困難",
	"實際一點",
	"你需要一點幫助",
	"協作",
	"尋找更多的選擇",
	"負責",
	"阻止",
	"你必須現在就行動",
	"遵守規則",
	"堅持",
	"需要花點時間",
	"你不會失望",
	"不要迫于壓力而改變初衷",
	"不要忽略身邊的人",
	"抗拒",
	"不值得鬥爭",
	"玩得開心就好",
	"毋庸置疑",
	"你也許會失望",
	"去改變",
	"一個强有力的承諾將會換回更好的結果",
	"也許有更好的解决方案",
	"不要害怕",
	"想法太對選擇太少",
	"一笑而過",
	"取决于你的選擇",
	"隨他去",
	"你需要考慮其他方面",
	"一年後就不那麽重要了",
	"醒醒吧別做夢了",
	"意義非凡",
	"默數十秒再問我",
	"去行動",
	"發揮你的想像力",
	"保持冷靜",
	"你必須彌補這個缺點",
	"你會後悔的",
	"毫無疑問",
	"當然",
	"現在比以往任何時候的情况都要好",
	"相信你的直覺",
	"這是一個機會",
	"去問你爸爸",
	"從來沒有",
	"尋找一個指路人",
	"去嘗試",
	"荒謬",
	"不賭",
	"不值得冒險",
	"不妥協",
	"關注你的家庭生活",
	"肯定",
	"不可預測",
	"絕對不",
	"我確定",
	"儘早完成,令人期待的事情馬上就要發生",
	"你需要適應",
	"表示懷疑",
	"它會帶來好運",
	"看看會發生什麽",
	"記錄下倆",
	"不宜在這個時候",
	"决定了就去做",
	"別要求太多",
	"放棄第一個方案",
	"Hold不住",
	"謹慎小心",
	"注意細節",
	"注意身後",
	"不要猶豫",
	"繼續前行",
	"情况很快會發生改變",
	"不要被情緒左右",
	"轉移注意力",
	"著眼未來",
	"問自己什麽是最重要的",
	"不要等了",
	"保持樂觀",
	"沒有更好的選擇",
	"你需要主動",
	"妥協",
	"有比這更重要的東西",
	"你需要掌握更多的信息",
	"删除記憶",
	"專注于你的工作",
	"你需要考慮其他的方面",
	"相信自己的直覺",
	"形勢不明",
	"先讓自己休息",
	"重新考慮",
	"不要做的太過分",
	"保持現狀/有意料之外的事會發生不妨等待",
	"花更多的時間來决定",
	"你開心就好",
	"有風險但也有機會",
	"算了吧",
	"當然咯",
	"千萬別傻,保持你的好奇心去挖掘真相",
	"把心揣懷裏",
	"時機不對",
	"照你想做的那樣去做",
	"量力而行",
	"拋棄首選方案",
	"最佳方案不一定可行",
	"注意細節",
	"說出來吧",
	"誰都不能保證",
	"不要陷得太深",
	"至關重要",
	"這是一定的",
	"不妨賭一把",
	"需要多思考一下",
	"這個問題確實不好回答",
	"其實都還不錯",
	"你認爲好的那個",
	"或許還沒有",
	"沒有足够的條件",
	"目前不滿足",
	"可以接受",
	"停止",
	"對比一下再决定",
	"勿忘初心",
	"不重要",
	"多讀書少思考",
	"放棄第一個選擇",
	"不該堅持",
	"學會放棄",
	"捨得才有機會獲得",
	"你是對的",
	"你值得這麽做",
	"沒有你想的那麽簡單",
	"不會更糟糕",
	"別騙自己",
	"想太多了",
	"睡一覺再决定",
	"不是最佳選擇",
	"不合適",
	"把注意力轉移一下",
	"不要强求",
	"時間會告訴你答案",
	"這件事不好回答",
	"要看你自己",
	"這個問題沒有答案",
	"你懂得，不用問我",
	"用心去做",
	"不能言傳",
	"改變自己",
	"無所謂",
	"全力以赴",
	"爭取早日擺脫",
	"顯而易見的道理",
	"沒有理由拒絕",
	"想想未來吧",
	"開心就好",
	"及時行樂",
	"看情况再說",
	"不聽老人言，吃虧在眼前",
	"無須多言",
	"熬過去就好",
	"一切都是好的",
	"是非難辨",
	"搞不清楚狀况",
	"不要太樂觀",
	"用心感受",
	"嗯",
	"明天就有變化",
	"等一周再說",
	"都可以",
	"都值得去做",
	"太早决定不好",
	"別懷疑自己",
	"你要果斷一些",
	"靜觀其變",
	"看起來不靠譜",
	"放輕鬆",
	"不想要就趁早放棄",
	"尋找新的開始",
	"都可以",
	"放下吧",
	"忽略別人的看法",
	"不需要解釋",
	"愛拼才會贏",
	"讓他、她知道",
	"其他選擇",
	"沒有意義",
	"你的答案在心裏",
	"換位思考",
	"嘗試新的生活",
	"接受它",
	"一切都是最好的安排",
	"完美",
	"不要放縱自己",
	"跟隨大衆的審美",
	"不太滿意的結果",
	"沒有更好的選擇",
	"堅持到底",
	"不要",
	"隨心所欲",
	"大膽去做",
	"聽人勸吃飽飯",
	"你還是不够努力",
	"不要欺騙自己",
	"注意細節",
	"珍惜現在",
	"讓別人替你分擔",
	"分享會有驚喜",
	"走下去",
	"淘汰它",
	"心誠則靈",
	"行與不行一試便知",
	"真心對待",
	"最後的决定",
	"二選一，選前者",
	"找人幫你做",
	"相信大家的眼光",
	"難得糊塗",
	"從現在開始努力",
	"回頭是岸",
	"求同存異",
	"或許還不是時候",
	"先苦後甜",
	"樹立信心再來一次",
	"過了這村沒這店",
	"運氣不佳不建議做",
	"別一條路走到黑",
	"別再委屈自己",
	"多看看外面的世界",
	"問下你們老師",
	"這是個問題嘛？",
	"無法回答",
	"相信科學",
	"少吃多動就會有收穫",
	"幹嘛想不開來笑一個",
	"誰也幫不了你",
	"瞭解自己的人會給你答案",
	"沒效果",
	"言多必失",
	"敞開心扉",
	"梳理一下再决定",
	"想想得了",
	"最後的疼愛是手放開",
	"別想那麽多沒用的",
	"沒用的",
	"不起作用",
	"適得其反",
	"空說無用",
	"沒什麽不妥",
	"長點心吧",
	"還有別的選擇嘛？",
	"別往心裏去",
	"控制自己",
	"今生無緣",
	"幸福快來了",
	"不是現在這個人、事、物",
	"再給自己一次機會",
	"未必適合你",
	"沒問題的",
	"不計得失方能成功",
	"愛幹嘛就幹嘛",
	"分散注意力",
	"緩解壓力繼續前行",
	"說多無益",
	"別膽少",
	"直接點",
	"只有你最清楚",
	"問問你閨蜜或基友",
	"看樣子是不行",
	"沒什麽差別",
	"摸著自己的胸再問一次",
	"親愛的那是不可能的",
	"反正也不會實現",
	"無所謂了",
	"試一次就知道",
	"別怕麻煩",
	"自己拿主意吧",
	"別人說的話隨便聽一聽",
	"我也幫不上忙",
	"和昨天一樣",
	"別忘了你的承諾",
	"恐怕來不及",
	"反復無常",
	"不要自討苦吃",
	"不要自討沒趣",
	"枉然",
	"取長補短",
	"不能硬來",
	"不明智的選擇",
	"犯不著",
	"理清頭緒答案就有了",
	"放輕鬆再問一遍",
	"你喜歡的就是好的",
	"如果有選擇我選第一個",
	"做自己喜歡的事",
	"很重要的事情要花點功夫",
	"對自己好一點",
	"愛惜自己",
	"沒有對比就沒有傷害",
	"醒醒吧",
	"不要輕易放棄",
	"浪費功夫",
	"依賴別人也不是辦法",
	"別人幫不了你",
	"沒有辦法感同身受",
	"不要好了傷疤忘了疼",
	"要矜持點",
	"簡單易行的方式",
	"找值得信賴的人諮詢",
	"少點套路",
	"什麽都沒有把握",
	"主意不錯哦",
	"要有野心",
	"好景不長",
	"不要自尋煩惱",
	"清理自己的過去",
	"提高自己",
	"誰也做不了你的主",
	"這個還真不好說",
	"給自己一點壓力",
	"別管對錯去做吧",
	"你需要點套路",
	"懶得想不如簡單點",
	"看開一點",
	"支持你",
	"不適合你的",
	"你這麽好看說什麽都對",
	"多讀書少提問",
	"活在當下",
	"別灰心再試一下",
	"沒有絕對的答案",
	"不存在優勢",
	"抓住重點",
	"這跟我沒關係",
	"好主意",
	"搞不定",
	"想想就好，別衝動",
	"鼓勵一下，你行滴",
	"無疑是一個好選擇",
	"看情况咯",
	"費盡心思也無濟于事",
	"性格不合",
	"試試賣萌、耍酷",
	"冷靜冷靜",
	"主動聯繫",
	"一包辣條壓壓驚",
	"痛苦的選擇",
	"離開",
	"顧及別人感受",
	"傻人有傻福",
	"一切從簡",
	"重新考慮一下",
	"千萬小心",
	"太天真",
	"別想太多啦",
	"忍一忍就過去了",
	"何必認真",
	"都是緣分",
	"提醒自己過去的事",
	"隨你吧",
	"這不重要吧",
	"你說對了呢",
	"仁者見仁智者見智",
	"無解",
	"是個謎",
	"無所謂",
	"不要反復果斷點",
	"不要感情用事",
	"放手一搏",
	"什麽都不用做",
	"轉機馬上到了",
	"要敢于直面現實",
	"改變不了自己，就放弃",
	"接受現狀",
	"可能不會有",
	"現實很殘酷",
	"不知道啊",
	"你一定是對的",
	"跟以前一樣",
	"還是老樣子",
	"不如讓自己開心一點",
	"糟糕",
	"猜不透就不猜",
	"別理睬",
	"忍",
	"陽光總在風雨後",
	"小心爲上",
	"不提也罷",
	"不該問我，問問自己",
	"想不通就明天再想",
	"問你身邊的异性",
	"問你身邊的朋友",
	"問你身邊的同性",
	"答案即將揭曉",
	"肯定沒戲",
	"別抱太大希望",
	"慢慢來",
	"不必在乎",
	"沒有準確答案",
	"如往常一樣",
	"沒什麽不妥",
	"安心去做",
	"抓緊實現",
	"你搞不定",
	"這個問題沒有答案",
	"需要找個專家問問",
	"樂觀面對",
	"不要做鴕鳥",
	"清醒地認識自己",
	"擺脫一切幹擾",
	"試試手氣重新來過",
	"別讓自己變得不像自己",
	"別著急，再好好想想",
	"問天問地不如問問自己",
	"毫無意義的事",
	"不要强加于人",
	"及時行樂",
	"與人溝通，會有收穫",
	"樂趣在于探索",
	"找不到相關的信息",
	"大膽提出建議",
	"無話可說",
	"別忘了自己的夢想",
	"說好的獨立解决呢",
	"拒絕回答一切問題",
	"不太想管你這種閑事",
	"安心的去做",
	"難道告訴你結果不妙嘛",
	"無聊的問題",
	"別人說的都對",
	"好人有好報",
	"祈禱一下，就會有奇迹",
	"不够虔誠，重新問一次",
	"不要騙自己",
	"很尷尬的局面",
	"沒必要堅持",
	"放手一搏",
	"換個角度思考",
	"神仙都幫不了你",
	"心靈鶏湯救不了你",
	"遠水救不了近火",
	"更多選擇更多歡笑",
	"軟硬兼施",
	"全面推進",
	"妥協吧",
	"只是時間問題罷了",
	"天時地利只欠人和",
	"等風來",
	"回家問你媽媽",
	"不一定是你滿意的結果",
	"强扭的瓜不甜",
	"真的未必能做到",
	"沒可能完成",
	"嘗試三次不行就撤",
	"誰說你不行，去他打",
	"你怎樣做都是錯,真理永遠掌握在少數人手中",
	"別猶豫加油做",
	"去吧，不然會後悔",
	"智者是不需要任何答案的",
	"反向思考",
	"淡定",
	"不知道",
	"找個人請教一下",
	"話聽三分",
	"你的地盤你做主",
	"這個問題太深奧",
	"决定了就去做"]

module.exports = {
	rollDiceCommand,
	initialize,
	getHelpMessage,
	prefixs,
	gameType,
	gameName,
	discordCommand
};