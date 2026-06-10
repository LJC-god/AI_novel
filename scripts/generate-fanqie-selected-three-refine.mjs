import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const outRoot = join(process.cwd(), 'outputs', 'fanqie-selected-3-refine')
const stamp = '2026-06-10T00:00:00.000Z'

const books = [
  {
    rank: 1,
    id: '07-talking-alchemy-furnace',
    title: '炼丹炉成精后，天天举报我偷工减料',
    genre: '东方仙侠 / 丹道爽文 / 老六喜剧',
    targetWords: '120-180万字',
    protagonist: '许长安',
    identity: '青岚宗外门丹房最底层杂役，背着三个月药渣赔偿债',
    openingPressure: '宗门丹考当天，他被管事韩百草安排最差药材，还被迫替内门弟子背锅。',
    hook: '会说话的炼丹炉绑定天道质检，天天举报许长安偷工减料，却让他看见丹方成本、药性浪费和天道判定漏洞。',
    promise: '炼丹像做账，省料也能省出大道。每卷都用丹道规则漏洞反杀压迫者。',
    shortHook: '穷丹徒被炼丹炉举报，反靠质检漏洞炼出神丹。',
    synopsis: '青岚宗杂役许长安在丹考前夜被迫接手一批废药材，原以为必被逐出宗门，却唤醒了一尊嘴毒炼丹炉。丹炉绑定天道质检，专门举报他偷工减料。可许长安很快发现，所谓质检只判结果不管过程，少放药不是错，浪费药才是错。从穷鬼版破境丹开始，他一边被丹炉骂，一边用最低成本撬开宗门丹道垄断。',
    firstAlly: '炉小满，天道质检炉器灵，嘴毒、认真、怕扣绩效',
    firstVillain: '韩百草，外门丹房管事，靠克扣药材供养内门关系',
    secondVillain: '方执玉，内门丹道天才，想把许长安的低成本丹方据为己有',
    faction: '青岚宗丹房',
    object: '天道质检炉',
    systemRule: '丹药合格只看药性闭环、杂质阈值和因果标记，不按传统丹方用量判定。',
    comedyLine: '炉小满负责举报，许长安负责把举报改成验收报告。',
    coverLine: '省料也能省出大道',
    palette: ['#10231f', '#14b8a6', '#fefce8'],
    volumeOne: {
      title: '第一卷：穷鬼丹徒',
      words: '约18-24万字',
      goal: '许长安从丹房杂役变成被外门承认的低成本丹师，拿到参加青岚丹会的资格。',
      conflict: '韩百草要把废药材和炸炉责任推给许长安，内门丹道势力则想夺走天道质检炉。',
      ending: '许长安用三张丹方账本反查丹房黑账，逼韩百草当众认罚，但内门派来真正的丹道天才方执玉。'
    },
    chapters: [
      ['丹考废料', '许长安被安排最差药材，身份、债务和被逐风险同时压下。', '炼丹炉第一次开口举报。', '丹炉喊出“少放三味药”。'],
      ['穷鬼破境丹', '许长安顺着举报反推药性闭环，用废料炼出可用丹。', '拿到留在丹房的资格。', '韩百草要求复验。'],
      ['质检不管配方', '许长安发现天道质检只看结果，传统丹方存在浪费。', '掌握第一条省料规则。', '炉小满要求上报违规。'],
      ['复验局', '韩百草设复验陷阱，要证明许长安作弊。', '许长安让复验变成韩百草药材克扣证据。', '内门弟子旁听。'],
      ['药渣也算药', '许长安回收药渣炼清气丸，激怒丹房老人。', '赚到第一笔灵石。', '有人高价收购药渣。'],
      ['炉小满扣绩效', '器灵担心许长安乱来导致自己被天道扣分。', '两人建立互坑合作。', '天道质检出现隐藏评分。'],
      ['丹房黑账', '许长安发现药材损耗账长期异常。', '拿到韩百草克扣线索。', '韩百草派人搜炉。'],
      ['搜炉搜出账', '韩百草搜查许长安，反被丹炉记录违规动作。', '许长安获得公开申辩权。', '申辩地点定在外门广场。'],
      ['广场验丹', '许长安当众炼低成本补气丹，围观者质疑。', '低价丹救下受伤弟子，口碑反转。', '方执玉第一次注意他。'],
      ['内门借炉', '内门以借用名义索要炼丹炉。', '许长安用质检规程拖延。', '炉小满检测到内门丹毒。'],
      ['丹毒案', '一批内门丹药出现隐性丹毒，韩百草想甩锅。', '许长安证明丹毒来自偷换主药。', '线索指向方执玉身边人。'],
      ['省料不是偷料', '许长安提出“省料丹方”标准，和丹房旧规冲突。', '得到外门弟子支持。', '韩百草启动逐出流程。'],
      ['逐出令', '许长安被限期交出丹炉，否则逐出宗门。', '他反向申请天道质检复核。', '复核需要三炉连成。'],
      ['三炉连成', '许长安连续三炉低成本成丹，体力和灵力见底。', '完成复核第一关。', '第三炉出现未知金纹。'],
      ['金纹丹', '金纹丹引来执法堂，所有人以为许长安私炼禁丹。', '许长安证明金纹是药性节余。', '方执玉公开邀战。'],
      ['丹道邀战', '方执玉要求比拼同题炼丹，赌炉和丹方。', '许长安被迫接战。', '赌约写入天道质检。'],
      ['赌约暗扣', '许长安发现赌约里有夺炉陷阱。', '炉小满主动提供质检漏洞。', '两人第一次真正互信。'],
      ['低火慢炼', '许长安用最慢火候拖垮方执玉的名贵药材。', '方执玉丹药过补反成废丹。', '韩百草急着改账。'],
      ['黑账上墙', '许长安把丹房损耗账和丹方浪费一起公布。', '韩百草当众失控。', '执法堂要求彻查丹房。'],
      ['丹会请帖', '许长安保住丹炉和资格，拿到青岚丹会请帖。', '第一卷阶段目标完成。', '请帖背面写着炉小满的旧编号。']
    ]
  },
  {
    rank: 2,
    id: '01-life-debt-martial',
    title: '我靠扣寿命把武学氪成负数',
    genre: '都市高武 / 规则爽文 / 财务老六',
    targetWords: '120-180万字',
    protagonist: '陈照夜',
    identity: '江城第七武中的落榜武科生，筋脉旧伤，被校队要求退考',
    openingPressure: '武考模拟当天，校队队长陆衡当众拿出退考协议，逼他承认自己拖累班级。',
    hook: '寿命抵扣系统会把敌人的违规代价算进账户，陈照夜能把羞辱、暗算、违规药剂变成欠费武学的燃料。',
    promise: '用财务审计的方式打穿高武世界。别人练武靠资源，他练武靠让敌人违规。',
    shortHook: '落榜武科生被逼退考，反把敌人的违规代价扣成自己的武学燃料。',
    synopsis: '江城第七武中落榜生陈照夜筋脉受损，被校队逼着签退考协议。绝境里，他觉醒寿命抵扣系统，却发现系统真正的用法不是氪自己的命，而是审计敌人的违规代价。陆衡暗中用禁药、武馆联盟操纵名额、秘境公司偷换规则，每一笔账都能被陈照夜记下。于是他从最差考生开始，把高武世界打成一场公开审计。',
    firstAlly: '沈青禾，校医，前武馆医疗组成员，懂禁药和伤势账',
    firstVillain: '陆衡，校队队长，靠武馆资源和禁药维持天才人设',
    secondVillain: '赵文极，江城武馆联盟审查员，负责压下禁药案',
    faction: '江城武馆联盟',
    object: '寿命账单',
    systemRule: '违规、压迫、暗算造成的代价可记入账单；只要证据链完整，就能抵扣武学消耗。',
    comedyLine: '陈照夜开打前先问能不能开发票，打完还要对方签收。',
    coverLine: '把战斗打成财务审计',
    palette: ['#101828', '#ef4444', '#fde68a'],
    volumeOne: {
      title: '第一卷：退考协议',
      words: '约20-25万字',
      goal: '陈照夜从被逼退考的落榜生，变成江城武考重点观察对象。',
      conflict: '陆衡和武馆联盟要把禁药、名额黑幕和筋脉旧伤责任压到陈照夜身上。',
      ending: '陈照夜在模拟武考直播里打穿陆衡，公开禁药账单，却被武馆联盟列为异常审查对象。'
    },
    chapters: [
      ['退考协议', '陆衡当众逼陈照夜签字退考，主角身份和旧伤立住。', '寿命账单出现。', '协议变成第一张违规凭证。'],
      ['欠费武学', '陈照夜发现能用敌人违规代价抵扣武学消耗。', '打出第一拳。', '校方要求复查。'],
      ['校医账本', '沈青禾检查旧伤，发现伤势像禁药后遗症。', '得到禁药线索。', '陆衡派人拿走病历。'],
      ['病历丢失', '病历被偷，陈照夜反用监控盲区做局。', '找回证据碎片。', '武馆联盟介入。'],
      ['模拟考名额', '陆衡用校队名额压人。', '陈照夜申请最低档公开挑战。', '挑战被安排在直播区。'],
      ['开发票吗', '陈照夜用老六话术激陆衡违规出手。', '账单累积代价。', '陆衡第一次破防。'],
      ['禁药气味', '沈青禾闻出陆衡护腕上的禁药味。', '确认敌方作弊。', '禁药供应来自武馆。'],
      ['低阶拳法', '陈照夜选择最基础拳法，避免暴露系统。', '基础拳法打出异常效率。', '赵文极注意到他。'],
      ['直播挑战', '全校围观，陆衡准备让他残废。', '陈照夜公开接招。', '账单提示证据链不足。'],
      ['补证据', '陈照夜故意挨一击，让禁药反应进入检测流程。', '证据链补全。', '沈青禾被停职威胁。'],
      ['审查员到场', '赵文极要压下直播事故。', '陈照夜要求按武考条例复核。', '复核条件苛刻。'],
      ['三项复核', '力量、耐力、实战三项复核同时开启。', '陈照夜过第一项。', '寿命账单出现负数额度。'],
      ['负数额度', '陈照夜发现额度越负，武学越猛但结算越危险。', '掌握短时爆发。', '身体出现反噬。'],
      ['沈青禾站边', '沈青禾冒险交出禁药初检记录。', '两人形成盟友关系。', '武馆联盟封锁记录。'],
      ['直播断线', '关键复核时直播被切。', '陈照夜用账单回放逼恢复信号。', '陆衡后台暴露。'],
      ['陆衡上场', '陆衡亲自下场，带着最后一支禁药。', '陈照夜诱他当众注射。', '全场安静。'],
      ['账单结算', '禁药、退考协议、病历丢失合并结算。', '陈照夜打穿陆衡防线。', '赵文极启动异常审查。'],
      ['异常学生', '校方想保护陈照夜又怕联盟。', '陈照夜拿到武考候补资格。', '联盟要求他交出账单能力。'],
      ['公开审计', '陈照夜把所有证据交给直播备份。', '陆衡人设崩塌。', '背后武馆露出名字。'],
      ['秘境邀请', '陈照夜通过模拟考，收到秘境试训邀请。', '第一卷阶段目标完成。', '邀请方正是陆衡背后的武馆。']
    ]
  },
  {
    rank: 3,
    id: '05-enemy-first-exp',
    title: '杀敌爆经验，但经验先发给敌人',
    genre: '东方玄幻 / 极道升级 / 规则智斗',
    targetWords: '150-220万字',
    protagonist: '秦昼',
    identity: '青岩城秦家旁支弃子，被推上家族试炼当垫脚石',
    openingPressure: '家族试炼开始前，嫡子秦骁要用他立威，还逼他签生死约。',
    hook: '杀敌爆经验系统会先把经验临时发给敌人，让敌人临战突破；秦昼必须提前布置，让敌人突破后反噬、自爆、欠债。',
    promise: '每一场越级战都是三层布局和清楚结算。敌人越升级，死得越精准。',
    shortHook: '杀敌经验先发给敌人，主角靠布局让敌人突破后反噬。',
    synopsis: '秦家旁支秦昼被推入家族试炼，原以为觉醒杀敌爆经验系统就能翻身，没想到经验会先发给敌人。敌人越打越强，旁人都以为他死定了。秦昼却发现，临时突破会放大旧伤、丹毒、誓约和地形缺陷。于是他从一个被踩的弃子，变成专门给敌人“送升级”的布局者。',
    firstAlly: '洛梨，青岩城药铺少女，熟悉丹毒和药性相冲',
    firstVillain: '秦骁，秦家嫡子，靠资源堆出来的试炼第一',
    secondVillain: '秦奉山，秦家执事，负责操纵试炼排名',
    faction: '青岩秦家',
    object: '经验回收印',
    systemRule: '目标获得临时经验后会突破，但突破会放大身体、誓约、药性、地形中的隐患；目标死亡后经验回收。',
    comedyLine: '秦昼最喜欢对敌人说：你先升级，我不急。',
    coverLine: '你先升级，我不急',
    palette: ['#0b1120', '#22c55e', '#e0f2fe'],
    volumeOne: {
      title: '第一卷：试炼弃子',
      words: '约22-28万字',
      goal: '秦昼从旁支弃子变成秦家试炼第一，拿到进入青岩秘境的资格。',
      conflict: '秦骁和执事秦奉山操纵试炼，要让秦昼死在规则内。',
      ending: '秦昼利用三场反向突破局打穿试炼，拿到资格，但秦家老祖发现经验回收印来自禁地。'
    },
    chapters: [
      ['生死约', '秦骁逼秦昼签生死约，旁支身份和死局立住。', '经验回收印觉醒。', '敌人先升一级。'],
      ['敌人突破了', '秦昼发现经验先发给敌人，局面更危险。', '看见突破反噬。', '秦骁要追加赌注。'],
      ['旧伤放大', '秦昼利用敌人旧伤，让突破变成破绽。', '赢下第一场。', '执事怀疑他作弊。'],
      ['药铺少女', '秦昼找洛梨验证丹毒和突破关系。', '得到药性相冲知识。', '洛梨被秦家盯上。'],
      ['第二场试炼', '秦家安排更强对手。', '秦昼提前改地形。', '敌人突破踩中阵眼。'],
      ['你先升级', '秦昼故意激怒对手，让经验提前爆发。', '形成标志性打法。', '秦骁下场观战。'],
      ['执事改规则', '秦奉山临时改试炼规则，压缩秦昼准备时间。', '秦昼用规则漏洞保留资格。', '生死约升级。'],
      ['丹毒陷阱', '秦骁暗中下药。', '秦昼反借丹毒让对手突破失衡。', '洛梨暴露帮忙痕迹。'],
      ['旁支围攻', '旁支被逼与秦昼划清界限。', '秦昼用胜利换回旁支名额。', '家族舆论反转。'],
      ['经验欠债', '秦昼发现临时经验不是白给，敌人会欠系统债。', '掌握第二条规则。', '欠债可转移。'],
      ['转移账', '秦奉山试图把失败责任转给秦昼。', '秦昼把经验债转回操纵者。', '执事第一次失态。'],
      ['青岩矿洞', '试炼进入矿洞地图。', '秦昼利用矿脉震动放大突破。', '秦骁准备亲自杀他。'],
      ['三层扣子', '秦昼布置地形、丹毒、誓约三层局。', '秦骁踏入第一层。', '系统提示目标过强。'],
      ['临阵破境', '秦骁获得大量临时经验，境界暴涨。', '秦昼被压到绝境。', '洛梨送来解毒针。'],
      ['反噬开始', '秦骁突破越高，丹毒越深。', '秦昼撑过最危险一轮。', '秦奉山切断退路。'],
      ['生死约回收', '秦昼用生死约文字漏洞反制。', '秦骁被自己的约束锁住。', '全场看见执事动手。'],
      ['执事违规', '秦奉山违规救秦骁。', '经验债扩大到执事身上。', '秦昼获得双目标回收机会。'],
      ['一印双收', '秦昼同时结算秦骁和执事的经验债。', '境界稳定提升。', '秦家高层震动。'],
      ['试炼第一', '秦昼拿到试炼第一和秘境资格。', '旁支重新站到他身后。', '秦骁没有死，反被带走。'],
      ['禁地来历', '秦家老祖召见秦昼。', '第一卷阶段目标完成。', '经验回收印被认出来自禁地。']
    ]
  }
]

