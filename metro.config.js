const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require("nativewind/metro");

const dirname = __dirname;

module.exports = (() => {
    const config = getDefaultConfig(dirname, {
        isCSSEnabled: true,
    });

    const { transformer, resolver } = config;

    // Configure SVG and CSS support
    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg", "css"],
    };

    // Integrate NativeWind
    return withNativeWind(config, {
        input: path.resolve(dirname, "global.css"),
    });
})();
