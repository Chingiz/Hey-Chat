var bt = require('bing-translate/lib/bing-translate.js').init({
    client_id: '3a7a26d9254FFC08', 
    client_secret: 'SuNwPHKH6UbvhyZ34FlqOWJ9z2zN6KS8djzHpf8NvOI='
  });
 
bt.translate('This hotel is located close to the centre of Paris.', 'en', 'ru', function(err, res){
  console.log(err, res);
  console.log(res.translated_text);
});