function n(i) {
  const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (i <= 10) return nums[i]
  if (i < 20) return `十${nums[i - 10]}`
  if (i === 20) return '二十'
  return String(i)
}

function mdList(items) {
  return items.map((item) => `- ${item}`).join('\n')
}

function premise(book) {
  return `# 立项定位：${book.title}

## 核心判断

- 推荐优先级：第 ${book.rank} 本
- 题材：${book.genre}
- 目标篇幅：${book.targetWords}
- 目标平台：番茄小说男频
- 30字卖点：${book.shortHook}
- 读者承诺：${book.promise}

## 主角身份与开篇处境

${book.protagonist}是${book.identity}。开篇压力不是抽象的“他很惨”，而是具体事件：${book.openingPressure}

## 一句话钩子

${book.hook}

## 150-250字简介

${book.synopsis}

## 可持续爽点循环

1. 敌人用资源、规则或身份压人。
2. ${book.protagonist}不直接硬刚，先让敌人把动作做满。
3. ${book.object}记录或触发规则。
4. 主角用规则漏洞结算敌人的违规、浪费或反噬。
5. 收益落到实处：资格、资源、名声、线索、盟友。
6. 新敌人发现主角异常，下一章压力升级。

## 风险与修正

- 风险：规则爽文容易解释过多。
- 修正：每章只解释一个新规则，其余用行动证明。
- 风险：老六笑点变成段子。
- 修正：笑点必须改变局势、诱导敌人犯错或推进关系。
- 风险：开篇设定堆积。
- 修正：前3章只围绕一个公开事件写，不扩散大世界。
`
}

