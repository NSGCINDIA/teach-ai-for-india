'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link2, Image as ImageIcon,
  Table, Code, Loader2, AlertCircle, Eye, PenTool
} from 'lucide-react'
import { saveBlog, type BlogActionState } from '@/actions/blogs'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BlogItem } from '@/lib/data/blogs'

const sanitizeImageUrl = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

const CATEGORIES = [
  'School Visit',
  'Volunteer Story',
  'Student Story',
  'AI Awareness',
  'Workshop',
  'Event',
  'Campus Update',
  'Community Impact',
  'Success Story'
]

function sanitizeUrl(url: string): string {
  if (!url) return '#'
  const trimmed = url.trim()
  if (!trimmed) return '#'
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed

  try {
    const parsed = new URL(trimmed, 'https://localhost')
    const protocol = parsed.protocol.toLowerCase()
    const allowed = ['http:', 'https:', 'mailto:', 'tel:']
    return allowed.includes(protocol) ? trimmed : '#'
  } catch {
    return '#'
  }
}

// Simple Markdown to HTML parser for the Preview tab
function renderMarkdown(md: string): string {
  if (!md) return ''
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Blockquotes
  html = html.replace(/^&gt;\s+(.*)$/gm, '<blockquote class="border-l-4 border-brand bg-brand/5 p-4 my-4 rounded-r-xl italic font-medium text-foreground">$1</blockquote>')

  // Headings
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-3xl font-display font-extrabold text-foreground mt-6 mb-3">$1</h1>')
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-2.5xl font-display font-bold text-foreground mt-5 mb-2.5">$1</h2>')
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-xl font-display font-bold text-foreground mt-4 mb-2">$1</h3>')

  // Lists
  html = html.replace(/^\*\s+(.*)$/gm, '<li class="list-disc ml-6 leading-relaxed">$1</li>')
  html = html.replace(/^-\s+(.*)$/gm, '<li class="list-disc ml-6 leading-relaxed">$1</li>')
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<li class="list-decimal ml-6 leading-relaxed">$1</li>')

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_, alt, src) => `<img src="${sanitizeUrl(src)}" alt="${alt}" class="my-6 rounded-2xl max-h-[360px] w-full object-cover shadow-soft" />`)

  // Links
  html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, text, href) => `<a href="${sanitizeUrl(href)}" class="text-brand hover:text-brand-orange hover:underline font-semibold" target="_blank" rel="noopener noreferrer">${text}</a>`)

  // Code
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-xl overflow-x-auto my-4 font-mono text-xs text-foreground shadow-inner">$1</pre>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-0.5 rounded font-mono text-xs text-brand">$1</code>')

  // Paragraph splitting
  const blocks = html.split('\n\n')
  return blocks
    .map((b) => {
      const trimmed = b.trim()
      if (!trimmed) return ''
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('<img')
      ) {
        return trimmed
      }
      return `<p class="leading-relaxed mb-4 text-muted-foreground">${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('')
}

export function BlogEditor({ blog }: { blog?: BlogItem }) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<BlogActionState>({})

  // Form fields state
  const [title, setTitle] = useState(blog?.title ?? '')
  const [summary, setSummary] = useState(blog?.summary ?? '')
  const [content, setContent] = useState(blog?.content ?? '')
  const [coverImage, setCoverImage] = useState(blog?.cover_image ?? '')
  const [category, setCategory] = useState(blog?.category ?? CATEGORIES[0])
  const [tags, setTags] = useState(blog?.tags.join(', ') ?? '')

  // SEO fields state
  const [seoTitle, setSeoTitle] = useState(blog?.seo_title ?? '')
  const [metaDescription, setMetaDescription] = useState(blog?.meta_description ?? '')
  const [keywords, setKeywords] = useState(blog?.keywords.join(', ') ?? '')
  const [ogImage, setOgImage] = useState(blog?.og_image ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(blog?.canonical_url ?? '')

  // UI state
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [uploading, setUploading] = useState(false)

  // Markdown formatting action helper
  function insertFormatting(type: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)

    let replacement = ''
    switch (type) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selected || 'italic text'}*`
        break
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`
        break
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`
        break
      case 'bullet':
        replacement = `\n- ${selected || 'List item'}\n`
        break
      case 'ordered':
        replacement = `\n1. ${selected || 'List item'}\n`
        break
      case 'quote':
        replacement = `\n> ${selected || 'Quote'}\n`
        break
      case 'link':
        replacement = `[${selected || 'Link text'}](https://example.com)`
        break
      case 'image':
        replacement = `![${selected || 'Image alt'}](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe)`
        break
      case 'table':
        replacement = `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`
        break
      case 'code':
        replacement = selected.includes('\n') ? `\n\`\`\`\n${selected || '// code block'}\n\`\`\`\n` : `\`${selected || 'code'}\``
        break
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end)
    setContent(newContent)
    textarea.value = newContent
    textarea.focus()

    // Reset cursor position
    setTimeout(() => {
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  // Cover image storage upload handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setState({})

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().substring(0, 8) : Date.now().toString(36)
      const filename = `blogs/${Date.now()}-${randomId}.${ext}`

      const { data, error } = await supabase.storage.from('public-assets').upload(filename, file)
      if (error) throw error

      const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(data.path)
      setCoverImage(urlData.publicUrl)
      if (!ogImage) setOgImage(urlData.publicUrl) // Fallback SEO image
    } catch (err: any) {
      setState({ error: err.message || 'Image upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  // Word count & read time calculations
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  // Form submission dispatcher
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState({})

    const fd = new FormData(e.currentTarget)
    fd.append('content', content)
    fd.append('cover_image', coverImage)
    fd.append('og_image', ogImage)
    
    startTransition(async () => {
      const res = await saveBlog({}, fd)
      if (res?.error) {
        setState({ error: res.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {state.error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="size-5 shrink-0" /> {state.error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Left Side: Metadata & SEO Inputs */}
        <div className="space-y-6 md:col-span-1 border-r border-border/40 pr-6">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className="border-input h-10 w-full rounded-xl border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/50 dark:bg-input/20"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Hyderabad, AI workshop, coding" className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cover_image_file">Cover Image</Label>
            {coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-2 border border-border">
                <img src={sanitizeImageUrl(coverImage)} alt="Cover Preview" className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="cover_image_file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="file:bg-brand/10 file:text-brand file:border-0 file:rounded-lg file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-brand/20 h-10 rounded-xl cursor-pointer"
              />
              {uploading && <Loader2 className="size-5 animate-spin self-center shrink-0 text-brand" />}
            </div>
            <Input
              name="cover_image"
              value={coverImage}
              onChange={(e) => setCoverImage(sanitizeImageUrl(e.target.value))}
              placeholder="Or paste an image URL..."
              className="mt-2 text-xs rounded-xl"
            />
          </div>

          {/* SEO Block */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <Eye className="size-4 text-brand" /> SEO Meta Info
            </h4>
            <div className="space-y-1.5">
              <Label htmlFor="seo_title" className="text-xs">SEO Title (optional)</Label>
              <Input id="seo_title" name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO friendly title" className="text-xs h-9 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_description" className="text-xs">Meta Description (optional)</Label>
              <Textarea id="meta_description" name="meta_description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Brief summary shown in search results..." className="text-xs rounded-xl h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keywords" className="text-xs">Keywords (comma separated)</Label>
              <Input id="keywords" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="SEO keywords" className="text-xs h-9 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="canonical_url" className="text-xs">Canonical URL (optional)</Label>
              <Input id="canonical_url" name="canonical_url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://..." className="text-xs h-9 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Side: Title, Summary, & Article Body Editor */}
        <div className="space-y-6 md:col-span-2 text-left">
          {blog?.id && <input type="hidden" name="id" value={blog.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-base font-bold">Article Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!seoTitle) setSeoTitle(e.target.value)
              }}
              required
              placeholder="e.g. Coding with AI at Warangal High School"
              className="h-12 text-lg font-bold rounded-xl border-neutral-300 focus-visible:border-brand"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Brief Excerpt/Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value)
                if (!metaDescription) setMetaDescription(e.target.value)
              }}
              required
              placeholder="A short hook summarizing what this story is about..."
              className="h-20 rounded-xl resize-none border-neutral-300"
            />
          </div>

          {/* Tab buttons */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 border-b-2 text-sm font-semibold flex items-center gap-1.5 ${
                activeTab === 'write' ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenTool className="size-4" /> Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 border-b-2 text-sm font-semibold flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="size-4" /> Preview ({wordCount} words, {readTime}m read)
            </button>
          </div>

          {activeTab === 'write' ? (
            <div className="space-y-2">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/65 border border-border rounded-xl">
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('bold')} title="Bold" className="size-8"><Bold className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('italic')} title="Italic" className="size-8"><Italic className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('h1')} title="Heading 1" className="size-8"><Heading1 className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('h2')} title="Heading 2" className="size-8"><Heading2 className="size-4" /></Button>
                <div className="h-6 w-px bg-border/60 mx-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('bullet')} title="Bullet List" className="size-8"><List className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('ordered')} title="Numbered List" className="size-8"><ListOrdered className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('quote')} title="Quote" className="size-8"><Quote className="size-4" /></Button>
                <div className="h-6 w-px bg-border/60 mx-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('link')} title="Insert Link" className="size-8"><Link2 className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('image')} title="Insert Image Link" className="size-8"><ImageIcon className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('table')} title="Insert Table template" className="size-8"><Table className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting('code')} title="Code" className="size-8"><Code className="size-4" /></Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Write your article body in Markdown here..."
                className="min-h-[350px] font-sans text-sm rounded-xl p-4 focus-visible:border-brand"
              />
            </div>
          ) : (
            <div className="border border-border/80 rounded-2xl p-6 md:p-8 bg-card/40 min-h-[400px] prose dark:prose-invert max-w-none shadow-soft">
              {coverImage && (
                <div className="aspect-[21/9] w-full rounded-xl overflow-hidden mb-6 bg-muted shadow-soft">
                  <img src={sanitizeImageUrl(coverImage)} alt="Cover Preview" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="text-xs font-bold text-brand uppercase tracking-wider mb-2">{category}</div>
              <h1 className="font-display font-extrabold text-2.5xl text-foreground leading-tight">{title || 'Untitled Article'}</h1>
              <p className="text-sm italic font-medium text-muted-foreground my-4 leading-relaxed pl-3 border-l-2 border-border">{summary || 'No summary provided.'}</p>
              <div 
                className="mt-6 text-sm text-foreground/90 space-y-4"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '_Write some content to see preview here_') }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/blogs')}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || uploading || !title.trim() || !content.trim()}
              className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl"
            >
              {isPending && <Loader2 className="size-4 animate-spin shrink-0" />}
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
