module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-proposal-private-property-in-object',
  ],
}