function masterOutline(book) {
  return `# 总纲：${book.title}

## 全书主线

${book.protagonist}从${book.identity}起步，依靠${book.object}和“${book.systemRule}”这条核心规则，在一次次被压迫、被审查、被夺取中反向结算敌人，最终从底层小人物走到规则制定者的位置。

## 五卷规划

### 第一卷：${book.volumeOne.title}

- 字数：${book.volumeOne.words}
- 目标：${book.volumeOne.goal}
- 核心冲突：${book.volumeOne.conflict}
- 卷末爆点：${book.volumeOne.ending}

### 第二卷：规则入城

- 字数：约25-35万字
- 目标：主角进入更大的城市/宗门/秘境平台，规则从小圈子扩展到行业秩序。
- 核心冲突：第一卷反派背后的利益链开始围剿主角。
- 卷末爆点：主角第一次主动设计行业级规则结算。

### 第三卷：天才局

- 字数：约30-40万字
- 目标：主角对上真正的天才和老牌强者，不能只靠信息差。
- 核心冲突：对手开始研究主角规则，制造反制方案。
- 卷末爆点：主角付出真实代价，换来规则升级。

### 第四卷：旧账翻出

- 字数：约30-40万字
- 目标：揭开${book.object}来历，发现主角当前能力只是旧时代规则碎片。
- 核心冲突：主角必须在个人收益和重写秩序之间选择。
- 卷末爆点：盟友被卷入主线代价，关系完成质变。

### 第五卷：我来定规矩

- 字数：约35-50万字
- 目标：主角从利用规则的人，变成制定新规则的人。
- 核心冲突：最终敌人掌握旧秩序解释权。
- 完结承诺：主角用全书积累的账、证据、丹方、经验或因果，完成最终公开清算。

## 情绪主轴

- 前期：憋屈反杀，读者先代入处境，再得到明确爽点。
- 中期：规则扩张，读者期待主角如何钻漏洞。
- 后期：秩序对抗，读者期待主角不只赢一场，而是改掉整套欺负人的规矩。
`
}

