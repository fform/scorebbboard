var request = require('request'),
	rateLimit = require('function-rate-limit');

exports.refreshList = function( list ){
	console.log('Run list refresh [%s] - %s', list, new Date());
	request.get('http://api.dribbble.com/shots/' + list +'?per_page=50', function(err, res){

		var result = JSON.parse(res.body);

		_(result.shots).each(function(shot){
			connection.query("INSERT INTO `shots` SET ?", {
				'id':shot.id,
				'list': list,
				'width': shot.width,
				'height': shot.height,
				'image_url': shot.image_url,
				'title': shot.title,
				'player_id': shot.player.id,
				'player_likes': shot.player.likes_received_count,
				'player_followers': shot.player.followers_count,
				'player_following': shot.player.following_count,
				'likes': shot.likes_count,
				'views': shot.views_count,
				'comments': shot.comments_count,
				'created_at': new Date(Date.parse(shot.created_at)),
			}, function(err,result){
				if(!err){
					connection.query("INSERT INTO `shots_status` SET ?", {
						'id':shot.id,
						'player_likes': shot.player.likes_received_count,
						'player_followers': shot.player.followers_count,
						'player_following': shot.player.following_count,
						'likes': shot.likes_count,
						'views': shot.views_count,
						'comments': shot.comments_count,
						'created_at': new Date(),
					}, function(err,result){
					});
				}
			});

			
		});
	});
};

exports.refreshShots = function(){
	console.log('Run shot refresh %s', new Date());
	connection.query("SELECT * FROM `shots` ORDER BY created_at desc LIMIT 250", function(err, result){
		var fn = rateLimit(30, 60*1000, function (shot) {
			console.log('update shot %s %s', shot.title, new Date());
			request.get('http://api.dribbble.com/shots/' + shot.id , function(err, res){

				var thisShot = JSON.parse(res.body);
				connection.query("INSERT INTO `shots_status` SET ?", {
					'id':thisShot.id,
					'player_likes': thisShot.player.likes_received_count,
					'player_followers': thisShot.player.followers_count,
					'player_following': thisShot.player.following_count,
					'likes': thisShot.likes_count,
					'views': thisShot.views_count,
					'comments': thisShot.comments_count,
					'created_at': new Date(),
				}, function(err,result){
				});
			});
		});
		_(result).each(function(row){
			fn(row);
		});
	});
};