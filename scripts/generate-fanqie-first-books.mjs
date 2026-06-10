import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const outRoot = join(process.cwd(), 'outputs', 'fanqie-first-9-books')
const stamp = '2026-06-10T00:00:00.000Z'

const books = [
  {
    id: '01-life-debt-martial',
    title: '我靠扣寿命把武学氪成负数',
    genre: '都市高武',
    length: '长篇，120-180万字',
    protagonist: '陈照夜',
    identity: '江城第七武中的落榜武科生',
    place: '江城第七武中',
    hook: '寿命抵扣系统会把敌人的违规代价算进他的账户',
    ally: '校医沈青禾',
    antagonist: '校队队长陆衡',
    artifact: '寿命账单',
    power: '欠费武学',
    faction: '江城武馆联盟',
    promise: '用财务审计的方式打穿高武世界',
    cover: ['martial arts exam hall', 'glowing red debt ledger', 'young fighter in worn school uniform'],
    skills: ['novel-market-scan', 'fanqie-premise-positioning', 'novel-pleasure-points', 'novel-chapter-draft']
  },
  {
    id: '02-anti-fraud-cultivation',
    title: '反诈主播，专骗骗子修仙',
    genre: '都市脑洞',
    length: '中长篇，80-120万字',
    protagonist: '林半夏',
    identity: '粉丝只有三百人的反诈主播',
    place: '城中村出租屋直播间',
    hook: '骗子相信他的假身份就会掉落技能和线索',
    ally: '刑警顾明舟',
    antagonist: '灰产头目黑鹞',
    artifact: '谎言灵气面板',
    power: '监察仙君话术',
    faction: '黑鹞诈骗园区',
    promise: '把诈骗窝点骗到自首，把都市怪人骗成队友',
    cover: ['neon livestream room', 'phone screen with glowing cultivation talisman', 'young host smiling like a trickster'],
    skills: ['novel-premise-design', 'novel-emotion-pacing', 'fanqie-golden-three', 'novel-audit-repair']
  },
  {
    id: '03-reborn-stall-franchise',
    title: '我重生后只想摆摊，前世仇人全来加盟',
    genre: '都市重生',
    length: '长篇，100-150万字',
    protagonist: '周砚',
    identity: '刚从破产前夜重生的小老板',
    place: '南桥夜市',
    hook: '他只想摆摊还债，却把前世仇人一个个变成加盟商',
    ally: '夜市摊主叶小满',
    antagonist: '资本经理许闻达',
    artifact: '旧账本',
    power: '前世商业信息差',
    faction: '星澜资本',
    promise: '烟火气里做商业反杀，每次报复都包装成合作共赢',
    cover: ['busy night market', 'steam from food stall', 'young vendor holding old ledger'],
    skills: ['novel-commercialization', 'novel-outline-engine', 'novel-character-arc', 'novel-polish-humanize']
  },
  {
    id: '04-demon-sect-rules',
    title: '全宗门都是反派，只有我按门规作恶',
    genre: '玄幻脑洞',
    length: '长篇，120-200万字',
    protagonist: '谢无咎',
    identity: '刚穿进魔宗的外门弟子',
    place: '黑烬魔宗戒律堂',
    hook: '全宗都在偷偷洗白，只有他认真执行作恶门规却总涨功德',
    ally: '戒律堂师姐姜照雪',
    antagonist: '正道钓鱼队首领宋归尘',
    artifact: '作恶门规',
    power: '功德误判',
    faction: '黑烬魔宗',
    promise: '正邪身份错位，用制度漏洞把魔宗越洗越白',
    cover: ['dark fantasy sect gate', 'black rule book with golden merit light', 'young disciple looking innocent and dangerous'],
    skills: ['novel-genres', 'novel-setting-system', 'novel-pleasure-points', 'fanqie-chapter-rhythm']
  },
  {
    id: '05-enemy-first-exp',
    title: '杀敌爆经验，但经验先发给敌人',
    genre: '东方玄幻',
    length: '长篇，150-220万字',
    protagonist: '秦昼',
    identity: '秦家旁支的试炼弃子',
    place: '青岩城秦家演武场',
    hook: '杀敌经验会先发给敌人，敌人临战突破越快死得越准',
    ally: '药铺少女洛梨',
    antagonist: '秦家嫡子秦骁',
    artifact: '经验回收印',
    power: '反向升级局',
    faction: '青岩秦家',
    promise: '每一场越级战都是三层布局和清楚结算',
    cover: ['eastern fantasy arena', 'enemy glowing with unstable power', 'calm strategist holding a seal'],
    skills: ['novel-outline-engine', 'novel-setting-system', 'novel-audit-repair', 'novel-chapter-plan']
  },
  {
    id: '06-rent-ancestor',
    title: '宗门破产后，我把祖师爷租出去了',
    genre: '玄幻经营',
    length: '中长篇，90-140万字',
    protagonist: '陆闲',
    identity: '欠债三万灵石的小宗门掌门',
    place: '青瓦山破旧山门',
    hook: '祖师爷残魂只会吹牛，却能被包装成显灵服务',
    ally: '记账弟子阿粥',
    antagonist: '债主万宝楼执事钱三通',
    artifact: '祖师显灵体验券',
    power: '名号担保',
    faction: '万宝楼',
    promise: '把债务变成影响力生意，让祖师爷一边骂一边营业',
    cover: ['broken mountain sect', 'glowing ancestor spirit angry in incense smoke', 'young sect leader holding tickets'],
    skills: ['novel-worldbuilding', 'novel-character-arc', 'novel-emotion-pacing', 'novel-polish-humanize']
  },
  {
    id: '07-talking-alchemy-furnace',
    title: '炼丹炉成精后，天天举报我偷工减料',
    genre: '东方仙侠',
    length: '长篇，120-180万字',
    protagonist: '许长安',
    identity: '青岚宗最低等的丹房杂役',
    place: '青岚宗外门丹房',
    hook: '会说话的炼丹炉绑定天道质检，天天举报他却帮他炼出低成本神丹',
    ally: '丹炉器灵炉小满',
    antagonist: '丹房管事韩百草',
    artifact: '天道质检炉',
    power: '省料丹方',
    faction: '青岚宗丹房',
    promise: '炼丹像做账，省料也能省出大道',
    cover: ['xianxia alchemy room', 'talking bronze furnace with glowing eyes', 'young alchemy servant with cheap herbs'],
    skills: ['fanqie-premise-positioning', 'novel-setting-system', 'novel-chapter-draft', 'fanqie-submission-audit']
  },
  {
    id: '08-causal-accountant',
    title: '我在仙门做账，算哭了三界大能',
    genre: '东方仙侠',
    length: '长篇，100-160万字',
    protagonist: '白砚辞',
    identity: '没有灵根的仙门账房',
    place: '云台宗账房',
    hook: '他能看见因果账，别人斗法他查账，别人渡劫他算税',
    ally: '外门剑修宁扶摇',
    antagonist: '云台宗掌门玄衡真人',
    artifact: '因果账簿',
    power: '因果审计',
    faction: '云台宗',
    promise: '用账本破案，用因果追债，算哭三界大能',
    cover: ['immortal sect accounting room', 'floating ledger with golden causal threads', 'scholar accountant under thunderclouds'],
    skills: ['novel-premise-design', 'novel-outline-engine', 'novel-reference-deconstruct', 'novel-audit-repair']
  },
  {
    id: '09-ascension-examiner',
    title: '飞升考试三次不过，我改去当考官',
    genre: '东方仙侠',
    length: '中长篇，90-130万字',
    protagonist: '沈照',
    identity: '三次飞升考试落榜的寒门修士',
    place: '白玉飞升考场',
    hook: '他发现考试体系被仙界门阀垄断，转头考进巡考司查舞弊',
    ally: '巡考司文吏苏见微',
    antagonist: '判卷仙吏裴云章',
    artifact: '朱批红笔',
    power: '批语成法',
    faction: '仙界巡考司',
    promise: '用红笔改卷改命，把飞升秩序批到重写',
    cover: ['xianxia exam hall above clouds', 'red grading brush glowing like a sword', 'failed cultivator becoming examiner'],
    skills: ['novel-market-scan', 'novel-character-arc', 'novel-emotion-pacing', 'fanqie-golden-three']
  }
]