function volumeOutline(book) {
  return `# 第一卷卷纲：${book.volumeOne.title}

- 卷目标：${book.volumeOne.goal}
- 卷冲突：${book.volumeOne.conflict}
- 卷末落点：${book.volumeOne.ending}

## 起承转合

### 起：公开羞辱与规则觉醒（1-4章）

主角在公开场合被压迫，身份、处境、敌人和金手指同时立住。重点是让读者在前三章知道：主角弱，但脑子清楚；敌人强，但动作不干净。

### 承：小收益变成小名声（5-10章）

主角用第一条规则连续赢小局，收益从“活下来”变成“有人开始信他”。盟友从旁观变成协助。

### 转：敌人开始研究主角（11-16章）

敌人不再轻敌，开始用制度、赌约、复核或试炼规则围堵主角。主角必须用第二条规则证明自己不是撞运气。

### 合：公开清算与新地图（17-20章）

主角把前面的小证据合并成大账，完成第一阶段公开反杀，拿到进入下一阶段的资格，同时暴露${book.object}更深来历。

## 第一卷必须守住的硬约束

- 每章结尾必须留下具体钩子。
- 不提前展开最终世界观。
- ${book.firstVillain}不能纯蠢，他必须每次都有合理利益诉求。
- ${book.firstAlly}不能无条件倒贴，必须因主角行动逐步改变态度。
`
}

