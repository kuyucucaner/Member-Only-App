const dbConfig = require('../dbConfig');
const mssql = require('mssql');

const Message = {
  createMessage: async function (message, user) {
    try {
      const pool = await mssql.connect(dbConfig);
      const result = await pool.request()
        .input('userId', mssql.Int, user.ID)
        .input('title', mssql.NVarChar, message.title)
        .input('timeStamp', mssql.Date, message.timeStamp)
        .input('textContent', mssql.NVarChar, message.textContent)
        .query('INSERT INTO Messages (UserID, Title, TimeStamp, TextContent) VALUES (@userId, @title, @timeStamp, @textContent)');

      mssql.close();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  getAllMessages: async function () {
    try {
      const pool = await mssql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM Messages');
      mssql.close();
      return result.recordset;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteMessage: async function (messageId) {
    try {
      const pool = await mssql.connect(dbConfig);
      const result = await pool.request()
        .input('id', mssql.Int, messageId)
        .query('DELETE FROM Messages WHERE ID = @id');
        console.log('Delete result:', result);

      mssql.close();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  // getMessagesWithoutTimeAndAuthor: async function () {
  //   try {
  //     const pool = await mssql.connect(dbConfig);
  //     const result = await pool.request().query('SELECT Title, TextContent FROM Messages');
  //     mssql.close();

  //     return result.recordset;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // },

};

module.exports = Message;

