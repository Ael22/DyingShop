module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "prefer-arrow-callback": "off",
    "prefer-destructuring": "warn",
    "object-shorthand": "warn",
    "func-names": "off",
    "no-param-reassign": "off",
    "no-undef": "off",
  },
};