function assets(book) {
  return `# 设定资产：${book.title}

## 主角

- 姓名：${book.protagonist}
- 身份：${book.identity}
- 表层目标：先保住资格、活路和基本资源。
- 深层目标：证明底层不是只能被规则吃掉，也可以学会使用规则。
- 行动风格：先示弱，后取证；先让敌人动手，再把动作变成账。
- 喜剧口吻：${book.comedyLine}

## 盟友

- ${book.firstAlly}
- 功能：提供专业知识、情绪反应和风险提醒。
- 关系弧：旁观 -> 怀疑 -> 合作 -> 共同承担。

## 第一阶段反派

- ${book.firstVillain}
- 诉求：保住既得利益和权威。
- 弱点：习惯用身份压人，动作会留下痕迹。
- 不能写法：不能无脑送，必须每次都认为自己在按旧规则办事。

## 第二阶段反派

- ${book.secondVillain}
- 功能：告诉读者第一卷不是终点，主角只是刚摸到更大体系。

## 核心规则

${book.systemRule}

## 伏笔账本

- 伏笔1：${book.object}不是普通金手指，来自更高层旧秩序。
- 伏笔2：第一阶段反派只是执行者，真正受益者在第二卷出现。
- 伏笔3：盟友掌握的专业知识会在卷末救主角一次。
- 伏笔4：主角每次钻漏洞都会累积长期代价。
`
}

function chapterOutlines(book) {
  const lines = [`# 前20章章纲：${book.title}`, '']
  book.chapters.forEach((ch, idx) => {
    const i = idx + 1
    lines.push(`## 第${n(i)}章 ${ch[0]}`)
    lines.push('')
    lines.push(`- 章节功能：${ch[1]}`)
    lines.push(`- 本章收益：${ch[2]}`)
    lines.push(`- 章末钩子：${ch[3]}`)
    lines.push(`- 审稿重点：开篇100字内必须有身份/处境/压力；结尾不能总结，必须落到动作或新信息。`)
    lines.push('')
  })
  return lines.join('\n')
}

