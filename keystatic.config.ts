import { config, fields, collection } from '@keystatic/core';

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
          directory: 'src/assets/images/blog',
          publicPath: '../../assets/images/blog/',
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/blog',
              publicPath: '../../assets/images/blog/',
            },
          },
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
          directory: 'src/assets/images/projects',
          publicPath: '../../assets/images/projects/',
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
});
