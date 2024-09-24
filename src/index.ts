import { Method, Router } from 'tiny-request-router';
import { GLOBALS } from './globals';
import { GetImage, StoreImage } from './v1/image/endpoint';
import { ErrorResponse } from './v1/util';

const router = new Router();

// @ts-ignore
router.get('/v1/image/:id', async params => GetImage(params))
router.post('/v1/image', async () => StoreImage())

function Route() {
	const request = GLOBALS.request.getRequest();
	const { pathname } = new URL(request.url)

	const match = router.match(request.method as Method, pathname)
	if (match) {
		return match.handler(match.params)
	}

	return ErrorResponse(404, 'Not Found');
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		GLOBALS.request.setRequest(request);
		GLOBALS.env.setEnv(env);
		GLOBALS.ctx.setContext(ctx);

		return Route();
	},
} satisfies ExportedHandler<Env>;
