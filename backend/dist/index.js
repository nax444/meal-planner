"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const error_1 = require("./middleware/error");
const auth_1 = __importDefault(require("./routes/auth"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const mealPlans_1 = __importDefault(require("./routes/mealPlans"));
(0, config_1.validateEnv)();
const app = (0, express_1.default)();
console.log('Connecting to MongoDB...');
mongoose_1.default
    .connect(config_1.config.mongoUri, config_1.dbOptions)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.default)(config_1.config.rateLimit);
app.use(limiter);
app.use('/api/auth', auth_1.default);
app.use('/api/recipes', recipes_1.default);
app.use('/api/meal-plans', mealPlans_1.default);
app.use(error_1.notFound);
app.use(error_1.errorHandler);
const PORT = config_1.config.port;
console.log(`Attempting to start server on port ${PORT}...`);
app.listen(PORT, () => {
    console.log(`Server running in ${config_1.config.nodeEnv} mode on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map