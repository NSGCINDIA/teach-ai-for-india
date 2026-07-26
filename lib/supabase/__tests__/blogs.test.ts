import { test } from 'node:test'
import assert from 'node:assert'
import { upsertBlogSchema, reviewBlogSchema } from '../../validations/blogs'

test('upsertBlogSchema - validates valid blog drafts', () => {
  const payload = {
    title: 'A Valid Blog Title',
    summary: 'This is a valid summary of the impact story we are testing.',
    content: 'This is the main body of our story, long enough to pass validation.',
    category: 'School Visit',
    tags: 'one, two, three',
    seo_title: 'Valid SEO Title',
    meta_description: 'Valid SEO meta description text.',
    keywords: 'key1, key2',
  }

  const result = upsertBlogSchema.safeParse(payload)
  assert.ok(result.success, result.success ? '' : result.error.message)
  
  if (result.success) {
    assert.deepStrictEqual(result.data.tags, ['one', 'two', 'three'])
    assert.deepStrictEqual(result.data.keywords, ['key1', 'key2'])
    assert.strictEqual(result.data.title, 'A Valid Blog Title')
  }
})

test('upsertBlogSchema - fails when required fields are missing or invalid', () => {
  const payload = {
    title: 'Ab', // too short
    summary: 'Short', // too short
    content: '', // empty
    category: '', // empty
  }

  const result = upsertBlogSchema.safeParse(payload)
  assert.ok(!result.success)
  
  if (!result.success) {
    const issues = result.error.issues.map(i => i.path[0])
    assert.ok(issues.includes('title'))
    assert.ok(issues.includes('summary'))
    assert.ok(issues.includes('content'))
    assert.ok(issues.includes('category'))
  }
})

test('reviewBlogSchema - validates correct review actions', () => {
  const payload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'rejected',
    rejected_reason: 'Please add more images of the classroom visit.',
  }

  const result = reviewBlogSchema.safeParse(payload)
  assert.ok(result.success)
  if (result.success) {
    assert.strictEqual(result.data.status, 'rejected')
    assert.strictEqual(result.data.rejected_reason, 'Please add more images of the classroom visit.')
  }
})
