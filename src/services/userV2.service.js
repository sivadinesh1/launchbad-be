// const db = require('../postgres/db')

// const createUser = (userBody) => {
//   console.log("create user method call----->", userBody)
//   const { username, hash, salt } = userBody;
//   let email = "test@gmail.com"
//   let date=new Date()
//   let query = 'INSERT INTO users(username, hash, email, salt, createdDate) VALUES($1, $2, $3,$4,$5) RETURNING *';

//   return new Promise(function (resolve, reject) {
//     db.one(query, [username, hash, email, salt,date])
//       .then((data) => {
//         console.log('data add successfully -->' + data.id); // print new user id;
//         resolve(data)
//       })
//       .catch((error) => {
//         console.log('object.. error ' + JSON.stringify(error));
//         reject(error)
//       });
//   });
// };

// const createGUser = (userBody) => {
//   console.log("create Guser method call----->", userBody)
//   const { username, email, socialmediaId } = userBody;
//   let source="GL"
//   let date=new Date()
//   let query = 'INSERT INTO users(username, email, source, socialmediaId, createdDate) VALUES($1, $2, $3, $4, $5) RETURNING *';

//   return new Promise(function (resolve, reject) {
//     db.one(query, [username, email, source, socialmediaId, date])
//       .then((data) => {
//         console.log('data add successfully -->' + data.id); // print new user id;
//         resolve(data)
//       })
//       .catch((error) => {
//         console.log('object.. error ' + JSON.stringify(error));
//         reject(error)
//       });
//   });
// };

// const getUserById = async (id) => {
//   console.log("get user method call----->", id)
//   let query = 'select * from users where id = $1';

//   return new Promise(function (resolve, reject) {
//     db.one(query, [id])
//       .then((data) => {
//         console.log('get data successfully -->' + data); // print new user id;
//         resolve(data)
//       })
//       .catch((error) => {
//         console.log('object.. error ' + JSON.stringify(error));
//         reject(error)
//       });
//   });
// };

// const getBySocialMadiaId = async (mediaId) => {
//   console.log("get BySocialMadiaId  method call----->", mediaId)
//   let query = 'select * from users where socialmediaId = $1';

//   return new Promise(function (resolve, reject) {
//     db.one(query, [mediaId])
//       .then((data) => {
//         console.log('get data successfully -->' + data); // print new user id;
//         resolve(data)
//       })
//       .catch((error) => {
//         console.log('object.. error ' + JSON.stringify(error));
//         reject(error)
//       });
//   });
// };

// const getUserByName = async (username) => {
//   console.log("get username method call----->", username)
//   let query = 'select * from users where username = $1';

//   return new Promise(function (resolve, reject) {
//     db.one(query, [username])
//       .then((data) => {
//         console.log('get data successfully -->', data); // print new user id;
//         resolve(data)
//       })
//       .catch((error) => {
//         console.log('object.. error ' + JSON.stringify(error));
//         reject(error)
//       });
//   });
// };

// module.exports = {
//   createUser,
//   getUserById,
//   getUserByName,
//   createGUser,
//   getBySocialMadiaId
// };