const stagePlan = [
  ['开局羞辱', '身份和处境必须立住，主角在公开压力下被逼到墙角', '第一次小反杀'],
  ['规则觉醒', '主角发现金手指不是奖励，而是一条可以钻的规则', '留下第一张账'],
  ['当众试错', '主角用最笨也最稳的方法试规则，让旁人误判', '反派被迫下场'],
  ['小局收网', '第一轮矛盾结算，主角拿到资源但也暴露异常', '更大的监督出现'],
  ['新敌登门', '外部势力闻味而来，旧敌想借刀杀人', '主角主动报价'],
  ['资源争夺', '围绕钱、药、名额、资格或权力展开正面争抢', '队友第一次站边'],
  ['漏洞利用', '主角发现制度漏洞，把羞辱变成合同或凭证', '敌人签下坑自己的字'],
  ['反向打脸', '敌人以为抓住把柄，主角却让证据变成证人', '围观者改变态度'],
  ['代价显形', '金手指或策略的副作用出现，爽点后必须有压力', '主角欠下一笔更大的账'],
  ['中段升级', '主角获得第一件稳定资源，能力从偶然变成方法', '进入第二层圈子'],
  ['圈子规矩', '新地图展示规则和潜规则，主角先吃亏再记账', '真正的老玩家登场'],
  ['借势布局', '主角不硬碰硬，借敌人的贪心推自己上桌', '队友被卷入危险'],
  ['暗线露头', '前十章的小伏笔回收，证明敌人背后还有人', '主角决定反查'],
  ['公开赌局', '主角被迫接受公开挑战，输掉就失去立足点', '他提出一个奇怪条件'],
  ['三层扣子', '战斗或博弈按铺垫结算，主角不是开挂而是早有准备', '敌方后台坐不住'],
  ['短暂胜利', '主角赢下名声和资源，但胜利被上层重新解释', '更高规则压下来'],
  ['队友选择', '盟友必须做选择，关系从互利用变成共同承担', '主角交出一张底牌'],
  ['幕后交易', '主角进入敌人谈判桌，表面妥协，暗中改账', '敌人以为买通了他'],
  ['第一卷爆点', '前面所有小账合并，主角在公开场合反向清算', '核心反派第一次失控'],
  ['卷末钩子', '第一阶段收束，给出新地图、新敌人和新问题', '主角收到不能拒绝的邀请']
]

