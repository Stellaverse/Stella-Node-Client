


module.exports = function initializeUpload(uploadID) {

	var upload = stella.$db.get('up-uploads-' + uploadID);

	var to = upload.to || 'drive';

	if (to === 'account') {
		var api = 'accounts.files.insertFile';
		var params = {
			file : {
				name : upload.file.name,
				size : upload.file.size
			}
		};
	}

	if (to === 'drive') {
		var api = 'drive.objects.insertObject';
		var params = {
			locale : upload.locale,
			parentID : upload.parentID,
			objectType : upload.objectType,
			title : upload.file.name
		};
	}

	stella.api.request({
		method : 'post',
		url : upload.api.url || stella.config.api.url,
		api : api,
		projectID : upload.projectID || stella.config.projectID,
		params : params,
		auth : upload.auth
	}, function(result) {

		if (result.error) {
			upload.status = 'error';
			upload.error = result.error;
			stella.$db.del('up-uploads-' + upload.id);
			if (upload.onError) upload.onError(upload);
			return;
		}

		upload.status = 'initialized';

		if (to === 'account') {

			var account = result.data.account;
			upload.account = account;

			var file = result.data.file;

			upload.objectID = null;
			upload.url = file.url;
			upload.key = file.key;
			upload.ext = file.ext;
			upload.credentials = file.credentials;

		}

		if (to === 'drive') {

			var object = result.data.object;

			upload.objectID = object._id;
			upload.url = object.url;
			upload.key = object.key;
			upload.ext = object.ext;
			upload.credentials = object.credentials;

		}

		stella.$db.set('up-uploads-' + upload.id, upload);

		upload.onInit(upload);

		return stella.up.uploadFile(upload.id);

	});

}
