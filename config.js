module.exports = {
  secret: 'IMsecret',
  'database': 'mongodb://localhost/test',
  tok_expires : 3600, //sekunder
  ftp_server : {
    host : '82.211.206.158',
    port : '21',
    user : 'ftp-user',
    password : 'ftp123'
  },
  java_server : {
    host : '82.211.206.158',
    port : '4444'
  },
  cdn_server : {
    host : 'http://82.211.206.158',
    port : '7878'
  },
};