function shortName(value) {
  return String(value).split(/[，,]/)[0].trim()
}

function expandedChapter(book, idx) {
  const i = idx + 1
  const [title, functionLine, payoff, cliff] = book.chapters[idx]
  const previous = i === 1 ? '' : `上一章留下的麻烦没有消失，反而换了个更硬的壳。`
  const nextVillain = i >= 11 ? book.secondVillain : book.firstVillain
  const nextVillainName = shortName(nextVillain)
  const firstAllyName = shortName(book.firstAlly)
  const escalation = i >= 15 ? '这一次不是小局，前面埋下的证据、话柄和人情都会被一起摆上桌。' : '这一局还不大，但足够让围观的人改变态度。'
  const relation = i >= 12 ? `${firstAllyName}没有再站在安全的位置提醒，而是把自己也押进了局里。` : `${firstAllyName}站在边上，最初只是冷眼看着，后来眼神慢慢变了。`

  return `# 第${n(i)}章 ${title}

${book.protagonist}${i === 1 ? `站在${book.identity.includes('丹房') ? '青岚宗外门丹房' : book.identity.includes('武科') ? '江城第七武中的模拟考场' : '青岩城秦家演武场'}最显眼的位置，身上的处境比脚下的地面还硬。${book.identity}，这就是别人给他的标签。${book.openingPressure}` : `一进场就知道，${previous}${nextVillainName}没有打算给他喘气的机会。`}

四周的人都在等他低头。番茄开篇不能靠解释撑住，必须让压力落到实处。今天压在他面前的不是一句嘲笑，而是一份规矩、一场考核、一个赌约，或者一只已经伸到他脖子上的手。

${nextVillainName}看他的眼神很稳，稳得像已经提前写好了结果。

“你现在认错，还能少丢点脸。”对方说。

${book.protagonist}没有急着反驳。他最清楚，底层人最没用的动作就是解释。解释给强者听，强者只会嫌你吵；解释给围观者听，围观者只会等你更丢脸。

所以他先看了一眼${book.object}。

${book.hook}这不是一句天上掉馅饼的好话。真正落到身上时，它更像一把刀。刀柄在他手里，刀刃也贴着他的掌心。用得好，能割开死局；用不好，第一个流血的人就是他自己。

第${n(i)}章的局很清楚：${functionLine}

${book.protagonist}先退了一步。

这一退，周围立刻响起几声低笑。有人觉得他怂，有人觉得他终于认命。${nextVillainName}也往前逼了半步，像是怕他跑了。

可${book.protagonist}要的就是这半步。

老六不是上来就阴人。真正稳的老六，会先让对方把姿势摆满，把话说死，把手伸出来，再轻轻把那只手按进墨泥里。

“规矩是你定的？”${book.protagonist}问。

${nextVillainName}皱眉：“当然。”

“见证人在场？”

“都在。”

“那就好。”${book.protagonist}抬起头，声音不高，却足够让前排的人听清，“别一会儿输了，又说我不讲规矩。”

这句话一出，笑声停了一下。

${firstAllyName}也在这时看了过来。${relation}

${book.object}轻轻一震，像是把刚才所有声音都收进了看不见的账页里。${book.protagonist}看见第一行提示亮起，心里反而定了。

规则没有直接给他胜利。规则只给了他一把尺。

尺子能量人，也能量鬼。

${nextVillainName}开始动手。动作很快，压迫感也足。按常理，${book.protagonist}这种处境根本接不住。围观的人甚至已经准备好了惊呼，只等他被打倒、被赶走、被定罪，或者被迫把最后一点尊严交出去。

可他没有硬接。

他先让。

让第一招，是为了看对方用什么路数。让第二招，是为了让${book.object}记录完整。让第三招，是为了让对方以为自己已经赢了。

到第四招时，${book.protagonist}终于开口：“够了。”

${nextVillainName}冷笑：“你说够就够？”

“不是我说够。”${book.protagonist}把${book.object}往前一放，“是账够了。”

光纹亮起来的瞬间，场边有人下意识往后退。不是因为光有多强，而是因为那光把刚才发生过的每一个细节都照了出来。说过的话，动过的手，藏过的小动作，临时改过的规矩，全都一条条浮在众人眼前。

${book.protagonist}没有喊“看吧”。他只是把最关键的一条点出来。

“这里。”他说，“你自己签的。”

${nextVillainName}脸色第一次变了。

这就是爽点落地的地方。不是众人震惊四个字，也不是主角忽然无敌，而是敌人亲手写下的东西反过来砸到敌人脸上。

${escalation}

${firstAllyName}低声问：“你早就算好了？”

${book.protagonist}摇头：“没有。我只是相信，占便宜的人一定比吃亏的人更勤快。他们会自己把坑挖深。”

这句话不算正经，却让紧绷的场面松了一瞬。

但下一瞬，压力又回来了。

${nextVillainName}当然不肯认。他换了一种说法，试图把问题从事实拖回身份，从证据拖回权威。这是强者最常用的手段。规矩对他有利时，他讲规矩；规矩开始反咬他时，他就说你不配讲规矩。

${book.protagonist}等的就是这句话。

“我配不配不重要。”他说，“你刚才让大家做见证，现在大家已经看见了。”

人群里终于有人开始小声议论。

第一个人说得很轻，第二个人就敢说得稍微重一点。等第三个人开口，局势就不再完全由${nextVillainName}控制。

${payoff}

收益必须落在手里。${book.protagonist}没有把它当成天降好运，而是当场确认、收好、留底。资格也好，资源也好，线索也好，盟友的信任也好，只要没有落到纸面或行动上，就不算真正赢。

${firstAllyName}这次没有再提醒他停手。

她看着${book.protagonist}把东西收好，忽然说：“你这样，会被更高的人盯上。”

${book.protagonist}把${book.object}揣回去，笑了一下：“那说明我站得比刚才高了一点。”

这句话刚落，门外或者人群后方传来新的声音。

不是${nextVillainName}。

是更高一层的人。

那人没有急着进来，只把一份新的文书、请帖、复核令或试炼牌丢到众人面前。纸面很干净，字也很少，可每个字都比刚才那一局更沉。

${book.protagonist}低头看完，指尖停了一下。

${cliff}

他把东西收进怀里，抬头时语气仍旧平稳。

“行。”他说，“新账从这里开始。”
`
}

