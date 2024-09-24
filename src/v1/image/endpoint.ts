import { ErrorResponse, JsonResponse } from '../util';
import { GLOBALS } from '../../globals';

interface Params {
	id: string;
}

type ImgLink = {
	hash: string;
	link: string;
}

export async function GetImage(params: Params): Promise<Response> {
	try {
		if (!params.id) {
			return ErrorResponse(400, 'Invalid id parameter');
		}

		const stmt = GLOBALS.env.getEnv().DB.prepare('SELECT * FROM img_link WHERE id = ?').bind(params.id);
		const res = await stmt.first<ImgLink>();
		if (!res) {
			return ErrorResponse(404, `Image with id "${params.id}" not found`);
		}

		const image_res = {
			id: res.hash,
			url: res.link,
		}

		return JsonResponse(200, image_res);
	} catch (err) {
		console.error(err);
		// @ts-ignore
		return ErrorResponse(500, {msg: "An error occurred", exception: err});
	}
}

export async function StoreImage(): Promise<Response> {
	try {
		const request = GLOBALS.request.getRequest();
		const env = GLOBALS.env.getEnv();

		const formData = await request.formData();
		const file = formData.get('file') as File;
		if (!file) {
			return ErrorResponse(400, 'No file uploaded');
		}

		const data = await file.arrayBuffer();
		if (!data) {
			return ErrorResponse(400, 'No file uploaded');
		}

		const upload_token = request.headers.get('X-Upload-Token');
		if (!upload_token) {
			return ErrorResponse(400, 'Missing X-Upload-Token');
		}

		console.log(JSON.stringify(request.headers));

		const stmt = env.DB.prepare('SELECT secret FROM upload_secrets WHERE secret = ?').bind(upload_token);
		const secrets = await stmt.raw();
		if (!secrets || !secrets.length) {
			return ErrorResponse(401, 'Given X-Upload-Token not valid');
		}

		const r2_options: R2PutOptions = {
			httpMetadata: {
				contentType: file.type
			}
		}

		const file_key = crypto.randomUUID();
		const file_url = `${env.CDN_URL}/${file_key}`;

		const res = await env.DB.exec(`INSERT INTO img_link (hash, link) VALUES ('${file_key}', '${file_url}')`);
		if (!res.count) {
			return ErrorResponse(500, 'Failed to save image to DB');
		}

		const uploaded_file = await env.IMG_STORAGE.put(file_key, data, r2_options);
		if (!uploaded_file) {
			await env.DB.exec(`DELETE FROM img_link WHERE hash = ${file_key}`);
			return ErrorResponse(500, 'Failed to save image to storage');
		}

		const req_res = {
			id: uploaded_file.key,
			url: file_url,
			uploaded: uploaded_file.uploaded,
			size: uploaded_file.size,
			checksums: uploaded_file.checksums,
		}

		return JsonResponse(200, req_res);
	} catch (err) {
		console.error(err);
		// @ts-ignore
		return ErrorResponse(500, {msg: "An error occurred", exception: err});
	}
}
