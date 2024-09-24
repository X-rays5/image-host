export function JsonResponse(status_code: number, body: any): Response {
	return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'max-age=30'
		},
		status: status_code
	});
}

export function ErrorResponse(status_code: number, error: string | object): Response {
	const err_res = {
		status_code: status_code,
		error: error,
	}

	return JsonResponse(status_code, JSON.stringify(err_res));
}
