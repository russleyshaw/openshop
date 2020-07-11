const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require("path");

module.exports = (_, args) => {
    const mode = args.mode || "development";
    const isDevMode = mode === "development";

    console.log("Mode: ", mode);

    const plugins = [
        new HtmlWebpackPlugin({ template: "./src/index.html" }),
        new ForkTsCheckerPlugin(),
        new MiniCssExtractPlugin(),
    ];

    const alias = {};
    const optimization = {
        splitChunks: {
            chunks: "all",
        },
    };

    if (isDevMode) {
        plugins.push(new BundleAnalyzerPlugin());
        alias["react-dom"] = "@hot-loader/react-dom";
    } else {
        plugins.push(
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
            })
        );
    }

    return {
        mode,
        entry: {
            index: "./src/index.tsx",
        },
        optimization,
        module: {
            rules: [
                {
                    test: /\.(j|t)sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                        },
                    },
                },
                {
                    test: /\.(png|jpg|gif|svg|ttf|eot)$/i,
                    use: "file-loader",
                },
                {
                    test: /(woff|woff2)/i,
                    use: "url-loader",
                },
                {
                    exclude: /node_modules/,
                    test: /\.glsl$/i,
                    use: "raw-loader",
                },
                {
                    test: /\.css$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: true,
                            },
                        },
                        // Translates CSS into CommonJS
                        "css-loader",
                    ],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: true,
                            },
                        },
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },
            ],
        },
        devtool: isDevMode ? "eval-source-map" : "none",
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
            alias,
        },
        output: {
            filename: "[name].bundle.js",
            chunkFilename: "[name].bundle.js",
            path: path.resolve(__dirname, "dist"),
        },
        watchOptions: {
            ignored: /node_modules/,
        },
        plugins,
    };
};
