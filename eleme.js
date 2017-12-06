
var fs = require('fs');
var request = require('request');
var geohash = require('ngeohash');
var geohashstr = "wsvz4m878r1"; //geohash 地址码
var nexturl = [];
var json = [];
var coupon= {"man":35,"jian":5}; // 满减 满35-5
var request_status = 0;
var request_time = 0;
var latlon = geohash.decode(geohashstr);
var url = 'https://www.ele.me/restapi/shopping/restaurants?extras%5B%5D=activities&geohash='+geohashstr+'&latitude='+latlon.latitude+'&limit=24&longitude='+latlon.longitude+'&offset=offset8878&terminal=web',page = 3;//抓取页数
for(var i=1;i<=page;i++){
	nexturl.push(url.replace("offset8878",(i-1)*24));
}
console.log(nexturl);
request_time = setInterval(function(){
	if (request_status){
		return;
	}
	if (nexturl.length<=0){
		clearInterval(request_time);
		calc(json);
		return;
	}
	request(nexturl.pop(), function (error, response, body) {
		if (!error && response.statusCode == 200) {
			json.push.apply(json,JSON.parse(body));
			request_status = 0;
		}
	})
	request_status = 1;
},1000);
//本地文件测试
//var data = fs.readFileSync('./message.txt', 'utf8');
//calc(JSON.parse(data));
function calc(json){
	console.log("总共",json.length,"家商铺");
	fs.writeFileSync('./message.txt',JSON.stringify(json));
	for (const key in json) {
		if (json.hasOwnProperty(key)) {
			const element = json[key];
			activities:
			for (let index = 0; index < element.activities.length; index++) {
				if (element.activities[index].icon_name == "减"){
					var dsd = (JSON.parse(element.activities[index].attribute));
					break activities;
				}
			}
			var min = 100;
			var mjia = 0;
			if (dsd == null ){
				min = coupon.man;
			}else{
				for (const key2 in dsd) {
					if (dsd.hasOwnProperty(key2)) {
						if (parseInt(key2)<= coupon.man+5 ){
							var tmp = (parseInt(key2)>coupon.man?parseInt(key2):coupon.man) - parseInt(dsd[key2]["1"]) ;
							if (min > tmp){
								min = tmp ;
							}
						}
					}
				}
			}
			var peisong = parseInt(element.float_delivery_fee);
			console.log(element.name,min+peisong-coupon.jian+2.5);
		}
	}
}











		