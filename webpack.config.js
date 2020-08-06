const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const { execSync } = require("child_process");

module.exports = (_, args) => {
    const mode = args.mode || "development";
    const PUBLIC_PATH = process.env.PUBLIC_PATH || "/";
    const GIT_HASH =
        process.env.GIT_HASH || execSync("git rev-parse HEAD").toString().replace(/\s/g, "");
    const TIMESTAMP = new Date().toUTCString();

    const isDevMode = mode === "development";

    console.log("Mode:        ", mode);
    console.log("Public Path: ", PUBLIC_PATH);
    console.log("Git Hash:    ", GIT_HASH);
    console.log("Timestamp:   ", TIMESTAMP);

    const plugins = [
        new HtmlWebpackPlugin({ template: "./src/index.html" }),
        new ForkTsCheckerPlugin(),
        new MiniCssExtractPlugin({
            filename: isDevMode ? "[name].css" : "[name].[hash].css",
            chunkFilename: isDevMode ? "[id].css" : "[id].[hash].css",
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(mode),
            "process.env.DEBUG": JSON.stringify(isDevMode),
            "process.env.GIT_HASH": JSON.stringify(GIT_HASH),
            "process.env.TIMESTAMP": JSON.stringify(TIMESTAMP),
        }),
    ];

    const alias = {};
    const optimization = {
        splitChunks: {
            chunks: "all",
        },
    };

    if (isDevMode) {
        plugins.push(
            new BundleAnalyzerPlugin({
                openAnalyzer: false,
            })
        );
        alias["react-dom"] = "@hot-loader/react-dom";
    } else {
        plugins.push(
            new BundleAnalyzerPlugin({
                openAnalyzer: false,
                analyzerMode: "static",
            })
        );
    }

    const styleLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {
            esModule: true,
            hmr: isDevMode,
        },
    };

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
                        styleLoader,
                        // Translates CSS into CommonJS
                        "css-loader",
                    ],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        styleLoader,
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
            filename: isDevMode ? "[name].bundle.js" : "[name].[contenthash].bundle.js",
            chunkFilename: isDevMode ? "[name].bundle.js" : "[name].[contenthash].bundle.js",
            path: path.resolve(__dirname, "dist"),
            publicPath: PUBLIC_PATH,
        },
        watchOptions: {
            ignored: /node_modules/,
        },
        plugins,
    };
};
