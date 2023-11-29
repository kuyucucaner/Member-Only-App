
const messagesModel = require('../models/messagesModel');


const messagesController = {
    postCreateMessageController: async function (req, res) {
        try {
          const messageContent = req.body.messageContent;
          const messageTitle = req.body.messageTitle;
          // Message.createMessage fonksiyonunu çağırırken req.user'ı iletiyoruz
          await messagesModel.createMessage({
            title: messageTitle,
            timeStamp: new Date(),
            textContent: messageContent
          }, req.user);
  
          res.send('Mesaj başarıyla oluşturuldu!');
        } catch (error) {
          console.error('Mesaj oluşturma hatası:', error);
          res.status(500).send('Bir hata oluştu, mesaj kaydedilemedi.');
        }
      },
    getAllMessagesController: async function (req, res) {
        try {
          const messages = await messagesModel.getAllMessages();
          console.log(messages); // messages objesini konsola yazdır
          return res.render('message', { title: 'Message', user: req.user, messages }); // return ekledik

        } catch (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error'); // return ekledik

        }
      },
      deleteMessageController: async function (req, res) {
        try {
          const messageIdToDelete = req.params.id; // params'tan sileceğiniz mesajın ID'sini alın
          console.log('Deleting message with ID:', messageIdToDelete);

          await messagesModel.deleteMessage(messageIdToDelete);

          res.redirect('/message');
        } catch (err) {
          console.error('Mesaj silme hatası:', err);
          res.status(500).send('Bir hata oluştu, mesaj silinemedi.');
        }
      },
    
      // getMessagesWithoutTimeAndAuthorController: async function (req, res) {
      //   try {
      //     const messages = await messagesModel.getMessagesWithoutTimeAndAuthor();
      //         res.render('message', { messages });
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }
      
  };
  
  module.exports = messagesController;
  