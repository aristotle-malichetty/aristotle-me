import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'aristotle.me' },
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        date: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        url: fields.url({ label: 'Live URL' }),
        github: fields.url({ label: 'GitHub URL' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/projects',
          publicPath: '/images/projects/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Live', value: 'live' },
            { label: 'Building', value: 'building' },
            { label: 'Idea', value: 'idea' },
          ],
          defaultValue: 'idea',
        }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: 'Site Settings',
      path: 'src/content/settings',
      schema: {
        siteName: fields.text({ label: 'Site Name', defaultValue: 'aristotle.me' }),
        siteDescription: fields.text({
          label: 'Site Description',
          multiline: true,
          defaultValue: 'Marketing Analyst, SaaS Builder, and AI-Powered Developer',
        }),
        socialLinks: fields.object({
          github: fields.url({ label: 'GitHub' }),
          linkedin: fields.url({ label: 'LinkedIn' }),
          twitter: fields.url({ label: 'X / Twitter' }),
          email: fields.text({ label: 'Email' }),
        }, { label: 'Social Links' }),
      },
    }),
  },
});
