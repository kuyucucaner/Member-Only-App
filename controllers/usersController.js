const authService = require('../services/authService');
const { check, validationResult } = require('express-validator');
const UsersModel = require('../models/usersModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');


const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        // SMTP ayarlarınızı buraya ekleyin
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'tahacanokuyucu@gmail.com',
            pass: 'yjvroxdsrqokigmz',
        },
    });

    try {
        const info = await transporter.sendMail({
            from: 'tahacanokuyucu@gmail.com',
            to,
            subject,
            text,
        });

        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


const usersController = {
    postCreateUserController: [
        check('email')
            .isEmail()
            .withMessage('Invalid email format.')
            .custom(async (value) => {
                const isEmailExists = await authService.getUserByEmail(value);
                if (isEmailExists) {
                    throw new Error('E-mail already in use');
                }
            }),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),

        async function (req, res) {
            // Hataları kontrol et
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const secretCode = await UsersModel.createUser({ ...req.body });
                if (secretCode) {
                    const userEmail = req.body.email;
                    const emailSubject = 'Üyelik Onayı';
                    const emailText = `Üyeliğinizi onaylamak için aşağıdaki kodu kullanın: ${secretCode}`;

                    await sendEmail(userEmail, emailSubject, emailText);
                    res.redirect('/joinclub');
                } else {
                    console.log('Kullanıcı oluşturma hatası! SecretCode alınamadı.');
                    res.status(500).send('Kullanıcı Oluşturma Hatası!');
                }
            } catch (error) {
                console.log('Kullanıcı oluşturma hatası!', error);
                res.status(500).send('Kullanıcı Oluşturma Hatası!');
            }
        }
    ],
    joinClub: [
        check('email').isEmail().withMessage('Invalid email format.'),
        check('secretCode').notEmpty().withMessage('Secret code is required.'),
        async function (req, res) {
            // Hataları kontrol et
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const { email, secretCode } = req.body;
                await UsersModel.updateMembershipStatus(email, secretCode);
                console.log(`Üyelik onaylandı for user with email ${email}`);
                res.redirect('/')
            } catch (error) {
                console.log('Üyelik onaylama hatası!', error);
                res.status(500).send('Üyelik onaylama hatası!');
            }
        }
    ],
 
};

module.exports = {
    usersController
};