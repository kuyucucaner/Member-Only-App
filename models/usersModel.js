const connect = require('../dbConfig');
const sql = require('mssql');
const authService = require('../services/authService');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const generateRandomCode = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};

const User = {
    createUser: async function (user) {
        try {
            const secretCode = generateRandomCode(); // Benzersiz kod oluştur
            // const hashedSecretCode = bcrypt.hashSync(secretCode , saltRounds);
            const hashedPassword =  bcrypt.hashSync(user.password, saltRounds); // Hash the password

            const pool = await sql.connect(connect);
            const result = await pool.request()
                .input('firstName', sql.NVarChar, user.firstName)
                .input('lastName', sql.NVarChar, user.lastName)
                .input('email', sql.NVarChar, user.email)
                .input('password', sql.NVarChar, hashedPassword)
                .input('secretCode', sql.NVarChar, secretCode) // hashlenmiş secretCode'u ekleyin
                .input('isAdmin' ,sql.Bit, user.isAdmin)
                .query('INSERT INTO Users (FirstName, LastName, Email, Password, SecretCode ,IsAdmin) VALUES (@firstName, @lastName, @email, @password, @secretCode , @isAdmin)');
                console.log("Create User Result : ",result);
            sql.close();

                return secretCode; // Oluşturulan secretCode'u geri döndür

        } catch (err) {
            // Handle errors
            console.error(err);
        }
    },
    checkEmailExistence: async function (email) {
        try {
            const pool = await sql.connect(connect);
            const queryResult = await pool
                .request()
                .input('email', sql.NVarChar, email)
                .query('SELECT COUNT(*) AS count FROM Users WHERE Email = @email');
    
            const userCount = queryResult.recordset[0].count;
            return userCount > 0;
        } catch (error) {
            console.error('E-posta varlığı kontrolü sırasında bir hata oluştu:', error);
            throw new Error('E-posta varlığı kontrolü sırasında bir hata oluştu.');
        }
    },
    updateMembershipStatus: async function (email, secretCode) {
        let pool;
        try {
            pool = await sql.connect(connect);    
            await pool
                .request()
                .input('email', sql.NVarChar, email)
                .input('secretCode', sql.NVarChar, secretCode)
                .query('UPDATE Users SET membershipStatus = 1 WHERE Email = @email AND SecretCode = @secretCode');
            console.log(`Membership status updated to 1 for user with email ${email}`);
        } catch (error) {
            console.error('Üyelik durumu güncelleme sırasında bir hata oluştu:', error);
            throw new Error('Üyelik durumu güncelleme sırasında bir hata oluştu.');
        } finally {
            if (pool) {
                pool.close();
            }
        }
    },
    
      
};

module.exports = User;