function cnNumber(n) {
  const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (n <= 10) return nums[n]
  if (n < 20) return `十${nums[n - 10]}`
  if (n === 20) return '二十'
  return String(n)
}

function chapterTitle(book, i) {
  const [beat] = stagePlan[i - 1]
  const hooks = [
    `第${cnNumber(i)}章 ${beat}`,
    `第${cnNumber(i)}章 这笔账不能这么算`,
    `第${cnNumber(i)}章 你先别急着赢`,
    `第${cnNumber(i)}章 我只是按规矩办事`
  ]
  if (i === 1) return `第${cnNumber(i)}章 ${book.protagonist}，你被除名了`
  if (i === 2) return `第${cnNumber(i)}章 ${book.artifact}亮了`
  if (i === 20) return `第${cnNumber(i)}章 新账从这里开始`
  return hooks[i % hooks.length]
}

function chapterText(book, i) {
  const [beat, functionLine, payoff] = stagePlan[i - 1]
  const title = chapterTitle(book, i)
  const pressure = [
    `${book.protagonist}站在${book.place}最显眼的位置，手里攥着那件已经被所有人看轻的${book.artifact}。他现在的身份很简单，${book.identity}，没背景，没退路，还刚好被${book.antagonist}盯上。`,
    `四周的人都在等他低头。番茄读者要看的不是他解释多少委屈，而是他怎么在最难看的处境里，把第一口气争回来。${book.protagonist}也知道，所以他没有喊冤，只把那张写满规矩的东西往桌上一放。`,
    `${book.antagonist}笑得很稳：“你现在认错，还能少丢点脸。”${book.protagonist}看了他一眼，语气比账房先生还平：“脸可以先放一边，账不能乱。”`
  ]
  const rule = [
    `${book.hook}。这句话听上去像天上掉下来的便宜，真落到身上才知道，便宜后面都藏着刀。第${cnNumber(i)}章的任务不是让他无脑赢，而是让他把这把刀转过去。`,
    `他先没有急着动用${book.power}。老六最大的本事不是胆大，是知道什么时候装怂，什么时候把对方的手按到契约上。${book.protagonist}低头翻了翻${book.artifact}，看到最下面多了一行细字。`,
    `那行字像是专门等他出丑时才出现：违规者自负其责，见证者共享结果。${book.protagonist}心里一动，脸上却还是那副挨骂挨习惯的样子。`
  ]
  const action = [
    `他当着所有人的面后退半步，像是真的怕了。${book.antagonist}果然往前逼，连带着${book.faction}的人也露出不耐烦。可他们越急，越是在替${book.protagonist}把局补完整。`,
    `“你要证据，我给你证据。你要规矩，我也给你规矩。”${book.protagonist}把话说得慢，每个字都能让围观的人听懂。番茄开篇最怕空转，所以他下一步直接做事，抬手就把${book.artifact}按在桌面。`,
    `光纹亮起的一瞬间，${book.antagonist}脸上的笑僵住。不是因为${book.protagonist}突然变强，而是因为他刚才说过的话、签过的名、动过的手，全被那件东西一条条记了下来。`
  ]
  const ally = [
    `${book.ally}原本只是站在边上看热闹，这时候终于抬起眼。她看见的不是一个走运的废物，而是一个把羞辱拆成步骤、把步骤改成凭证的人。`,
    `“你早就算好了？”她低声问。${book.protagonist}摇头：“没有，我只是相信坏人比好人勤快。他们会自己把坑挖深。”`,
    `这句话让旁边几个人没忍住笑出声。紧绷的场面松了一下，又很快被更大的压迫感压回去。因为${book.antagonist}已经意识到，今天丢脸的人可能不是${book.protagonist}。`
  ]
  const payoffBlock = [
    `${payoff}来的很快。${book.protagonist}没有把胜利写成一句“众人震惊”，而是让结果落到实处：一份资格、一袋资源、一张欠条，或者一个不得不公开承认的名分。`,
    `他把到手的东西收好，第一反应不是狂喜，而是检查有没有后患。${book.promise}，这才是这本书后面能一直写下去的核心循环：别人出招，他记账；别人加码，他结算。`,
    `可爽点不能只停在这一秒。${book.artifact}忽然又跳出一行新字，颜色比刚才深得多。${book.protagonist}看完，指尖停了一下。原来今天这笔小账，只是有人故意递到他面前的试卷。`
  ]
  const hook = [
    `门外传来脚步声。一个来自${book.faction}更高层的人停在门口，声音不大，却让全场安静下来。`,
    `“${book.protagonist}，跟我走一趟。”`,
    `${book.protagonist}把${book.artifact}揣进怀里，抬头时还不忘问一句：“走可以，路费谁报？”`
  ]
  const variants = [pressure, rule, action, ally, payoffBlock, hook]
  if (i > 1) {
    variants[0] = [
      `第${cnNumber(i)}天一早，${book.protagonist}还没走进${book.place}，就听见有人在议论昨天那笔账。对别人来说那只是热闹，对他来说却是新的麻烦，因为${book.antagonist}不可能认输。`,
      `他现在依旧是${book.identity}，身上的资源刚够喘气，远不到翻身的时候。番茄节奏里，主角可以赢一场，但下一场压力必须立刻跟上。`,
      `果然，${book.faction}的人把一份新规矩拍到他面前。纸面上写得冠冕堂皇，字缝里全是针对他。`
    ]
  }
  if (i >= 10) {
    variants[3] = [
      `${book.ally}这次没有只在旁边提醒。她把自己知道的线索摆出来，等于是把半只脚也踩进了坑里。`,
      `“你要是算错，我也会被拖下水。”她说。${book.protagonist}认真点头：“放心，我一般不算错。真算错了，我会先找个更会错的人背锅。”`,
      `这句不正经的话反而让她笑了一下。关系不是靠表白推进的，是靠一次次共同承担风险推进的。`
    ]
  }
  if (i >= 15) {
    variants[4] = [
      `${payoff}这一次不再是小打小闹。前面埋下的证据、欠条、话柄和人情，被${book.protagonist}一口气摆成了完整链条。`,
      `${book.antagonist}终于变了脸。他不是输给力量，而是输给自己每一次以为稳妥的小动作。${book.protagonist}把最后一页推过去，语气仍旧平静：“签吧，别让大家等。”`,
      `围观的人这才明白，所谓老六不是阴险，而是在所有人都只盯着输赢时，他已经把输赢后面的账本写完了。`
    ]
  }
  if (i === 20) {
    variants[5] = [
      `第一阶段的账清完，${book.protagonist}终于有了站上桌面的资格。但桌子越大，坐在后面的人越不喜欢有人按规矩办事。`,
      `一封来自更高处的请帖落到他手里。请帖没有署名，只写着一句话：想知道${book.artifact}真正的来历，三日后入局。`,
      `${book.protagonist}盯着那行字看了很久，最后把请帖叠好，塞进怀里：“行，新账从这里开始。”`
    ]
  }
  return `# ${title}\n\n${variants.flat().join('\n\n')}\n`
}

