import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
    {
        ignores: ["dist", ".eslintrc.cjs", "node_modules"],
    },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
            parser: typescriptParser,
            parserOptions: {
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "react": react,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                },
            ],
            "react-refresh/only-export-components": [
                "warn",
                {
                    "allowConstantExport": true,
                },
            ],
            ...reactHooks.configs.recommended.rules,
        },
    },
];