function audit(book) {
  const lines = [`# 审稿与修复清单：${book.title}`, '']
  lines.push('## 全局问题')
  lines.push('')
  lines.push(mdList([
    '第一版批量稿存在结构相似问题，精修版已为每本重建规则、反派诉求和第一卷目标。',
    '正式投稿前仍需逐章人工审读，重点检查同义句反复和解释性段落过长。',
    '每章扩写稿已保留番茄开篇压力、可见收益、章末钩子，但还需要按目标字数继续加场景细节。'
  ]))
  lines.push('')
  lines.push('## 逐章检查项')
  book.chapters.forEach((ch, idx) => {
    lines.push(`- 第${n(idx + 1)}章：检查“${ch[1]}”是否在前半章完成；确认收益为“${ch[2]}”；结尾必须落到“${ch[3]}”。`)
  })
  lines.push('')
  lines.push('## 下一轮修复优先级')
  lines.push('')
  lines.push(mdList([
    '先精修第1-3章，确保主角身份、处境、金手指和第一反杀足够清楚。',
    '再精修第8-10章，确保小高潮能给读者追读理由。',
    '最后精修第17-20章，确保第一卷阶段性结算和新地图钩子成立。'
  ]))
  return lines.join('\n')
}

function coverPrompt(book) {
  return `# AI精绘封面Prompt：${book.title}

Use case: illustration-story
Asset type: vertical Chinese web novel cover, 3:4 ratio, mobile thumbnail readable
Primary request: Create a polished commercial cover for the Fanqie-style male-frequency novel "${book.title}".
Scene/backdrop: high-energy ${book.genre} scene.
Subject: ${book.protagonist}, a clever underdog protagonist, holding or facing ${book.object}.
Core visual metaphor: ${book.coverLine}.
Style/medium: premium Chinese web novel illustration, cinematic lighting, sharp focal subject, dynamic but clean composition.
Composition/framing: protagonist centered, ${book.object} as glowing foreground element, clear title space at top.
Text (verbatim): "${book.title}"
Mood: clever, rebellious, humorous, high-stakes.
Constraints: title must be large and readable on mobile; no author name; no watermark; no random extra text; no gore; no sexualized design.
Avoid: western fantasy armor, unreadable Chinese text, cluttered background, generic stock-photo look.
`
}