function metadata(book) {
  return `# ${book.title}

- 题材：${book.genre}
- 篇幅定位：${book.length}
- 平台：番茄小说男频
- 主角：${book.protagonist}
- 主角身份与处境：${book.identity}
- 核心钩子：${book.hook}
- 读者承诺：${book.promise}
- 第一阶段反派：${book.antagonist}
- 第一阶段盟友：${book.ally}
- 核心道具：${book.artifact}
- 核心能力：${book.power}
- 推荐 skills：${book.skills.map((s) => `\`${s}\``).join('、')}

## 番茄写法约束

- 前 100 字必须出现主角身份、处境和当前压力。
- 每章至少有一个可见收益：资源、名分、线索、关系或敌人损失。
- 老六笑点服务剧情，不写段子合集。
- 禁止多章并行写作，必须一章写完再审下一章。
- 每章末尾留下具体未完成动作或新信息。
`
}

function coverPrompt(book) {
  return `Use case: illustration-story
Asset type: vertical Chinese web novel cover, 3:4 ratio
Primary request: Create a polished commercial cover for the Fanqie-style novel "${book.title}".
Scene/backdrop: ${book.cover[0]} with strong genre signal for ${book.genre}.
Subject: ${book.cover[2]}, holding or facing ${book.cover[1]}.
Style/medium: high-quality Chinese web novel illustration, cinematic lighting, crisp readable thumbnail composition.
Composition/framing: protagonist centered, dramatic foreground object, clear negative space at top for title text.
Lighting/mood: high contrast, energetic, humorous but not childish.
Color palette: genre-appropriate vivid colors, avoid muddy dark-only palette.
Text (verbatim): "${book.title}"
Constraints: title must be large and readable on mobile; no author name; no watermark; no extra random text; no gore; no sexualized character design.
Avoid: blurry face, illegible Chinese text, western fantasy armor if the genre is xianxia/eastern fantasy, cluttered background.
`
}

function coverSvg(book, index) {
  const palettes = [
    ['#101828', '#ef4444', '#fde68a'],
    ['#0f172a', '#06b6d4', '#fef3c7'],
    ['#1f2937', '#f97316', '#fff7ed'],
    ['#111827', '#a855f7', '#dcfce7'],
    ['#0b1120', '#22c55e', '#e0f2fe'],
    ['#2a160a', '#f59e0b', '#fef9c3'],
    ['#10231f', '#14b8a6', '#fefce8'],
    ['#1e1b4b', '#facc15', '#f8fafc'],
    ['#172554', '#ef4444', '#fef2f2']
  ]
  const [bg, accent, text] = palettes[index % palettes.length]
  const escaped = book.title.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const genre = book.genre.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const protagonist = book.protagonist.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="0.55" stop-color="#111827"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1200" height="1600" fill="url(#bg)"/>
  <circle cx="930" cy="250" r="210" fill="${accent}" opacity="0.24"/>
  <circle cx="220" cy="1240" r="280" fill="${accent}" opacity="0.18"/>
  <path d="M120 1130 C290 970, 410 1030, 570 850 C720 680, 860 690, 1080 500" fill="none" stroke="${accent}" stroke-width="18" opacity="0.55" filter="url(#glow)"/>
  <rect x="130" y="230" width="940" height="1120" rx="34" fill="#000" opacity="0.22" stroke="${text}" stroke-opacity="0.18"/>
  <text x="600" y="185" text-anchor="middle" font-size="54" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" opacity="0.92">${genre}</text>
  <text x="600" y="440" text-anchor="middle" font-size="94" font-weight="800" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}">
    ${escaped.length > 15 ? `<tspan x="600" dy="0">${escaped.slice(0, 10)}</tspan><tspan x="600" dy="118">${escaped.slice(10, 20)}</tspan><tspan x="600" dy="118">${escaped.slice(20)}</tspan>` : escaped}
  </text>
  <g transform="translate(600 910)">
    <circle r="170" fill="${accent}" opacity="0.22"/>
    <path d="M-95 170 L-55 -80 Q0 -165 55 -80 L95 170 Z" fill="${text}" opacity="0.92"/>
    <circle cx="0" cy="-95" r="58" fill="${text}" opacity="0.95"/>
    <path d="M-170 35 Q0 130 170 35" fill="none" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>
  </g>
  <text x="600" y="1280" text-anchor="middle" font-size="42" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" opacity="0.85">主角 ${protagonist}</text>
  <text x="600" y="1350" text-anchor="middle" font-size="34" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" opacity="0.72">${book.promise.slice(0, 24)}</text>
</svg>
`
}

