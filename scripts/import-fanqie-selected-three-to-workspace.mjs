import { randomUUID } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const repoRoot = process.cwd()
const sourceRoot = join(repoRoot, 'outputs', 'fanqie-selected-3-refine')
const dbPath = join(process.env.APPDATA ?? '', 'CharacterArc', 'data', 'workspace.db')

const books = [
  {
    dir: '01-07-talking-alchemy-furnace',
    id: 'fanqie-refine-talking-alchemy-furnace',
    title: '炼丹炉成精后，天天举报我偷工减料',
    genre: '东方仙侠',
    novelLength: 'long',
    wordCount: '目标 120-180 万字',
    line: '省料也能省出大道',
    main: ['许长安', '青岚宗外门丹房最底层杂役，背着三个月药渣赔偿债'],
    ally: ['炉小满', '天道质检炉器灵，嘴毒、认真、怕扣绩效'],
    villain: ['韩百草', '外门丹房管事，靠克扣药材供养内门关系'],
    color: '#14b8a6'
  },
  {
    dir: '02-01-life-debt-martial',
    id: 'fanqie-refine-life-debt-martial',
    title: '我靠扣寿命把武学氪成负数',
    genre: '都市高武',
    novelLength: 'long',
    wordCount: '目标 80-150 万字',
    line: '把战斗打成财务审计',
    main: ['陈照夜', '江城第七武中的落榜武科生，筋脉旧伤，被校队要求退考'],
    ally: ['沈青禾', '校医，前武馆医疗组成员，懂禁药和伤势账'],
    villain: ['陆衡', '校队队长，靠武馆资源和禁药维持天才人设'],
    color: '#ef4444'
  },
  {
    dir: '03-05-enemy-first-exp',
    id: 'fanqie-refine-enemy-first-exp',
    title: '杀敌爆经验，但经验先发给敌人',
    genre: '东方玄幻',
    novelLength: 'long',
    wordCount: '目标 100-180 万字',
    line: '你先升级，我不急',
    main: ['秦昼', '青岩城秦家旁支弃子，被推上家族试炼当垫脚石'],
    ally: ['洛梨', '青岩城药铺少女，熟悉丹毒和药性相冲'],
    villain: ['秦骁', '秦家嫡子，靠资源堆出来的试炼第一'],
    color: '#22c55e'
  }
]

function readUtf8(...parts) {
  return readFileSync(join(...parts), 'utf8')
}

