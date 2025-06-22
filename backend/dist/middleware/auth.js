"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
        }
        try {
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const generateToken = (userId) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map