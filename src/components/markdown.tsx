// Tiny markdown subset renderer: headings, bold, inline code, bullets, fenced blocks.
// Input is trusted (our own lesson files) but we still escape HTML entities first.
import type { ReactNode } from 'react'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

export function Markdown({ text }: { text: string }): ReactNode {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let list: string[] = []
  let olist: string[] = []
  let para: string[] = []
  let fence: string[] | null = null

  const flushList = () => {
    if (list.length) {
      out.push(<ul key={out.length}>{list.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(li) }} />)}</ul>)
      list = []
    }
    if (olist.length) {
      out.push(<ol key={out.length}>{olist.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(li) }} />)}</ol>)
      olist = []
    }
  }
  const flushPara = () => {
    if (para.length) {
      out.push(<p key={out.length} dangerouslySetInnerHTML={{ __html: inline(para.join(' ')) }} />)
      para = []
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (fence) {
        out.push(<pre key={out.length}><code>{fence.join('\n')}</code></pre>)
        fence = null
      } else {
        flushPara(); flushList(); fence = []
      }
      continue
    }
    if (fence) { fence.push(line); continue }
    if (line.startsWith('## ')) { flushPara(); flushList(); out.push(<h2 key={out.length} dangerouslySetInnerHTML={{ __html: inline(line.slice(3)) }} />); continue }
    if (line.startsWith('- ')) { flushPara(); list.push(line.slice(2)); continue }
    const om = line.match(/^(\d+)\. (.*)$/)
    if (om) { flushPara(); olist.push(om[2]); continue }
    if (line.trim() === '') { flushPara(); flushList(); continue }
    para.push(line)
  }
  flushPara(); flushList()
  return <div className="theory">{out}</div>
}
