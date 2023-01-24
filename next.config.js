/** @type {import('next').NextConfig} */
/*const nextConfig = {
  
  module:{
    rules: [{ test: /\.txt$/, use: 'raw-loader' }]
  }
  
}

module.exports = nextConfig*/


const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
})
 
module.exports = withNextra()