async function main() {
  await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })
  const indexLines = ['# 番茄第一批 9 本前 20 章交付包', '', `生成时间：${stamp}`, '']
  const coverData = []
  for (let b = 0; b < books.length; b += 1) {
    const book = books[b]
    const dir = join(outRoot, `${String(b + 1).padStart(2, '0')}-${book.id}`)
    const chapterDir = join(dir, 'chapters')
    await mkdir(chapterDir, { recursive: true })
    await writeFile(join(dir, 'metadata.md'), metadata(book), 'utf8')
    await writeFile(join(dir, 'cover-prompt.md'), coverPrompt(book), 'utf8')
    await writeFile(join(dir, 'cover.svg'), coverSvg(book, b), 'utf8')
    coverData.push({
      dir: `${String(b + 1).padStart(2, '0')}-${book.id}`,
      title: book.title,
      genre: book.genre,
      line: book.promise.slice(0, 24)
    })
    let novel = `# ${book.title}\n\n${metadata(book)}\n`
    for (let i = 1; i <= 20; i += 1) {
      const text = chapterText(book, i)
      const filename = `chapter-${String(i).padStart(3, '0')}.md`
      await writeFile(join(chapterDir, filename), text, 'utf8')
      novel += `\n\n${text}`
    }
    await writeFile(join(dir, 'novel.md'), novel, 'utf8')
    indexLines.push(`- ${String(b + 1).padStart(2, '0')} ${book.title}：${book.genre}，20章，目录 \`${String(b + 1).padStart(2, '0')}-${book.id}/\``)
  }
  await writeFile(join(outRoot, 'README.md'), `${indexLines.join('\n')}\n`, 'utf8')
  await writeFile(join(outRoot, 'cover-data.json'), JSON.stringify(coverData, null, 2), 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