function readOptional(...parts) {
  const path = join(...parts)
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

function imageDataUrl(path) {
  if (!existsSync(path)) return ''
  return `data:image/png;base64,${readFileSync(path).toString('base64')}`
}

function extractSummary(markdown) {
  const introMatch = markdown.match(/## 150-250字简介\s+([\s\S]*?)(?=\n## |\n# |$)/)
  if (introMatch) return introMatch[1].trim()
  const firstText = markdown
    .replace(/^# .+$/gm, '')
    .replace(/^## .+$/gm, '')
    .replace(/^- /gm, '')
    .trim()
  return firstText.slice(0, 280)
}

function parseChapterOutlines(markdown) {
  const matches = [...markdown.matchAll(/^##\s+(第[一二三四五六七八九十百\d]+章\s+.+)$/gm)]
  return matches.map((match, index) => {
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? markdown.length
    const block = markdown.slice(start, end)
    const title = match[1].trim()
    const summary = (block.match(/章节功能：(.+)/)?.[1] ?? '').trim()
    const conflict = (block.match(/章末钩子：(.+)/)?.[1] ?? '').trim()
    const gain = (block.match(/本章收益：(.+)/)?.[1] ?? '').trim()
    return {
      title,
      summary,
      conflict: conflict || gain || summary
    }
  })
}

function parseChapterDraft(markdown) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '未命名章节'
  const content = markdown.replace(/^#\s+.+\r?\n+/, '').trim()
  return { title, content }
}

function nowIso() {
  return new Date().toISOString()
}

function projectSkills() {
  return [
    ['fanqie-premise-positioning', '番茄立项定位 Skill', '判断题材、卖点、开篇压力和商业风险。', ['premise']],
    ['fanqie-master-outline', '番茄总纲 Skill', '生成长线主线、阶段反派、爽点循环和卷级推进。', ['outline']],
    ['fanqie-volume-outline', '第一卷卷纲 Skill', '把总纲拆成可连载的第一卷结构。', ['outline']],
    ['fanqie-story-assets', '设定资产 Skill', '沉淀世界观、角色、组织、规则、伏笔账本。', ['setting']],
    ['fanqie-chapter-outline', '章纲 Skill', '一章一个压力、一章一个收益、一章一个钩子。', ['outline', 'draft']],
    ['fanqie-sequential-draft', '逐章正文 Skill', '质量优先，禁止并行多章批量生成。', ['draft']],
    ['fanqie-audit-repair', '审稿修复 Skill', '检查开篇身份处境、钩子、爽点闭环和番茄节奏。', ['draft']],
    ['fanqie-cover-prompt', '封面提示词 Skill', '输出适合后续图片模型生成的封面提示词。', ['premise']]
  ].map(([id, name, description, stageIds]) => ({
    id,
    name,
    path: '',
    scope: 'project',
    description,
    enabled: true,
    stageIds
  }))
}

function assistantTemplates() {
  return [
    {
      id: 'fanqie-next-chapter-quality',
      label: '逐章质量扩写',
      group: 'write',
      prompt: '按番茄男频节奏扩写当前章节：开篇100字内落身份、处境、压力；一章只解决一个核心矛盾；结尾落动作或新信息。',
      mode: 'continue',
      length: 'long',
      task: 'chat',
      requiresSelection: false
    },
    {
      id: 'fanqie-hook-audit',
      label: '章末钩子审稿',
      group: 'rewrite',
      prompt: '检查本章章末是否有强钩子，指出断点太软、总结感太强、信息释放不足的位置，并给出可替换结尾。',
      mode: 'polish',
      length: 'medium',
      task: 'chat',
      requiresSelection: true
    }
  ]
}

function workflowDocs(book, files, timestamp) {
  return [
    ['task_plan', '立项定位', files.premise],
    ['current_status', '总纲', files.masterOutline],
    ['progress', '第一卷卷纲', files.volumeOutline],
    ['novel_setting', '设定资产', files.storyAssets],
    ['character_relationships', '前20章章纲', files.chapterOutlines],
    ['findings', '审稿修复清单', files.audit],
    ['resource_ledger', '封面 AI 提示词', files.coverPrompt],
    ['pending_hooks', '投稿推进说明', `# 投稿推进说明：${book.title}

- 当前已导入平台：立项、总纲、第一卷卷纲、设定资产、前20章章纲、前20章正文草稿、封面提示词。
- 写作规则：质量优先，一次只推进一章，不并行生成多章。
- 目标风格：番茄男频，老六搞笑，强压力开篇，章末钩子。
- 下一步建议：优先精修第1-3章，再决定是否继续扩写到10万字。`]
  ].map(([key, title, content]) => ({
    key,
    title,
    content: String(content ?? '').trim(),
    updatedAt: timestamp
  }))
}

function backupDb() {
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const backupPath = `${dbPath}.codex-backup-${stamp}`
  copyFileSync(dbPath, backupPath)
  return backupPath
}

if (!existsSync(sourceRoot)) {
  throw new Error(`Source output folder not found: ${sourceRoot}`)
}

if (!existsSync(dbPath)) {
  throw new Error(`Workspace database not found: ${dbPath}`)
}

const backupPath = backupDb()
const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON')

const deleteTables = [
  'story_character_state',
  'story_foreshadowing',
  'story_relationships',
  'story_timeline',
  'story_world_rules',
  'story_countdown_clocks',
  'story_embeddings',
  'assistant_sessions',
  'plot_threads',
  'workflow_documents',
  'ai_runs',
  'chapter_versions',
  'chapters',
  'outline_items',
  'outline_volumes',
  'inspiration_entries',
  'organization_memberships',
  'character_relationships',
  'organizations',
  'characters',
  'worldview_entries'
]

const insertProject = db.prepare(`
  INSERT INTO projects (
    id, title, genre, novel_length, word_count, last_edited, cover, target_platform,
    cover_history_json, reference_works_json, writing_style_preset_id, writing_style_prompt,
    novel_workflow_stages_json, project_skills_json, chapter_assistant_templates_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    genre = excluded.genre,
    novel_length = excluded.novel_length,
    word_count = excluded.word_count,
    last_edited = excluded.last_edited,
    cover = excluded.cover,
    target_platform = excluded.target_platform,
    cover_history_json = excluded.cover_history_json,
    reference_works_json = excluded.reference_works_json,
    writing_style_preset_id = excluded.writing_style_preset_id,
    writing_style_prompt = excluded.writing_style_prompt,
    novel_workflow_stages_json = excluded.novel_workflow_stages_json,
    project_skills_json = excluded.project_skills_json,
    chapter_assistant_templates_json = excluded.chapter_assistant_templates_json
`)

const insertVolume = db.prepare(`
  INSERT INTO outline_volumes (id, project_id, title, word_target, summary, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertOutline = db.prepare(`
  INSERT INTO outline_items (id, project_id, volume_id, title, word_target, conflict, summary, status, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertChapter = db.prepare(`
  INSERT INTO chapters (id, project_id, volume_id, outline_item_id, title, summary, status, word_target, content, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertVersion = db.prepare(`
  INSERT INTO chapter_versions (id, project_id, chapter_id, title, summary, status, word_target, content, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertWorldview = db.prepare(`
  INSERT INTO worldview_entries (id, project_id, type, title, content, sort_order, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertCharacter = db.prepare(`
  INSERT INTO characters (id, project_id, name, role, description, avatar, tags_json)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const insertInspiration = db.prepare(`
  INSERT INTO inspiration_entries (id, project_id, type, title, content, tags_json, source, sort_order, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertWorkflow = db.prepare(`
  INSERT INTO workflow_documents (id, project_id, volume_id, doc_key, title, content, updated_at, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertAssistantSession = db.prepare(`
  INSERT INTO assistant_sessions (id, project_id, title, messages_json, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

db.exec('BEGIN')
try {
  for (const book of books) {
    for (const table of deleteTables) {
      db.prepare(`DELETE FROM ${table} WHERE project_id = ?`).run(book.id)
    }

    const dir = join(sourceRoot, book.dir)
    const timestamp = nowIso()
    const files = {
      premise: readUtf8(dir, '01-premise.md'),
      masterOutline: readUtf8(dir, '02-master-outline.md'),
      volumeOutline: readUtf8(dir, '03-volume-01-outline.md'),
      storyAssets: readUtf8(dir, '04-story-assets.md'),
      chapterOutlines: readUtf8(dir, '05-chapter-outlines.md'),
      expanded20: readUtf8(dir, '06-expanded-20-chapters.md'),
      audit: readUtf8(dir, '07-audit-repair-checklist.md'),
      coverPrompt: readOptional(dir, 'cover-ai-prompt.md')
    }

    const cover = imageDataUrl(join(dir, 'cover.png')) || `linear-gradient(135deg, ${book.color} 0%, #111827 100%)`
    const volumeId = `${book.id}-volume-01`
    const summary = extractSummary(files.premise)
    const stages = [
      { id: 'reference', status: 'done' },
      { id: 'premise', status: 'done' },
      { id: 'setting', status: 'done' },
      { id: 'outline', status: 'done' },
      { id: 'draft', status: 'doing' }
    ]

    insertProject.run(
      book.id,
      book.title,
      book.genre,
      book.novelLength,
      book.wordCount,
      timestamp,
      cover,
      '番茄小说',
      JSON.stringify([
        {
          id: `${book.id}-cover-local`,
          createdAt: timestamp,
          cover,
          promptTitle: `${book.title} 封面提示词`,
          prompt: files.coverPrompt,
          summary: book.line,
          keywords: [book.genre, '番茄小说', '老六搞笑'],
          genre: book.genre,
          targetPlatform: '番茄小说',
          authorName: '',
          extraNotes: '本地版式草稿，正式精绘需接入图片模型。'
        }
      ]),
      '[]',
      'cinematic-cool',
      '番茄男频节奏：开篇强压力、身份处境前置、每章一个核心矛盾、章末必须落到动作或新信息。保留老六搞笑，但笑点必须推动局势。',
      JSON.stringify(stages),
      JSON.stringify(projectSkills()),
      JSON.stringify(assistantTemplates())
    )

    insertVolume.run(volumeId, book.id, '第一卷', '目标 20-30 万字', files.volumeOutline.slice(0, 800), 0)

    const outlines = parseChapterOutlines(files.chapterOutlines)
    for (let i = 0; i < 20; i++) {
      const chapterPath = join(dir, 'chapters-expanded', `chapter-${String(i + 1).padStart(3, '0')}.md`)
      const draft = parseChapterDraft(readFileSync(chapterPath, 'utf8'))
      const outline = outlines[i] ?? { title: draft.title, summary: '', conflict: '' }
      const outlineId = `${book.id}-outline-${String(i + 1).padStart(3, '0')}`
      const chapterId = `${book.id}-chapter-${String(i + 1).padStart(3, '0')}`
      const chapterTitle = draft.title || outline.title
      const chapterSummary = outline.summary || draft.content.slice(0, 180)

      insertOutline.run(
        outlineId,
        book.id,
        volumeId,
        outline.title || chapterTitle,
        '3000-4000字',
        outline.conflict || chapterSummary,
        chapterSummary,
        i < 20 ? 'drafting' : 'planned',
        i
      )
      insertChapter.run(
        chapterId,
        book.id,
        volumeId,
        outlineId,
        chapterTitle,
        chapterSummary,
        'draft',
        '3000-4000字',
        draft.content,
        i
      )
      insertVersion.run(
        `${chapterId}-import-${randomUUID()}`,
        book.id,
        chapterId,
        chapterTitle,
        chapterSummary,
        'draft',
        '3000-4000字',
        draft.content,
        timestamp
      )
    }

    const worldviewEntries = [
      ['core-premise', '核心卖点', summary],
      ['rules', '核心规则与爽点循环', files.premise],
      ['story-assets', '设定资产', files.storyAssets]
    ]
    worldviewEntries.forEach(([suffix, title, content], index) => {
      insertWorldview.run(
        `${book.id}-world-${suffix}`,
        book.id,
        index === 0 ? 'premise' : 'rule',
        title,
        content,
        index,
        timestamp,
        timestamp
      )
    })

    const characters = [
      [book.main[0], '主角', book.main[1], ['主角', '老六', '底层逆袭']],
      [book.ally[0], '盟友', book.ally[1], ['盟友', '专业辅助', '吐槽位']],
      [book.villain[0], '第一阶段反派', book.villain[1], ['反派', '压迫者', '第一卷']]
    ]
    characters.forEach(([name, role, description, tags]) => {
      insertCharacter.run(
        `${book.id}-char-${String(name).toLowerCase()}`,
        book.id,
        name,
        role,
        description,
        '',
        JSON.stringify(tags.map((label) => ({ label })))
      )
    })

    const inspirations = [
      ['卖点', book.line, summary, ['卖点', '投稿']],
      ['写法规则', '番茄章节节奏', '开篇100字内交代身份、处境、压力；每章要有明确收益；章末不能总结，要落到动作或新信息。', ['番茄', '节奏']],
      ['质量规则', '逐章生成', '禁止并行多章跑正文。每章按章纲、设定资产、上一章状态逐章生成、审稿、修复。', ['质量优先', '流程']]
    ]
    inspirations.forEach(([type, title, content, tags], index) => {
      insertInspiration.run(
        `${book.id}-idea-${index + 1}`,
        book.id,
        type,
        title,
        content,
        JSON.stringify(tags),
        'ai',
        index,
        timestamp,
        timestamp
      )
    })

    workflowDocs(book, files, timestamp).forEach((doc, index) => {
      insertWorkflow.run(
        `${book.id}-${volumeId}-${doc.key}`,
        book.id,
        volumeId,
        doc.key,
        doc.title,
        doc.content,
        doc.updatedAt,
        index
      )
    })

    insertAssistantSession.run(
      `${book.id}-assistant-import-session`,
      book.id,
      '导入说明',
      JSON.stringify({
        messages: [
          {
            id: `${book.id}-assistant-import-message`,
            role: 'assistant',
            content: `已从 outputs/fanqie-selected-3-refine 导入《${book.title}》：立项、总纲、第一卷卷纲、设定资产、前20章章纲、前20章正文草稿、审稿清单和封面提示词。`,
            turns: [],
            toolCalls: [],
            editEvents: []
          }
        ],
        proposal: null,
        lastProposalPrompt: '',
        lastAssistantReply: '',
        orchestrator: null,
        active: true
      }),
      timestamp,
      timestamp
    )
  }

  db.prepare(`UPDATE app_settings SET selected_project_id = ? WHERE id = 1`).run(books[0].id)
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
} finally {
  db.close()
}

console.log(JSON.stringify({
  importedProjects: books.map((book) => ({ id: book.id, title: book.title })),
  chapters: books.length * 20,
  backupPath,
  dbPath
}, null, 2))
