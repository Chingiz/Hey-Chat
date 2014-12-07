var translate = require('yandex-translate');
var key = "trnsl.1.1.20141205T204405Z.916da3f1c8b0abfa.932b315624f4b848e47a27661933040d190e2421";
translate('Kate ate an apple', { to: 'tr', key:key }, function(err, res) {
  console.log(res.text);
});

translate.detect('Граждане Российской Федерации имеют право собираться мирно без оружия, проводить собрания, митинги и демонстрации, шествия и пикетирование',{key:key}, function(err, res) {
   // res.lang -> 'ru'
   console.log(res.lang);
});