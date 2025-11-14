import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  astro: true,
  // ADD THE 'ignores' PROPERTY HERE
  ignores: [
    'src/content/blog/**', // This ignores all files and subdirectories inside src/content/blog
  ],
  formatters: {
    astro: true,
    css: true,
  },
})
