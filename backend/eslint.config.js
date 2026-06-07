module.exports = [
  {
    files: ["src/**/*.js"],
    ignores: ["src/__tests__/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
    }
  },
  {
    files: ["src/__tests__/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        it: "readonly",
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
    }
  },
  {
    ignores: ["node_modules/**", "coverage/**"]
  }
];