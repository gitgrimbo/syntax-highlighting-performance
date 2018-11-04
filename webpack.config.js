const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: ["@babel/polyfill", "whatwg-fetch", "./src/main.js"],
    iframe: ["@babel/polyfill", "whatwg-fetch", "./src/iframe.js"],
  },
  output: {
    publicPath: "/web/dist/",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "web", "dist"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 1,
      name: "common",
      cacheGroups: {
        vendors: {
          test: /STOP_AUTOMATIC_ADDITION_OF_NODE_MODULES_IN_COMMON_CHUNK/,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {
                "targets": {
                  "ie": "11"
                },
              }],
            ],
          },
        },
      },
    ],
  },
};
