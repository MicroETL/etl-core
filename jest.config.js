module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    },
    moduleFileExtensions: [
        "ts",
        "js",
        "json"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/test/**/*.spec.(ts|js)"
    ],
    testEnvironment: "node",
    setupFiles: [
        "jest-date-mock"
    ],
    moduleNameMapper: {
        "@/(.*)": "<rootDir>/src/$1",
        "@adapters/(.*)": "<rootDir>/src/adapters/$1",
        "@usecases/(.*)": "<rootDir>/src/usecases/$1"
    }
};