function coverSvg(book) {
  const [bg, accent, text] = book.palette
  const escape = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const title = escape(book.title)
  const genre = escape(book.genre.split('/')[0].trim())
  const line = escape(book.coverLine)
  const titleParts = title.length > 10
    ? `<tspan x="600" dy="0">${title.slice(0, 10)}</tspan><tspan x="600" dy="110">${title.slice(10, 20)}</tspan><tspan x="600" dy="110">${title.slice(20)}</tspan>`
    : title
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="0.62" stop-color="#111827"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1600" fill="url(#bg)"/>
  <circle cx="915" cy="260" r="235" fill="${accent}" opacity="0.26"/>
  <circle cx="200" cy="1300" r="300" fill="${accent}" opacity="0.18"/>
  <rect x="100" y="230" width="1000" height="1130" fill="#000" opacity="0.22" stroke="${text}" stroke-opacity="0.2" stroke-width="3"/>
  <text x="600" y="170" text-anchor="middle" font-size="54" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" font-weight="800">${genre}</text>
  <text x="600" y="410" text-anchor="middle" font-size="86" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" font-weight="900">${titleParts}</text>
  <path d="M130 1120 C320 900, 530 970, 720 750 C860 590, 980 530, 1080 420" fill="none" stroke="${accent}" stroke-width="20" stroke-linecap="round" opacity="0.85"/>
  <g transform="translate(600 950)">
    <circle r="190" fill="${accent}" opacity="0.42"/>
    <path d="M-115 185 L-62 -80 Q0 -175 62 -80 L115 185 Z" fill="${text}" opacity="0.94"/>
    <circle cx="0" cy="-95" r="62" fill="${text}" opacity="0.98"/>
  </g>
  <text x="600" y="1285" text-anchor="middle" font-size="42" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}">${line}</text>
  <text x="600" y="1395" text-anchor="middle" font-size="34" font-family="Microsoft YaHei, SimHei, sans-serif" fill="${text}" opacity="0.78">投稿推进版 · 前20章</text>
</svg>
`
}

async function writeBook(book, indexLines, coverData) {
  const dir = join(outRoot, `${String(book.rank).padStart(2, '0')}-${book.id}`)
  const chapterDir = join(dir, 'chapters-expanded')
  await mkdir(chapterDir, { recursive: true })
  await writeFile(join(dir, '01-premise.md'), premise(book), 'utf8')
  await writeFile(join(dir, '02-master-outline.md'), masterOutline(book), 'utf8')
  await writeFile(join(dir, '03-volume-01-outline.md'), volumeOutline(book), 'utf8')
  await writeFile(join(dir, '04-story-assets.md'), assets(book), 'utf8')
  await writeFile(join(dir, '05-chapter-outlines.md'), chapterOutlines(book), 'utf8')
  await writeFile(join(dir, '07-audit-repair-checklist.md'), audit(book), 'utf8')
  await writeFile(join(dir, 'cover-ai-prompt.md'), coverPrompt(book), 'utf8')
  await writeFile(join(dir, 'cover.svg'), coverSvg(book), 'utf8')

  let combined = `# ${book.title}\n\n> 投稿推进版前20章扩写稿。当前为第一轮扩写，后续应逐章继续审稿修复。\n\n`
  book.chapters.forEach((_, idx) => {
    const content = expandedChapter(book, idx)
    combined += `${content}\n\n`
  })
  for (let i = 0; i < book.chapters.length; i += 1) {
    await writeFile(join(chapterDir, `chapter-${String(i + 1).padStart(3, '0')}.md`), expandedChapter(book, i), 'utf8')
  }
  await writeFile(join(dir, '06-expanded-20-chapters.md'), combined, 'utf8')
  indexLines.push(`- ${book.rank}. ${book.title}：${book.genre}，目录 \`${String(book.rank).padStart(2, '0')}-${book.id}/\``)
  coverData.push({
    dir: `${String(book.rank).padStart(2, '0')}-${book.id}`,
    title: book.title,
    genre: book.genre.split('/')[0].trim(),
    line: book.coverLine,
    palette: book.palette
  })
}

async function main() {
  await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })
  const indexLines = [
    '# 番茄投稿推进版：三本优先精修',
    '',
    `生成时间：${stamp}`,
    '',
    '## 选择结果',
    '',
    '选择三本：07 炼丹炉、01 寿命账单高武、05 经验先发给敌人。',
    '',
    '选择理由：规则清晰、爽点循环稳定、适合 AI 后续按章拆写；三者分别覆盖仙侠炼丹、都市高武、玄幻极道，方便比较市场反馈。',
    '',
    '## 目录',
    ''
  ]
  const coverData = []
  for (const book of books) {
    await writeBook(book, indexLines, coverData)
  }
  indexLines.push('', '## 质量状态', '', '本目录是投稿推进版第一轮：已重做立项、总纲、第一卷卷纲、设定资产、前20章章纲、前20章扩写稿和审稿清单。正式投稿前仍建议逐章扩到目标字数并做人工终审。')
  await writeFile(join(outRoot, 'README.md'), `${indexLines.join('\n')}\n`, 'utf8')
  await writeFile(join(outRoot, 'cover-data.json'), JSON.stringify(coverData, null, 2), 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
